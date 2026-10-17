/**
 * dsh-token-counting — node half.
 *
 * Aggregates provider-reported token usage from every durable session log
 * (plus any live in-memory sessions) into per-local-day buckets and
 * per-session totals, and serves:
 *
 *   GET /api/token-counting  -> JSON report consumed by the web client
 *       (title badge per session, sidebar card totals + 30-day series,
 *       and the detail overlay's full breakdown).
 *
 * Usage attribution follows the same semantics as the built-in token meter
 * and dsh-token-stats: for each (turn, step) the LAST usage sample wins (an
 * assistant/message replaces its step's earlier usage chunks), and the step's
 * usage is charged to the local day of that sample's event time. The
 * model/provider come from the most recent request/header event before the
 * sample.
 *
 * @module @dsh-local/token-counting
 */
import { readFile, stat } from "node:fs/promises";
import { zstdDecompressSync } from "node:zlib";

/** Cordis plugin name. */
export const name = "token-counting";
/** Required services: the route registry and the durable session-log store. */
export const inject = ["webServer", "sessionPersistence"];

/** Zstandard frame magic (little-endian 0xFD2FB528). */
const ZSTD_MAGIC = Buffer.from([0x28, 0xb5, 0x2f, 0xfd]);

/**
 * Run `fn` over `items` with at most `limit` concurrent invocations, keeping
 * result order aligned with input order.
 * @template T
 * @template R
 * @param {T[]} items - inputs.
 * @param {number} limit - concurrency cap.
 * @param {(item: T, index: number) => Promise<R>} fn - async mapper.
 * @returns {Promise<R[]>} results in input order.
 */
export async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const index = next;
      next += 1;
      if (index >= items.length) return;
      results[index] = await fn(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}

/**
 * Decompress a session artifact that is a concatenation of zstd frames (the
 * JSONL persistence appends one frame per batch). Node's "async" zstd API
 * turns out to block the event loop anyway (measured: it does not use the
 * threadpool), so this uses the synchronous decompressor and yields to the
 * event loop every N frames — a large cold read never blocks the server's
 * request handling. Plain-text logs pass through unchanged.
 * @param buffer - raw artifact bytes.
 * @param isZstd - whether the artifact is zstd-compressed.
 * @param framesPerYield - frames decompressed between event-loop yields.
 * @returns the decoded UTF-8 log text.
 */
export async function decodeSessionArtifactAsync(buffer, isZstd, framesPerYield = 300) {
  if (!isZstd) return buffer.toString("utf8");
  const frames = [];
  let start = buffer.indexOf(ZSTD_MAGIC);
  if (start === -1) return "";
  while (start !== -1) {
    const next = buffer.indexOf(ZSTD_MAGIC, start + 1);
    const end = next === -1 ? buffer.length : next;
    frames.push(buffer.subarray(start, end));
    if (next === -1) break;
    start = next;
  }
  let text = "";
  for (let i = 0; i < frames.length; i++) {
    text += zstdDecompressSync(frames[i]).toString("utf8");
    if (i % framesPerYield === 0) await new Promise((resolve) => setImmediate(resolve));
  }
  return text;
}

/**
 * Parse a session log's JSONL text into event records, skipping torn lines.
 * @param text - decoded log text.
 * @returns parsed event objects.
 */
export function parseLogText(text) {
  const events = [];
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.length === 0) continue;
    try {
      events.push(JSON.parse(trimmed));
    } catch {
      // A torn tail line (crash mid-append) is skipped; the fold stays valid.
    }
  }
  return events;
}

/**
 * Fast parse of only the event lines the token fold can consume: request
 * headers and usage-bearing assistant records. Every other line (chunks,
 * permissions, tool results, …) is skipped without a JSON.parse.
 * @param text - decoded log text.
 * @returns parsed relevant event objects.
 */
export function parseLogRelevant(text) {
  const events = [];
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.length === 0) continue;
    if (!trimmed.includes('"assistant/chunk"')
      && !trimmed.includes('"assistant/message"')
      && !trimmed.includes('"request/header"')) continue;
    try {
      events.push(JSON.parse(trimmed));
    } catch {
      // torn tail line — skip
    }
  }
  return events;
}

/**
 * Chunked async variant of {@link parseLogRelevant} used by the background
 * refresh: yields to the event loop every N lines so a large cold read never
 * blocks the server's request handling.
 * @param text - decoded log text.
 * @param yieldEvery - lines between event-loop yields.
 * @returns parsed relevant event objects.
 */
export async function parseLogRelevantAsync(text, yieldEvery = 4000) {
  const events = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.length === 0) continue;
    if (!trimmed.includes('"assistant/chunk"')
      && !trimmed.includes('"assistant/message"')
      && !trimmed.includes('"request/header"')) continue;
    try {
      events.push(JSON.parse(trimmed));
    } catch {
      // torn tail line — skip
    }
    if (i % yieldEvery === 0) await new Promise((resolve) => setImmediate(resolve));
  }
  return events;
}

/**
 * Local calendar day key (YYYY-MM-DD) of a millisecond epoch in the server's
 * local timezone.
 * @param ms - epoch milliseconds.
 * @returns the day key.
 */
export function localDayKey(ms) {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Fold one session event batch into a persistent fold state. The state is a
 * plain object `{ header, steps }` where `steps` maps "turn|step" to the
 * last-seen usage sample — the same replace-don't-double-count rule as the
 * token meter, so folding an appended tail over an existing state is exactly
 * equivalent to folding the whole log from scratch. `header` carries the most
 * recent request/header config across batches.
 * @param state - the fold state to mutate ({ header, steps }).
 * @param events - session events in log order.
 * @param from - index to start folding at (incremental tail).
 */
export function foldRange(state, events, from) {
  for (let i = from; i < events.length; i++) {
    const event = events[i];
    if (event.type === "request/header") {
      const config = event.data?.header?.config;
      if (config !== undefined) {
        state.header = { provider: config.provider, model: config.model };
      }
      continue;
    }
    let usage;
    let turn;
    let step;
    if (event.type === "assistant/chunk" && event.data?.chunk?.type === "usage") {
      ({ turn, step } = event.data);
      usage = event.data.chunk.usage;
    } else if (event.type === "assistant/message" && event.data?.usage !== undefined) {
      ({ turn, step, usage } = event.data);
    }
    if (usage === undefined || usage === null) continue;
    if (typeof turn !== "number" || typeof step !== "number") continue;
    state.steps.set(`${turn}|${step}`, {
      usage,
      time: typeof event.time === "number" ? event.time : Date.now(),
      model: state.header?.model,
      provider: state.header?.provider
    });
  }
}

/**
 * Fold one session's events into the authoritative per-step usage samples
 * (one-shot convenience over {@link foldRange}).
 * @param events - session events in log order.
 * @returns a Map of "turn|step" -> { usage, time, model, provider }.
 */
export function foldSessionEvents(events) {
  const state = { header: undefined, steps: new Map() };
  foldRange(state, events, 0);
  return state.steps;
}

/**
 * Official DeepSeek off-peak (闲时/低谷) prices in CNY per 1M tokens, from the
 * pricing adjustment effective 2026-08-17 (same table as dsh-token-stats).
 * Cache writes are billed at the cache-miss input rate; models without an
 * entry get no cost estimate (cost stays undefined).
 */
const OFFPEAK_PRICE_CNY_PER_M = {
  "deepseek-v4-flash": { cacheHit: 0.05, cacheMiss: 1.5, output: 4.5 },
  "deepseek-v4-pro": { cacheHit: 0.15, cacheMiss: 4.5, output: 13.5 }
};

/** Cost estimate for one model's bucketed usage, or undefined when unpriced. */
function modelCost(modelKey, buckets) {
  const name = modelKey.slice(modelKey.lastIndexOf("/") + 1);
  const price = OFFPEAK_PRICE_CNY_PER_M[name];
  if (price === undefined) return undefined;
  return (
    ((buckets.input + buckets.cacheWrite) / 1e6) * price.cacheMiss
    + (buckets.cacheRead / 1e6) * price.cacheHit
    + (buckets.output / 1e6) * price.output
  );
}

/** Sum of the four usage fields. */
function totalOf({ input, output, cacheRead, cacheWrite }) {
  return input + output + cacheRead + cacheWrite;
}

/** Add one usage bucket into a target accumulator object. */
function addInto(target, buckets) {
  target.input += buckets.input;
  target.output += buckets.output;
  target.cacheRead += buckets.cacheRead;
  target.cacheWrite += buckets.cacheWrite;
}

/** Fresh zero accumulator. */
function zeroBuckets() {
  return { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
}

/**
 * Pure bucketing core: fold per-session usage samples into per-day buckets
 * (with per-model splits), per-session totals (with per-model splits), and
 * first/last usage timestamps per session.
 * @param sessions - array of { id, steps } where steps is a usage-sample Map.
 * @returns the raw aggregate.
 */
function bucketSteps(sessions) {
  const days = new Map();
  const sessionBuckets = new Map();
  for (const session of sessions) {
    if (typeof session?.id !== "string" || !(session.steps instanceof Map)) continue;
    let sessionTotal = 0;
    let hasUsage = false;
    let first = Number.POSITIVE_INFINITY;
    let last = Number.NEGATIVE_INFINITY;
    let sessionAcc = sessionBuckets.get(session.id);
    if (sessionAcc === undefined) {
      sessionAcc = { buckets: zeroBuckets(), models: new Map(), first: undefined, last: undefined };
      sessionBuckets.set(session.id, sessionAcc);
    }
    for (const sample of session.steps.values()) {
      const usage = sample.usage;
      const buckets = {
        input: Number.isFinite(usage.inputTokens) ? usage.inputTokens : 0,
        output: Number.isFinite(usage.outputTokens) ? usage.outputTokens : 0,
        cacheRead: Number.isFinite(usage.cacheReadTokens) ? usage.cacheReadTokens : 0,
        cacheWrite: Number.isFinite(usage.cacheWriteTokens) ? usage.cacheWriteTokens : 0
      };
      const total = totalOf(buckets);
      if (total <= 0) continue;
      const key = localDayKey(sample.time);
      let day = days.get(key);
      if (day === undefined) {
        day = { date: key, buckets: zeroBuckets(), sessions: new Set(), models: new Map() };
        days.set(key, day);
      }
      addInto(day.buckets, buckets);
      day.sessions.add(session.id);
      const modelKey = `${sample.provider ?? "unknown"}/${sample.model ?? "unknown"}`;
      let dayModel = day.models.get(modelKey);
      if (dayModel === undefined) {
        dayModel = zeroBuckets();
        day.models.set(modelKey, dayModel);
      }
      addInto(dayModel, buckets);
      addInto(sessionAcc.buckets, buckets);
      let sessionModel = sessionAcc.models.get(modelKey);
      if (sessionModel === undefined) {
        sessionModel = zeroBuckets();
        sessionAcc.models.set(modelKey, sessionModel);
      }
      addInto(sessionModel, buckets);
      sessionTotal += total;
      if (sample.time < first) first = sample.time;
      if (sample.time > last) last = sample.time;
      hasUsage = true;
    }
    if (!hasUsage && sessionTotal === 0) sessionBuckets.delete(session.id);
    else {
      sessionAcc.first = first;
      sessionAcc.last = last;
    }
  }
  const ordered = [...days.values()].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return { days: ordered, sessionBuckets };
}

/**
 * Pure aggregation core (exported for tests): fold every session's usage into
 * per-day and per-session buckets.
 * @param sessions - array of { id, events }.
 * @returns the raw aggregate.
 */
export function aggregate(sessions) {
  return bucketSteps(
    sessions.map((session) => ({
      id: session.id,
      steps: Array.isArray(session.events) ? foldSessionEvents(session.events) : new Map()
    }))
  );
}

/**
 * Build the wire view from the raw aggregate: summary totals, today, the
 * per-day series (newest first, with model split + cost), and the per-session
 * list (with input/output/cache split + per-model split + cost) that backs the
 * conversation-title badge.
 * @param aggregateResult - output of {@link aggregate}.
 * @param generatedAt - report timestamp.
 * @returns the JSON-serializable report.
 */
export function buildView(aggregateResult, generatedAt) {
  const { days, sessionBuckets } = aggregateResult;
  const today = days.length > 0 ? days[days.length - 1].date : undefined;
  const dayViews = [...days].reverse().map((day) => {
    const models = [...day.models.entries()]
      .map(([model, m]) => ({
        model,
        tokens: totalOf(m),
        ...m,
        cost: modelCost(model, m)
      }))
      .sort((a, b) => b.tokens - a.tokens);
    const dayCost = models.reduce((acc, m) => acc + (m.cost ?? 0), 0);
    return {
      date: day.date,
      input: day.buckets.input,
      output: day.buckets.output,
      cacheRead: day.buckets.cacheRead,
      cacheWrite: day.buckets.cacheWrite,
      total: totalOf(day.buckets),
      sessions: day.sessions.size,
      cost: dayCost,
      models
    };
  });
  const totals = dayViews.reduce(
    (acc, day) => ({
      input: acc.input + day.input,
      output: acc.output + day.output,
      cacheRead: acc.cacheRead + day.cacheRead,
      cacheWrite: acc.cacheWrite + day.cacheWrite,
      cost: acc.cost + day.cost
    }),
    { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, cost: 0 }
  );
  const todayCost = dayViews.length > 0 && dayViews[0].date === today ? dayViews[0].cost : 0;
  const sessions = [...sessionBuckets.entries()]
    .map(([sessionId, acc]) => {
      const models = [...acc.models.entries()]
        .map(([model, m]) => ({
          model,
          tokens: totalOf(m),
          ...m,
          cost: modelCost(model, m)
        }))
        .sort((a, b) => b.tokens - a.tokens);
      return {
        sessionId,
        input: acc.buckets.input,
        output: acc.buckets.output,
        cacheRead: acc.buckets.cacheRead,
        cacheWrite: acc.buckets.cacheWrite,
        total: totalOf(acc.buckets),
        cost: models.reduce((sum, m) => sum + (m.cost ?? 0), 0),
        firstUsageAt: Number.isFinite(acc.first) ? acc.first : undefined,
        lastUsageAt: Number.isFinite(acc.last) ? acc.last : undefined,
        models
      };
    })
    .filter((session) => session.total > 0)
    .sort((a, b) => b.total - a.total);
  let timeZone = "local";
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    // keep "local"
  }
  return {
    generatedAt,
    timeZone,
    totals: {
      input: totals.input,
      output: totals.output,
      cacheRead: totals.cacheRead,
      cacheWrite: totals.cacheWrite,
      total: totals.input + totals.output + totals.cacheRead + totals.cacheWrite,
      cost: totals.cost
    },
    today,
    todayCost,
    pricing: {
      basis: "DeepSeek 官方低谷（闲时）价 · 2026-08-17 调价后 · 每百万 tokens · 缓存写入按未命中输入计",
      currency: "CNY",
      unit: "per 1M tokens",
      offPeak: OFFPEAK_PRICE_CNY_PER_M
    },
    days: dayViews,
    sessions
  };
}

/**
 * Cordis plugin body: mount the JSON API route consumed by the web client.
 * Requests never wait on log I/O — the fold cache is warmed in the background
 * at activation, every request returns the cached view instantly, and data
 * changes are picked up by a debounced background refresh (live sessions
 * advance by their in-memory tail; cold artifacts re-read only when their
 * file stat changed).
 * @param ctx - host plugin context (webServer, sessionPersistence injected).
 */
export function apply(ctx) {
  /** Per-session incremental fold state: { kind, consumed, fileKey, header, steps }. */
  const folds = new Map();
  /** Cached wire view and its pre-serialized JSON; rebuilt only on change. */
  let view = null;
  let viewJson = null;
  /** Single in-flight refresh; concurrent callers share it. */
  let inflight = null;
  /** Timestamp of the last completed refresh (debounce guard). */
  let lastRefreshAt = 0;
  /** TTL cache for the artifact listing (directory scan). */
  let artifactsCache = { at: 0, list: null };
  const ARTIFACTS_TTL_MS = 30000;
  const REFRESH_DEBOUNCE_MS = 2000;
  const COLD_READ_CONCURRENCY = 6;

  const refresh = async () => {
    const persistence = ctx.get("sessionPersistence");
    const live = ctx.get("sessions");
    const liveIds = new Set();
    let changed = false;

    // 1) Live in-memory sessions: fold only the appended tail.
    if (live !== undefined) {
      try {
        for (const session of live.list()) {
          if (session === undefined || typeof session?.id !== "string" || !Array.isArray(session?.events)) continue;
          liveIds.add(session.id);
          let state = folds.get(session.id);
          if (state === undefined || state.kind !== "live") {
            state = { kind: "live", consumed: 0, header: undefined, steps: new Map() };
            folds.set(session.id, state);
            changed = true;
          }
          if (session.events.length > state.consumed) {
            foldRange(state, session.events, state.consumed);
            state.consumed = session.events.length;
            changed = true;
          }
        }
      } catch (error) {
        ctx.logger.warn(`token-counting: live session scan failed: ${String(error)}`);
      }
    }

    // 2) Cold durable artifacts: re-read a file only when its size/mtime
    //    changed since the last fold.
    const known = new Set(liveIds);
    if (persistence !== undefined) {
      try {
        if (artifactsCache.list === null || Date.now() - artifactsCache.at > ARTIFACTS_TTL_MS) {
          artifactsCache = { at: Date.now(), list: await persistence.listArtifacts() };
        }
        const changedArtifacts = [];
        for (const artifact of artifactsCache.list) {
          const id = artifact.header?.id;
          if (typeof id !== "string") continue;
          known.add(id);
          if (liveIds.has(id)) continue; // live fold is fresher than the file
          let fileKey;
          try {
            const info = await stat(artifact.path);
            fileKey = `${info.size}:${info.mtimeMs}`;
          } catch {
            continue; // artifact vanished; keep the old fold until it returns
          }
          const state = folds.get(id);
          if (state !== undefined && state.kind === "cold" && state.fileKey === fileKey) continue;
          changedArtifacts.push({ id, path: artifact.path, fileKey });
        }
        if (changedArtifacts.length > 0) {
          await mapLimit(changedArtifacts, COLD_READ_CONCURRENCY, async ({ id, path, fileKey }) => {
            try {
              const text = await decodeSessionArtifactAsync(await readFile(path), path.endsWith(".zstd"));
              const events = await parseLogRelevantAsync(text);
              const next = { kind: "cold", consumed: events.length, fileKey, header: undefined, steps: new Map() };
              foldRange(next, events, 0);
              folds.set(id, next);
              changed = true;
            } catch (error) {
              ctx.logger.warn(`token-counting: reading session ${id} failed: ${String(error)}`);
            }
          });
        }
      } catch (error) {
        ctx.logger.warn(`token-counting: session artifact listing failed: ${String(error)}`);
      }
    }

    // 3) Drop folds for sessions that no longer exist.
    for (const id of folds.keys()) {
      if (!known.has(id)) {
        folds.delete(id);
        changed = true;
      }
    }

    // 4) Rebuild the wire view only when something advanced.
    if (view === null || changed) {
      const states = [];
      for (const [id, state] of folds) states.push({ id, steps: state.steps });
      view = buildView(bucketSteps(states), Date.now());
      viewJson = JSON.stringify(view);
    }
    lastRefreshAt = Date.now();
    return view;
  };

  const refreshOnce = () => {
    if (inflight === null) {
      inflight = refresh();
      inflight.then(
        () => { inflight = null; },
        (error) => {
          inflight = null;
          ctx.logger.warn(`token-counting: refresh failed: ${String(error)}`);
        }
      );
    }
    return inflight;
  };

  const compute = async () => {
    if (view !== null) {
      if (Date.now() - lastRefreshAt >= REFRESH_DEBOUNCE_MS) refreshOnce();
      return view;
    }
    await refreshOnce();
    return view;
  };

  // Background warm-up at activation.
  refreshOnce().catch((error) => {
    ctx.logger.warn(`token-counting: warm-up failed: ${String(error)}`);
  });

  ctx.effect(
    () => ctx.webServer.register({
      kind: "exact",
      path: "/api/token-counting",
      handler: async (req, res) => {
        if (req.method !== "GET" && req.method !== "HEAD") {
          res.writeHead(405, { "content-type": "text/plain; charset=utf-8" });
          res.end("method not allowed");
          return;
        }
        try {
          const viewValue = await compute();
          const body = viewJson ?? JSON.stringify(viewValue);
          res.writeHead(200, {
            "content-type": "application/json; charset=utf-8",
            "cache-control": "no-store"
          });
          res.end(req.method === "HEAD" ? undefined : body);
        } catch (error) {
          ctx.logger.warn(`token-counting: /api/token-counting failed: ${String(error)}`);
          res.writeHead(500, { "content-type": "application/json; charset=utf-8" });
          res.end(JSON.stringify({ error: String(error) }));
        }
      }
    }),
    "token-counting: /api/token-counting"
  );
}

window.__ModuleLoader__.load({
	id: "@dsh-local/token-counting",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region styles
		const css = [
			".tcc_side{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);border-radius:var(--dsw-radius-md);flex-direction:column;gap:6px;width:100%;padding:10px 10px 8px;display:flex}",
			".tcc_sideRow{align-items:baseline;justify-content:space-between;gap:8px;display:flex}",
			".tcc_sideLabel{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;letter-spacing:.02em;white-space:nowrap}",
			".tcc_sideValue{color:var(--dsw-alias-label-primary);font-size:13px;font-weight:600;line-height:18px;font-variant-numeric:tabular-nums;white-space:nowrap}",
			".tcc_sideChart{width:100%;height:36px;display:block;cursor:default}",
			".tcc_sideChart svg{width:100%;height:36px;display:block}",
			".tcc_sideButton{box-sizing:border-box;border-radius:var(--dsw-radius-md);height:30px;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-fill-l2);border:0;cursor:pointer;align-items:center;justify-content:center;gap:6px;width:100%;padding:0;font:inherit;font-size:12px;line-height:18px;display:flex}",
			".tcc_sideButton:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}",
			".tcc_sideRail{border-radius:var(--dsw-radius-sm);width:36px;height:36px;color:var(--dsw-alias-label-secondary);background:0 0;border:0;cursor:pointer;justify-content:center;align-items:center;padding:0;display:inline-flex}",
			".tcc_sideRail:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
			".tcc_badge{box-sizing:border-box;border-radius:999px;height:20px;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-fill-l2);border:1px solid var(--dsw-alias-border-l2);align-items:center;gap:4px;padding:0 8px;font:inherit;font-size:11px;line-height:18px;font-variant-numeric:tabular-nums;cursor:pointer;flex:none;display:inline-flex}",
			".tcc_badge:hover{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-border-l3)}",
			".tcc_badge svg{flex:none}",
			".tcc_overlay{z-index:1000;justify-content:center;align-items:center;display:flex;position:fixed;inset:0}",
			".tcc_mask{background:var(--dsw-alias-bg-mask-1);backdrop-filter:var(--dsw-mask-blur);position:absolute;inset:0}",
			".tcc_panel{z-index:1;box-sizing:border-box;--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);width:min(680px, calc(100vw - 48px));height:min(720px, calc(100vh - 2 * max(24px, var(--dsh-frame-overlay-top, 24px))));border-radius:var(--dsw-radius-panel);background:var(--dsw-alias-bg-layer-2);box-shadow:var(--dsw-elevation-prominent);flex-direction:column;padding:24px;position:relative;overflow-y:auto;display:flex}",
			".tcc_panel:focus{outline:none}",
			".tcc_panelHeader{align-items:center;justify-content:space-between;gap:12px;margin-bottom:4px;display:flex}",
			".tcc_title{color:var(--dsw-alias-label-primary);font-size:16px;font-weight:600;line-height:24px}",
			".tcc_close{border-radius:var(--dsw-radius-sm);width:28px;height:28px;color:var(--dsw-alias-label-secondary);background:0 0;border:0;cursor:pointer;justify-content:center;align-items:center;padding:0;display:inline-flex}",
			".tcc_close:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
			".tcc_hint{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;margin:0 0 14px}",
			".tcc_kpis{flex-wrap:wrap;gap:24px;margin-bottom:16px;display:flex}",
			".tcc_kpi b{color:var(--dsw-alias-label-primary);font-size:20px;font-weight:700;line-height:26px;display:block;font-variant-numeric:tabular-nums}",
			".tcc_kpi span{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;letter-spacing:.06em}",
			".tcc_chartTitle{color:var(--dsw-alias-label-secondary);font-size:11px;font-weight:600;line-height:16px;margin:4px 0 6px}",
			".tcc_chart{width:100%;height:96px;display:block}",
			".tcc_chart svg{width:100%;height:96px;display:block}",
			".tcc_toolbar{align-items:center;gap:8px;margin-top:14px;display:flex}",
			".tcc_refresh{box-sizing:border-box;height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:var(--dsw-alias-fill-l2);border:0;border-radius:14px;padding:0 12px;font:inherit;font-size:12px;line-height:28px}",
			".tcc_refresh:hover:not(:disabled){color:var(--dsw-alias-label-primary)}",
			".tcc_refresh:disabled{opacity:.5;cursor:default}",
			".tcc_gen{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px}",
			".tcc_table{width:100%;border-collapse:collapse;margin-top:14px;font-size:12px}",
			".tcc_table th{color:var(--dsw-alias-label-tertiary);font-weight:400;text-align:left;padding:4px 8px;border-bottom:1px solid var(--dsw-alias-border-l2);white-space:nowrap}",
			".tcc_table th.num,.tcc_table td.num{text-align:right;font-variant-numeric:tabular-nums}",
			".tcc_table td{color:var(--dsw-alias-label-primary);padding:4px 8px;border-bottom:1px solid var(--dsw-alias-border-l1);white-space:nowrap}",
			".tcc_barTrack{width:26%;height:6px;border-radius:3px;background:var(--dsw-alias-fill-l2);overflow:hidden;display:block}",
			".tcc_bar{height:100%;background:var(--dsw-alias-brand-primary);border-radius:3px;min-width:2px}",
			".tcc_cost{align-items:baseline;gap:10px;flex-wrap:wrap;padding-top:12px;margin-top:auto;border-top:1px solid var(--dsw-alias-border-l2);display:flex}",
			".tcc_costLabel{color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:600;line-height:18px}",
			".tcc_costValue{color:var(--dsw-alias-label-primary);font-size:13px;font-weight:700;line-height:18px;font-variant-numeric:tabular-nums}",
			".tcc_costHint{color:var(--dsw-alias-label-tertiary);font-size:10px;line-height:15px;flex-basis:100%}",
			".tcc_empty{color:var(--dsw-alias-label-tertiary);font-size:12px;padding:24px 0;text-align:center}",
			".tcc_error{color:var(--dsw-alias-state-error-primary);font-size:12px}"
		].join("");
		const tagId = "@dsh-local/token-counting/client.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@dsh-local/token-counting";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		//#endregion
		//#region locales
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"side.cumulative": "累计用量",
			"side.open": "Token 用量",
			"chart.sideHint": "近 30 天每日 token 用量",
			"title": "Token 用量",
			"subtitle": "按本地时区聚合所有会话的提供方用量，同一 (轮次, 步骤) 只计最后一次样本",
			"today": "今日",
			"total": "累计",
			"sessions": "会话数",
			"refresh": "刷新",
			"generatedAt": "生成于 {time}",
			"chart.days": "近 30 天用量走势",
			"col.date": "日期",
			"col.total": "总量",
			"col.input": "输入",
			"col.output": "输出",
			"col.cache": "缓存",
			"col.sessions": "会话",
			"cost.label": "估算费用",
			"cost.today": "今日",
			"cost.total": "累计",
			"cost.hint": "按 DeepSeek 官网低谷（闲时）价 · 2026-08-17 调价后 · 每百万 tokens · 缓存写入按未命中输入计",
			"badge.title": "本会话用量：输入 {input} · 输出 {output} · 缓存 {cache}",
			"badge.aria": "本会话 token 用量 {total}，点击查看详情",
			"loading": "统计中…",
			"error": "加载失败：{message}",
			"empty": "还没有可统计的用量记录。"
		};
		/** English dictionary, key-identical to the Chinese source of truth. */
		const en = {
			"side.cumulative": "All-time usage",
			"side.open": "Token usage",
			"chart.sideHint": "Daily token usage, last 30 days",
			"title": "Token usage",
			"subtitle": "Provider-reported usage across all sessions, bucketed by local day; one (turn, step) counts only its last sample",
			"today": "Today",
			"total": "All time",
			"sessions": "Sessions",
			"refresh": "Refresh",
			"generatedAt": "Generated {time}",
			"chart.days": "Last 30 days",
			"col.date": "Date",
			"col.total": "Total",
			"col.input": "Input",
			"col.output": "Output",
			"col.cache": "Cache",
			"col.sessions": "Sessions",
			"cost.label": "Estimated cost",
			"cost.today": "Today",
			"cost.total": "All time",
			"cost.hint": "DeepSeek official off-peak prices · post 2026-08-17 adjustment · per 1M tokens · cache writes billed as cache miss",
			"badge.title": "This session: input {input} · output {output} · cache {cache}",
			"badge.aria": "Session token usage {total}, click for details",
			"loading": "Aggregating…",
			"error": "Failed to load: {message}",
			"empty": "No usage records yet."
		};
		//#endregion
		//#region shared data store
		/** Dictionary namespace owned by this plugin. */
		const NS = "token-counting";
		/** Days covered by the line charts. */
		const CHART_DAYS = 30;
		/** Client-side re-fetch floor (the server also debounces log I/O). */
		const FETCH_TTL_MS = 5000;
		/** Poll interval while a consumer is visible. */
		const POLL_MS = 30000;
		/** Max rows in the detail table (newest first). */
		const MAX_TABLE_ROWS = 14;

		/** Minimal external-store (getSnapshot/subscribe) over one value. */
		function createStore(initial) {
			let value = initial;
			const listeners = new Set();
			return {
				getSnapshot: () => value,
				set(next) {
					if (Object.is(next, value)) return;
					value = next;
					for (const fn of [...listeners]) fn();
				},
				subscribe(fn) {
					listeners.add(fn);
					return () => {
						listeners.delete(fn);
					};
				}
			};
		}

		/** Report store: { status, data, error, at }. */
		const dataStore = createStore({ status: "loading", data: null, error: null, at: 0 });
		/** Whether the detail overlay is open (shared by every entry). */
		const openStore = createStore(false);
		/** Single in-flight fetch; concurrent callers join it. */
		let inflight = null;

		/**
		* Fetch the report (deduped, TTL-guarded). Keeps previous data visible
		* while refreshing — only a first-load failure surfaces an error state.
		* @param force - bypass the TTL cache.
		* @returns the fetch promise.
		*/
		function load(force = false) {
			const held = dataStore.getSnapshot();
			if (!force && held.data !== null && Date.now() - held.at < FETCH_TTL_MS) return Promise.resolve();
			if (inflight !== null) return inflight;
			inflight = (async () => {
				try {
					const res = await fetch("/api/token-counting", { headers: { accept: "application/json" } });
					if (!res.ok) throw new Error("HTTP " + res.status);
					const data = await res.json();
					dataStore.set({ status: "ready", data, error: null, at: Date.now() });
				} catch (error) {
					const prev = dataStore.getSnapshot();
					dataStore.set({
						status: prev.data !== null ? "ready" : "error",
						data: prev.data,
						error: error instanceof Error ? error.message : String(error),
						at: Date.now()
					});
				} finally {
					inflight = null;
				}
			})();
			return inflight;
		}

		/** Subscribe a component to (a stable slice of) one store. */
		function useStore(store, selector) {
			return react.useSyncExternalStore(store.subscribe, () => selector(store.getSnapshot()));
		}

		/** Compact number formatting (k / M). */
		function fmt(n) {
			if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
			if (n >= 1e3) return (n / 1e3).toFixed(1) + "k";
			return String(n);
		}
		/** Full number formatting for titles. */
		function fmtFull(n) {
			return Number(n).toLocaleString("en-US");
		}
		/** Money formatting: ¥ with up to two decimals. */
		function fmtMoney(n) {
			const value = Number(n);
			if (!Number.isFinite(value)) return "—";
			return "¥" + (Math.abs(value) >= 100 ? value.toFixed(2) : String(Math.round(value * 100) / 100));
		}
		/** Local wall-clock label for a report generation timestamp. */
		function clock(ms) {
			const d = new Date(ms);
			const hh = String(d.getHours()).padStart(2, "0");
			const mm = String(d.getMinutes()).padStart(2, "0");
			return `${d.getMonth() + 1}/${d.getDate()} ${hh}:${mm}`;
		}
		function dayKeyOf(date) {
			return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
		}
		/**
		* Build the trailing 30-day series (ascending, zero-filled) from the
		* report's newest-first day list. The window anchors on the report's own
		* `today` (server-local day) when present.
		* @param data - the report.
		* @returns [{ date, total }] ascending, CHART_DAYS long.
		*/
		function seriesOf(data) {
			if (data === null) return [];
			const byDate = new Map((data.days ?? []).map((day) => [day.date, day.total]));
			let end;
			if (typeof data.today === "string") {
				const parts = data.today.split("-").map(Number);
				end = new Date(parts[0], parts[1] - 1, parts[2]);
			} else {
				end = new Date();
				end.setHours(0, 0, 0, 0);
			}
			const out = [];
			for (let i = CHART_DAYS - 1; i >= 0; i--) {
				const d = new Date(end.getFullYear(), end.getMonth(), end.getDate() - i);
				const key = dayKeyOf(d);
				out.push({ date: key, total: byDate.get(key) ?? 0 });
			}
			return out;
		}
		//#endregion
		//#region chart
		/** Minimal usage glyph for rail buttons and the badge. */
		const GlyphUsage = () => (0, react_jsx_runtime.jsx)("svg", {
			width: 14,
			height: 14,
			viewBox: "0 0 16 16",
			fill: "none",
			"aria-hidden": "true",
			children: [(0, react_jsx_runtime.jsx)("path", {
				d: "M2.5 13.5 6 8l3 3.2 4.5-7.2",
				stroke: "currentColor",
				strokeWidth: 1.5,
				strokeLinecap: "round",
				strokeLinejoin: "round"
			}), (0, react_jsx_runtime.jsx)("circle", { cx: 13.5, cy: 4, r: 1.4, fill: "currentColor" })]
		});
		/**
		* Zero-dependency line chart: a stroked polyline with a soft area fill,
		* stretched to the container via viewBox + non-scaling strokes.
		* @param props - series (ascending), inner width/height, tooltip text.
		* @returns the svg element.
		*/
		function LineChart({ series, width, height, title }) {
			if (series.length === 0) return null;
			const max = Math.max(1, ...series.map((point) => point.total));
			const stepX = series.length > 1 ? width / (series.length - 1) : width;
			const inner = Math.max(2, height - 4);
			const points = series.map((point, i) => [i * stepX, height - 2 - (point.total / max) * inner]);
			const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join("");
			const area = `${line}L${width},${height}L0,${height}Z`;
			return (0, react_jsx_runtime.jsx)("svg", {
				viewBox: `0 0 ${width} ${height}`,
				preserveAspectRatio: "none",
				role: "img",
				"aria-label": typeof title === "string" ? title : void 0,
				children: [
					(0, react_jsx_runtime.jsx)("path", { d: area, fill: "var(--dsw-alias-brand-primary)", opacity: 0.12 }),
					(0, react_jsx_runtime.jsx)("path", {
						d: line,
						fill: "none",
						stroke: "var(--dsw-alias-brand-primary)",
						strokeWidth: 1.5,
						strokeLinejoin: "round",
						strokeLinecap: "round",
						vectorEffect: "non-scaling-stroke"
					})
				]
			});
		}
		//#endregion
		//#region sidebar card
		/**
		* The sidebar-foot card (a `sidebar.footer.action` entry): cumulative
		* tokens and a compact 30-day line chart above the migrated "Token 用量"
		* button, which opens the detail overlay. In rail mode it degrades to one
		* icon button. Deliberately small — it lives in the left sidebar.
		* @param props - owner share (wide) + locale.
		* @returns the card element tree.
		*/
		function TokenSidebarCard({ wide, t }) {
			const status = useStore(dataStore, (s) => s.status);
			const data = useStore(dataStore, (s) => s.data);
			const error = useStore(dataStore, (s) => s.error);
			react.useEffect(() => {
				load();
				const timer = window.setInterval(() => load(true), POLL_MS);
				return () => {
					window.clearInterval(timer);
				};
			}, []);
			const openPanel = () => {
				load();
				openStore.set(true);
			};
			if (!wide) {
				return (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: "tcc_sideRail",
					"aria-label": t("side.open"),
					title: t("side.open"),
					onClick: openPanel,
					children: (0, react_jsx_runtime.jsx)(GlyphUsage, {})
				});
			}
			const total = data?.totals?.total;
			const series = seriesOf(data);
			return (0, react_jsx_runtime.jsxs)("div", { className: "tcc_side", children: [
				(0, react_jsx_runtime.jsxs)("div", { className: "tcc_sideRow", children: [
					(0, react_jsx_runtime.jsx)("span", { className: "tcc_sideLabel", children: t("side.cumulative") }),
					(0, react_jsx_runtime.jsx)("span", {
						className: "tcc_sideValue",
						title: total === undefined ? void 0 : fmtFull(total),
						children: total === undefined ? (status === "error" ? "—" : "…") : fmt(total)
					})
				] }),
				(0, react_jsx_runtime.jsx)("div", {
					className: "tcc_sideChart",
					title: t("chart.sideHint"),
					children: (0, react_jsx_runtime.jsx)(LineChart, { series, width: 240, height: 36, title: t("chart.sideHint") })
				}),
				(0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "tcc_sideButton",
					onClick: openPanel,
					children: [(0, react_jsx_runtime.jsx)(GlyphUsage, {}), t("side.open")]
				}),
				status === "error" && (0, react_jsx_runtime.jsx)("div", { className: "tcc_error", children: t("error", { message: error ?? "" }) })
			] });
		}
		//#endregion
		//#region detail overlay
		/**
		* The full report panel (a `shell.overlay` entry): KPIs, a 30-day line
		* chart, a daily breakdown table, and cost estimates — the content that
		* used to live in the Settings page, migrated here behind the sidebar
		* button. Renders nothing while closed.
		* @param props - locale share.
		* @returns the overlay element tree, or null.
		*/
		function TokenDetailOverlay({ t }) {
			const open = useStore(openStore, (s) => s);
			const status = useStore(dataStore, (s) => s.status);
			const data = useStore(dataStore, (s) => s.data);
			const error = useStore(dataStore, (s) => s.error);
			const [refreshing, setRefreshing] = react.useState(false);
			const panelRef = react.useRef(null);
			react.useEffect(() => {
				if (!open) return;
				load();
				const timer = window.setInterval(() => load(true), POLL_MS);
				return () => {
					window.clearInterval(timer);
				};
			}, [open]);
			react.useEffect(() => {
				if (!open) return;
				const onKey = (event) => {
					if (event.key === "Escape") openStore.set(false);
				};
				document.addEventListener("keydown", onKey);
				panelRef.current?.focus({ preventScroll: true });
				return () => {
					document.removeEventListener("keydown", onKey);
				};
			}, [open]);
			const refresh = async () => {
				setRefreshing(true);
				try {
					await load(true);
				} finally {
					setRefreshing(false);
				}
			};
			if (!open) return null;
			const close = () => {
				openStore.set(false);
			};
			const series = seriesOf(data);
			const todayRow = data?.days?.find((day) => day.date === data.today);
			const rows = (data?.days ?? []).slice(0, MAX_TABLE_ROWS);
			const maxRow = rows.length > 0 ? Math.max(...rows.map((row) => row.total), 1) : 1;
			const body = data === null
				? (0, react_jsx_runtime.jsx)("div", { className: "tcc_empty", children: status === "error" ? t("error", { message: error ?? "" }) : t("loading") })
				: (0, react_jsx_runtime.jsxs)(react.Fragment, { children: [
					(0, react_jsx_runtime.jsx)("div", { className: "tcc_hint", children: t("subtitle") }),
					(0, react_jsx_runtime.jsxs)("div", { className: "tcc_kpis", children: [
						(0, react_jsx_runtime.jsxs)("div", { className: "tcc_kpi", children: [
							(0, react_jsx_runtime.jsx)("b", { title: todayRow === undefined ? void 0 : fmtFull(todayRow.total), children: todayRow === undefined ? "—" : fmt(todayRow.total) }),
							(0, react_jsx_runtime.jsx)("span", { children: t("today") })
						] }),
						(0, react_jsx_runtime.jsxs)("div", { className: "tcc_kpi", children: [
							(0, react_jsx_runtime.jsx)("b", { title: fmtFull(data.totals.total), children: fmt(data.totals.total) }),
							(0, react_jsx_runtime.jsx)("span", { children: t("total") })
						] }),
						(0, react_jsx_runtime.jsxs)("div", { className: "tcc_kpi", children: [
							(0, react_jsx_runtime.jsx)("b", { children: String(data.sessions.length) }),
							(0, react_jsx_runtime.jsx)("span", { children: t("sessions") })
						] })
					] }),
					series.length > 0 && (0, react_jsx_runtime.jsxs)("div", { children: [
						(0, react_jsx_runtime.jsx)("div", { className: "tcc_chartTitle", children: t("chart.days") }),
						(0, react_jsx_runtime.jsx)("div", { className: "tcc_chart", children: (0, react_jsx_runtime.jsx)(LineChart, { series, width: 640, height: 96, title: t("chart.days") }) })
					] }),
					rows.length === 0
						? (0, react_jsx_runtime.jsx)("div", { className: "tcc_empty", children: t("empty") })
						: (0, react_jsx_runtime.jsxs)("table", { className: "tcc_table", children: [
							(0, react_jsx_runtime.jsx)("thead", { children: (0, react_jsx_runtime.jsx)("tr", { children: [
								(0, react_jsx_runtime.jsx)("th", { children: t("col.date") }),
								(0, react_jsx_runtime.jsx)("th", { style: { width: "26%" }, children: "" }),
								(0, react_jsx_runtime.jsx)("th", { className: "num", children: t("col.total") }),
								(0, react_jsx_runtime.jsx)("th", { className: "num", children: t("col.input") }),
								(0, react_jsx_runtime.jsx)("th", { className: "num", children: t("col.output") }),
								(0, react_jsx_runtime.jsx)("th", { className: "num", children: t("col.cache") }),
								(0, react_jsx_runtime.jsx)("th", { className: "num", children: t("col.sessions") })
							] }) }),
							(0, react_jsx_runtime.jsx)("tbody", { children: rows.map((row) => (0, react_jsx_runtime.jsxs)("tr", { children: [
								(0, react_jsx_runtime.jsx)("td", { children: row.date + (row.date === data.today ? " · " + t("today") : "") }),
								(0, react_jsx_runtime.jsx)("td", { children: (0, react_jsx_runtime.jsx)("span", { className: "tcc_barTrack", children: (0, react_jsx_runtime.jsx)("span", { className: "tcc_bar", style: { width: Math.max(2, Math.round((row.total / maxRow) * 100)) + "%" } }) }) }),
								(0, react_jsx_runtime.jsx)("td", { className: "num", title: fmtFull(row.total), children: fmt(row.total) }),
								(0, react_jsx_runtime.jsx)("td", { className: "num", title: fmtFull(row.input), children: fmt(row.input) }),
								(0, react_jsx_runtime.jsx)("td", { className: "num", title: fmtFull(row.output), children: fmt(row.output) }),
								(0, react_jsx_runtime.jsx)("td", { className: "num", title: fmtFull(row.cacheRead + row.cacheWrite), children: fmt(row.cacheRead + row.cacheWrite) }),
								(0, react_jsx_runtime.jsx)("td", { className: "num", children: String(row.sessions) })
							] }, row.date)) })
						] }),
					(0, react_jsx_runtime.jsxs)("div", { className: "tcc_toolbar", children: [
						(0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "tcc_refresh",
							disabled: refreshing,
							onClick: refresh,
							children: t("refresh")
						}),
						(0, react_jsx_runtime.jsx)("span", { className: "tcc_gen", children: t("generatedAt", { time: clock(data.generatedAt) }) })
					] }),
					(0, react_jsx_runtime.jsxs)("div", { className: "tcc_cost", children: [
						(0, react_jsx_runtime.jsx)("span", { className: "tcc_costLabel", children: t("cost.label") }),
						(0, react_jsx_runtime.jsx)("span", { className: "tcc_costValue", children: `${t("cost.today")} ${fmtMoney(data.todayCost)}` }),
						(0, react_jsx_runtime.jsx)("span", { className: "tcc_costValue", children: `${t("cost.total")} ${fmtMoney(data.totals.cost)}` }),
						(0, react_jsx_runtime.jsx)("span", { className: "tcc_costHint", children: t("cost.hint") })
					] })
				] });
			return (0, react_jsx_runtime.jsxs)("div", { className: "tcc_overlay", role: "presentation", children: [
				(0, react_jsx_runtime.jsx)("div", { className: "tcc_mask", "aria-hidden": "true", onClick: close }),
				(0, react_jsx_runtime.jsxs)("div", {
					ref: panelRef,
					tabIndex: -1,
					className: "tcc_panel",
					role: "dialog",
					"aria-modal": "true",
					"aria-label": t("title"),
					children: [
						(0, react_jsx_runtime.jsxs)("div", { className: "tcc_panelHeader", children: [
							(0, react_jsx_runtime.jsx)("h2", { className: "tcc_title", style: { margin: 0 }, children: t("title") }),
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "tcc_close",
								"aria-label": t("refresh") === "刷新" ? "关闭" : "Close",
								onClick: close,
								children: (0, react_jsx_runtime.jsx)("svg", {
									width: 14,
									height: 14,
									viewBox: "0 0 16 16",
									fill: "none",
									"aria-hidden": "true",
									children: (0, react_jsx_runtime.jsx)("path", { d: "M4 4l8 8M12 4l-8 8", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" })
								})
							})
						] }),
						body
					]
				})
			] });
		}
		//#endregion
		//#region session title badge
		/**
		* The per-session usage badge (a `conversation.session.header.actions`
		* entry): a small pill beside the conversation title showing this
		* session's token total; the tooltip carries the input/output/cache
		* split and a click opens the detail overlay. Sessions with no usage
		* yet render nothing.
		* @param props - standard Session share (sessionId) + locale.
		* @returns the badge element, or null.
		*/
		function SessionTokenBadge({ sessionId, t }) {
			const status = useStore(dataStore, (s) => s.status);
			const data = useStore(dataStore, (s) => s.data);
			react.useEffect(() => {
				load();
				const timer = window.setInterval(() => load(true), POLL_MS);
				return () => {
					window.clearInterval(timer);
				};
			}, []);
			if (typeof sessionId !== "string" || data === null) return null;
			const mine = data.sessions.find((session) => session.sessionId === sessionId);
			if (mine === undefined || mine.total <= 0) return null;
			const title = t("badge.title", {
				input: fmtFull(mine.input),
				output: fmtFull(mine.output),
				cache: fmtFull(mine.cacheRead + mine.cacheWrite)
			});
			return (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "tcc_badge",
				title,
				"aria-label": t("badge.aria", { total: fmtFull(mine.total) }),
				onClick: () => {
					load();
					openStore.set(true);
				},
				children: [
					(0, react_jsx_runtime.jsx)(GlyphUsage, {}),
					fmt(mine.total)
				]
			});
		}
		//#endregion
		//#region index
		/** Required client services: slot registration plus the locale translator. */
		const inject = ["slots", "locale"];
		/**
		* Client plugin body: register the dictionaries, the sidebar-foot card,
		* the detail overlay, and the session-title badge. Every target slot is
		* declared by a shipped entry, so each registration goes through
		* `slots.inject` (activation order is never guaranteed).
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			const t = ctx.locale.bind(NS);
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "token-counting: dictionaries");
			ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
				name: "sidebar.footer.action",
				id: "token-counting",
				order: 50,
				locale: NS
			}, TokenSidebarCard));
			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "token-counting",
				locale: NS
			}, TokenDetailOverlay));
			ctx.slots.inject("conversation.session.header.actions", () => ctx.slots.register({
				name: "conversation.session.header.actions",
				id: "token-counting",
				order: 900,
				locale: NS
			}, SessionTokenBadge));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

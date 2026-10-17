# dsh-token-counting

DSH（DeepSeek Harness）Web 界面的 token 用量插件：会话标题显示本会话用量、左侧栏底部（更多/设置按钮上方）显示累计用量与 30 天折线图，原设置面板里的「Token 用量」页迁移为侧栏按钮 + 详情浮层。参考 [owyoew/dsh-token-stats](https://github.com/owyoew/dsh-token-stats) 的统计口径与性能设计，数据面完全等价。

## 功能

- **会话标题徽章**（`conversation.session.header.actions`）：会话标题旁的用量胶囊，显示本会话累计 token；悬停为 输入/输出/缓存 明细，点击打开详情浮层。
- **侧栏用量卡片**（`sidebar.footer.action`）：位于左侧栏底部、更多/设置按钮上方 —— 累计用量数字 + 36px 高的 30 天折线图（刻意小巧适配侧栏）+「Token 用量」按钮；折叠为窄栏时退化为一个图标按钮。每 30 秒自动刷新。
- **详情浮层**（`shell.overlay`）：点击上述按钮/徽章打开 —— 今日/累计/会话数 KPI、30 天用量走势、每日明细表（总量/输入/输出/缓存/会话数）、估算费用（DeepSeek 官方低谷价，2026-08-17 调价后，缓存写入按未命中输入计；未收录模型不计费）、手动刷新与生成时间。
- **JSON API**：`GET /api/token-counting`，返回 `{ totals, today, todayCost, days[], sessions[], pricing }`；`sessions[]` 按会话给出 输入/输出/缓存 拆分与费用，是标题徽章的数据源。

## 统计口径

- 数据来源：每个会话日志（`$DSH_HOME/sessions/**/session.v4.jsonl.zstd`）里提供方报告的 usage 记录 + 内存中的活跃会话。
- 按「(轮次, 步骤)」去重：同一步骤的多次 usage 样本只取最后一次（与内置 token-meter 及 dsh-token-stats 语义一致）。
- 按事件时间归属到**服务器本地时区**的日历日。
- 模型 / 提供方取自该样本之前最近的 `request/header`。

## 性能

沿用参考项目的性能设计：

- **请求永不等待日志 I/O**：激活时后台预热折叠缓存；每次请求直接返回内存视图，数据变化时后台防抖 2s 增量刷新。
- **增量折叠**：活跃会话只折叠内存中新增的事件尾巴；冷会话文件仅在 size/mtime 变化时重读。
- **不阻塞事件循环**：zstd 同步解压 + 分块让步，冷读只解析 usage 相关行。
- 实测：15 个会话日志全量 fold + bucket 仅约 22ms。

## 安装位置

- 插件源码：`C:\Users\~\Desktop\dsh-token-counting\`
- Profile 依赖：`~\.dsh\profiles\web\package.json` 与 `~\.dsh\profiles\desktop\package.json` 中的 `@dsh-local/token-counting`（link → 源码目录；桌面端经 `resources\runtime\cli\bin\dsh.cmd plugin --profile desktop add` 安装）
- 加载器入口：`token-counting`（bundle patch，位于插件 `cordis.patch.yml`）

## 热加载

插件不改一行代码即可获得 DSH 内建的两层热加载，改完源码**无需重启**：

- **浏览器端**（`client-hmr`，web-app bundle 常驻）：`lib/client.js` 落盘后，宿主 stat-poll（默认 500ms）发现变更 → `rebuilt` 事件 → SSE 推送到打开的页面 → 浏览器自动拉取新 bundle 并热替换本插件的 UI（重载后 React 组件状态重置，会话/连接状态保留）。改 UI 直接保存即可看到。
- **宿主端**（`dsh-hmr`，base bundle）：已在其 `root` 中加入本插件目录，`lib/index.js` 模块变更 → 宿主 fiber 热重载，`/api/token-counting` 路由即时更新。

两个 profile 的 `cordis.patch.yml` 均已追加：

```yaml
- id: hmr
  config:
    root:
      - "C:/Users/02halei/Desktop/dsh-token-counting"
```

注意：

- 宿主端 `hmr` 行要求宿主以 `profileContext` 启动（桌面端天然满足；`dsh web` 命令行方式无 profileContext 时该行禁用，此时仅浏览器端热替换可用）。
- dsh-hmr 自带防抖（100ms 合并 + 2s 写稳定窗口），连续快速编辑不会撕裂。
- 首次从「未安装」到「已安装」仍需一次重启让图谱收编本插件；此后的一切源码改动都走热加载。

## 修改后生效

- **已配置热加载时（推荐路径，见上节）**：改 `lib/client.js` 或 `lib/index.js` 直接保存，约 1~3 秒内自动生效（浏览器端热替换 / 宿主端 fiber 重载），无需重启。
- **未配置热加载时**：改动插件源码或补丁后需要重启 —— 原终端 Ctrl+C 后重新 `dsh web`（或 `npx @deepseek-ai/dsh web`），桌面端重开应用并刷新页面。

## 旧设置页迁移说明

原 dsh-token-stats 在设置面板注册的「Token 用量」页已由本插件取代：web 与 desktop 两个 profile 的 `cordis.patch.yml` 中

```yaml
- id: token-stats
  disabled: true
```

停用了旧插件整体（含其设置页与 `/api/token-stats`）。如需恢复旧设置页，删除该行后重启即可。

## 验收记录（开发期已跑通）

- 合成数据：去重（同 turn|step 后样本覆盖前样本）、本地日归属、双模型费用数学全部通过。
- 真实日志：与参考实现 dsh-token-stats 逐样本等价（同一 session.v4.jsonl.zstd：155 样本、17,381,596 tokens 一致）。
- 全量语料：15 个会话日志、12 个有用量、总量 44,965,433 tokens，fold + bucket 约 22ms。
- 注册验收：`npx @deepseek-ai/dsh --profile web --dump-config` 中 `token-counting` 恰好出现一次，`token-stats` 已 disabled。

测试脚本（`test-*.mjs` / `test-client-structure.cjs`）与参考源码副本（`ref/`）为开发期工件，验收通过后已从本目录清理。

## 许可

MIT（含自 dsh-token-stats 移植的折叠/解压逻辑，该项目同为 MIT）。

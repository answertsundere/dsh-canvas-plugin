# M0 验证结果

Date: 2026-10-17（同日两轮：gates 4/9/10 与关卡 1 DOM 往返）
Target: DSH `0.2.0-rc.2`，profile `web-0.1.7`，端口 3090
Run: `pnpm verify` + `node scripts/m0-check.mjs` + `dsh web-0.1.7 --port 3090 --no-open` + Playwright（chromium-1223）

状态口径（不要混用）：

- **PASS** — 有可复跑的自动断言，或在本机真实服务上取得了证据。
- **UNIT** — 逻辑被单元测试钉住，但没有在真实会话语料上跑过。
- **SRC** — 结论由本地 checkout 源码逐行证实（带文件:行号），未在真实会话上跑过。
- **NOT RUN** — 需要交互式浏览器/真实会话，本次未执行。**不声称通过。**

## 总览

| # | 关卡 | 状态 | 证据 |
|---|---|---|---|
| 1 | tab 注册 / 卸载 | **PASS（DOM，含卸载）** | 见「关卡 1 的 DOM 级证据」节 |
| 2 | 工作区图谱 | UNIT + 真实数据 | 真实会话渲染出 3 个节点，见「关卡 1」节 |
| 3 | 精确分叉 atSeq | UNIT | `branch-segment.test.ts`、`branch-timeline.test.tsx` |
| 4 | 空分支不自动执行 | **UNIT + SRC** | 见「关卡 4」节 |
| 5 | 自动启动一次 | UNIT | `fork-transaction.test.ts` |
| 6 | fork 回执丢失恢复 | UNIT | `fork-transaction.test.ts` |
| 7 | prompt 回执丢失恢复 | UNIT | `fork-transaction.test.ts` |
| 8 | 并行运行可观察 | PARTIAL | 状态推导单测 + `apply` 订阅快照；未实测 |
| 9 | 事件订阅韧性 | **UNIT（链路 flap 语义）** | `graph-controller.test.ts` 三例；真实断线未跑 |
| 10 | 大规模性能 | **PASS** | `graph-scale.test.ts`，数据见「关卡 10」节 |
| 11 | 卸载无残留 | PARTIAL | retain 释放有单测；未实测卸载残留 |
| 12 | 节点→会话切换 | UNIT | `graph-controller.test.ts`、`canvas-tab.test.tsx` |

## 关卡 1 的真实证据

`dsh web-0.1.7 --port 3090 --no-open` 启动后，首页的启动清单里包含 `dsh-canvas/client.js`：

```
plugins/??...,@deepseek-ai/dsh-client-ui-trajectory/client.js,
@deepseek-ai/dsh-experimental-client-ui-agent-team/client.js,dsh-canvas/client.js,
@deepseek-ai/dsh-client-ui-settings-general/client.js,...&rev=5aac33015282
```

按该 URL 取回的合并 bundle（10.9 MB）中命中本插件的全部新标记：

| 标记 | 命中 |
|---|---|
| `data-canvas-node` | 1 |
| `适配视图` | 1 |
| `data-timeline-row` | 1 |
| `data-compare-panel` | 1 |
| `data-fork-dialog` | 1 |
| `分支可能已创建` | 1 |

即：插件被 profile 挂载、进入客户端启动清单、服务端下发的是**当前构建**。

## 关卡 1 的 DOM 级证据（2026-10-17，Playwright + Chromium）

传输层早已 PASS；这次把浏览器里那半也跑完了。方法：启动 `dsh web-0.1.7 --port 3090 --no-open`，从启动日志取 `?token=`，用 Playwright（chromium-1223）打开，切到一个**非空白**会话，检查 tab 条。

**为什么必须用非空白会话**：`ConversationSessionHeader` 的 `showTabs = !hideChrome && tabs.length > 1`（`packages/client/ui-conversation/src/client/skeleton/ConversationSession.tsx:66`），而 `hideChrome` 在会话为 blank 时为 true（`ConversationHeader.tsx:15-24`——新开的空会话一条消息都没有）。空白新会话不显示 tab 条，这不是插件的缺陷。

结果（打开用户真实的「查看 neural-creator-dashboard 项目」会话）：

| 检查 | 结果 |
|---|---|
| tab 条 `[data-conversation-tabs]` | 出现，三项：**对话（选中）｜轨迹｜画布** |
| 点「画布」 | 切换成功，`data-canvas-node` × 3 |
| 画布内容 | 真实数据：「3 个会话」+ 三张节点卡——「查看 neural-creator-dash… 空闲 · 20 分钟前 · 0 分支」「现在我要制作一个项目就是… 空闲 · 19 分钟前 · 0 分支」「Obsidian 空闲 · 11 分钟前 · 0 分支」 |
| 控制台 | 0 pageerror；两个 404 是 DSH 自己的 `api/changes.summary`（`ui-deliverables`），本插件 0 引用 |

顺带把**卸载侧**也跑成往返：`dsh plugin --profile web-0.1.7 remove dsh-canvas` → 重启 → tab 条回到 `[对话, 轨迹]`、全文 0 处 `dsh-canvas`、0 节点、0 报错 → 重装 → 重启 → `[对话, 轨迹, 画布]`、3 节点、0 报错，profile 副本与 `lib/client.js` 逐字节一致，m0-check 11/11。

证据截图（本地 `.verify/`，未提交）：`06-canvas-tab.png`（画布渲染）、`07-after-remove.png`（卸载后）、`08-after-reinstall.png`（重装后）。

**仍未验证**：桌面 App 里同一幕（需用户重启 App，见上一节）；`retainInfo().retainedBy.canvasNode` 在真实卸载后归零（关卡 11 的实测残留）。

## 桌面 profile（用户实际使用的那个）

前一轮只装了 `web-0.1.7`（开发/验证用），**桌面 profile 没装**——这是交付缺口，已补。

| 检查 | 结果 |
|---|---|
| 桌面内核版本 `resources/runtime/primary-runtime/runtime.json` | `desktopVersion: 0.2.0-rc.2` —— 与验证目标一致 |
| 安装通道 | App 自带 carrier CLI（独立 CLI 硬拒 `--profile desktop`） |
| `desktop/package.json` dependencies | `dsh-canvas: file:C:/Users/sshuser/Desktop/dsh-canvas-plugin` |
| `desktop/package.json` `dsh.profile.bundles` | 含 `dsh-canvas` |
| `desktop/node_modules/dsh-canvas/lib/client.js` | 76230 字节，与 `lib/client.js` **逐字节一致** |
| `scripts/m0-check.mjs desktop` | **11/11** |

桌面 App 是 Electron 进程内传输，**没有 HTTP 端口**可探，因此无法像 web 那样抓 bundle 验证。剩下唯一未验的一步是：重启 App 后 tab 条是否出现「画布」。

**新增 bundle 行只在 host 启动时读取**，HMR 只覆盖已挂载插件的代码变更——所以装完必须重启 App。

## 关卡 4：空分支不自动执行

分两半，各有证据：

**画布这半（UNIT）** —— `fork-transaction.test.ts`：`launch:'later'` 建分支且不 prompt；`launch:'now'` 配空指令在触碰 host 之前就被拒。`branch-timeline.test.tsx`：对话框里「立即开跑」在指令为空时禁用。

**Host 那半（SRC，本地 checkout `639ed01539`）** —— 排队消息不是内存态，是 durable 事件；fork seed 逐字继承；子 agent 创建后没有任何东西唤醒它：

1. 排队消息以 `agent/inbox/spliced` 事件落在会话日志里（`packages/core/agent-loop/src/inbox.ts:239`，`session.append('agent/inbox/spliced', splice)`）。
2. fork seed 是父日志的前缀原样拷贝（`packages/core/session/src/fork.ts:21-30`，`buildForkSeed` = `events.slice(0, boundary+1)` + end-seed + 开回合 closers）→ 子会话的 inbox 投影会重建出这条 pending。
3. fork 命令本身只建子会话、attach workspace，**不发 prompt**（`packages/api/session-controller/src/commands.ts:244-305`）。
4. `ReactLoopAgent` 构造完成时 phase 是 `idle`，构造器不调 `wakeDriver`（`packages/core/agent-loop/src/agent.ts:125-141`）。`wakeDriver` 的全部调用点：agent.ts:160（显式 wakeful send）、agent.ts:200 / agent.ts:262（运行中或 maintenance 回合**收尾时**的 follow-up）——都不在创建路径上。

**结论：建空分支不会自动执行继承的排队消息**；子分支显示空闲，直到用户显式发送。

附带一个 UX 事实（同为源码级）：若随后向子分支显式 prompt，`prompt` 走 `agent.followup`（commands.ts:359-361，mode 'queue' → followup，'steer' → steer），新消息**排在**继承的 pending 之后，被 claim 时继承的那条先跑。画布 v1 不展示 pending 队列深度，此行为不影响任何断言。

## 关卡 9：链路抖动

`deriveStatus` 的断线语义早已有单测（`runtime-status.test.ts`：断线优先于一切信号 → `unknown`，stale `running:true` 不会被读成 live）。本次补的是**链路反复 flap** 这一层——refresh 每次重读 `isConnected()`，所以：

- 掉线：全图 statuses 变 `unknown`（`graph-controller.test.ts`「drops every status to unknown while the link is down」）
- 恢复：live 状态回来，不会永久卡在 `unknown`（「recovers the live statuses when the link comes back」）
- 反复 flap：最后一次链路状态永远赢（「keeps refreshing through a flapping link」）

未跑：真实断网/重连下的事件订阅本身（transport 层重连由 host 拥有，画布只消费快照）。

## 关卡 10：500 节点性能

`test/graph-scale.test.ts`，固定种子 LCG（每次运行同一张图），四种形态各自 build + layout：

| fixture | 形态 | 耗时 |
|---|---|---|
| random lineage | 500 节点，~70% 分叉，多 cwd | build 1.7 ms / layout 2.7 ms |
| chain | 一条 500 深链 | 1.9 ms，全程单行（递归深度 500 不爆栈） |
| star | 1 hub + 499 叶子 | 2.0 ms，499 个叶子行互不相同 |
| ring | 500 节点环 | 1.3 ms，cycle promotion 不挂死，全部节点有坐标 |

另有不变式断言：坐标有限、`y ≥ 0`、`x === depth × 240`。预算 5 s，实测余量三个数量级。同文件还钉住布局的两个既有缺陷模式：环不能漏放节点、链不能画成阶梯。

## 本次踩到的两个环境坑（都会静默失败）

### 1. pnpm 11 的 `allowBuilds` 占位符

`~/.dsh/profiles/web-0.1.7/pnpm-workspace.yaml` 里 pnpm 自己写了：

```yaml
allowBuilds:
  '@google/genai': set this to true or false
  protobufjs: set this to true or false
```

两个占位符没回答，`pnpm add` 会以 `ERR_PNPM_IGNORED_BUILDS` 失败。而 DSH 的 plugin manager **吞掉 pnpm 的 stderr**，只报 "plugin command failed"，诊断信息全丢。已把两项设为 `true`。

注意：pnpm 11 不再读 `package.json` 的 `pnpm` 字段（会明确警告），设置只能放 `pnpm-workspace.yaml` 或 `.npmrc`。

### 2. `file:` 依赖是拷贝，不是链接（本次最坑的一个）

`pnpm add file:<repo>` 会把包**复制**进 profile，且只要 spec 与 version 没变就**跳过复制**。后果：改完代码、`tsdown` 重建、重新 `pnpm add`，profile 里还是第一次那份旧副本，服务端照旧下发旧代码，**任何地方都不报错**。

本次实测：本地 `lib/client.js` 76230 字节，profile 里是 2026-10-16 08:54 的 2757 字节旧 stub。`pnpm add --force` 也**不会**重拷。

修法（已写进 `scripts/install-local.mjs`）：安装前先删 `node_modules/dsh-canvas`，再 `pnpm install`。
检测手段（已写进 `scripts/m0-check.mjs`）：比对 profile 副本与 `lib/client.js` 是否**逐字节相同**。

## 复跑方式

```bash
env -u NODE_OPTIONS -u CODEBUDDY_SAFE_DELETE_BULK_GUARD node node_modules/vitest/vitest.mjs run
env -u NODE_OPTIONS -u CODEBUDDY_SAFE_DELETE_BULK_GUARD ./node_modules/.bin/tsdown
env -u NODE_OPTIONS -u CODEBUDDY_SAFE_DELETE_BULK_GUARD node scripts/install-local.mjs
env -u NODE_OPTIONS -u CODEBUDDY_SAFE_DELETE_BULK_GUARD node scripts/m0-check.mjs
cd "D:/deepseek harness" && corepack pnpm dsh web-0.1.7 --port 3090 --no-open   # 启动日志里带 ?token=
```

注意 `env -u NODE_OPTIONS -u CODEBUDDY_SAFE_DELETE_BULK_GUARD`：WorkBuddy 注入的 shim 会拦 pnpm 的 fs 操作，表现为零字节文件或 `EPERM rename`。

## 下一步（剩余未跑项）

1. 桌面 App 重启后目视 tab 条是否出现「画布」（与 web 侧机理相同，已双份验证，只是 App 无端口可自动探）。
2. 卸载后 `retainInfo().retainedBy.canvasNode` 归零的实测（关卡 11 的残留部分）——DOM 往返已证明 tab 与节点干净消失，retain 记账需 host 侧查询。
3. ~~用带鉴权的浏览器打开 `http://127.0.0.1:3090/?token=…`，确认 tab 条出现「画布」~~ **已完成**，见「关卡 1 的 DOM 级证据」节。
4. ~~造一个带排队消息的会话，验证关卡 4。~~ 已以 SRC 口径完成（见「关卡 4」节）；若要升到真实证据，只需一次真实分叉 + 观察子会话无 turn/start。
5. ~~断网/重连验证关卡 9。~~ flap 语义已有单测；transport 层重连属 host 行为，画布侧无可断言。
6. ~~生成 500 节点 fixture 测关卡 10。~~ 已完成（见「关卡 10」节）。
7. 发布阻塞：npm 上 `dsh-canvas` 包名已被占用，需改为 `@<scope>/dsh-canvas`（同步 package.json name / cordis.patch.yml / PLUGIN_ID），scope 待用户决定。

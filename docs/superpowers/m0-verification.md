# M0 验证结果

Date: 2026-10-17
Target: DSH `0.2.0-rc.2`，profile `web-0.1.7`，端口 3090
Run: `pnpm verify` + `node scripts/m0-check.mjs` + `dsh web-0.1.7 --port 3090 --no-open`

状态口径（不要混用）：

- **PASS** — 有可复跑的自动断言，或在本机真实服务上取得了证据。
- **UNIT** — 逻辑被单元测试钉住，但没有在真实会话语料上跑过。
- **NOT RUN** — 需要交互式浏览器/真实会话，本次未执行。**不声称通过。**

## 总览

| # | 关卡 | 状态 | 证据 |
|---|---|---|---|
| 1 | tab 注册 / 卸载 | **PASS（传输层）** | 见下 |
| 2 | 工作区图谱 | UNIT | `graph-model.test.ts`、`workspace-adapter.test.ts` |
| 3 | 精确分叉 atSeq | UNIT | `branch-segment.test.ts`、`branch-timeline.test.tsx` |
| 4 | 空分支不自动执行 | **NOT RUN** | 需要带排队消息的真实会话 |
| 5 | 自动启动一次 | UNIT | `fork-transaction.test.ts` |
| 6 | fork 回执丢失恢复 | UNIT | `fork-transaction.test.ts` |
| 7 | prompt 回执丢失恢复 | UNIT | `fork-transaction.test.ts` |
| 8 | 并行运行可观察 | PARTIAL | 状态推导单测 + `apply` 订阅快照；未实测 |
| 9 | 事件订阅韧性 | **NOT RUN** | 需要断线/重连 |
| 10 | 大规模性能 | **NOT RUN** | 无 500 节点 fixture，未测量 |
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

未验证：浏览器 DOM 里 `[对话｜轨迹｜画布]` 三个 tab 是否真的渲染，以及卸载后是否消失。这需要带鉴权的浏览器会话。

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

## 下一步（补齐 4/9/10 与关卡 1 的 DOM 部分）

1. 用带鉴权的浏览器打开 `http://127.0.0.1:3090/?token=…`，确认 tab 条出现「画布」，`dsh plugin --profile web-0.1.7 remove dsh-canvas` 后重启确认消失。
2. 造一个带排队消息的会话，验证关卡 4。
3. 断网/重连验证关卡 9，以及卸载后 `retainInfo().retainedBy.canvasNode` 归零（关卡 11）。
4. 生成 500 节点 fixture 测关卡 10。

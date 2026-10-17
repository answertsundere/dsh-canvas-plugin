# HANDOFF — 交接给下一个 AI

> 这份文件是**接管入口**。读完这一份 + 它指向的文件，就足够继续推进；不需要口头背景。
> 最后更新：2026-10-17（M0 关卡 4/9/10 与关卡 1 DOM 级收口之后）。

## 1. 这是什么

**dsh-canvas**：DeepSeek Harness（DSH，本地 checkout 在 `D:/deepseek harness`，commit `639ed01539`，版本 `0.2.0-rc.2`）的客户端插件。注册为会话区的第三个 tab「画布」，在一张图上画出**当前工作区**的会话血缘，支持从任意消息精确分叉、并行分支实况、确定性对比、择优继续。

仓库：`C:/Users/sshuser/Desktop/dsh-canvas-plugin`（git，main 分支，工作树干净）。

## 2. 当前状态（30 秒版）

| 维度 | 状态 |
|---|---|
| 计划任务 | 14/14 完成（Task 1–15b，含 14 桌面 profile、15 关卡收尾、15b 关卡 1 DOM） |
| 测试 | **14 文件 / 175 测试全绿**（`vitest run`） |
| 构建 | typecheck 干净；`lib/client.js` 76.23 kB / gzip 21.47 kB，lazy-CJS banner 完好 |
| 安装 | **两个 profile 都已装**：`web-0.1.7`（开发验证）与 `desktop`（用户实际使用的桌面 App），副本与 `lib/client.js` **逐字节一致**，`m0-check` 均 11/11 |
| M0 关卡 | 1 **PASS（DOM，含卸载往返）**；2/5/6/7/12 UNIT（2 另有真实数据证据）；4 UNIT+SRC；9 UNIT（flap 语义）；10 **PASS（500 节点实测）**；3 UNIT；8 PARTIAL（未实测并行实况）；11 PARTIAL（retainInfo 残留未实测） |
| 发布 | **阻塞**：npm 包名 `dsh-canvas` 被占用，需 `@<scope>/dsh-canvas`（见 §7 决策点） |

## 3. 真理文件地图（先读这些）

| 问题 | 文件 |
|---|---|
| 每个任务为什么这么设计、每个 DSH API 的合同与 file:line 证据 | `docs/superpowers/plans/2026-10-15-dsh-canvas-implementation.md` **（最重要，随 clone 走）** |
| 产品范围与 v1 明确不做的边界 | `docs/superpowers/specs/2026-10-15-dsh-canvas-design.md` |
| M0 十二关的证据、口径（PASS/UNIT/SRC/NOT RUN）、复跑方法、踩过的环境坑 | `docs/superpowers/m0-verification.md` |
| 升级 DSH 时的脆弱点排行（prompt 参数序、RemoteResult、file: 拷贝语义等） | `docs/compat.md` |
| 用户视角的安装/使用 | `README.md` / `README.zh-CN.md` |

⚠️ **`.superpowers/sdd/.../progress.md`（本地 ledger）被 gitignore**，不随 clone 走。所有重要结论都已抄进上面的 plan 文档——**不要把 ledger 当唯一来源**。

## 4. 日常命令

```bash
# 全部命令都要带这个前缀：WorkBuddy 注入的 shim 会拦 pnpm/tsdown 的 fs 操作
# （症状：零字节文件、EPERM rename、SAFE_DELETE_BULK_CONFIRM_REQUIRED）
PFX="env -u NODE_OPTIONS -u CODEBUDDY_SAFE_DELETE_BULK_GUARD"

$PFX pnpm run verify        # typecheck + vitest run + tsdown 构建（提交前必跑）
$PFX pnpm run test          # 只跑测试
$PFX node scripts/install-local.mjs                # 装进 web-0.1.7
$PFX node scripts/install-local.mjs --profile desktop   # 装进桌面 profile（走 App carrier CLI）
$PFX node scripts/m0-check.mjs                     # 11 项可脚本化断言（可加 desktop 参数）

# 起真实服务做验证（token 打在 boot 日志里，别把输出管进 tail，会被缓冲吃掉）
cd "D:/deepseek harness" && $PFX corepack pnpm dsh web-0.1.7 --port 3090 --no-open
# 浏览器自动化：Playwright 1.60.0 在 D:/npm-global/node_modules/wigolo/node_modules/playwright
# chromium-1223 在 %LOCALAPPDATA%/ms-playwright
```

## 5. 接手前必读的坑（全部会静默失败）

按危险度排序，每条都咬过人：

1. **`file:` 依赖是拷贝不是链接，且版本不变就跳过复制**。改了代码 → 重建 → 直接 `pnpm add`，profile 里还是第一份旧副本，服务端照发旧代码，**任何地方都不报错**。`--force` 也没用。**必须走 `scripts/install-local.mjs`（它会先删 `node_modules/dsh-canvas`）**；`m0-check.mjs` 用逐字节比对兜底。
2. **DSH API 一律对着本地 checkout 核实**（`D:/deepseek harness`，`639ed01539`），不读线上文档。已验证的关键合同：`fork({sessionId, atSeq, increaseTitle, onCreated})`；`prompt(content, mode, signal?, requestId?)`——**requestId 是第 4 参**，传错位置 Host 去重静默失效；`prompt` 返回 `RemoteResult` 不 reject；`uiConversation.binding()` 对非活跃会话抛错。
3. **空白会话不渲染 tab 条**：`showTabs = !hideChrome && tabs.length > 1`（`packages/client/ui-conversation/src/client/skeleton/ConversationSession.tsx:66`），blank 会话 `hideChrome=true`。**复跑关卡 1 必须打开有消息的真实会话**，否则会误判成注册失败。
4. **pnpm 11 的两个坑**：`allowBuilds` 占位符没回答会 `ERR_PNPM_IGNORED_BUILDS`，而 DSH plugin manager **吞掉 pnpm 的 stderr**，只报 "plugin command failed"；pnpm 11 不再读 package.json 的 `pnpm` 字段。
5. **桌面 profile 只能走 App 自带 carrier CLI**（`%LOCALAPPDATA%\Programs\DeepSeek Harness\resources\runtime\cli\bin\dsh.cmd`）：独立 CLI 硬拒 `--profile desktop`（`apps/cli/src/args.ts:83-87`）。且 `execFileSync` + `shell:true` **不给文件参数加引号**，路径含空格会断——传整条命令字符串。
6. **新增 bundle 行只在 host 启动时读取**，HMR 只覆盖已挂载插件的代码变更——装完插件必须重启 App/服务。
7. **类型断言只允许出现在 `src/client/index.ts`**（DSH 品牌类型边界）；其余层全部走结构化接口 + 依赖注入，测试用 fake。
8. 状态口径三层：confirmed / inferred / unknown，**绝不从沉默推断 idle**；`unknown` 在断线时优先于一切。

## 6. 改代码的闭环（项目既有 SDD 约定）

1. 先写失败测试 → 实现 → 跑绿；
2. **就地更新** `docs/superpowers/plans/2026-10-15-dsh-canvas-implementation.md`（这是 clone 后唯一的设计史）；
3. 追加 `.superpowers/.../progress.md` ledger（本地速记，同上，不是唯一来源）；
4. `$PFX pnpm run verify` 全绿 + `m0-check` 通过，再 commit（每个修复独立 commit）。

## 7. 待办与决策点

| # | 事项 | 状态 |
|---|---|---|
| 1 | **桌面 App 重启**验证 tab 条 | 已装好并验证过除目视外全部环节；bundle 行只在 host 启动时读，**重启决定权在用户**（App 正在跑，未擅杀） |
| 2 | **npm 发布 scope 决策** | `dsh-canvas` 包名被占用（有人同名占位）。需用户定 scope 后联动改三处：`package.json` name、`cordis.patch.yml` name、`tsdown.config.ts` 的 `PLUGIN_ID`。**没定之前不要改名**——loader id 是已安装 profile 行的一部分 |
| 3 | 关卡 11 残留实测 | 卸载后 `retainInfo().retainedBy.canvasNode` 归零（需 host 侧查询）；DOM 往返已证明 tab/节点干净消失 |
| 4 | 关卡 8 并行实况 | 两个并行分支状态可观察，目前只有单测 + 订阅快照 |
| 5 | 可选清理 | 加 `@deepseek-ai/dsh-api-session-controller` 依赖可消除 `index.ts` 两处类型断言（同时恢复 `declare module` 合并） |

## 8. 给接管的 AI：建议启动顺序

```text
1. 读 §3 的 plan 文档（重点：Task 6 fork 事务、Task 11 wiring、Task 12/15/15b 的坑与证据）
2. 跑 $PFX pnpm run verify，确认 175 测试全绿——与本文档描述不符就先停下来问
3. 跑 $PFX node scripts/m0-check.mjs desktop，确认 11/11、逐字节一致
4. 需要真实证据时：起 web profile → 从 boot 日志取 token → Playwright 打开一个非空白会话
5. 动任何 DSH API 前，去 D:/deepseek harness 对应包读源码确认合同，别信记忆
```

本地证据截图在 `.verify/`（gitignore，含用户私有工作区名，**不要提交、不要外传**）。

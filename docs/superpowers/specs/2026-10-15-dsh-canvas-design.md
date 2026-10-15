# dsh-canvas — DSH 会话分支画布设计

Date: 2026-10-15
Status: Draft for review
Target: DeepSeek Harness 0.2.0-rc.2（官方桌面版，desktop profile）

## 问题

DSH 原生支持会话分叉（fork），侧边栏也能看到会话列表，但：

1. **分支关系不可见**：侧边栏把 fork 子会话与普通会话平铺展示（`deriveGroups` 明确"every session as a top-level row"），父子血缘被丢弃。
2. **分叉入口深**：fork 只在侧边栏行菜单和聊天 turn 尾按钮，看不到全局结构就没法规划"往哪分"。
3. **并行探索无实况**：同时跑两个方案时，无法在一个画面里看到各自进展、也无法对比结果。

目标：一个官方形态的 DSH 插件，注册「画布」tab，提供**分支探索工作台**——看全血缘、从任意消息建分支并行跑、确定性对比、择优继续。

## 已锁定的决策（头脑风暴结论）

| 决策 | 结论 |
|---|---|
| 与 dsh-synapse（MIT, 525★）的关系 | **从零自研**，dsh-synapse 仅作技术参考；差异化 = 任意消息分叉 / 并行实况 / 确定性对比 / 择优继续（它均无，且仅支持 web profile） |
| 画布范围 | 当前**工作区**（workspace 成员会话）的血缘图；跨工作区全局图不做 |
| 分叉粒度 | 任意消息/turn 边界，映射到精确 `atSeq`，UI 明示真实切点与继承范围 |
| 分支启动 | 两种：内联指令立即开跑（`prompt('queue')`）/ 只建空分支 |
| 对比 | 确定性 diff（消息/工具/步骤/完成状态，只比新增事件）+ 择优继续 + 带回结论（可编辑草稿，不自动提交） |
| 主线语义 | 只叫「切换至此分支继续」，**无持久主线标记** |

## 平台事实（全部本地核实，非文档推断）

以下每条都在 `D:\deepseek harness`（commit 639ed01539, v0.2.0-rc.2）源码中验证，是实现的地基：

| 能力 | 证据 |
|---|---|
| 注册第三个 tab | `packages/client/ui-conversation/src/client/apply.ts:180-192` 从 slot `conversation.view` 投影 tab 行；`≥2` 个 view 即显示 tab 条。参考实现：`ui-trajectory/src/client/index.ts:79-112`（最小完整样例） |
| fork 支持**任意事件边界** | `session-controller/src/commands.ts:245-254`：显式 `atSeq` 只校验事件存在，无 turn 边界限制；contract 明说"a cut inside an open turn is balanced Host-side with synthetic closers"（`client/contract/sessions.ts:122-131`）；`core/session/src/fork.ts:21-29` 合成 closers |
| fork 子会话**永远继承源 cwd** | `commands.ts:275` `meta.cwd` 取自 `source.header.cwd`；`SessionForkRequest` 无 cwd 字段 → **公开 API 无法分叉到新目录**，v1 画布分支共享工作目录 |
| Prompt 发送链 | `ctx.sessions.scope(id)`（`client/contract/sessions.ts:143`，无 retained generation 返回 undefined）→ `sessionOf(ctx)` → `face.prompt(blocks, 'queue'\|'steer')`（`client/contract/session.ts:87-89`）。`'queue'` 追加一轮，`'steer'` 打断当前轮 |
| Prompt 幂等 | Host 按 `requestId` 去重：`commands.ts:330` `hasPromptRequest(agent, request.requestId) → {accepted:true}`；客户端 `prompt(..., requestId?)` 可传显式 ID，但**默认每次 randomUUID**（`client/sessions/session.ts:272`）→ 重试必须复用同一 ID |
| 引用生命周期 | `sessions.using(target, opts, op)`（`client/sessions/service.ts:297-309`）= retain→await ready→op→finally release；`openState` 随快照可达（`client/contract/snapshot.ts:80`，`'error'` 会与 ready 一起到达）；`binding(id)`/`scope(id)` 只借不延命 |
| 继承边界标记 | fork 子会话带 `inheritedEventCount`（`commands.ts:273`）+ 种子尾事件 `session/end-seed{inherited:true}`（`fork.ts:24`）→ 对比只取其后的新增事件 |
| 实时状态 | `session/control` 流承载 live 状态（`api/session-controller/src/types.ts` SessionWireHeader）；list 快照含 running/availability（`list.ts:126-144`） |
| 工作区归属 | workspace 记录含 `sessionIds`（`workspace/src/entity.ts:101-103` 按 canonical cwd 过滤成员）；血缘用 `parentSession`。**不用 cwd 相等判断归属** |
| 插件安装 | profile `package.json` 的 `dsh.profile.bundles` + `dependencies` file: 链接；`dsh plugin --profile desktop add <spec>` 经桌面版捆绑的 pnpm 安装并自动追加 bundle（`boot/plugin-manager/src/operations.ts:88-113`）。桌面 profile 路径 `apps/desktop/src/paths.ts:17-21` |
| 客户端插件动态加载 | `packages/client/modules/src/index.ts:841-854` 按 `dsh.client` 声明组装浏览器条目，`/plugins` 路由下发，boot 时载入；**启动失败是整体致命**（`assertEntriesActive` 抛错，`client/web/src/boot-client.ts`） |
| inbox 由事件重建 | `core/agent/src/types.ts:41` "Complete pending Inbox value reconstructed from durable splices"；agent 创建文档"Setup composes, it never drives"（`core/agent/src/index.ts:114-116`）→ 空分支是否自动执行继承排队消息**未证实**，列 M0 关卡 |

## 架构

四层，DSH API 变化只冲击 Adapter 层：

```
UI 层         CanvasTab · BranchTimeline · ComparePanel
Controller 层 GraphController · ForkController · CompareController
Adapter 层   WorkspaceAdapter · SessionAdapter · ForkAdapter · EventStreamAdapter · RuntimeStatusAdapter
DSH 官方服务  Slots · sessions(list/fork/retain/prompt) · workspaces · control/event streams
```

仓库布局 `dsh-canvas-plugin/`（独立 git 仓库，不动官方源码树）：

```
package.json            # dsh.bundle.patch + dsh.client 声明（dsh-mnemon 成品骨架）
cordis.patch.yml        # - insert: canvas 行
src/host/index.ts       # 主机侧 apply（配置/探针，轻量）
src/client/index.ts     # 注册 conversation.view tab + locale
src/client/CanvasTab.tsx        # 全幅画布
src/client/BranchTimeline.tsx   # 消息时间线 + 切点映射 + 分叉操作
src/client/ComparePanel.tsx     # 确定性对比 + 择优 + 带回结论
src/client/graph-layout.ts      # 血缘分层布局（零依赖）
src/client/controllers/*.ts     # Graph/Fork/Compare 控制器
src/client/adapters/*.ts        # 五个 DSH 适配器
src/shared/contracts.ts         # 跨层类型
locales/{zh,en}.ts
lib/                    # tsdown 产物（client.js lazy-CJS banner）
test/                   # vitest
docs/superpowers/specs/
```

数据流：

```
tab 注册 → GraphController: workspace 成员 + parentSession 建图（list 快照）
状态更新 → control 流增量刷新（已确认/推断/未知三态）
节点展开 → EventStreamAdapter 按需订阅该会话事件流（retain + release 生命周期）
分叉     → ForkController 事务：选点→校验→fork→retain child→prompt(同一requestId)→回执→订阅
对比     → 读两会话事件流 → 取 inheritedEventCount 后新增段 → 确定性 diff
```

## UI 设计（已定稿：A 全幅画布 + 右侧面板）

**画布区（主内容全幅）**
- 血缘布局：根左叉右，按 createdAt 分层；缩放/平移/框选双选/适配视图
- 节点卡：标题、状态徽标（运行中脉冲/排队/思考/工具执行/待批准/失败/**状态未知**）、模型、轮次·步数、相对时间、isSeeded 分叉标记、当前会话描边；与运行中兄弟同 cwd 者常驻「⚠ 并行写入」角标
- 规模纪律：视口虚拟化（只渲染可见节点）、子节点 >N 折叠 `+n`、全局只订轻量流、展开才订完整事件流
- 浮动顶栏：搜索（定位+高亮）、布局切换（血缘树/时间线）、刷新

**右侧面板（点节点滑出，[详情｜对比] 双 tab）**
- 详情：消息时间线（懒加载）；每条消息标注事件序号区间；「⑂ 从此分叉」明示真实切点（例："切在 AI 第 3 条回复后 · seq 47 · 继承 47 事件"）；内联指令框 + [立即开跑]/[只建分支]
- 对比：双选后并排 A|B——最终结论 + 逐轮步骤 diff，**只比 inheritedEventCount 之后的新增事件**，合成 closers 不计步骤；[切换至此分支继续] [带回结论→可编辑草稿]
- 点节点联动左侧原生侧边栏选中；Ctrl/Cmd+点击加入对比

**切点映射规则（消除歧义）**：时间线的行按与「对话」视图相同的聚合规则派生（chunk 合并不拆行），消息行 M 的 `atSeq` = **下一行首个事件的前一个事件 seq**（即 M 及其所属事件的最后一个 seq）。UI 在分叉确认处展示"该切点继承 N 个事件"供确认；行与事件的映射关系由 M0 关卡 3 对真实语料逐 seq 核对。

## 分支创建事务（ForkController）

```
选点 → 校验(seq 存在/在源会话范围内) → fork({atSeq}) → onCreated 记录 childId
   → using(child): retain → await ready → 检查 openState → prompt(blocks,'queue',requestId)
   → 成功: 订阅 child 状态，画布落节点
```

- **requestId**：每次分支启动生成一个，重试复用（Host 去重）。
- **回执丢失**：prompt 失败只重试 prompt，同一 ID；fork 后 child 已存在（onCreated/manifest 可查），**绝不二次 fork**。
- **部分成功**：workspace 挂载失败（`session/workspace-attach-failed`）→ child 在图中但未挂工作区，UI 明示。
- **ForkCapability 探测**：Adapter 启动时探测 fork 契约（显式 atSeq 可用性）；不可用时退化到完成轮边界并**明示退化**，不静默替换。

## 分支对比（CompareController）

- 对齐：两分支的 LCA（最近公共祖先会话）= 沿 parentSession 上溯的交点；各自新增段 = `inheritedEventCount` 之后的事件。
- **对齐规则**：只对两个新增段做**逐轮位置对齐**（新增段第 1 轮 vs 第 1 轮）， inherited 前缀长度不同时在 UI 明示各自继承量；位置对齐是确定性的，不做语义配对。
- 确定性 diff：用户消息序列、工具调用序列（名称+参数摘要+结果状态）、步骤数、完成状态（turn/end reason）、未决审批。
- 带回结论：生成预填指令草稿"参考分支 B 的结论：<摘要>。现在……"——**可编辑、不自动提交**；外部分支结论仅作引用内容，不赋予执行权限。
- 语义摘要（模型概括优缺点）：v1.1 可选，v1 不做。

## 错误处理

| 场景 | 行为 |
|---|---|
| fork 回执丢失 | 查 manifest/onCreated 核对，不盲目重 fork；无法确认→分支标「状态未知」 |
| prompt 回执丢失 | 同一 requestId 重试 |
| 空分支继承排队消息 | M0 关卡（见下）；若子会话自动执行→「只建分支」增加显式清理或明示 |
| workspace 挂载失败 | 错误码呈现，child 保留 |
| 插件启动失败 | patch 条目最小化 + apply 零抛射；发布前实测整体 boot |
| 节点渲染抛错 | slot 错误边界降级单节点，不影响画布 |
| 断线重连 | control 流重基线；断开期状态「未知」，不把无事件推断为空闲 |
| 卸载/切工作区 | release 全部 retain、退订全部流；M0 实测无残留 |

## M0 验证关卡（建画布之前的最小验证插件）

| # | 关卡 | 通过标准 |
|---|---|---|
| 1 | tab 注册/卸载 | 画布 tab 显示、卸载后无残留 |
| 2 | 工作区图谱 | workspace 成员 + parentSession 正确成图，孤立/外部父节点有标记 |
| 3 | 精确分叉 | `atSeq` 对应预期继承位置（对已知语料逐 seq 核对） |
| 4 | **空分支不自动执行** | 源有排队消息时分叉，子会话保持空闲 |
| 5 | 自动启动一次 | 指令准确到达子会话一次（requestId 去重防双发） |
| 6 | fork 回执丢失恢复 | 模拟回执丢失，恢复后无重复子会话 |
| 7 | prompt 回执丢失恢复 | 同一 requestId 重试，最终只有一条指令 |
| 8 | 并行运行 | 两分支状态可分别观察 |
| 9 | 事件订阅韧性 | 切换/断线/重连后订阅正确 |
| 10 | 大规模性能 | 500+ 节点不卡（虚拟化），展开节点才订流 |
| 11 | 卸载 | retain 全释放、订阅全退、原生会话功能不受影响 |
| 12 | 节点→会话切换 | 点画布节点可切换到该会话（侧边栏选中跟随），API 形态在 M0 中确定 |

## 成品化与发布

- **包名**：`dsh-canvas`（npm，发布前查重名；备选 `@<scope>/dsh-canvas`）。MIT。
- **安装**：`dsh plugin --profile desktop add dsh-canvas`（README 同时给 web profile 指令）。
- **数据纪律**：只投影 DSH 会话数据，不复制、不修改、不写 `~/.dsh`；v1 零插件自存。
- **质量门**：vitest（图构建/切点映射/对比 diff/状态机/控制器）、`tsc -b`、oxlint、双语 README（带截图）、LICENSE / THIRD_PARTY_NOTICES / SECURITY.md / CHANGELOG、semver。
- **兼容**：peer `@deepseek-ai/dsh-client-*` 按 dsh-mnemon 姿势声明；README 标注实测版本矩阵（首发：0.2.0-rc.2 desktop）。CI：test+build；tag 触发 npm publish。

## v1 明确不做（v1.1+ 候选）

跨工作区全局画布 · Git worktree 目录隔离（公开 fork API 无 cwd 参数，需 host 侧路径评估）· 语义合并两分支事件历史 · 自动择优 · 持久主线标记 · 模型语义摘要对比 · subagent 子任务节点（默认隐藏）

## 测试策略

- 纯函数单测：切点映射、血缘建图（含孤立/环/外部父）、对比 diff（含合成事件过滤）、状态推导三态。
- 控制器单测：ForkController 事务各失败路径（mock Adapter）。
- M0 关卡作为真实环境集成验证（手工 + 脚本断言）。
- 端到端：desktop profile 安装 → tab 出现 → 建分支 → 并行 → 对比 → 卸载，全流程走查。

## 开放问题

1. npm 包名 `dsh-canvas` 是否被占用（发布时查）。
2. 布局默认方向（左→右时间流）是否随工作区记忆（v1 不做记忆，默认即可）。

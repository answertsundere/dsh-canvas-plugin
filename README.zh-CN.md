# dsh-canvas

DeepSeek Harness 的会话分支画布插件：把当前工作区的会话血缘画成一张全幅画布，可以从任意一条消息分叉、并行跑两个方案、再确定性地对比它们。

> 目标版本：DSH `0.2.0-rc.2`。所有 DSH API 都是对着本地 checkout（commit `639ed01539`）核实的，不是对着线上文档。

## 它解决什么

DSH 原生支持会话分叉，侧边栏也能看到会话列表，但：

1. **分支关系看不见**——侧边栏把 fork 出来的子会话和普通会话平铺，父子血缘被丢掉；
2. **分叉入口太深**——只在侧边栏行菜单和聊天轮次尾部，看不到全局结构就没法规划"往哪分"；
3. **并行探索没有实况**——同时跑两个方案时，没法在一个画面里看各自进展、也没法对比结果。

## v1 能力

- **血缘画布**：工作区会话按 `parentSession` 建成左→右分层图，链式会话保持一条直线，分支才向下展开。可缩放（0.4–2×）、拖拽平移、适配视图、搜索定位。
- **从任意消息分叉**：详情面板逐条列出该分支自己的轮次，每行标注真实 `seq` 区间与「⑂ 从此分叉」。切点是这一行自己的最后一个事件序号——**永远是一个真实存在的事件**。
- **两种启动方式**：「立即开跑」把指令作为 `queue` 投给子会话；「只建分支」建一个空分支不发送任何东西。
- **确定性对比**：只比各自 `inheritedEventCount` 之后的新增事件，逐轮位置对齐，不比语义。「带回结论」生成**可编辑草稿**，绝不自动提交。
- **状态三态**：已确认（idle/queued/failed/done）、推断（thinking/tool）、未知（断线）。**绝不从沉默推断空闲。**

## 安装

桌面版（推荐）：

```bash
dsh plugin --profile desktop add <包名>
```

Web profile（开发用）：

```bash
dsh plugin --profile web add <包名>
dsh web --port 3090 --no-open
```

> 桌面 profile 的插件集合由桌面 App 自己管理，CLI 拒绝 `--profile desktop`（`apps/cli/src/args.ts:83-87`）。本地开发和 M0 验证因此都走 web profile——桌面壳加载的是同一个 `dsh-web-frontend` 客户端运行时。

## v1 明确不做

| 限制 | 原因 |
|---|---|
| 分支共享同一工作目录 | 公开的 fork API 没有 `cwd` 参数，无法分叉到新目录。UI 常驻「⚠ 并行写入」告警。 |
| 详情面板是快照，不实时 | 选中节点时一次性读取并立刻释放 retain，保证不把会话钉住。 |
| 带回结论走剪贴板 | v1 没有 composer 句柄。 |
| 无持久主线标记 | 只叫「切换至此分支继续」。 |
| 无自动择优 / 无语义摘要 | 位置对齐是唯一能两次给出同一答案的规则。 |

## 版本矩阵

| DSH | 状态 |
|---|---|
| `0.2.0-rc.2` | 开发与验证目标 |

详见 [`docs/compat.md`](docs/compat.md) 与 [`docs/superpowers/m0-verification.md`](docs/superpowers/m0-verification.md)（M0 12 个关卡的实际结果，含未执行的关卡）。

## ⚠️ 发布前的已知阻塞

npm 上的 `dsh-canvas` **已被占用**（`0.0.1`，描述为 "Infinite canvas for the DeepSeek Harness - name reserved"，仓库 `dushaobindoudou/dsh-canvas`）。发布前必须改名为 `@<scope>/dsh-canvas`，并同步更新：

- `package.json` 的 `name`
- `cordis.patch.yml` 里的 `name:`
- `tsdown.config.ts` 的 `PLUGIN_ID`（决定 `window.__ModuleLoader__.load({ id })`）

**不要在本地开发阶段改名**：`id` 一改，已装进 profile 的插件行就对不上，M0 验证过的安装会失效。

## 开发

```bash
env -u NODE_OPTIONS -u CODEBUDDY_SAFE_DELETE_BULK_GUARD node node_modules/vitest/vitest.mjs run
env -u NODE_OPTIONS -u CODEBUDDY_SAFE_DELETE_BULK_GUARD ./node_modules/.bin/tsdown
env -u NODE_OPTIONS -u CODEBUDDY_SAFE_DELETE_BULK_GUARD node scripts/install-local.mjs
env -u NODE_OPTIONS -u CODEBUDDY_SAFE_DELETE_BULK_GUARD node scripts/m0-check.mjs
```

`env -u NODE_OPTIONS -u CODEBUDDY_SAFE_DELETE_BULK_GUARD` 不是装饰：宿主的 shim 会拦 pnpm 的 fs 操作，表现为零字节文件或 `EPERM rename`。

两个会让改动**静默不生效**的坑，细节见 [`docs/superpowers/m0-verification.md`](docs/superpowers/m0-verification.md)：

1. `file:` 依赖是**拷贝**不是链接，且 spec/version 不变就跳过复制 → 重建后必须删掉 profile 里的副本再装（脚本已处理）。
2. pnpm 11 的 `pnpm-workspace.yaml` 里 `allowBuilds` 占位符没回答，`pnpm add` 会失败，而 DSH 的 plugin manager 会吞掉 pnpm 的 stderr。

## 许可证

MIT，见 [`LICENSE`](LICENSE)。

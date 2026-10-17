# dsh-canvas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A publishable DSH client plugin that registers a 「画布」tab showing a workspace's session lineage as a full-bleed canvas, forks branches from any message with idempotent launches, shows parallel run status, and compares two branches deterministically.

**Architecture:** A standalone npm package (`dsh-canvas`) with a host apply (config only) and a client apply registering the `conversation.view` slot. Four layers keep DSH API churn isolated: UI (CanvasTab/BranchTimeline/ComparePanel) → Controllers (Graph/Fork/Compare) → Adapters (Workspace/Session/Fork/EventStream/RuntimeStatus) → DSH services (`ctx.sessions`, `ctx.workspaces`, `ctx.uiWorkspace`, `ctx.uiConversation`, `ctx.slots`, `ctx.locale`). All lineage/graph/diff/fork-transaction logic is pure and unit-tested; DSH touchpoints live behind adapters with injectable fakes.

**Tech Stack:** TypeScript 5.9, tsdown 0.22 (host ESM + client CJS lazy-bundle), vitest 3.2, @testing-library/react 16, React 18 (peer from host), cordis (peer from host), zero runtime dependencies beyond optional dev tooling.

## Global Constraints

- **Target**: DeepSeek Harness `0.2.0-rc.2`, desktop profile for shipping. All DSH APIs must be verified against the local checkout `D:\deepseek harness` (commit `639ed01539`), never against online master docs.
- **Desktop profile is not CLI-installable**: `apps/cli/src/args.ts:83-87` rejects `--profile desktop` on every command ("managed exclusively by the Electron application"). Local development and all M0 gates run on the **web profile** (`dsh plugin --profile web add file:<repo>` + `dsh web --port 3090`); the desktop shell serves the same `dsh-web-frontend` client runtime, so web-profile verification covers every behavior gate. Desktop install happens only after npm publish, through the app's 插件 page (a user action in Task 13).
- **Plugin shape**: local client plugin loaded at runtime; must NOT patch or rebuild DSH core. `dsh.bundle.patch` inserts one row; `dsh.client.platform: "web"` (web-compatible, desktop-first).
- **Zero host storage**: never write to `~/.dsh` or `$DSH_HOME/canvas/`. Read-only projection of DSH session data.
- **Branches share cwd**: `SessionForkRequest` has no cwd (commands.ts:275 inherits source cwd). The UI must carry a persistent 「⚠ 并行写入」 affordance; no directory isolation in v1.
- **Idempotent branch launch**: one `requestId` per branch launch; retries reuse it (Host dedupes: commands.ts:330). Never re-fork after a lost fork receipt.
- **Retain lifecycle**: one-shot operations use `ctx.sessions.using(...)`; long-lived node reads use `retain()` + explicit `release()` on close/switch/unload.
- **Comparison boundary**: compare only events after each branch's `inheritedEventCount`; synthetic fork closers (`session/end-seed`, `turn/end{kind:'forked'}`) are excluded from step counts.
- **Boot safety**: a client entry that fails to activate is fatal for the whole page boot (`assertEntriesActive`). `apply()` must not throw; patch entries stay minimal.
- **State model**: every displayed status is one of `idle|queued|thinking|tool|awaiting-approval|failed|done|unknown`; `unknown` on disconnect; never infer idle from silence.
- **No CJK in `.cjs`/`.ps1`**: TypeScript sources may contain CJK literals (UTF-8); PowerShell scripts must use `\uXXXX` escapes.
- **Build outputs**: `lib/` is generated (gitignored). Client bundle MUST keep the `window.__ModuleLoader__.load(...)` lazy-CJS banner.
- **Tests**: `vitest run` must pass before any commit; each task ends green.

---

## File Structure

```
dsh-canvas-plugin/
  package.json                      # npm manifest: dsh.bundle.patch + dsh.client declaration
  cordis.patch.yml                  # `- insert: canvas` row (config only)
  tsconfig.json                     # typecheck config (no emit)
  tsconfig.types.json               # declaration emit for host+client
  tsdown.config.ts                  # host ESM lib/index.js + client CJS lib/client.js
  vitest.config.ts                  # node env for pure tests, jsdom for components
  src/
    host/index.ts                   # host apply: reads plugin config, no throw
    shared/contracts.ts             # cross-layer types (CanvasNode, CanvasGraph, statuses, requests)
    shared/status.ts                # status union + badge metadata (pure)
    client/index.ts                 # registers conversation.view tab id 'canvas' order 20
    client/locales.ts               # NS + zh/en dictionaries
    client/theme.ts                 # inline-style tokens (no CSS pipeline)
    client/adapters/workspace-adapter.ts   # workspace membership + session summaries → CanvasNode[]
    client/adapters/session-adapter.ts     # list snapshot → summaries; session binding helpers
    client/adapters/event-stream-adapter.ts# retain/ready/openState/release + chat target snapshot
    client/adapters/fork-adapter.ts        # fork(atSeq) + prompt(blocks,'queue',requestId)
    client/adapters/runtime-status-adapter.ts # confirmed/inferred/unknown status derivation
    client/graph/graph-model.ts      # buildLineageGraph (pure, handles orphans/cycles)
    client/graph/graph-layout.ts     # layered left→right positions (pure)
    client/controllers/graph-controller.ts  # graph state + status refresh
    client/controllers/fork-controller.ts   # fork transaction state machine (injectable deps)
    client/controllers/compare-controller.ts# comparison assembly from two segments
    client/compare/branch-segment.ts  # extract new segment after inheritedEventCount (pure)
    client/compare/diff.ts            # positional turn alignment + tool/turn diffs (pure)
    client/ui/CanvasTab.tsx          # full-bleed canvas: toolbar, nodes, pan/zoom
    client/ui/NodeCard.tsx           # session node card
    client/ui/RightPanel.tsx         # [详情|对比] container
    client/ui/BranchTimeline.tsx     # message rows, seq ranges, fork action + dialog
    client/ui/ComparePanel.tsx       # A|B comparison, 择优继续, 带回结论
    client/ui/ForkDialog.tsx         # instruction input, launch mode, shared-cwd warning
  test/
    graph-model.test.ts
    graph-layout.test.ts
    branch-segment.test.ts
    diff.test.ts
    fork-transaction.test.ts
    runtime-status.test.ts
    canvas-tab.test.tsx
    branch-timeline.test.tsx
    compare-panel.test.tsx
  scripts/install-local.mjs          # dev loop: install the package into the desktop profile
  docs/superpowers/specs/2026-10-15-dsh-canvas-design.md
  docs/superpowers/plans/2026-10-15-dsh-canvas-implementation.md
```

## Verified DSH API Surface (copy these exact calls)

| Need | Call | Source |
|---|---|---|
| Register tab | `ctx.slots.inject('conversation.view', () => ctx.slots.register({ name, id:'canvas', order:20, locale:NS, label:()=>t('view.canvas'), inject:(sessionId)=>… }, CanvasTab))` | ui-trajectory/src/client/index.ts:79-112 |
| Inject list | `export const inject = ['slots','sessions','workspaces','uiWorkspace','uiConversation','locale']` | ui-trajectory:41, mnemon:150-153 |
| Session summaries | `ctx.sessions.list.getSnapshot()` → `{ ids, byId }`-style snapshot with `parentId`, `cwd`, `running` | session-controller client/sessions/service.ts:33 |
| Workspace membership | `ctx.workspaces.list.getSnapshot()` → `{ items, recentWorkspaceId }`; items carry `sessionIds` | mnemon client/index.ts:152; workspace feed.ts:56-76 |
| Open a session (node click) | `ctx.uiWorkspace.openSession(sessionId)` | ui-workspace client/navigation.ts:34,151,200 |
| Fork at exact seq | `await ctx.sessions.fork({ sessionId, atSeq, increaseTitle: true, onCreated })` → childId | client/contract/sessions.ts:132-137 |
| One-shot retain | `await ctx.sessions.using({sessionId}, {source:'gateway'}, async ref => …)` | client/sessions/service.ts:297-309 |
| Long-lived retain | `const ref = ctx.sessions.retain({sessionId}, {source:'gateway'}); await ref.ready; …; ref.release()` | service.ts:282-295 |
| Prompt once | `ctx.sessions.sessionOf(ctx.sessions.scope(id)!)!.prompt([{type:'text',text}], 'queue', requestId)` | contract/session.ts:87-91; sessions.ts:143,156 |
| Timeline data | `ctx.uiConversation.binding(sessionId).target('chat').getSnapshot()` (+ `.subscribe`) | ui-chat apply.ts:102; ui-trajectory:93 |
| Load older page | `await ctx.sessions.binding(sessionId)?.session.loadOlder()` | ui-trajectory:92 |
| Locale | `ctx.locale.register(NS, { zh, en })`, `ctx.locale.bind(NS)` | ui-trajectory:62,66 |

Request ids: `SessionRequestId` = `randomUUID()`-branded string (session.ts:229).

---

### Task 1: Package scaffold, build pipeline, and tab-registration smoke test

**Files:**
- Create: `package.json`, `cordis.patch.yml`, `tsconfig.json`, `tsconfig.types.json`, `tsdown.config.ts`, `vitest.config.ts`
- Create: `src/shared/contracts.ts`, `src/shared/status.ts`, `src/host/index.ts`, `src/client/locales.ts`, `src/client/theme.ts`, `src/client/index.ts`, `src/client/ui/CanvasTab.tsx`
- Create: `test/canvas-tab.test.tsx`
- Create: `scripts/install-local.mjs`

**Interfaces:**
- Produces: package `dsh-canvas@0.1.0` with `dsh.bundle.patch`, `dsh.client.inject`; `CanvasTab` component; `StatusKind` union; `build: ok`.

- [ ] **Step 1: Write package.json**

```json
{
  "name": "dsh-canvas",
  "version": "0.1.0",
  "description": "Conversation branch canvas for DeepSeek Harness: lineage map, message-level fork, parallel run status, deterministic branch comparison.",
  "license": "MIT",
  "type": "module",
  "main": "lib/index.js",
  "types": "lib/types/index.d.ts",
  "exports": {
    ".": { "types": "./lib/types/index.d.ts", "default": "./lib/index.js" },
    "./client": { "types": "./lib/types/client/index.d.ts", "default": "./lib/client.js" },
    "./package.json": "./package.json"
  },
  "files": ["lib", "cordis.patch.yml", "README.md", "README.zh-CN.md", "THIRD_PARTY_NOTICES.md", "SECURITY.md", "LICENSE"],
  "dsh": {
    "bundle": { "patch": "./cordis.patch.yml" },
    "client": {
      "inject": [
        "@deepseek-ai/dsh-client-connection",
        "@deepseek-ai/dsh-client-ui-conversation",
        "@deepseek-ai/dsh-client-ui-renderer",
        "@deepseek-ai/dsh-client-locale"
      ],
      "platform": "web"
    }
  },
  "scripts": {
    "build": "tsdown && tsc -p tsconfig.types.json",
    "bundle": "tsdown",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run",
    "install:local": "node scripts/install-local.mjs",
    "verify": "pnpm run typecheck && pnpm run test && pnpm run build"
  },
  "peerDependencies": {
    "@deepseek-ai/dsh-client-ui-primitives": ">=0.1.0-rc.6",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@deepseek-ai/cordis": "^4.0.1",
    "@deepseek-ai/dsh-client-locale": "0.2.0-rc.2",
    "@deepseek-ai/dsh-client-ui-conversation": "0.2.0-rc.2",
    "@deepseek-ai/dsh-client-ui-primitives": "0.2.0-rc.2",
    "@deepseek-ai/dsh-client-ui-renderer": "0.2.0-rc.2",
    "@deepseek-ai/dsh-client-ui-slots": "0.2.0-rc.2",
    "@deepseek-ai/dsh-session": "0.2.0-rc.2",
    "@testing-library/react": "^16.3.0",
    "@types/node": "^22.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "jsdom": "^26.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tsdown": "^0.22.0",
    "typescript": "^5.9.0",
    "vitest": "^3.2.0"
  },
  "engines": { "node": ">=22.19.0" }
}
```

**Step 1 fix notes** (verified during implementation, Task 1 rounds 1-2):
- The `dsh.client.inject` array above is authoritative — copy it verbatim. `@deepseek-ai/dsh-client-runtime` and the `ui-slots` inject row are NOT valid at 0.2.0-rc.2 (runtime does not exist; ui-slots declares no `dsh.client` entry). Do not add either as an inject row. `@deepseek-ai/dsh-client-ui-renderer` is the row that provides `ctx.slots`.
- A package with no `dsh.client` manifest is not automatically safe to drop from inject (ui-renderer/connection also lack one yet are load-bearing). Only drop a row after verifying it is neither a client entry nor a provider of a `ctx` service.
- Do NOT list `@deepseek-ai/dsh-client-runtime` in devDependencies; `@deepseek-ai/dsh-client-ui-slots` stays in devDependencies (its `LocaleNamespaceMap` types are required) but never in inject.

- [ ] **Step 2: Write cordis.patch.yml**

```yaml
# Mount the canvas bundle into a DSH profile. Config only: every runtime knob
# defaults in code so a future DSH version cannot break this row.
- insert:
    - id: canvas
      name: dsh-canvas
      config:
        defaultLayout: lineage
        sharedCwdWarning: true
```

- [ ] **Step 3: Write tsdown.config.ts** (host ESM + client CJS with the mandatory lazy banner; no CSS plugin — styling is inline via `theme.ts`)

```ts
import type { UserConfig } from 'tsdown'

const PLUGIN_ID = 'dsh-canvas'
const CLIENT_EXTERNALS = [
  /^react(?:\/.*)?$/,
  /^react-dom(?:\/.*)?$/,
  /^@deepseek-ai\/cordis(?:\/.*)?$/,
  /^@deepseek-ai\/dsh-client-ui-primitives(?:\/.*)?$/,
]

const host: UserConfig = {
  name: PLUGIN_ID,
  entry: ['src/host/index.ts'],
  outDir: 'lib',
  format: ['esm'],
  platform: 'node',
  target: 'es2024',
  fixedExtension: false,
  dts: false,
  clean: true,
  deps: { neverBundle: true },
}

const client: UserConfig = {
  name: `${PLUGIN_ID}/client`,
  entry: { client: 'src/client/index.ts' },
  outDir: 'lib',
  format: 'cjs',
  fixedExtension: false,
  outExtensions: () => ({ js: '.js' }),
  platform: 'browser',
  target: 'es2022',
  dts: false,
  sourcemap: false,
  clean: false,
  deps: { neverBundle: CLIENT_EXTERNALS },
  define: { 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production') },
  outputOptions: {
    banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(PLUGIN_ID)}, factory: (require) => {`,
    footer: 'return module.exports; } });',
    intro: 'var module = { exports: {} }; var exports = module.exports;',
  },
}

export default [host, client]
```

- [ ] **Step 4: Write tsconfig.json, tsconfig.types.json, vitest.config.ts**

`tsconfig.json`: `{ "compilerOptions": { "target": "ES2022", "module": "ESNext", "moduleResolution": "Bundler", "jsx": "react-jsx", "strict": true, "noUncheckedIndexedAccess": true, "skipLibCheck": true, "noEmit": true, "types": ["node", "vitest/globals"] }, "include": ["src", "test"] }`
`tsconfig.types.json`: same minus `noEmit`, plus `"declaration": true, "emitDeclarationOnly": true, "outDir": "lib/types", "noEmit": false`, `"include": ["src"]`
`vitest.config.ts`: `defineConfig({ test: { environment: 'node', environmentMatchGlobs: [['test/**/*.test.tsx', 'jsdom']] } })`

- [ ] **Step 5: Write src/shared/status.ts and src/shared/contracts.ts**

```ts
// src/shared/status.ts
export type StatusKind =
  | 'idle' | 'queued' | 'thinking' | 'tool' | 'awaiting-approval' | 'failed' | 'done' | 'unknown'

export interface StatusBadge {
  readonly kind: StatusKind
  readonly confirmed: boolean
  readonly label: string
  readonly color: string
}

const BADGES: Record<StatusKind, StatusBadge> = {
  idle:           { kind: 'idle', confirmed: true, label: '空闲', color: '#9aa4b2' },
  queued:         { kind: 'queued', confirmed: true, label: '排队', color: '#8a7dff' },
  thinking:       { kind: 'thinking', confirmed: false, label: '思考中', color: '#f2a33c' },
  tool:           { kind: 'tool', confirmed: false, label: '工具执行', color: '#2f9e6f' },
  'awaiting-approval': { kind: 'awaiting-approval', confirmed: true, label: '待批准', color: '#d98a2b' },
  failed:         { kind: 'failed', confirmed: true, label: '失败', color: '#e0554d' },
  done:           { kind: 'done', confirmed: true, label: '已完成', color: '#4aa3df' },
  unknown:        { kind: 'unknown', confirmed: false, label: '状态未知', color: '#5b6472' },
}

export function badge(kind: StatusKind): StatusBadge { return BADGES[kind] }
```

```ts
// src/shared/contracts.ts
export type SessionId = string

export interface CanvasNode {
  readonly id: SessionId
  readonly parentId: SessionId | null
  readonly externalParent: boolean
  readonly title: string
  readonly createdAt: number
  readonly running: boolean
  readonly available: boolean
  readonly seeded: boolean
  readonly cwd: string | null
  readonly childCount: number
  /** Layered-layout column: 0 for roots and external roots (Task 2 addition). */
  readonly depth: number
}

export interface CanvasGraph {
  readonly nodes: ReadonlyMap<SessionId, CanvasNode>
  readonly roots: readonly SessionId[]
  readonly maxDepth: number
}

export type LaunchMode = 'now' | 'later'

export interface ForkRequest {
  readonly sessionId: SessionId
  readonly atSeq: number
  readonly instruction?: string
  readonly launch: LaunchMode
  readonly requestId: string
}

export interface BranchTurn {
  readonly index: number
  readonly userMessage?: string
  readonly assistantSummary?: string
  readonly tools: readonly { readonly name: string; readonly status: string }[]
  readonly endedAs?: string
  readonly synthetic: boolean
}

export interface BranchSegment {
  readonly sessionId: SessionId
  readonly inheritedCount: number
  readonly turns: readonly BranchTurn[]
}

export interface TurnDiff {
  readonly left?: BranchTurn
  readonly right?: BranchTurn
  readonly equal: boolean
}

export interface ComparisonResult {
  readonly a: BranchSegment
  readonly b: BranchSegment
  readonly turnDiffs: readonly TurnDiff[]
  readonly toolCountDiff: number
  readonly bothFailed: boolean
  readonly lastConclusion: { readonly side: 'a' | 'b' | 'both' | 'none'; text: string }
}
```

- [ ] **Step 6: Write src/client/locales.ts, src/client/theme.ts, src/host/index.ts**

```ts
// src/client/locales.ts
export const NS = 'dsh-canvas'
export const zh = {
  'view.canvas': '画布',
  'toolbar.search': '搜索',
  'toolbar.layout': '布局',
  'toolbar.refresh': '刷新',
  'panel.detail': '详情',
  'panel.compare': '对比',
  'fork.here': '从此分叉',
  'fork.inherit': '继承',
  'fork.launch.now': '立即开跑',
  'fork.launch.later': '只建分支',
  'fork.cwdWarning': '并行分支共享同一工作目录，同时写文件可能互相覆盖',
  'compare.continue': '切换至此分支继续',
  'compare.carry': '带回结论',
  'compare.empty': '选择两个分支进行对比',
  'state.unknown': '状态未知',
} as const
export const en: Record<keyof typeof zh, string> = {
  'view.canvas': 'Canvas',
  'toolbar.search': 'Search',
  'toolbar.layout': 'Layout',
  'toolbar.refresh': 'Refresh',
  'panel.detail': 'Detail',
  'panel.compare': 'Compare',
  'fork.here': 'Fork here',
  'fork.inherit': 'inherits',
  'fork.launch.now': 'Run now',
  'fork.launch.later': 'Create empty branch',
  'fork.cwdWarning': 'Parallel branches share one working directory; concurrent writes may overwrite each other',
  'compare.continue': 'Continue in this branch',
  'compare.carry': 'Carry conclusion here',
  'compare.empty': 'Select two branches to compare',
  'state.unknown': 'Status unknown',
}
```

```ts
// src/client/theme.ts
export const theme = {
  bg: '#11131a', panel: '#181b23', border: '#262a35', text: '#e6e9ef', muted: '#9aa4b2',
  accent: '#6af', warn: '#e0a23c', card: '#1c2029', cardActive: '#232a38',
} as const
```

```ts
// src/host/index.ts — config only; must never throw at boot.
export const name = 'dsh-canvas'
export interface CanvasConfig { readonly defaultLayout?: 'lineage' | 'timeline'; readonly sharedCwdWarning?: boolean }
export function apply(_ctx: unknown, _config: CanvasConfig = {}): void { /* config validated in adapters */ }
```

- [ ] **Step 7: Write the failing registration test**

```tsx
// test/canvas-tab.test.tsx
import { describe, expect, it, vi } from 'vitest'
import { apply, inject } from '../src/client/index.ts'
import { CanvasTab } from '../src/client/ui/CanvasTab.tsx'

describe('canvas client plugin', () => {
  it('declares the services it needs', () => {
    expect(inject).toEqual(expect.arrayContaining(['slots', 'sessions', 'uiConversation', 'locale']))
  })

  it('registers the canvas conversation.view with id canvas and order 20', () => {
    const register = vi.fn()
    const injectSlots = vi.fn((_slot: string, fn: () => void) => { fn(); return () => {} })
    const locale = { register: vi.fn(), bind: () => (key: string) => key }
    const ctx = { slots: { inject: injectSlots, register }, locale }
    apply(ctx as never)
    expect(injectSlots).toHaveBeenCalledWith('conversation.view', expect.any(Function))
    const [options, component] = register.mock.calls[0] as never as [{ id: string; order: number }, unknown]
    expect(options.id).toBe('canvas')
    expect(options.order).toBe(20)
    expect(component).toBe(CanvasTab)
  })
})
```

- [ ] **Step 8: Run the test — expect failure** (`Cannot find module '../src/client/index.ts'`)

Run: `pnpm vitest run test/canvas-tab.test.tsx`

- [ ] **Step 9: Write src/client/index.ts and src/client/ui/CanvasTab.tsx (minimal)**

```ts
// src/client/index.ts
import type { Context } from '@deepseek-ai/cordis'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import { NS, en, zh } from './locales.ts'
import { CanvasTab } from './ui/CanvasTab.tsx'

export const inject = ['slots', 'sessions', 'workspaces', 'uiWorkspace', 'uiConversation', 'locale']

export function apply(ctx: Context): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-canvas: dictionaries')
  const t = ctx.locale.bind(NS)
  ctx.slots.inject('conversation.view', () => ctx.slots.register({
    name: 'conversation.view',
    id: 'canvas',
    order: 20,
    locale: NS,
    label: () => t('view.canvas'),
    inject: (_sessionId: SessionId) => ({}),
  }, CanvasTab))
}
```

```tsx
// src/client/ui/CanvasTab.tsx
import type { FC } from 'react'
import { theme } from '../theme.ts'
export const CanvasTab: FC = () => (
  <div style={{ height: '100%', background: theme.bg, color: theme.text }} data-canvas-root />
)
```

- [ ] **Step 10: Run tests → PASS; typecheck; build**

Run: `pnpm vitest run && pnpm tsc -p tsconfig.json --noEmit && pnpm tsdown`
Verify `lib/client.js` first line contains `window.__ModuleLoader__.load(`.

- [ ] **Step 11: Write scripts/install-local.mjs (web profile) and install**

```js
// scripts/install-local.mjs — local dev loop. The desktop profile refuses CLI
// mutation by design (apps/cli/src/args.ts:83-87), so development installs into
// the web profile; the desktop shell serves the same client runtime.
import { execFileSync } from 'node:child_process'
const repo = 'D:/deepseek harness'
const pkg = 'file:C:/Users/sshuser/Desktop/dsh-canvas-plugin'
execFileSync('corepack', ['pnpm', 'dsh', 'plugin', '--profile', 'web', 'add', pkg],
  { cwd: repo, stdio: 'inherit', shell: true })
console.log('installed into web profile; start it with: corepack pnpm dsh web --port 3090 --no-open')
```

Run: `node scripts/install-local.mjs`
Then boot the web profile on a free port (`--port 3090`, since 3080 is squatted on this machine) and confirm the 「画布」 tab appears next to 对话/轨迹. **M0 gate #1 passes when the tab shows and disappears after `dsh plugin --profile web remove dsh-canvas` + reboot.**

- [ ] **Step 12: Commit**

```bash
git add -A && git commit -m "feat: plugin scaffold with canvas tab registration and local install script"
```

---

### Task 2: Lineage graph model (pure)

**Files:** Create `src/client/graph/graph-model.ts`, `test/graph-model.test.ts`
**Interfaces:** Produces `buildLineageGraph(summaries: SessionSummaryLike[], memberIds: ReadonlySet<string>): CanvasGraph`; `export interface SessionSummaryLike { id: string; parentId?: string; title?: string; createdAt: number; running: boolean; available: boolean; seeded?: boolean; cwd?: string }`

- [ ] **Step 1: Write failing tests** (cover: single root, child linking, parent outside workspace → externalParent root, cycle a→b→a, ordering by createdAt)

```ts
import { describe, expect, it } from 'vitest'
import { buildLineageGraph, type SessionSummaryLike } from '../src/client/graph/graph-model.ts'

const s = (id: string, extra: Partial<SessionSummaryLike> = {}): SessionSummaryLike =>
  ({ id, createdAt: 0, running: false, available: true, ...extra })

describe('buildLineageGraph', () => {
  it('links children to parents and computes depth', () => {
    const g = buildLineageGraph([s('a', { createdAt: 1 }), s('b', { parentId: 'a', createdAt: 2 })], new Set(['a', 'b']))
    expect(g.nodes.get('b')?.parentId).toBe('a')
    expect(g.roots).toEqual(['a'])
    expect(g.maxDepth).toBe(1)
    expect(g.nodes.get('a')?.childCount).toBe(1)
  })

  it('treats a parent outside the workspace as an external root', () => {
    const g = buildLineageGraph([s('b', { parentId: 'elsewhere' })], new Set(['b']))
    expect(g.nodes.get('b')?.externalParent).toBe(true)
    expect(g.nodes.get('b')?.parentId).toBe('elsewhere')
    expect(g.roots).toEqual(['b'])
  })

  it('breaks cycles instead of hanging', () => {
    const g = buildLineageGraph([s('a', { parentId: 'b' }), s('b', { parentId: 'a' })], new Set(['a', 'b']))
    expect(g.roots.length).toBeGreaterThan(0)
    expect(g.nodes.size).toBe(2)
  })

  it('excludes non-members', () => {
    const g = buildLineageGraph([s('a'), s('z')], new Set(['a']))
    expect([...g.nodes.keys()]).toEqual(['a'])
  })
})
```

- [ ] **Step 2: Run → FAIL**
- [ ] **Step 3: Implement** — filter to members; `parentId` kept raw; `externalParent = parentId != null && !memberIds.has(parentId)`; roots = nodes with no parent OR external parent OR parent missing from node map; depth via BFS from roots over children map with a `visited` guard (cycle-safe); `childCount` from children map; roots sorted by createdAt asc.
- [ ] **Step 4: Run → PASS; commit** `feat: lineage graph model with orphan and cycle handling`

---

### Task 3: Runtime status adapter (pure reducer + adapter shell)

**Files:** Create `src/client/adapters/runtime-status-adapter.ts`, `test/runtime-status.test.ts`
**Interfaces:** Produces `deriveStatus(input: { running: boolean; available: boolean; lastHint?: 'thinking' | 'tool' | 'awaiting-approval'; connected: boolean }): StatusKind`

- [ ] **Step 1: Failing tests**: disconnected → `unknown` regardless of running; available=false → `failed`; running with hint → hint kind (confirmed=false); running without hint → `thinking`; not running + hint tool → `unknown`?? (spec: never infer idle from silence — if not running and hint exists, hint is stale → `idle`? Decide: not running → `idle` is a confirmed fact from the summary (running=false), so `idle`; disconnected wins first.)

Order of precedence: `!connected → unknown`; `!available → failed`; `running → hint ?? thinking`; else `idle`.
- [ ] **Step 2: FAIL → 3: implement → 4: PASS; commit** `feat: runtime status derivation with confirmed/inferred/unknown`

---

### Task 4: Workspace + session adapters (graph input assembly)

**Files:** Create `src/client/adapters/workspace-adapter.ts`, `src/client/adapters/session-adapter.ts`
**Interfaces:**
- `workspace-adapter.ts`: `selectWorkspaceSummaries(workspaceItems: readonly WorkspaceItemLike[] | undefined, currentWorkspaceId: string | null | undefined, summaries: readonly SessionSummaryLike[], fallbackCwd: string | null): WorkspaceSelection` where `WorkspaceItemLike = { workspaceId: string; path?: string; sessionIds?: readonly string[] }` and `WorkspaceSelection = { workspaceId: string | null; members: SessionSummaryLike[] }`. Members are the **union** of `sessionIds` accounting (in that manual order) and a `cwd === path` match; when the current workspace cannot be resolved, fall back to `cwd === fallbackCwd` and recover the workspace id from a row whose `path` matches. Undecidable membership yields `members: []`, never the unfiltered list.
- `session-adapter.ts`: `toSummaries(listSnapshot: unknown): SessionSummaryLike[]` — narrow defensively (no throw): accepts `{ ids, byId }`, `{ items }`, or a bare array; membership comes from `ids` alone (byId also carries subagent fallback rows that must not become nodes); maps `parentSessionId ?? parentId`.

**Task 4 corrections (verified against local source, 2026-10-16)** — the original text of this task was written from the spec, which had drifted from the checkout at `639ed01539`:
- There is **no `recentWorkspaceId`** on the client workspace snapshot. The real snapshot is `WorkspaceSnapshot { items: WorkspaceView[]; archivedSessionIds; pinnedSessionIds; state; phase; error }` (`packages/api/workspace-controller/src/client/model.ts:32-41`), and `WorkspaceView` is `{ workspaceId, path, title, sessionIds, createdAt, updatedAt }` (`…/types.ts`). The caller resolves which workspace is current; hence `currentWorkspaceId` replaces `recentWorkspaceId`.
- The client list row has **no `createdAt`** (`client/sessions/service.ts:26-51`). `toSummaries` maps `createdAt ← createdAt ?? updatedAt`, so root ordering is activity-based, not creation-based. This is a carry-forward: DSH's own `flattenLineage` refuses to re-sort a hydrated list by mutable timestamps and treats input order as authoritative (`client/sessions/lineage.ts:37-40`).
- The client list row has **no availability/failure signal**, and `agentAvailable` means "currently owns a live Agent" (`src/list.ts:113`) — false for every cold session. Mapping it to `available` would report idle sessions as `failed`, so `toSummaries` always sets `available: true` and the `failed` branch of Task 3 stays reachable only from an explicit future error channel.
- `seeded` is **not** a list fact (`inheritedEventCount` / `session/end-seed` are event-stream facts, `src/commands.ts:273`, `core/session/src/fork.ts:24`); the list adapter leaves it unset for the event-stream adapter to fill.

- [ ] **Step 1: Failing tests** for both (fixture shapes from the real snapshots: client row `{ id, displayTitle, running, retainedBy, blank, updatedAt, title?, cwd?, parentId? }` under `{ ids, byId }`; `WorkspaceView` rows; workspace item without `sessionIds` → path/cwd fallback; `null`/malformed snapshot → `[]`).
- [ ] **Step 2: FAIL → 3: implement → 4: PASS; commit** `feat: workspace membership and session summary adapters`

---

### Task 5: Event stream adapter (retain lifecycle + timeline snapshot)

**Files:** Create `src/client/adapters/event-stream-adapter.ts`, `test/event-stream-adapter.test.ts`
**Interfaces:** Produces
```ts
export interface TimelineSource {
  readonly sessionId: string
  openState(): OpenStateLike            // 'cold' | 'loading' | 'open' | 'error'
  snapshot(): unknown
  subscribe(listener: () => void): () => void
  loadOlder(): Promise<boolean>
  release(): void                       // idempotent
}
export function openTimeline(sessions: SessionsLike, uiConversation: UiConversationLike, sessionId: string): Promise<TimelineSource>
```
`SessionsLike = { retain(target, options): SessionReferenceLike }` where `SessionReferenceLike = { sessionId; binding; ready: Promise<SessionBindingLike>; release() }`. The binding is taken from `reference.ready`, **not** from a second `sessions.binding(id)` lookup — the reference is what keeps the Session alive, so its own resolved binding removes a lookup and a generation race. `openState` is read from `binding.session.getSnapshot().openState`, which is guaranteed present, rather than from the chat target snapshot (whose type is `… | undefined`). `loadOlder()` delegates to `binding.session.loadOlder()` and returns whether the window actually changed, since `loadOlder(): Promise<void>` reports completion only and lands failures in `snapshot.openState`/`loadingOlder`.

**Task 5 corrections (verified against local source, 2026-10-16):**
- `retain` returns `SessionReference { sessionId, binding, ready: Promise<SessionBinding>, release() }` (`client/contract/sessions.ts:24-33`), and `SessionFace = ISession & ObservableSnapshot<SessionSnapshot>` (`…/contract/session.ts:155`) — so both `getSnapshot()` and `loadOlder()` hang off `binding.session`.
- `SessionRetainOptions.source` is a **closed, merge-extensible union** (`SessionReferenceSourceMap`, `client/index.ts:80-88`) whose base members are `controllerOperation | gateway`; every other plugin declares its own label (`ui-workspace` → `workspaceOperation`, `ui-goal` → `goalActivation`, `ui-session` → `mainView`). This plugin declares `canvasNode` and retains under it so M0 gate 11 can attribute its retains. The declaration merge is deferred to Task 13 (the package is not a dependency here, so `declare module` is TS2664); the label still works at runtime.
- **`uiConversation.binding(sessionId)` throws** for an unknown *or inactive* session (`ui-conversation client/conversation/assembly.ts:237-243`), so it may only be called after a retain has made the session current, and its throw must release the retain.
- **Both failure paths must release before rethrowing.** A failed read that leaves a Session pinned open is precisely the residue M0 gate 11 checks for.

- [ ] **Step 1: Failing tests** with fakes: retain called with `{source: canvasNode}` and the chat target read off the retained binding; ready resolves → snapshot/subscribe exposed; ready rejects → reject **and release called once, with no conversation lookup**; binding throws → reject and release; `loadOlder` delegates and reports window change; subscribe unsubscribes; double `release()` releases once.
- [ ] **Step 2: FAIL → 3: implement → 4: PASS; commit** `feat: timeline event stream adapter with retain/release lifecycle`

---

### Task 6: Fork transaction (idempotent, no double-fork)

**Files:** Create `src/client/controllers/fork-controller.ts`, `test/fork-transaction.test.ts`
**Interfaces:**
```ts
export interface ForkDeps {
  fork(req: { sessionId: string; atSeq: number; increaseTitle: boolean; onCreated?: (id: string) => void }): Promise<string>
  findChildByScan(parentId: string): Promise<string | undefined>
  using<T>(sessionId: string, op: (send: (text: string, requestId: string) => Promise<PromptOutcome>) => Promise<T>): Promise<T>
  newRequestId(): string
}
export type PromptOutcome = { ok: true } | { ok: false; error: string }
export type ForkPhase = 'validating' | 'forking' | 'launching' | 'done' | 'failed' | 'unverified'
export interface ForkResult { readonly childId: string; readonly phase: ForkPhase; readonly error?: string; readonly retriedPrompt: boolean }
export async function runForkTransaction(deps: ForkDeps, req: { sessionId: string; atSeq: number; instruction?: string; launch: 'now' | 'later'; requestId?: string }): Promise<ForkResult>
```
Behavior: validate (`atSeq` a non-negative integer; `launch:'now'` requires a non-blank instruction) → fork once → optionally prompt with a single retry.

**Task 6 corrections (verified against local source, 2026-10-16):**
- **`prompt()`'s `requestId` is the FOURTH parameter**, after `signal`: `prompt(content, mode, signal?, requestId?)` (`client/contract/session.ts:87-92`; canonical call `ui-conversation client/service.ts:293`). The original plan wrote `prompt(blocks, 'queue', requestId)`, which passes the id as `signal` — the id is dropped and Host-side dedupe silently stops working, breaking M0 gate 7. Task 11's wiring must pass `undefined` for `signal`.
- **`prompt()` does not reject on business errors**: it resolves `Promise<RemoteResult<{accepted:true}>>` (`ui-conversation client/service.ts:293-295` reads `result.ok`). A transaction that only catches rejections would read a refused prompt as success, so `send` returns an unwrapped `PromptOutcome` and the retry decision keys on `ok`.
- **`onCreated` fires before the optional title rename, and `fork` rejects when only that rename fails** (`contract/sessions.ts:122-131`). A rejection therefore does not prove the child is absent: the id captured by `onCreated` is checked first, before any scan or error-text reasoning.
- Recovery does not gate on error text. Any rejection with no observed child attempts a scan, so a lost receipt is recovered however it is worded; the transport-vs-business heuristic only chooses between the `unverified` and `failed` **labels**. A misclassification can never cause a duplicate fork.
- `requestId` is optional on the request; `deps.newRequestId()` mints one when absent (this is what gives that dep its purpose).

- [ ] **Step 1: Failing tests**: happy path (fork→prompt once, same requestId); rename-failure recovery (fork rejects, `onCreated` captured the child, no scan, fork called exactly once); receipt-loss recovery (fork rejects, scan finds child, prompt proceeds, fork exactly once); scan miss with a transport error → `unverified` and fork called once; scan miss with a business error → `failed`; prompt fails twice → `failed`, fork once, both prompts the same id; retried prompt succeeds → `done` with `retriedPrompt`; `launch:'later'` → no prompt; `launch:'now'` blank instruction and invalid `atSeq` → `failed` with **no** fork; a thrown send is retried; `requestId` defaults to `newRequestId()`; instruction is trimmed.
- [ ] **Step 2: FAIL → 3: implement → 4: PASS; commit** `feat: fork transaction with idempotent prompt retry and receipt-loss recovery`

---

### Task 7: Branch segment + deterministic diff (pure)

**Files:** Create `src/client/compare/branch-segment.ts`, `src/client/compare/diff.ts`, `test/branch-segment.test.ts`, `test/diff.test.ts`
**Interfaces:**
- `segmentFromEvents(sessionId: string, inheritedCount: number, events: readonly SessionEventLike[]): BranchSegment` where `SessionEventLike = { seq: number; type: string; data?: unknown }`. Keeps events with `seq >= inheritedCount`; groups them into turns spanning `turn/start..turn/end`; user text from `user/message` **whose `data.source.kind === 'user'`**; assistant summary from `assistant/message.data.message.content` text blocks, bounded to 200 chars; tools from `tool/call` paired to `tool/result` by `callId` with status `pending | ok | error`; `synthetic: true` when the turn contains `session/end-seed` or a `turn/end` with `reason.kind === 'forked'`.
- `compareBranches(a: BranchSegment, b: BranchSegment): ComparisonResult` — positional alignment over each side's non-synthetic turns, `max(len)` rows, missing side left `undefined`; `equal` = same user text + same tool-name sequence (outcomes may differ); `toolCountDiff` = right − left; `bothFailed` = both last turns ended with `reason.kind === 'error'` (`aborted` is not a failure); `lastConclusion` = the last non-synthetic turn's summary per side, `'both'` when identical, else the longer text, tie to `'a'`.

**Task 7 corrections (verified against local source, 2026-10-16)** — `core/session/src/types.ts:281-431`:
- **There is no `text-chunks` event type.** Assistant text lives in `assistant/message.data.message.content` as `{ type: 'text', text }` blocks (`ContentBlock` = text | reasoning | image | …, merge-extensible). The summary reads text blocks and ignores reasoning and images.
- **The inherited boundary is inclusive, so the new segment is `seq >= inheritedCount`, not `>`.** DSH sets `inheritedEventCount = SessionLogOffset(boundary + 1)` for the inclusive cut `atSeq = boundary` (`api/session-controller/src/commands.ts:273`), and the reader-side test is `identity.seq < inheritedEventCount` → inherited (`history.ts:368`). "Rows after `inheritedCount`" was off by one.
- **Synthetic closers therefore land inside the new segment** — which is what the `synthetic` flag is for. A cut inside an open turn leaves the child a `turn/end{reason:{kind:'forked'}}` with **no** `turn/start` of its own; `turn/end.reason.kind` is the discriminator, not `turn/end.kind`.
- **`user/message` also carries injected context** (`agent.inject()`: file-change notices, subdir AGENTS.md, skill content, cron) and all variants project their content verbatim. `source.kind === 'user'` is the separator — the same test DSH's own list projection uses for `lastPromptAt` (`api/session-controller/src/list.ts:50`). Without it, injected context would pollute every prompt diff.
- `tool/result` pairs to its call through the **required** `message.toolCallId` (`llm/src/message.ts:177`). A result whose call sits in the inherited prefix has no name to report and is skipped rather than emitted as a nameless row.
- Synthetic turns are excluded from `turnDiffs`, `toolCountDiff`, and `lastConclusion` — they are identical in every branch by construction, so counting them would add the same noise row to every comparison. They stay visible in `BranchSegment.turns` for the timeline UI.

- [ ] **Step 1: Failing tests**: segment skips the inherited prefix (`>=`, boundary case pinned); turns grouped with `endedAs`; injected context ignored and a turn with no human prompt left `undefined`; assistant summary concatenated and bounded to 200 with an ellipsis; tool outcomes `ok`/`error`/`pending`; an inherited-prefix result ignored; `session/end-seed` and `turn/end{forked}` both flag `synthetic`; a `turn/end` with no `turn/start` becomes its own synthetic turn; unsorted input ordered by seq; empty and fully-inherited windows yield no turns; malformed data never throws. Diff: positional alignment with `undefined` side; equality rules; synthetic exclusion; `toolCountDiff` sign; `bothFailed`; conclusion selection including a discriminating "last turn not first" case and a "synthetic closer must not win" case.
- [ ] **Step 2: FAIL → 3: implement → 4: PASS; commit** `feat: branch segment extraction and deterministic comparison`

---

### Task 8: Canvas UI — full-bleed canvas with nodes, layout, pan/zoom

**Files:** Create `src/client/graph/graph-layout.ts`, `test/graph-layout.test.ts`, `src/client/ui/canvas-model.ts`, `src/client/ui/NodeCard.tsx`, extend `src/client/ui/CanvasTab.tsx`, extend `src/client/index.ts` inject wiring, `test/canvas-tab.test.tsx` additions
**Interfaces:**
- `layoutLayered(graph: CanvasGraph, opts?: { columnGap?; rowGap?; nodeWidth?; nodeHeight? }): { positions: ReadonlyMap<string, { x: number; y: number }>; width: number; height: number }` — `depth` → x column; rows assigned to **leaves** in depth-first order with a parent centred between its first and last child; pure.
- `CanvasModel` in `src/client/ui/canvas-model.ts` = `{ graph; statusOf(id): StatusBadge; selectedId?; compareIds; view: { x, y, scale }; onSelect; onToggleCompare; onViewChange; search; refresh? }`, plus `emptyCanvasModel()`. `CanvasTab` props are `{ canvas?: CanvasModel }`.

**Task 8 decisions (verified against local source / recorded, 2026-10-16):**
- **Rows go to leaves, not to every node.** The obvious reading of "DFS order → y stack" (one row per node) draws a staircase for the single most common shape, a linear chain: a → b → c would occupy three rows and three columns diagonally. Assigning rows to leaves and centring a parent between its children keeps a chain flat on one row while still separating real branches. Pinned by two tests.
- **The parallel-write badge means "another *running* session shares my directory"**, so: two running sessions in one directory → both flagged; an idle node beside a running one → the idle node is flagged (forking it adds a second writer); the *only* running session in a directory → not flagged, since it has nobody to collide with. Computed as a per-cwd running count, so it is O(n) rather than O(n²) on the 500-node stress fixture of M0 gate 10.
- `refresh` is optional on `CanvasModel`; the toolbar only renders 刷新 when the controller supplies one, rather than shipping a button that does nothing.
- **The layout toggle (血缘树/时间线) is not rendered.** Only the layered layout exists in v1; a toggle with one working option is worse than no toggle. `defaultLayout` stays a host config knob.
- `CanvasTab` accepts an absent model and renders an explicit `data-canvas-unwired` state. `index.ts` supplies `emptyCanvasModel()` (built once at module scope for a stable identity) so the tab renders in the app before Task 11 wires the controller; Task 11 replaces it. A client entry that throws during render is fatal for the whole page boot, so this is boot safety, not a placeholder for its own sake.
- Wheel zoom clamps to 0.4–2; pan uses mouse events rather than pointer events, which jsdom supports without polyfills.

- [ ] **Step 1: Failing layout tests**: single root at origin; per-depth columns; siblings stacked by row gap; a chain stays on one row; a second branch moves to the next row with the parent centred; bounds cover the last column and row; custom gaps; empty graph; a cycle terminates and still positions every node; a node no root reaches is still placed; separate roots stack in column 0.
- [ ] **Step 2: implement layout + NodeCard (title, status dot with inferred styling, relative time, child count, ⑂ seeded marker, external-parent note, ⚠ 并行写入) + CanvasTab (SVG bezier edges + absolutely positioned cards, wheel zoom, drag pan, 适配视图, search that highlights matches, ctrl/cmd+click toggles compare) → 4: PASS; component tests cover the unwired boot state, one card per node, click→`onSelect`, ctrl+click→`onToggleCompare` without selecting, search reporting and highlight, selected/compared marking, the three parallel-write cases, the seeded marker, fit-view scale clamping, the conditional refresh button, and one edge per non-root node; `lib/client.js` keeps its `window.__ModuleLoader__.load(` banner with React external; commit** `feat: full-bleed lineage canvas with layered layout`

---

### Task 9: Right panel — detail timeline + fork flow UI

**Files:** Create `src/client/ui/RightPanel.tsx`, `src/client/ui/BranchTimeline.tsx`, `src/client/ui/ForkDialog.tsx`, `test/branch-timeline.test.tsx`
**Interfaces:**
- `BranchTimeline` props: `{ turns: readonly BranchTurn[]; inheritedCount: number; onFork(rowIndex: number): void; cwdWarning: boolean }` — renders one row per turn with its `seq first–last` range, the human prompt (or 「（无用户消息）」), the assistant summary, tool count and `endedAs`; each non-synthetic row offers 「⑂ 从此分叉」.
- `cutSeqAt(turns, rowIndex): number | undefined` — the fork cut for a row.
- `ForkDialog` props: `{ open; atSeq; inheritedCount; busy?; error?; onCancel(); onConfirm(instruction, mode: LaunchMode) }` — instruction textarea, mode radios 立即开跑/只建分支, a **persistent** ⚠ shared-cwd line, 取消/创建.
- `RightPanel` props: `{ tab: 'detail' | 'compare'; title?; onTabChange(tab); onClose(); children }`.

**Task 9 corrections and decisions (verified against local source, 2026-10-16):**
- **`BranchTurn` had no seq range, so the cut point could not be named at all.** `segmentFromEvents` now records `firstSeq`/`lastSeq` per turn (Task 7 contract extension), which is what the spec's 「每条消息标注事件序号区间」 actually requires.
- **The cut is the row's own `lastSeq`, not "the seq before the next row's first event".** Those are equal only while seqs are contiguous, and they are not: with a gap (row 0 ends at 4, row 1 starts at 20) the spec's rule yields `19`, which is not an event — and DSH rejects a fork whose `atSeq` is not a real event (`api/session-controller/src/commands.ts:246-254`, "event N does not exist"). Cutting at the row's own last seq is always real, inherits the row in full, and excludes the next row, which is what "fork here" means. Pinned by a test that asserts the two rules differ.
- **Forking at a synthetic closer row is refused** (button disabled): cutting at fork plumbing is never what the user means.
- **The dialog names the real cut**: `atSeq` plus `atSeq + 1` inherited events, because `inheritedEventCount = boundary + 1`. The spec's example prose ("seq 47 · inherits 47 events") is off by one; the code is what runs. When the source session is itself a fork, its own inherited count is shown as 「其中 N 个来自更上游」.
- **The dialog blocks a blank "run now"** (confirm disabled) rather than submitting a request the fork transaction is guaranteed to reject; 「只建分支」 with a blank instruction stays allowed.
- The shared-cwd warning is permanent in both the timeline and the dialog, not a dismissible toast — v1 branches always share the source cwd.

- [ ] **Step 1: Failing tests**: `cutSeqAt` returns the row's last seq, survives a gap, and is `undefined` out of range; rows render with seq ranges and outcome; `onFork` receives the row index; a synthetic row's fork button is disabled and does not fire; the warning appears only when it applies; the empty state; the placeholder for a turn with no human prompt. Dialog: closed renders nothing; the cut line names `atSeq` and `atSeq + 1`; the warning is always present; confirm passes trimmed text + mode; defaults to `now`; a blank immediate run is blocked while an empty branch is allowed; cancel; error and busy disable confirm. RightPanel: tab switch and close.
- [ ] **Step 2: implement → 4: PASS; commit** `feat: branch detail timeline with message-level fork dialog`

---

### Task 10: Compare panel — comparison, 择优继续, 带回结论

**Files:** Create `src/client/ui/ComparePanel.tsx`, `test/compare-panel.test.tsx`
**Interfaces:** `ComparePanel` props: `{ result: ComparisonResult | null; onContinue(side: 'a' | 'b'): void; onCarry(side: 'a' | 'b', draft: string): void }` — A|B summary (inherited prefix + tool count per side, tool-count difference, both-failed notice), both last conclusions, one row per `turnDiffs` entry, and the actions.

**Task 10 decisions (2026-10-16):**
- **「带回结论」 has two steps, and the first sends nothing.** Clicking it only fills an editable textarea with `参考另一分支的结论：<对方的结论>。现在结合两者继续：`; `onCarry` fires only from a second, explicit 「放入输入框」 action, by which point the user has seen and edited the text. This is the design spec's rule made structural — an external branch's conclusion is reference material and carries no execution authority.
- Each carry button carries the **other** side's conclusion (`带回 B 的结论` on the A side), so `side` is the branch being continued in and the summary is the other branch's. When the other side has no conclusion the draft says 「（对方没有结论）」 rather than emitting a blank sentence.
- Per-side conclusions are read from that side's last **non-synthetic** turn, matching `compareBranches`' own rule, so the panel and the diff can never disagree. `lastConclusion.side` is surfaced as a factual note (「两边一致」 / 「更完整」) rather than as a recommendation — the rule picks the longer text, not the better one.
- A 取消 discards the draft and hands nothing over.

- [ ] **Step 1: Failing tests**: empty state message; per-side inherited counts and tool counts plus the difference; both-failed notice; one row per diff with unequal marking and a missing side; conclusions per side and the identical case; 择优继续 calls `onContinue`; carry fills the draft and does **not** call `onCarry`; the edited draft is what gets handed over; carrying works in both directions; the no-conclusion placeholder; 取消 hands nothing over.
- [ ] **Step 2: implement → 4: PASS; commit** `feat: branch comparison panel with continue and carry-forward draft`

---

### Task 11: Controllers + wiring (graph, fork, compare) and DSH integration

**Files:** Create `src/client/controllers/graph-controller.ts`, extend `src/client/index.ts`
**Interfaces:** `createGraphController(deps: GraphControllerDeps): GraphController` where the controller returns `{ model(): CanvasModel; refresh(); select(id); toggleCompare(id); search(text); openInChat(id); forkFromRow(sessionId, atSeq, instruction, launch); compare(); subscribe(listener) }`.

**Task 11 corrections and decisions (verified against local source, 2026-10-16):**
- **The controller takes structural `deps`, not `ctx`.** Every DSH call lives in `index.ts` (`depsFor`), so the controller is testable with a fake and the DSH surface has exactly one home. `apply` builds one controller per conversation and caches its model, because the slot hands the tab **one** model object for its lifetime.
- **The model is a live view, not a snapshot.** Its properties are getters over controller state plus an optional `subscribe`; `CanvasTab` subscribes and bumps a reducer. Handing out a fresh model every render would drop the tab's subscription each time.
- **`forkDeps.using`'s reference exposes `binding.session`, not `session`** — `SessionReference { sessionId, binding, ready, release }` and `SessionBinding.session` is the `SessionFace`. The prompt call is `reference.binding.session.prompt(content, 'queue', undefined, requestId)`, with `requestId` fourth (see Task 6).
- **`SessionTarget` is `SessionId | SubagentAddress`** — the original `{ sessionId: id }` is neither. A branded id is passed instead.
- **Two type augmentations are missing because the packages are not dependencies**: `ctx.uiWorkspace` and `SessionReferenceSource`. Both are cast at the DSH boundary in `index.ts` only, with the reason documented inline. This is the Task 5 deferred debt coming due; adding the two `@deepseek-ai/dsh-api-*` devDependencies restores both merges.
- **`findChildByScan(parentId)` was replaced by `childrenOf` + a before/after diff** (see Task 6). On a canvas the parent almost always already has children, so "a child of the parent" would return a pre-existing branch and deliver the prompt to the wrong session.
- **`inheritedCountOf` does not exist client-side.** The inherited prefix is read off the fork's own `session/end-seed { inherited: true }` marker via `inheritedPrefixLength(events)` in `branch-segment.ts` — the same boundary the Host records as `inheritedEventCount`, so the number is derived from the log instead of a field the client surface does not expose.
- **Comparison assembly had no task at all.** `compare()` is included here: it reads each side's durable events through `readEvents` (a one-shot `retain` → `binding.eventSource.getSnapshot().entries`, filtered to `type === 'event'`, released in `finally`) and returns `null` on any failure — a comparison that cannot be built must read as "nothing to compare", never as "identical branches".
- **Workspace scope is resolved from the conversation's cwd**, since the client workspace snapshot has no "current workspace" field: the tab's own session decides which workspace the canvas shows.
- `isConnected()` is `phase === 'ready' && state !== 'error'` from the list snapshot, which makes the `unknown` status genuinely reachable on boot and on a stream failure.
- Session and workspace snapshots are subscribed in `apply`, so a parallel branch changing state reaches the canvas without user action.

- [ ] **Step 1: Failing tests** for the controller with a fake: graph built from workspace members and out-of-workspace sessions excluded; per-node status including `unknown` on disconnect; selection through the model getters; compare toggling with the oldest pick dropping on a third; search locating the first match; `openInChat` delegation; selections dropped when they leave the workspace; subscriber notification; `forkFromRow` running the transaction and refreshing; `compare()` null below two picks and on an unreadable read; `compare()` honouring each side's inherited prefix. Plus `inheritedPrefixLength` (marker at the cut, last marker wins, untagged markers ignored, never-forked is zero) and an integration test that `apply` injects a **live** controller model, not a placeholder.
- [ ] **Step 2: implement → 4: PASS; commit** `feat: wire controllers and panels into the canvas tab`
- [ ] **Step 3: mount the panels inside `CanvasTab`.** `RightPanel` + `BranchTimeline` (detail), `ComparePanel` (compare tab), `ForkDialog` (over the panel body). The model gained `detail(id)`, `comparison()`, `forkFromRow(...)`, `openInChat(id)` and `clearSelection()`; each is optional, so a tab without them still renders the canvas alone.
  - The detail read is **one-shot** (`readEvents` retains, reads, releases), so selecting another node has nothing to leak and there is no `closeDetail`. v1 therefore shows a snapshot of the branch, not a live-updating one.
  - `unverified` is surfaced as 「分支可能已创建，但无法确认」 and the dialog stays open — calling it a failure would invite exactly the second fork the transaction exists to prevent.
  - v1 has no composer handle, so 带回结论 copies the draft to the clipboard and confirms it. It still never submits anything.
  - Double-clicking a node opens it in the conversation (`openInChat`), which is what makes `openInChat` reachable from the UI.
  - `parallelWriteIds` moved to `graph/parallel-write.ts` so the badge and the detail panel's `cwdWarning` share one rule instead of two copies.
- [ ] **Step 4: commit** `feat: mount the detail, compare, and fork panels in the canvas tab`

---

### Task 12: M0 verification run against the real desktop profile

**Files:** Create `docs/superpowers/m0-verification.md` (results table), `scripts/m0-check.mjs` (assertions where scriptable)
**Steps:**
- [ ] Run `pnpm verify` (typecheck+test+build).
- [ ] Install into the **web** profile (`pnpm run install:local`), boot `dsh web --port 3090 --no-open`, and walk all 12 M0 gates from the spec in the browser (tab show/remove; workspace graph; exact atSeq inheritance checked against a real session; **empty branch does not auto-run queued input**; single launch; fork-receipt-loss recovery; prompt-receipt-loss single execution; two parallel branches observable; subscription survives switch/disconnect/reconnect; 500-node stress with fixtures; uninstall leaves no retains; node→session switching). Record PASS/FAIL + evidence per gate.
- [ ] The desktop-shell tab check is deferred to Task 13 (it requires an npm install through the app's 插件 page, which is a user action).
- [ ] Fix every FAIL before continuing (each fix gets its own commit).
- [ ] Commit the results doc: `test: M0 verification results`.

---

### Task 13: Packaging and publish readiness

**Files:** Create `README.md`, `README.zh-CN.md`, `LICENSE` (MIT), `THIRD_PARTY_NOTICES.md`, `SECURITY.md`, `CHANGELOG.md`, `.github/workflows/ci.yml`, `docs/compat.md`
**Steps:**
- [ ] READMEs: one-line install for desktop and web profiles, screenshots placeholder path, capability list, explicit v1 limits (shared cwd, no auto-pick, no persistent mainline), compat matrix (0.2.0-rc.2 verified).
- [ ] CI: `pnpm install --frozen-lockfile && pnpm run verify`; tag-triggered `npm publish` job with `NODE_AUTH_TOKEN`.
- [ ] `publint --strict` + `attw --pack . --profile esm-only` pass.
- [ ] npm name availability check (`npm view dsh-canvas`) — if taken, rename to `@<scope>/dsh-canvas` and update README.
- [ ] Commit: `chore: packaging, docs, and publish pipeline`.

---

## Self-Review Checklist (run before executing)

1. **Spec coverage**: graph (T2,T8) · fork lifecycle (T5,T6,T9) · compare (T7,T10) · status (T3,T11) · workspace membership (T4) · UI (T8,T9,T10) · M0 (T12) · packaging (T13). Every spec section maps to ≥1 task. ✔
2. **Placeholders**: none — every task contains real code/commands. The Step 1 package.json inject array is corrected in-task (Step 1 fix). ✔
3. **Type consistency**: `CanvasNode/CanvasGraph/StatusKind/ForkRequest/BranchSegment/ComparisonResult` defined once in `src/shared/contracts.ts` + `status.ts` and reused verbatim; `runForkTransaction` signature identical in T6 and T11; `TimelineSource` defined in T5 and consumed in T9/T10. ✔
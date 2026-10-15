# dsh-canvas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A publishable DSH client plugin that registers a 「画布」tab showing a workspace's session lineage as a full-bleed canvas, forks branches from any message with idempotent launches, shows parallel run status, and compares two branches deterministically.

**Architecture:** A standalone npm package (`dsh-canvas`) with a host apply (config only) and a client apply registering the `conversation.view` slot. Four layers keep DSH API churn isolated: UI (CanvasTab/BranchTimeline/ComparePanel) → Controllers (Graph/Fork/Compare) → Adapters (Workspace/Session/Fork/EventStream/RuntimeStatus) → DSH services (`ctx.sessions`, `ctx.workspaces`, `ctx.uiWorkspace`, `ctx.uiConversation`, `ctx.slots`, `ctx.locale`). All lineage/graph/diff/fork-transaction logic is pure and unit-tested; DSH touchpoints live behind adapters with injectable fakes.

**Tech Stack:** TypeScript 5.9, tsdown 0.22 (host ESM + client CJS lazy-bundle), vitest 3.2, @testing-library/react 16, React 18 (peer from host), cordis (peer from host), zero runtime dependencies beyond optional dev tooling.

## Global Constraints

- **Target**: DeepSeek Harness `0.2.0-rc.2`, desktop profile. All DSH APIs must be verified against the local checkout `D:\deepseek harness` (commit `639ed01539`), never against online master docs.
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
        "@deepseek-ai/dsh-client-runtime",
        "@deepseek-ai/dsh-client-connection",
        "@deepdeep-placeholder"
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
    "@deepseek-ai/dsh": "0.2.0-rc.2",
    "@deepseek-ai/dsh-client-locale": "0.2.0-rc.2",
    "@deepseek-ai/dsh-client-runtime": "0.2.0-rc.2",
    "@deepseek-ai/dsh-client-ui-conversation": "0.2.0-rc.2",
    "@deepseek-ai/dsh-client-ui-primitives": "0.2.0-rc.2",
    "@deepseek-ai/dsh-client-ui-slots": "0.2.0-rc.2",
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

**Step 1 fix (required)**: the `dsh.client.inject` array must be exactly:
`["@deepseek-ai/dsh-client-runtime", "@deepseek-ai/dsh-client-connection", "@deepseek-ai/dsh-client-ui-conversation", "@deepseek-ai/dsh-client-ui-slots", "@deepseek-ai/dsh-client-locale"]`
(the placeholder line above must not survive).

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

- [ ] **Step 11: Write scripts/install-local.mjs and install into the desktop profile**

```js
// scripts/install-local.mjs
import { execFileSync } from 'node:child_process'
const repo = 'D:/deepseek harness'
const pkg = 'file:C:/Users/sshuser/Desktop/dsh-canvas-plugin'
execFileSync('corepack', ['pnpm', 'dsh', 'plugin', '--profile', 'desktop', 'add', pkg],
  { cwd: repo, stdio: 'inherit', shell: true })
```

Run: `node scripts/install-local.mjs`
Then restart the desktop app: `Start-Process "$env:LOCALAPPDATA\Programs\DeepSeek Harness\DeepSeek Harness.exe"` (app must be quit first), confirm port 19387 listens, and confirm the 「画布」 tab appears next to 对话/轨迹. **M0 gate #1 passes when the tab shows and disappears after `dsh plugin --profile desktop remove dsh-canvas` + restart.**

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
- `workspace-adapter.ts`: `selectWorkspaceSummaries(workspaceItems: readonly { workspaceId: string; sessionIds: readonly string }[] | undefined, recentWorkspaceId: string | undefined, summaries: readonly SessionSummaryLike[], fallbackCwd: string | null): { workspaceId: string | null; members: SessionSummaryLike[] }` — prefer `recentWorkspaceId`'s members; if no item carries `sessionIds`, fall back to `cwd === fallbackCwd`.
- `session-adapter.ts`: `toSummaries(listSnapshot: unknown): SessionSummaryLike[]` — narrow the client snapshot shape defensively (no throw): reads `ids`/`byId` or an array form; maps `parentSessionId ?? parentId`.

- [ ] **Step 1: Failing tests** for both (fixture shapes from the real snapshot: `{ ids: [...], byId: { id: {...} } }`; workspace item without `sessionIds` → cwd fallback; `null` snapshot → `[]`).
- [ ] **Step 2: FAIL → 3: implement → 4: PASS; commit** `feat: workspace membership and session summary adapters`

---

### Task 5: Event stream adapter (retain lifecycle + timeline snapshot)

**Files:** Create `src/client/adapters/event-stream-adapter.ts`, `test/event-stream-adapter.test.ts`
**Interfaces:** Produces
```ts
export interface TimelineSource {
  readonly sessionId: string
  readonly snapshot: () => unknown
  readonly subscribe: (listener: () => void) => () => void
  loadOlder(): Promise<boolean>
  release(): void
}
export function openTimeline(sessions: SessionsLike, uiConversation: UiConversationLike, sessionId: string): Promise<TimelineSource>
```
`SessionsLike` = `{ retain(target, options): { ready: Promise<Binding>; release(): void }; binding(id): { session: { loadOlder(): Promise<void> } } | undefined }` — after `await ref.ready`, check `ref.ready` resolution's `openState` via the chat target snapshot if present, else proceed; expose `openState` on the source for UI warnings.

- [ ] **Step 1: Failing tests** with fakes: ready resolves → snapshot/subscribe exposed; ready rejects → propagate; release called on `release()`; `loadOlder` delegates; subscribe unsubscribes.
- [ ] **Step 2: FAIL → 3: implement → 4: PASS; commit** `feat: timeline event stream adapter with retain/release lifecycle`

---

### Task 6: Fork transaction (idempotent, no double-fork)

**Files:** Create `src/client/controllers/fork-controller.ts`, `test/fork-transaction.test.ts`
**Interfaces:**
```ts
export interface ForkDeps {
  fork(req: { sessionId: string; atSeq: number; increaseTitle: boolean; onCreated?: (id: string) => void }): Promise<string>
  findChildByScan(parentId: string): Promise<string | undefined>
  using<T>(sessionId: string, op: (send: (text: string, requestId: string) => Promise<void>) => Promise<T>): Promise<T>
  newRequestId(): string
}
export type ForkPhase = 'validating' | 'forking' | 'launching' | 'done' | 'failed' | 'unverified'
export interface ForkResult { readonly childId: string; readonly phase: ForkPhase; readonly error?: string; readonly retriedPrompt: boolean }
export async function runForkTransaction(deps: ForkDeps, req: { sessionId: string; atSeq: number; instruction?: string; launch: 'now' | 'later'; requestId: string }): Promise<ForkResult>
```
Behavior: fork once (`onCreated` caches childId); on fork rejection whose error indicates receipt loss (message contains `ECONN`/`aborted`/`timeout`) → `findChildByScan` → found → continue; not found → `unverified` (never re-fork). `launch:'later'` → `done` after fork. `launch:'now'` → `using(childId, send => send(instruction, requestId))`; prompt failure → retry ONCE with the same requestId, set `retriedPrompt:true`; second failure → `failed`.

- [ ] **Step 1: Failing tests**: happy path (fork→prompt once, same requestId); receipt-loss recovery (fork rejects, scan finds child, prompt proceeds, fork called exactly once); scan miss → `unverified` and fork called once; prompt fails twice → `failed`, fork once, both prompts same id; `launch:'later'` → no prompt.
- [ ] **Step 2: FAIL → 3: implement → 4: PASS; commit** `feat: fork transaction with idempotent prompt retry and receipt-loss recovery`

---

### Task 7: Branch segment + deterministic diff (pure)

**Files:** Create `src/client/compare/branch-segment.ts`, `src/client/compare/diff.ts`, `test/branch-segment.test.ts`, `test/diff.test.ts`
**Interfaces:**
- `segmentFromEvents(sessionId: string, inheritedCount: number, events: readonly { seq: number; type: string; data?: unknown }[]): BranchSegment` — rows after `inheritedCount`; a turn spans `turn/start..turn/end`; user text from `user/message`; assistant summary = concatenated `text-chunks`/`assistant/message` truncated 200 chars; tools from `tool/call` + `tool/result` (name, outcome); `synthetic:true` when the turn contains `session/end-seed` or `turn/end` with `kind:'forked'`.
- `compareBranches(a: BranchSegment, b: BranchSegment): ComparisonResult` — positional alignment `max(len)`, `equal` = same user text + same tool-name sequence; `toolCountDiff`; `bothFailed`; `lastConclusion` = last assistantSummary per side ('both' when identical, else the longer one? — pick 'both' if equal else that side).

- [ ] **Step 1: Failing tests**: segment skips inherited prefix; synthetic closers flagged and excluded from tool counts; diff aligns turns positionally with missing side `undefined`; conclusion selection.
- [ ] **Step 2: FAIL → 3: implement → 4: PASS; commit** `feat: branch segment extraction and deterministic comparison`

---

### Task 8: Canvas UI — full-bleed canvas with nodes, layout, pan/zoom

**Files:** Create `src/client/graph/graph-layout.ts`, `test/graph-layout.test.ts`, `src/client/ui/NodeCard.tsx`, extend `src/client/ui/CanvasTab.tsx`, extend `src/client/index.ts` inject wiring, `test/canvas-tab.test.tsx` additions
**Interfaces:**
- `layoutLayered(graph: CanvasGraph, opts?: { columnGap?: number; rowGap?: number }): { positions: ReadonlyMap<string, { x: number; y: number }>; width: number; height: number }` — depth → x column; DFS order → y stack; pure.
- `CanvasTab` props: `{ canvas: CanvasModel }` where `CanvasModel = { graph: CanvasGraph; statusOf(id): StatusBadge; selectedId?: string; compareIds: readonly string[]; view: { x: number; y: number; scale: number }; onSelect(id); onToggleCompare(id); onViewChange(v); search(text): void }` (kept as plain data so tests need no DSH context).

- [ ] **Step 1: Failing layout tests**: single root at (0,0); child x = columnGap; siblings stacked by y gap; bounds width/height.
- [ ] **Step 2: FAIL → 3: implement layout + NodeCard (title, badge, model-free meta: createdAt/childCount/seeded marker, ⚠ when a sibling shares cwd and is running) + CanvasTab (SVG edges + absolutely positioned cards, wheel zoom 0.4–2, drag pan, fit-view button, toolbar with search input that highlights matches) → 4: PASS; component test asserts node click calls onSelect and ctrl+click calls onToggleCompare; commit** `feat: full-bleed lineage canvas with layered layout`

---

### Task 9: Right panel — detail timeline + fork flow UI

**Files:** Create `src/client/ui/RightPanel.tsx`, `src/client/ui/BranchTimeline.tsx`, `src/client/ui/ForkDialog.tsx`, `test/branch-timeline.test.tsx`
**Interfaces:**
- `BranchTimeline` props: `{ turns: BranchTurn[]; inheritedCount: number; onFork(rowIndex: number): void; cwdWarning: boolean }` — renders rows; each row shows 「⑂ 从此分叉」; cut label = `seq = next row's first seq - 1`, last row = last event seq; the fork dialog (instruction textarea, mode radio 立即开跑/只建分支, persistent ⚠ shared-cwd line, 取消/创建) is owned by `ForkDialog` with props `{ open, atSeq, inheritedCount, onCancel, onConfirm(instruction, mode) }`.

- [ ] **Step 1: Failing tests**: rows render with cut labels; clicking a row's fork button calls onFork with that row index; dialog confirm passes text+mode; warning visible.
- [ ] **Step 2: FAIL → 3: implement → 4: PASS; commit** `feat: branch detail timeline with message-level fork dialog`

---

### Task 10: Compare panel — comparison, 择优继续, 带回结论

**Files:** Create `src/client/ui/ComparePanel.tsx`, `test/compare-panel.test.tsx`
**Interfaces:** `ComparePanel` props: `{ result: ComparisonResult | null; onContinue(side: 'a' | 'b'): void; onCarry(side: 'a' | 'b', draft: string): void }` — A|B columns (last conclusion + turn diff rows + tool counts + inherited counts shown); 带回结论 produces an **editable draft** in a textarea (never auto-submits): `参考另一分支的结论：<summary>。现在结合两者继续：`.

- [ ] **Step 1: Failing tests**: empty state message; side-by-side render with inherited counts; 择优继续 calls onContinue; carry fills the editable draft and does NOT call submit.
- [ ] **Step 2: FAIL → 3: implement → 4: PASS; commit** `feat: branch comparison panel with continue and carry-forward draft`

---

### Task 11: Controllers + wiring (graph, fork, compare) and DSH integration

**Files:** Create `src/client/controllers/graph-controller.ts`, extend `src/client/index.ts`
**Interfaces:** `createGraphController(ctx)` returning `{ model(): CanvasModel; refresh(): void; select(id); toggleCompare(id); search(q); openInChat(id): void }`; uses adapters from Tasks 2-6; `openInChat` calls `ctx.uiWorkspace.openSession(id)`. `forkFromRow(sessionId, atSeq, instruction, launch)` calls `runForkTransaction` with real deps: `fork: (r) => ctx.sessions.fork(r)`, `using: (id, op) => ctx.sessions.using({ sessionId: id }, { source: 'gateway' }, async ref => op((text, requestId) => ref.session.prompt([{ type: 'text', text }], 'queue', requestId)))`, `findChildByScan: async (parentId) => (await ctx.sessions.list.getSnapshot()…)` filter `parentId`, `newRequestId: () => crypto.randomUUID()`.

- [ ] **Step 1: Failing tests** for graph-controller with fake ctx (members filter, status refresh, compare toggle, openInChat delegation).
- [ ] **Step 2: FAIL → 3: implement + wire CanvasTab/RightPanel/ComparePanel into `apply` (lazy: open timeline only for the selected node; release on selection change) → 4: PASS; commit** `feat: wire controllers and panels into the canvas tab`

---

### Task 12: M0 verification run against the real desktop profile

**Files:** Create `docs/superpowers/m0-verification.md` (results table), `scripts/m0-check.mjs` (assertions where scriptable)
**Steps:**
- [ ] Run `pnpm verify` (typecheck+test+build).
- [ ] Install into desktop profile (`pnpm run install:local`), restart the app, walk all 12 M0 gates from the spec (tab show/hide; workspace graph; exact atSeq inheritance checked against a real session; **empty branch does not auto-run queued input**; single launch; fork-receipt-loss recovery; prompt-receipt-loss single execution; two parallel branches observable; subscription survives switch/disconnect/reconnect; 500-node stress with fixtures; uninstall leaves no retains; node→session switching). Record PASS/FAIL + evidence per gate.
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
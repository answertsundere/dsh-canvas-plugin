import { useReducer } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { apply, inject } from '../src/client/index.ts'
import { CanvasTab } from '../src/client/ui/CanvasTab.tsx'
import type { CanvasDetail, CanvasModel, CanvasView } from '../src/client/ui/canvas-model.ts'
import type { LiveTail } from '../src/client/live/live-tail.ts'
import { badge } from '../src/shared/status.ts'
import type { CanvasGraph, CanvasNode } from '../src/shared/contracts.ts'

afterEach(cleanup)

const node = (id: string, extra: Partial<CanvasNode> = {}): CanvasNode => ({
  id,
  parentId: null,
  externalParent: false,
  title: id,
  createdAt: 0,
  running: false,
  available: true,
  seeded: false,
  cwd: null,
  childCount: 0,
  depth: 0,
  ...extra,
})

const graph = (nodes: readonly CanvasNode[], roots: readonly string[]): CanvasGraph => ({
  nodes: new Map(nodes.map(n => [n.id, n])),
  roots,
  maxDepth: nodes.reduce((max, n) => Math.max(max, n.depth), 0),
})

const model = (over: Partial<CanvasModel> = {}): CanvasModel => ({
  graph: graph([node('a'), node('b', { parentId: 'a', depth: 1, title: 'Branch B' })], ['a']),
  statusOf: () => badge('idle'),
  compareIds: [],
  view: { x: 0, y: 0, scale: 1 },
  onSelect: vi.fn(),
  onToggleCompare: vi.fn(),
  onViewChange: vi.fn(),
  search: vi.fn(),
  ...over,
})

/** One raw client list row, as the session store actually stores it. */
const listRow = (id: string, extra: Record<string, unknown> = {}) => ({
  id,
  displayTitle: id,
  running: false,
  retainedBy: {},
  blank: false,
  updatedAt: 0,
  ...extra,
})

/** A ctx just real enough for `apply`: the slot, the locale, and the two snapshots. */
const fakeCtx = () => {
  const register = vi.fn()
  const injectSlots = vi.fn((_slot: string, fn: () => void) => { fn(); return () => {} })
  const locale = { register: vi.fn(), bind: () => (key: string) => key }
  const effect = vi.fn((fn: () => unknown) => fn())
  const sessions = {
    list: {
      getSnapshot: () => ({
        ids: ['a'],
        byId: { a: listRow('a', { cwd: 'C:/w', title: 'Alpha' }) },
        phase: 'ready',
        projectionsBySession: {},
      }),
      subscribe: () => () => {},
    },
    fork: vi.fn(),
    using: vi.fn(),
    retain: vi.fn(),
  }
  const workspaces = {
    list: {
      getSnapshot: () => ({
        items: [{ workspaceId: 'w1', path: 'C:/w', title: 'w1', sessionIds: ['a'] }],
        phase: 'ready',
      }),
      subscribe: () => () => {},
    },
  }
  return { ctx: { effect, slots: { inject: injectSlots, register }, locale, sessions, workspaces }, register, injectSlots }
}

describe('canvas client plugin', () => {
  it('declares the services it needs', () => {
    expect(inject).toEqual(expect.arrayContaining(['slots', 'sessions', 'uiConversation', 'locale']))
  })

  it('registers the canvas conversation.view with id canvas and order 20', () => {
    const fake = fakeCtx()
    apply(fake.ctx as never)
    expect(fake.injectSlots).toHaveBeenCalledWith('conversation.view', expect.any(Function))
    const [options, component] = fake.register.mock.calls[0] as never as [{ id: string; order: number }, unknown]
    expect(options.id).toBe('canvas')
    expect(options.order).toBe(20)
    expect(component).toBe(CanvasTab)
  })

  it('injects a live controller model rather than an empty placeholder', () => {
    const fake = fakeCtx()
    apply(fake.ctx as never)
    const options = fake.register.mock.calls[0]?.[0] as unknown as {
      inject(sessionId: string): { canvas: CanvasModel }
    }
    const { canvas } = options.inject('a')
    expect([...canvas.graph.nodes.keys()]).toEqual(['a'])
    expect(canvas.statusOf('a').kind).toBe('idle')
    expect(typeof canvas.subscribe).toBe('function')
  })

  it('hands the same model back for the same conversation', () => {
    const fake = fakeCtx()
    apply(fake.ctx as never)
    const options = fake.register.mock.calls[0]?.[0] as unknown as {
      inject(sessionId: string): { canvas: CanvasModel }
    }
    // A new model per render would drop the tab's subscription every time.
    expect(options.inject('a').canvas).toBe(options.inject('a').canvas)
  })
})

describe('CanvasTab', () => {
  it('boots into an explicit unwired state rather than throwing', () => {
    // A client entry that throws during render is fatal for the whole page boot.
    const { container } = render(<CanvasTab />)
    expect(container.querySelector('[data-canvas-unwired="true"]')).not.toBeNull()
  })

  it('renders one card per graph node', () => {
    const { container } = render(<CanvasTab canvas={model()} />)
    expect(container.querySelectorAll('[data-canvas-node]')).toHaveLength(2)
    expect(container.querySelector('[data-canvas-node="b"]')?.textContent).toContain('Branch B')
  })

  it('selects a node on click', () => {
    const canvas = model()
    const { container } = render(<CanvasTab canvas={canvas} />)
    fireEvent.click(container.querySelector('[data-canvas-node="b"]') as Element)
    expect(canvas.onSelect).toHaveBeenCalledWith('b')
    expect(canvas.onToggleCompare).not.toHaveBeenCalled()
  })

  it('toggles comparison on ctrl/cmd click instead of selecting', () => {
    const canvas = model()
    const { container } = render(<CanvasTab canvas={canvas} />)
    fireEvent.click(container.querySelector('[data-canvas-node="b"]') as Element, { ctrlKey: true })
    expect(canvas.onToggleCompare).toHaveBeenCalledWith('b')
    expect(canvas.onSelect).not.toHaveBeenCalled()
  })

  it('reports the search query upward and highlights matches', () => {
    const canvas = model()
    const { container } = render(<CanvasTab canvas={canvas} />)
    fireEvent.change(container.querySelector('[data-canvas-search]') as Element, { target: { value: 'branch' } })
    expect(canvas.search).toHaveBeenCalledWith('branch')
    expect(container.querySelector('[data-canvas-node="b"]')?.getAttribute('data-highlight')).toBe('true')
    expect(container.querySelector('[data-canvas-node="a"]')?.getAttribute('data-highlight')).toBe('false')
  })

  it('marks the selected and compared nodes', () => {
    const { container } = render(<CanvasTab canvas={model({ selectedId: 'a', compareIds: ['b'] })} />)
    expect(container.querySelector('[data-canvas-node="a"]')?.getAttribute('data-selected')).toBe('true')
    expect(container.querySelector('[data-canvas-node="b"]')?.getAttribute('data-comparing')).toBe('true')
  })

  it('warns about a parallel write only when ANOTHER running session shares the directory', () => {
    const both = graph([
      node('a', { cwd: 'C:/w', running: true }),
      node('b', { parentId: 'a', depth: 1, cwd: 'C:/w', running: true }),
    ], ['a'])
    const pair = render(<CanvasTab canvas={model({ graph: both })} />)
    expect(pair.container.querySelector('[data-canvas-node="a"] [data-node-parallel-write]')).not.toBeNull()
    expect(pair.container.querySelector('[data-canvas-node="b"] [data-node-parallel-write]')).not.toBeNull()

    // An idle node in a directory someone else is writing is flagged too: forking
    // it would put a second writer there.
    const idleBesideRunning = graph([
      node('a', { cwd: 'C:/w', running: true }),
      node('b', { parentId: 'a', depth: 1, cwd: 'C:/w', running: false }),
    ], ['a'])
    const asymmetric = render(<CanvasTab canvas={model({ graph: idleBesideRunning })} />)
    expect(asymmetric.container.querySelector('[data-canvas-node="a"] [data-node-parallel-write]')).toBeNull()
    expect(asymmetric.container.querySelector('[data-canvas-node="b"] [data-node-parallel-write]')).not.toBeNull()

    const quiet = render(<CanvasTab canvas={model({
      graph: graph([node('a', { cwd: 'C:/w' }), node('b', { parentId: 'a', depth: 1, cwd: 'C:/w' })], ['a']),
    })} />)
    expect(quiet.container.querySelector('[data-node-parallel-write]')).toBeNull()

    const apart = render(<CanvasTab canvas={model({
      graph: graph([
        node('a', { cwd: 'C:/w', running: true }),
        node('b', { parentId: 'a', depth: 1, cwd: 'C:/other', running: true }),
      ], ['a']),
    })} />)
    expect(apart.container.querySelector('[data-node-parallel-write]')).toBeNull()
  })

  it('marks a seeded node and exposes its status kind', () => {
    const seeded = graph([node('a', { seeded: true })], ['a'])
    const { container } = render(<CanvasTab canvas={model({ graph: seeded })} />)
    expect(container.querySelector('[data-node-seeded="true"]')).not.toBeNull()
    expect(container.querySelector('[data-node-status="idle"]')).not.toBeNull()
  })

  it('fits the view by clamping the scale to the allowed range', () => {
    const canvas = model()
    const { container } = render(<CanvasTab canvas={canvas} />)
    fireEvent.click(container.querySelector('[data-canvas-fit]') as Element)
    const view = (canvas.onViewChange as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as { scale: number }
    expect(view.scale).toBeGreaterThanOrEqual(0.4)
    expect(view.scale).toBeLessThanOrEqual(2)
  })

  it('shows a refresh button only when the controller supplies one', () => {
    const without = render(<CanvasTab canvas={model()} />)
    expect(without.container.querySelector('[data-canvas-refresh]')).toBeNull()
    const withRefresh = render(<CanvasTab canvas={model({ refresh: vi.fn() })} />)
    expect(withRefresh.container.querySelector('[data-canvas-refresh]')).not.toBeNull()
  })

  it('draws one edge per non-root node', () => {
    const { container } = render(<CanvasTab canvas={model()} />)
    // Only the spoke paths count; the defs' marker paths live inside <marker>.
    expect(container.querySelectorAll('[data-canvas-edges] path[marker-end]')).toHaveLength(1)
  })

  it('opens a node in the conversation on double click', () => {
    const openInChat = vi.fn()
    const { container } = render(<CanvasTab canvas={model({ openInChat })} />)
    fireEvent.doubleClick(container.querySelector('[data-canvas-node="b"]') as Element)
    expect(openInChat).toHaveBeenCalledWith('b')
  })
})

const detailOf = (over: Partial<CanvasDetail> = {}): CanvasDetail => ({
  sessionId: 'b',
  turns: [
    { index: 0, firstSeq: 10, lastSeq: 14, userMessage: '问一句', tools: [], synthetic: false, endedAs: 'completed' },
  ],
  inheritedCount: 3,
  cwdWarning: false,
  ...over,
})

describe('CanvasTab right panel', () => {
  it('stays closed until a node is selected', () => {
    const { container } = render(<CanvasTab canvas={model()} />)
    expect(container.querySelector('[data-right-panel]')).toBeNull()
  })

  it('loads the selected node\u2019s turns into the detail timeline', async () => {
    const detail = vi.fn(async () => detailOf())
    const { container } = render(<CanvasTab canvas={model({ selectedId: 'b', detail })} />)
    expect(container.querySelector('[data-right-panel]')).not.toBeNull()
    await waitFor(() => expect(container.querySelectorAll('[data-timeline-row]')).toHaveLength(1))
    expect(detail).toHaveBeenCalledWith('b')
    expect(container.querySelector('[data-timeline-inherited]')?.textContent).toContain('3')
  })

  it('closes through clearSelection', () => {
    const clearSelection = vi.fn()
    const { container } = render(<CanvasTab canvas={model({ selectedId: 'b', clearSelection })} />)
    fireEvent.click(container.querySelector('[data-panel-close]') as Element)
    expect(clearSelection).toHaveBeenCalledTimes(1)
  })

  it('opens the fork dialog at the row\u2019s own cut and runs the transaction', async () => {
    const forkFromRow = vi.fn(async () => ({ childId: 'child', phase: 'done', retriedPrompt: false }))
    const { container } = render(
      <CanvasTab canvas={model({ selectedId: 'b', detail: async () => detailOf(), forkFromRow })} />,
    )
    await waitFor(() => expect(container.querySelector('[data-fork-row="0"]')).not.toBeNull())
    fireEvent.click(container.querySelector('[data-fork-row="0"]') as Element)

    // The cut is the row's own last seq — always a real event seq.
    expect(container.querySelector('[data-fork-cut]')?.textContent).toContain('seq 14')
    fireEvent.change(container.querySelector('[data-fork-instruction]') as Element, {
      target: { value: '换条路' },
    })
    fireEvent.click(container.querySelector('[data-fork-confirm]') as Element)

    await waitFor(() => expect(forkFromRow).toHaveBeenCalledWith('b', 14, '换条路', 'now'))
    await waitFor(() => expect(container.querySelector('[data-fork-dialog]')).toBeNull())
  })

  it('keeps the dialog open and reports a failed fork', async () => {
    const forkFromRow = vi.fn(async () => ({
      childId: '', phase: 'failed', error: '目标会话不存在', retriedPrompt: false,
    }))
    const { container } = render(
      <CanvasTab canvas={model({ selectedId: 'b', detail: async () => detailOf(), forkFromRow })} />,
    )
    await waitFor(() => expect(container.querySelector('[data-fork-row="0"]')).not.toBeNull())
    fireEvent.click(container.querySelector('[data-fork-row="0"]') as Element)
    fireEvent.change(container.querySelector('[data-fork-instruction]') as Element, { target: { value: 'go' } })
    fireEvent.click(container.querySelector('[data-fork-confirm]') as Element)

    await waitFor(() => expect(container.querySelector('[data-fork-error]')?.textContent).toBe('目标会话不存在'))
    expect(container.querySelector('[data-fork-dialog]')).not.toBeNull()
  })

  it('tells the user when a fork is unverified rather than calling it a failure', async () => {
    // The child may exist; saying "failed" would invite a second fork.
    const forkFromRow = vi.fn(async () => ({ childId: '', phase: 'unverified', retriedPrompt: false }))
    const { container } = render(
      <CanvasTab canvas={model({ selectedId: 'b', detail: async () => detailOf(), forkFromRow })} />,
    )
    await waitFor(() => expect(container.querySelector('[data-fork-row="0"]')).not.toBeNull())
    fireEvent.click(container.querySelector('[data-fork-row="0"]') as Element)
    fireEvent.change(container.querySelector('[data-fork-instruction]') as Element, { target: { value: 'go' } })
    fireEvent.click(container.querySelector('[data-fork-confirm]') as Element)
    await waitFor(() => expect(container.querySelector('[data-fork-error]')?.textContent).toContain('可能已创建'))
  })

  it('loads the comparison when the compare tab is opened', async () => {
    const comparison = vi.fn(async () => null)
    const { container } = render(
      <CanvasTab canvas={model({
        selectedId: 'b', compareIds: ['a', 'b'],
        detail: async () => detailOf(), comparison,
      })} />,
    )
    fireEvent.click(container.querySelector('[data-panel-tab="compare"]') as Element)
    await waitFor(() => expect(comparison).toHaveBeenCalledTimes(1))
    expect(container.querySelector('[data-compare-empty]')).not.toBeNull()
  })

  it('switches to the chosen branch on 择优继续', async () => {
    const onSelect = vi.fn()
    const result = {
      a: { sessionId: 'a', inheritedCount: 0, turns: [] },
      b: { sessionId: 'b', inheritedCount: 0, turns: [] },
      turnDiffs: [],
      toolCountDiff: 0,
      bothFailed: false,
      lastConclusion: { side: 'none' as const, text: '' },
    }
    const { container } = render(
      <CanvasTab canvas={model({
        selectedId: 'b', compareIds: ['a', 'b'], onSelect,
        detail: async () => detailOf(), comparison: async () => result,
      })} />,
    )
    fireEvent.click(container.querySelector('[data-panel-tab="compare"]') as Element)
    await waitFor(() => expect(container.querySelector('[data-compare-panel]')).not.toBeNull())
    fireEvent.click(container.querySelector('[data-continue="b"]') as Element)
    expect(onSelect).toHaveBeenCalledWith('b')
  })

  it('hands a carried draft to the clipboard path and confirms it', async () => {
    const result = {
      a: { sessionId: 'a', inheritedCount: 0, turns: [] },
      b: { sessionId: 'b', inheritedCount: 0, turns: [] },
      turnDiffs: [],
      toolCountDiff: 0,
      bothFailed: false,
      lastConclusion: { side: 'none' as const, text: '' },
    }
    const { container } = render(
      <CanvasTab canvas={model({
        selectedId: 'b', compareIds: ['a', 'b'],
        detail: async () => detailOf(), comparison: async () => result,
      })} />,
    )
    fireEvent.click(container.querySelector('[data-panel-tab="compare"]') as Element)
    await waitFor(() => expect(container.querySelector('[data-carry="a"]')).not.toBeNull())
    fireEvent.click(container.querySelector('[data-carry="a"]') as Element)
    fireEvent.click(container.querySelector('[data-carry-send]') as Element)
    await waitFor(() => expect(container.querySelector('[data-carry-done]')).not.toBeNull())
  })
})

const liveTailOf = (over: Partial<LiveTail> = {}): LiveTail => ({
  attemptId: 'a1', turn: 0, step: 1, seq: 9, phase: 'thinking',
  reasoning: '分析目录结构', text: '', ...over,
})

describe('canvas live output', () => {
  it('shows a live snippet on a streaming node card', () => {
    const tail = liveTailOf()
    render(<CanvasTab canvas={model({ tailOf: id => (id === 'b' ? tail : null) })} />)
    const card = document.querySelector('[data-canvas-node="b"]')
    expect(card?.querySelector('[data-node-live]')?.textContent).toContain('分析目录结构')
    expect(document.querySelector('[data-canvas-node="a"] [data-node-live]')).toBeNull()
  })

  it('shows the answer text on the card once the model starts emitting it', () => {
    const tail = liveTailOf({ text: '正在写代码', phase: 'thinking' })
    render(<CanvasTab canvas={model({ tailOf: id => (id === 'b' ? tail : null) })} />)
    const live = document.querySelector('[data-canvas-node="b"] [data-node-live]')
    expect(live?.textContent).toContain('正在写代码')
    expect(live?.textContent).not.toContain('分析目录结构')
  })

  it('renders the live stream in the detail panel of the selected node', () => {
    const detail: CanvasDetail = { sessionId: 'b', turns: [], inheritedCount: 0, cwdWarning: false }
    const tail = liveTailOf({ text: '答案前半' })
    render(<CanvasTab canvas={model({ selectedId: 'b', liveDetail: () => detail, tailOf: () => tail })} />)
    expect(document.querySelector('[data-live-tail]')).not.toBeNull()
    expect(document.querySelector('[data-live-reasoning]')?.textContent).toContain('分析目录结构')
    expect(document.querySelector('[data-live-text]')?.textContent).toContain('答案前半')
  })

  it('prefers the live detail and skips the one-shot read while the window is open', () => {
    const detail: CanvasDetail = { sessionId: 'b', turns: [], inheritedCount: 0, cwdWarning: false }
    const oneShot = vi.fn(async () => detail)
    render(<CanvasTab canvas={model({ selectedId: 'b', liveDetail: () => detail, detail: oneShot })} />)
    expect(oneShot).not.toHaveBeenCalled()
  })

  it('falls back to the one-shot read when the live window closes', async () => {
    const detail: CanvasDetail = { sessionId: 'b', turns: [], inheritedCount: 0, cwdWarning: false }
    let live = true
    const oneShot = vi.fn(async () => detail)
    const m = model({ selectedId: 'b', liveDetail: () => (live ? detail : null), detail: oneShot })
    const view = render(<CanvasTab canvas={m} />)
    expect(oneShot).not.toHaveBeenCalled()
    live = false
    view.rerender(<CanvasTab canvas={m} />)
    await waitFor(() => { expect(oneShot).toHaveBeenCalledTimes(1) })
  })
})

describe('fork from a live branch', () => {
  it('opens the fork dialog from a row while the branch streams', async () => {
    // Regression: the live path leaves the one-shot `detail` state null, so the
    // fork action must read the effective detail (live window first).
    const turns = [{
      index: 0, userMessage: '你好', tools: [], firstSeq: 1, lastSeq: 4, synthetic: false,
    }]
    const detail: CanvasDetail = { sessionId: 'b', turns, inheritedCount: 0, cwdWarning: false }
    render(<CanvasTab canvas={model({
      selectedId: 'b',
      liveDetail: () => detail,
      // No one-shot read result: the effect skips it while the window is open.
      detail: undefined,
    })} />)
    fireEvent.click(document.querySelector('[data-fork-row="0"]') as Element)
    expect(document.querySelector('[data-fork-dialog]')).not.toBeNull()
    expect(document.querySelector('[data-fork-cut]')?.textContent).toContain('seq 4')
  })
})

describe('agent swarm entry', () => {
  it('the node card offers the ⌖ entry only when the model can inspect', () => {
    const onInspect = vi.fn()
    const { container } = render(<CanvasTab canvas={model({
      inspectSwarm: () => ({ state: () => swarmStateFake, subscribe: () => () => {}, dispose: onInspect }) as never,
    })} />)
    const button = document.querySelector('[data-node-inspect="a"]') as HTMLButtonElement
    expect(button).not.toBeNull()
    fireEvent.click(button)
    expect(document.querySelector('[data-swarm-root]')).not.toBeNull()
    // Closing releases the controller (the dispose spy is onInspect here).
    fireEvent.click(document.querySelector('[data-swarm-close]') as Element)
    expect(onInspect).toHaveBeenCalledTimes(1)
    expect(document.querySelector('[data-swarm-root]')).toBeNull()
    void container
  })

  it('without inspectSwarm the tab shows no entry button and still boots', () => {
    render(<CanvasTab canvas={model()} />)
    expect(document.querySelector('[data-node-inspect="a"]')).toBeNull()
    expect(document.querySelector('[data-canvas-root]')).not.toBeNull()
  })
})

const swarmStateFake = {
  rootId: 'a',
  rootLabel: 'A',
  rootSnippet: null,
  agents: [],
  edges: [],
  layout: { positions: new Map(), radius: 230 },
  activity: { turnCount: 0, openTurn: false, currentTurn: null, tools: [], pendingToolId: null },
  toolLayout: { positions: new Map() },
  todos: new Map(),
  team: null,
  heat: new Map(),
}

describe('active-card halo and the prominent swarm entry', () => {
  it('a thinking or streaming card breathes; an idle card does not', () => {
    render(<CanvasTab canvas={model({
      statusOf: id => badge(id === 'b' ? 'thinking' : 'idle'),
      tailOf: () => null,
    })} />)
    const busy = document.querySelector('[data-canvas-node="b"]') as HTMLElement
    const idle = document.querySelector('[data-canvas-node="a"]') as HTMLElement
    expect(busy.getAttribute('data-node-active')).toBe('true')
    expect(busy.style.animation).toContain('dshCanvasBreath')
    expect(idle.getAttribute('data-node-active')).toBe('false')
    expect(idle.style.animation).toBe('')
  })

  it('the detail panel header carries the Agent 实况 entry and opens the web', () => {
    const dispose = vi.fn()
    render(<CanvasTab canvas={model({
      selectedId: 'b',
      inspectSwarm: () => ({ state: () => swarmStateFake, subscribe: () => () => {}, dispose }) as never,
    })} />)
    const action = document.querySelector('[data-panel-action]') as HTMLButtonElement
    expect(action).not.toBeNull()
    expect(action.textContent).toContain('Agent 实况')
    fireEvent.click(action)
    expect(document.querySelector('[data-swarm-root]')).not.toBeNull()
    fireEvent.click(document.querySelector('[data-swarm-close]') as Element)
    expect(dispose).toHaveBeenCalledTimes(1)
  })

  it('no inspect capability means no header action', () => {
    render(<CanvasTab canvas={model({ selectedId: 'b' })} />)
    expect(document.querySelector('[data-panel-action]')).toBeNull()
  })
})

describe('right-click shortcuts', () => {
  it('right-click opens the menu and 从最新消息分叉 opens the dialog at the last real row', () => {
    const turns = [
      { index: 0, userMessage: 'a', tools: [], firstSeq: 1, lastSeq: 4, synthetic: false },
      { index: 1, userMessage: 'b', tools: [], firstSeq: 5, lastSeq: 9, synthetic: false },
      { index: 2, userMessage: undefined, tools: [], firstSeq: 10, lastSeq: 10, synthetic: true },
    ]
    const detail: CanvasDetail = { sessionId: 'b', turns, inheritedCount: 0, cwdWarning: false }
    // A stateful stand-in for the real model: selection sticks, as it does when
    // the controller notifies and the tab re-renders.
    let selected: string | undefined
    const canvas = {
      ...model({ onSelect: (id: string) => { selected = id }, liveDetail: () => detail }),
      get selectedId() { return selected },
    }
    render(<CanvasTab canvas={canvas} />)
    fireEvent.contextMenu(document.querySelector('[data-canvas-node="b"]') as Element)
    expect(document.querySelector('[data-context-menu]')).not.toBeNull()
    fireEvent.click(document.querySelector('[data-context-item="fork"]') as Element)
    const dialog = document.querySelector('[data-fork-dialog]')
    expect(dialog).not.toBeNull()
    // The cut skips the trailing synthetic row: row 1's own last seq.
    expect(document.querySelector('[data-fork-cut]')?.textContent).toContain('seq 9')
  })

  it('the menu offers 实况 and 打开对话, and a backdrop click dismisses it', () => {
    const inspect = vi.fn(() => ({ state: () => swarmStateFake, subscribe: () => () => {}, dispose: () => {} }) as never)
    const openInChat = vi.fn()
    render(<CanvasTab canvas={model({ inspectSwarm: inspect, openInChat })} />)
    fireEvent.contextMenu(document.querySelector('[data-canvas-node="a"]') as Element)
    expect(document.querySelector('[data-context-item="inspect"]')).not.toBeNull()
    fireEvent.click(document.querySelector('[data-context-item="open"]') as Element)
    expect(openInChat).toHaveBeenCalledWith('a')
    expect(document.querySelector('[data-context-menu]')).toBeNull()

    fireEvent.contextMenu(document.querySelector('[data-canvas-node="a"]') as Element)
    fireEvent.click(document.querySelector('[data-context-backdrop]') as Element)
    expect(document.querySelector('[data-context-menu]')).toBeNull()
  })
})

describe('drag threshold', () => {
  it('panning from a card does not select it', () => {
    const onSelect = vi.fn()
    const { container } = render(<CanvasTab canvas={model({ onSelect })} />)
    const surface = container.querySelector('[data-canvas-surface]') as HTMLElement
    const card = document.querySelector('[data-canvas-node="a"]') as HTMLElement
    fireEvent.mouseDown(card, { clientX: 100, clientY: 100 })
    fireEvent.mouseMove(surface, { clientX: 160, clientY: 140 })
    fireEvent.mouseUp(surface, { clientX: 160, clientY: 140 })
    fireEvent.click(card)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('a plain click still selects', () => {
    const onSelect = vi.fn()
    render(<CanvasTab canvas={model({ onSelect })} />)
    fireEvent.click(document.querySelector('[data-canvas-node="a"]') as Element)
    expect(onSelect).toHaveBeenCalledWith('a')
  })
})
describe('minimap', () => {
  it('renders a corner overview with one dot per node and recenters on click', () => {
    const onViewChange = vi.fn()
    const { container } = render(<CanvasTab canvas={model({ onViewChange })} />)
    onViewChange.mockClear()
    const minimap = container.querySelector('[data-canvas-minimap]')
    expect(minimap).not.toBeNull()
    expect(minimap?.querySelectorAll('[data-minimap-node]')).toHaveLength(2)
    fireEvent.click(minimap as Element, { clientX: 60, clientY: 40 })
    expect(onViewChange).toHaveBeenCalledTimes(1)
    const view = onViewChange.mock.calls[0]?.[0] as CanvasView
    expect(typeof view.x).toBe('number')
    expect(typeof view.y).toBe('number')
    expect(view.scale).toBe(1)
  })
})

describe('full title tooltip', () => {
  it('the card carries its full title as a tooltip', () => {
    render(<CanvasTab canvas={model({
      graph: graph([node('a', { title: '这是一个非常非常长的会话标题会被截断' })], ['a']),
    })} />)
    expect((document.querySelector('[data-canvas-node="a"]') as HTMLElement).title).toBe('这是一个非常非常长的会话标题会被截断')
  })
})

describe('minimap node selection', () => {
  it('clicking a minimap dot selects that node without recentering', () => {
    const onSelect = vi.fn()
    const onViewChange = vi.fn()
    const { container } = render(<CanvasTab canvas={model({ onSelect, onViewChange })} />)
    onViewChange.mockClear()
    fireEvent.click(container.querySelector('[data-minimap-node="a"]') as Element)
    expect(onSelect).toHaveBeenCalledWith('a')
    expect(onViewChange).not.toHaveBeenCalled()
  })
})

describe('empty workspace hint', () => {
  it('an empty canvas says so and notes the archive rule', () => {
    const { container } = render(<CanvasTab canvas={model({
      graph: graph([], []),
    })} />)
    expect(container.querySelector('[data-canvas-empty]')?.textContent).toContain('当前工作区还没有会话')
    expect(container.querySelector('[data-canvas-empty]')?.textContent).toContain('归档的会话不会出现在画布上')
  })
})

describe('minimap selected highlight', () => {
  it('the selected node dot is highlighted', () => {
    render(<CanvasTab canvas={model({ selectedId: 'a' })} />)
    const dot = document.querySelector('[data-minimap-node="a"]') as HTMLElement
    expect(dot.getAttribute('data-minimap-selected')).toBe('true')
    expect(dot.style.outline).toContain('solid')
  })
})

describe('minimap lives inside the canvas surface', () => {
  it('the minimap is a descendant of the surface, never overlapping the panel', () => {
    const { container } = render(<CanvasTab canvas={model()} />)
    expect(container.querySelector('[data-canvas-surface] [data-canvas-minimap]')).not.toBeNull()
  })

  it('a window resize re-fits the view', async () => {
    const onViewChange = vi.fn()
    render(<CanvasTab canvas={model({ onViewChange })} />)
    onViewChange.mockClear()
    fireEvent(window, new Event('resize'))
    // The resize listener debounces 200ms before re-fitting.
    await new Promise(resolve => setTimeout(resolve, 250))
    expect(onViewChange).toHaveBeenCalled()
  })

  it('double-clicking empty canvas space re-fits', () => {
    const onViewChange = vi.fn()
    const { container } = render(<CanvasTab canvas={model({ onViewChange })} />)
    onViewChange.mockClear()
    const surface = container.querySelector('[data-canvas-surface]') as HTMLElement
    fireEvent.doubleClick(surface)
    expect(onViewChange).toHaveBeenCalled()
  })
})

describe('Esc layering and search cycling', () => {
  it('Esc closes the menu first, then the swarm', async () => {
    const dispose = vi.fn()
    const canvas = {
      ...model({
        inspectSwarm: () => ({ state: () => swarmStateFake, subscribe: () => () => {}, dispose }) as never,
      }),
    }
    render(<CanvasTab canvas={canvas} />)
    // Open the swarm first — it stays open underneath the menu layering.
    fireEvent.click(document.querySelector('[data-node-inspect="a"]') as Element)
    expect(document.querySelector('[data-swarm-root]')).not.toBeNull()
    // Open the context menu on top.
    fireEvent.contextMenu(document.querySelector('[data-canvas-node="a"]') as Element)
    expect(document.querySelector('[data-context-menu]')).not.toBeNull()
    fireEvent.keyDown(window, { key: 'Escape' })
    // Menu closed, swarm untouched.
    expect(document.querySelector('[data-context-menu]')).toBeNull()
    expect(document.querySelector('[data-swarm-root]')).not.toBeNull()
    // Second press: the swarm closes and the controller is disposed.
    fireEvent.keyDown(window, { key: 'Escape' })
    await waitFor(() => { expect(document.querySelector('[data-swarm-root]')).toBeNull() })
    expect(dispose).toHaveBeenCalledTimes(1)
  })

  it('Enter in the search input cycles to the next match', () => {
    const searchNext = vi.fn()
    const { container } = render(<CanvasTab canvas={model({ searchNext })} />)
    fireEvent.keyDown(container.querySelector('[data-canvas-search]') as Element, { key: 'Enter' })
    expect(searchNext).toHaveBeenCalledWith('')
  })
})

describe('hover highlights spokes', () => {
  it('hovering a node lights its edge', () => {
    const { container } = render(<CanvasTab canvas={model()} />)
    const card = document.querySelector('[data-canvas-node="a"]') as HTMLElement
    fireEvent.mouseEnter(card)
    const edge = container.querySelector('[data-canvas-edges] path[marker-end]') as SVGPathElement
    expect(edge.getAttribute('stroke')).toBe('#e6e9ef')
  })
})

describe('subtree collapse', () => {
  const threeNodes = () => ({
    graph: graph([
      node('a'),
      node('b', { parentId: 'a', depth: 1, childCount: 1 }),
      node('c', { parentId: 'b', depth: 2 }),
    ], ['a']),
  })

  it('the +/- toggle appears on nodes with children and collapses the subtree', async () => {
    const collapsedNodes = new Set<string>()
    const base = model(threeNodes())
    // A stateful harness: toggling mutates the external set and forces a
    // re-render, as the real controller's notify() does in the app.
    function Harness(): JSX.Element {
      const [, force] = useReducer((n: number) => n + 1, 0)
      const canvasModel: CanvasModel = {
        ...base,
        get collapsedNodes() { return collapsedNodes },
        toggleSubtree: (id: string) => {
          if (collapsedNodes.has(id)) collapsedNodes.delete(id)
          else collapsedNodes.add(id)
          force()
        },
      }
      return <CanvasTab canvas={canvasModel} />
    }
    const { container } = render(<Harness />)
    const toggle = container.querySelector('[data-node-collapse="b"]') as HTMLElement
    expect(toggle).not.toBeNull()
    expect(toggle.textContent).toBe('−')
    fireEvent.click(toggle)
    await waitFor(() => { expect(container.querySelectorAll('[data-canvas-node]')).toHaveLength(2) })
    expect(container.querySelector('[data-canvas-node="c"]')).toBeNull()
    // Toggle back expands.
    fireEvent.click(container.querySelector('[data-node-collapse="b"]') as Element)
    await waitFor(() => { expect(container.querySelectorAll('[data-canvas-node]')).toHaveLength(3) })
    void collapsedNodes
  })

  it('a node without children shows no toggle', () => {
    const { container } = render(<CanvasTab canvas={model()} />)
    expect(container.querySelector('[data-node-collapse="a"]')).toBeNull()
  })
})

describe('search match count', () => {
  it('the toolbar shows how many nodes match the query', () => {
    const { container } = render(<CanvasTab canvas={model()} />)
    const input = container.querySelector('[data-canvas-search]') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'branch' } })
    expect(container.querySelector('[data-canvas-match-count]')?.textContent).toContain('1 个匹配')
  })

  it('no matches reads as zero', () => {
    const { container } = render(<CanvasTab canvas={model()} />)
    const input = container.querySelector('[data-canvas-search]') as HTMLInputElement
    fireEvent.change(input, { target: { value: '不存在' } })
    expect(container.querySelector('[data-canvas-match-count]')?.textContent).toContain('0 个匹配')
  })
})

describe('minimap frame', () => {
  it('the viewport frame is present and sized', () => {
    const { container } = render(<CanvasTab canvas={model()} />)
    const frame = container.querySelector('[data-minimap-frame]') as HTMLElement
    expect(frame).not.toBeNull()
    expect(frame.style.width.endsWith('px')).toBe(true)
  })
})

describe('keyboard pan and zoom', () => {
  it('arrow keys pan the view', () => {
    const onViewChange = vi.fn()
    const { container } = render(<CanvasTab canvas={model({ onViewChange })} />)
    const input = container.querySelector('[data-canvas-search]') as HTMLElement
    input.blur()
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(onViewChange).toHaveBeenCalled()
    const view = onViewChange.mock.calls.at(-1)?.[0] as CanvasView
    expect(view.x).toBe(60)
  })

  it('typing in the search field never pans', () => {
    const onViewChange = vi.fn()
    const { container } = render(<CanvasTab canvas={model({ onViewChange })} />)
    onViewChange.mockClear()
    const input = container.querySelector('[data-canvas-search]') as HTMLElement
    fireEvent.keyDown(input, { key: 'ArrowLeft' })
    expect(onViewChange).not.toHaveBeenCalled()
  })
})

describe('visual texture and status badge', () => {
  it('the surface carries the dot-grid texture', () => {
    const { container } = render(<CanvasTab canvas={model()} />)
    const surface = container.querySelector('[data-canvas-surface]') as HTMLElement
    expect(surface.className).toContain('dsh-canvas-surface')
  })

  it('the toolbar counts running sessions', () => {
    const { container } = render(<CanvasTab canvas={model({
      statusOf: id => badge(id === 'b' ? 'thinking' : 'idle'),
    })} />)
    expect(container.querySelector('[data-canvas-running-count]')?.textContent).toContain('1 运行中')
  })

  it('node cards carry the hover-lift class', () => {
    render(<CanvasTab canvas={model()} />)
    expect((document.querySelector('[data-canvas-node="a"]') as HTMLElement).className).toContain('dsh-node-card')
  })

  it('busy threads flow (dsh-edge-busy class)', () => {
    const { container } = render(<CanvasTab canvas={model({
      statusOf: id => badge(id === 'b' ? 'thinking' : 'idle'),
    })} />)
    expect(container.querySelector('.dsh-edge-busy')).not.toBeNull()
  })
})

describe('glow layer', () => {
  it('busy edges carry a blurred glow duplicate', () => {
    const { container } = render(<CanvasTab canvas={model({
      statusOf: id => badge(id === 'b' ? 'thinking' : 'idle'),
    })} />)
    expect(container.querySelector('[data-edge-glow]')).not.toBeNull()
    expect(container.querySelector('#dsh-glow')).not.toBeNull()
  })

  it('idle edges have no glow duplicate', () => {
    const { container } = render(<CanvasTab canvas={model()} />)
    expect(container.querySelector('[data-edge-glow]')).toBeNull()
  })
})

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { apply, inject } from '../src/client/index.ts'
import { CanvasTab } from '../src/client/ui/CanvasTab.tsx'
import type { CanvasDetail, CanvasModel } from '../src/client/ui/canvas-model.ts'
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
    expect(container.querySelectorAll('[data-canvas-edges] path')).toHaveLength(1)
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

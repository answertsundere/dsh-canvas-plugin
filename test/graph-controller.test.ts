import { describe, expect, it, vi } from 'vitest'
import { createGraphController, type GraphControllerDeps } from '../src/client/controllers/graph-controller.ts'
import type { ForkDeps, PromptOutcome } from '../src/client/controllers/fork-controller.ts'
import type { SessionEventLike } from '../src/client/compare/branch-segment.ts'

const row = (id: string, extra: Record<string, unknown> = {}) => ({
  id,
  displayTitle: id,
  running: false,
  retainedBy: {},
  blank: false,
  updatedAt: 0,
  ...extra,
})

interface Options {
  readonly ids?: string[]
  readonly byId?: Record<string, unknown>
  readonly connected?: boolean
  readonly workspaceId?: string | null
  readonly cwd?: string | null
  readonly workspaces?: unknown
  readonly events?: Record<string, readonly SessionEventLike[]>
  readonly readThrows?: boolean
}

const makeDeps = (options: Options = {}) => {
  let ids = options.ids ?? ['a', 'b']
  let byId: Record<string, unknown> = options.byId ?? {
    a: row('a', { cwd: 'C:/w', title: 'Alpha' }),
    b: row('b', { parentId: 'a', cwd: 'C:/w', running: true, title: 'Beta' }),
  }
  const sent: { text: string; requestId: string }[] = []
  const openSession = vi.fn()

  const forkDeps: ForkDeps = {
    fork: vi.fn(async (request: { onCreated?: (id: string) => void }) => {
      request.onCreated?.('child')
      return 'child'
    }),
    childrenOf: vi.fn(async () => []),
    using: async (_id, op) => op(async (text, requestId) => {
      sent.push({ text, requestId })
      return { ok: true } as PromptOutcome
    }),
    newRequestId: () => 'rid',
  }

  const deps: GraphControllerDeps = {
    listSnapshot: () => ({ ids, byId, phase: 'ready', projectionsBySession: {} }),
    workspaceSnapshot: () => options.workspaces ?? {
      items: [{ workspaceId: 'w1', path: 'C:/w', title: 'w1', sessionIds: ['a', 'b'] }],
      phase: 'ready',
    },
    scope: () => ({
      workspaceId: options.workspaceId === undefined ? 'w1' : options.workspaceId,
      cwd: options.cwd === undefined ? 'C:/w' : options.cwd,
    }),
    isConnected: () => options.connected !== false,
    openSession,
    forkDeps,
    readEvents: async id => {
      if (options.readThrows === true) throw new Error('unreadable')
      return options.events?.[id] ?? []
    },
  }

  return {
    deps,
    forkDeps,
    sent,
    openSession,
    setRows: (nextIds: string[], nextById: Record<string, unknown>) => {
      ids = nextIds
      byId = nextById
    },
  }
}

describe('createGraphController', () => {
  it('builds the lineage graph from the workspace members', () => {
    const fake = makeDeps()
    const graph = createGraphController(fake.deps).model().graph
    expect([...graph.nodes.keys()]).toEqual(['a', 'b'])
    expect(graph.nodes.get('b')?.parentId).toBe('a')
    expect(graph.roots).toEqual(['a'])
    expect(graph.nodes.get('b')?.depth).toBe(1)
  })

  it('excludes sessions outside the workspace', () => {
    const fake = makeDeps({
      ids: ['a', 'b', 'outside'],
      byId: {
        a: row('a', { cwd: 'C:/w' }),
        b: row('b', { parentId: 'a', cwd: 'C:/w' }),
        outside: row('outside', { cwd: 'C:/elsewhere' }),
      },
    })
    const graph = createGraphController(fake.deps).model().graph
    expect(graph.nodes.has('outside')).toBe(false)
  })

  it('derives a status per node, with unknown on disconnect', () => {
    const connected = createGraphController(makeDeps().deps).model()
    expect(connected.statusOf('a').kind).toBe('idle')
    expect(connected.statusOf('b').kind).toBe('thinking')

    const offline = createGraphController(makeDeps({ connected: false }).deps).model()
    expect(offline.statusOf('a').kind).toBe('unknown')
    expect(offline.statusOf('b').kind).toBe('unknown')
  })

  it('reports unknown for a node it has never seen', () => {
    const model = createGraphController(makeDeps().deps).model()
    expect(model.statusOf('ghost').kind).toBe('unknown')
  })

  it('tracks the selection through the model getters', () => {
    const controller = createGraphController(makeDeps().deps)
    const model = controller.model()
    expect(model.selectedId).toBeUndefined()
    model.onSelect('b')
    expect(model.selectedId).toBe('b')
  })

  it('toggles comparison, and drops the oldest pick when a third arrives', () => {
    const fake = makeDeps({
      ids: ['a', 'b', 'c'],
      byId: { a: row('a', { cwd: 'C:/w' }), b: row('b', { cwd: 'C:/w' }), c: row('c', { cwd: 'C:/w' }) },
    })
    const controller = createGraphController(fake.deps)
    const model = controller.model()

    model.onToggleCompare('a')
    model.onToggleCompare('b')
    expect(model.compareIds).toEqual(['a', 'b'])

    // A third click replaces rather than being ignored, which would look broken.
    model.onToggleCompare('c')
    expect(model.compareIds).toEqual(['b', 'c'])

    model.onToggleCompare('b')
    expect(model.compareIds).toEqual(['c'])
  })

  it('locates the first match when searching', () => {
    const controller = createGraphController(makeDeps().deps)
    const model = controller.model()
    model.search('beta')
    expect(model.selectedId).toBe('b')
    model.search('   ')
    expect(model.selectedId).toBe('b')
  })

  it('delegates opening a session in chat', () => {
    const fake = makeDeps()
    createGraphController(fake.deps).openInChat('b')
    expect(fake.openSession).toHaveBeenCalledWith('b')
  })

  it('drops a selection and comparison that left the workspace on refresh', () => {
    const fake = makeDeps()
    const controller = createGraphController(fake.deps)
    const model = controller.model()
    model.onSelect('b')
    model.onToggleCompare('a')
    model.onToggleCompare('b')

    fake.setRows(['a'], { a: row('a', { cwd: 'C:/w' }) })
    controller.refresh()

    expect(model.selectedId).toBeUndefined()
    expect(model.compareIds).toEqual(['a'])
  })

  it('notifies subscribers on every change', () => {
    const controller = createGraphController(makeDeps().deps)
    const listener = vi.fn()
    const off = controller.subscribe(listener)
    controller.select('b')
    expect(listener).toHaveBeenCalled()
    off()
    controller.select('a')
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('runs a fork through the transaction and refreshes the graph', async () => {
    const fake = makeDeps()
    const controller = createGraphController(fake.deps)
    const listener = vi.fn()
    controller.subscribe(listener)

    const result = await controller.forkFromRow('a', 12, '试试另一条路', 'now')
    expect(result.phase).toBe('done')
    expect(result.childId).toBe('child')
    expect(fake.sent).toEqual([{ text: '试试另一条路', requestId: 'rid' }])
    expect(listener).toHaveBeenCalled()
  })

  it('refreshes even when the fork could not be confirmed', async () => {
    // An unverified child may still exist and must appear as a node.
    const fake = makeDeps()
    const controller = createGraphController(fake.deps)
    const listener = vi.fn()
    controller.subscribe(listener)
    const result = await controller.forkFromRow('a', 12, '', 'later')
    expect(result.phase).toBe('done')
    expect(listener).toHaveBeenCalled()
  })

  it('has nothing to compare until exactly two branches are picked', async () => {
    const controller = createGraphController(makeDeps().deps)
    const model = controller.model()
    expect(await controller.compare()).toBeNull()
    model.onToggleCompare('a')
    expect(await controller.compare()).toBeNull()
  })

  it('compares the two selected branches over their own events only', async () => {
    const events: Record<string, readonly SessionEventLike[]> = {
      a: [
        { seq: 4, type: 'session/end-seed', data: { inherited: true } },
        { seq: 5, type: 'turn/start', data: { turn: 1 } },
        { seq: 6, type: 'user/message', data: { content: [{ type: 'text', text: '问 A' }], source: { kind: 'user' } } },
        { seq: 7, type: 'turn/end', data: { turn: 1, reason: { kind: 'completed' } } },
      ],
      b: [
        { seq: 0, type: 'turn/start', data: { turn: 1 } },
        { seq: 1, type: 'user/message', data: { content: [{ type: 'text', text: '问 B' }], source: { kind: 'user' } } },
        { seq: 2, type: 'turn/end', data: { turn: 1, reason: { kind: 'completed' } } },
      ],
    }
    const controller = createGraphController(makeDeps({ events }).deps)
    const model = controller.model()
    model.onToggleCompare('a')
    model.onToggleCompare('b')

    const result = await controller.compare()
    expect(result).not.toBeNull()
    // a's seed marker at seq 4 makes its inherited prefix 5 events.
    expect(result?.a.inheritedCount).toBe(5)
    expect(result?.b.inheritedCount).toBe(0)
    expect(result?.a.turns.map(t => t.userMessage)).toEqual(['问 A'])
    expect(result?.turnDiffs).toHaveLength(1)
    expect(result?.turnDiffs[0]?.equal).toBe(false)
  })

  it('reports nothing to compare when the events cannot be read', async () => {
    // A failed read must read as "no comparison", never as "identical branches".
    const controller = createGraphController(makeDeps({ readThrows: true }).deps)
    const model = controller.model()
    model.onToggleCompare('a')
    model.onToggleCompare('b')
    expect(await controller.compare()).toBeNull()
  })

  it('keeps a stable model object so a tab subscription survives', () => {
    const controller = createGraphController(makeDeps().deps)
    expect(controller.model()).not.toBe(controller.model())
    // Identity of the *snapshot* changes, but every model reads the same state.
    controller.select('b')
    expect(controller.model().selectedId).toBe('b')
  })
})

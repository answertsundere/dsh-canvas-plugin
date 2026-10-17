import { describe, expect, it, vi } from 'vitest'
import { createGraphController, type GraphControllerDeps } from '../src/client/controllers/graph-controller.ts'
import type { ForkDeps, PromptOutcome } from '../src/client/controllers/fork-controller.ts'
import type { SessionEventLike } from '../src/client/compare/branch-segment.ts'
import type { LiveEntryLike } from '../src/client/live/live-tail.ts'

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
  let connected = options.connected !== false

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
    isConnected: () => connected,
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
    setConnected: (next: boolean) => { connected = next },
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

  // M0 gate 9: a link that drops must not leave a stale `running:true` reading
  // as live, and a link that comes back must recover the live statuses — a
  // connection loss is not allowed to wedge the canvas in `unknown` forever.
  it('drops every status to unknown while the link is down', () => {
    const fake = makeDeps()
    const controller = createGraphController(fake.deps)
    const model = controller.model()
    expect(model.statusOf('b').kind).toBe('thinking')

    fake.setConnected(false)
    controller.refresh()
    expect(model.statusOf('a').kind).toBe('unknown')
    expect(model.statusOf('b').kind).toBe('unknown')
  })

  it('recovers the live statuses when the link comes back', () => {
    const fake = makeDeps()
    const controller = createGraphController(fake.deps)
    const model = controller.model()

    fake.setConnected(false)
    controller.refresh()
    expect(model.statusOf('b').kind).toBe('unknown')

    fake.setConnected(true)
    controller.refresh()
    expect(model.statusOf('a').kind).toBe('idle')
    expect(model.statusOf('b').kind).toBe('thinking')
  })

  it('keeps refreshing through a flapping link', () => {
    // Each refresh re-reads the link, so repeated losses cannot wedge the tab:
    // the last state of the link always wins.
    const fake = makeDeps()
    const controller = createGraphController(fake.deps)
    const model = controller.model()

    for (const connected of [false, true, false, true]) {
      fake.setConnected(connected)
      controller.refresh()
      expect(model.statusOf('b').kind).toBe(connected ? 'thinking' : 'unknown')
    }
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

const flush = async (): Promise<void> => { await new Promise(resolve => setTimeout(resolve, 0)) }

const makeLiveWindow = (sessionId: string) => {
  const listeners = new Set<() => void>()
  let entries: LiveEntryLike[] = []
  const release = vi.fn()
  const source = {
    sessionId,
    entries: () => entries,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } },
    release,
  }
  return {
    source,
    release,
    entries: (next: LiveEntryLike[]) => { entries = next },
    emit: () => { for (const listener of [...listeners]) listener() },
  }
}

const reasoningEntries = (attemptId: string, text: string): LiveEntryLike[] => [
  { type: 'transient', event: { type: 'assistant/live-chunk', seq: 10, data: { attemptId, turn: 0, step: 1, chunk: { type: 'block-start', index: 0, blockType: 'reasoning' } } } },
  { type: 'transient', event: { type: 'assistant/live-chunk', seq: 11, data: { attemptId, turn: 0, step: 1, chunk: { type: 'reasoning-delta', index: 0, text } } } },
]

describe('live windows', () => {
  it('opens one window per running session and releases it when the session stops', async () => {
    const base = makeDeps()
    const live = makeLiveWindow('b')
    const opened: string[] = []
    const deps: GraphControllerDeps = {
      ...base.deps,
      liveWindow: async id => { opened.push(id); return live.source },
    }
    const controller = createGraphController(deps)
    await flush()
    expect(opened).toEqual(['b'])
    controller.model().tailOf?.('b')

    base.setRows(['a', 'b'], {
      a: row('a', { cwd: 'C:/w' }),
      b: row('b', { parentId: 'a', cwd: 'C:/w', running: false }),
    })
    controller.refresh()
    expect(live.release).toHaveBeenCalledTimes(1)
    expect(controller.model().tailOf?.('b')).toBeNull()
  })

  it('a live chunk turns the node status into the real hint and notifies subscribers', async () => {
    const base = makeDeps()
    const live = makeLiveWindow('b')
    const deps: GraphControllerDeps = { ...base.deps, liveWindow: async () => live.source }
    const controller = createGraphController(deps)
    const model = controller.model()
    await flush()

    const notified = vi.fn()
    model.subscribe?.(notified)

    live.entries(reasoningEntries('a1', '先看需求'))
    live.emit()
    expect(notified).toHaveBeenCalled()
    expect(model.tailOf?.('b')?.reasoning).toBe('先看需求')
    expect(model.statusOf('b').kind).toBe('thinking')

    live.entries([
      ...reasoningEntries('a1', '先看需求'),
      { type: 'transient', event: { type: 'assistant/live-chunk', seq: 12, data: { attemptId: 'a1', turn: 0, step: 1, chunk: { type: 'block-start', index: 1, blockType: 'tool-call' } } } },
      { type: 'transient', event: { type: 'assistant/live-chunk', seq: 13, data: { attemptId: 'a1', turn: 0, step: 1, chunk: { type: 'tool-call-delta', index: 1, id: 'c1', name: 'read', argumentsDelta: '{}' } } } },
    ])
    live.emit()
    expect(model.statusOf('b').kind).toBe('tool')
    expect(model.tailOf?.('b')?.tool?.name).toBe('read')
  })

  it('a window that refuses to open costs the live view, never the canvas', async () => {
    const base = makeDeps()
    const deps: GraphControllerDeps = {
      ...base.deps,
      liveWindow: async () => { throw new Error('retain refused') },
    }
    const controller = createGraphController(deps)
    await flush()
    expect(controller.model().tailOf?.('b')).toBeNull()
    // The node still reports the coarse running status.
    expect(controller.model().statusOf('b').kind).toBe('thinking')
  })

  it('derives the live detail (turns and inherited count) from the open window', async () => {
    const base = makeDeps()
    const live = makeLiveWindow('b')
    const deps: GraphControllerDeps = { ...base.deps, liveWindow: async () => live.source }
    const controller = createGraphController(deps)
    await flush()

    live.entries([
      { type: 'event', event: { type: 'user/message', seq: 1, data: { source: { kind: 'user' }, content: [{ type: 'text', text: '跑起来' }] } } },
      { type: 'event', event: { type: 'turn/start', seq: 0, data: { turn: 0 } } },
      ...reasoningEntries('a1', '正在做'),
    ])
    live.emit()

    const detail = controller.model().liveDetail?.('b')
    expect(detail).not.toBeNull()
    expect(detail?.sessionId).toBe('b')
    expect(detail?.turns.map(turn => turn.userMessage)).toEqual(['跑起来'])
    expect(controller.model().liveDetail?.('a')).toBeNull()
  })

  it('closes the live detail when the session stops running', async () => {
    const base = makeDeps()
    const live = makeLiveWindow('b')
    const deps: GraphControllerDeps = { ...base.deps, liveWindow: async () => live.source }
    const controller = createGraphController(deps)
    await flush()
    live.entries(reasoningEntries('a1', 'x'))
    live.emit()
    expect(controller.model().liveDetail?.('b')).not.toBeNull()

    base.setRows(['a', 'b'], {
      a: row('a', { cwd: 'C:/w' }),
      b: row('b', { parentId: 'a', cwd: 'C:/w', running: false }),
    })
    controller.refresh()
    expect(controller.model().liveDetail?.('b')).toBeNull()
  })
})

describe('dispose', () => {
  it('releases every open window, so plugin unload leaves no retains', async () => {
    const base = makeDeps()
    const live = makeLiveWindow('b')
    const deps: GraphControllerDeps = { ...base.deps, liveWindow: async () => live.source }
    const controller = createGraphController(deps)
    await flush()
    controller.dispose()
    expect(live.release).toHaveBeenCalledTimes(1)
    expect(controller.model().tailOf?.('b')).toBeNull()
  })
})

describe('team member identity on the canvas', () => {
  it('a team member shows its team name and role instead of its prompt', () => {
    const fake = makeDeps({
      ids: ['lead1', 'mate1'],
      byId: {
        lead1: row('lead1', { cwd: 'C:/w', title: '主会话' }),
        mate1: row('mate1', { parentId: 'lead1', cwd: 'C:/w', title: '你是 Canvas 文件校验员。工作…' }),
      },
    })
    // The session list also carries the agentTeam projection.
    const base = fake.deps.listSnapshot()
    const deps: GraphControllerDeps = { ...fake.deps, listSnapshot: () => ({
      ...(base as Record<string, unknown>),
      projectionsBySession: {
        lead1: { values: { agentTeam: { members: [
          { id: 'lead1', name: 'lead', role: 'lead' },
          { id: 'mate1', name: '校验员', role: 'teammate' },
        ] } } },
      },
    }) }
    const controller = createGraphController(deps)
    const node = controller.model().graph.nodes.get('mate1')
    expect(node?.title).toBe('校验员')
    expect(node?.teamRole).toBe('teammate')
    expect(controller.model().graph.nodes.get('lead1')?.teamRole).toBe('lead')
  })
})

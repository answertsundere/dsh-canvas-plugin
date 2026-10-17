import { describe, expect, it, vi } from 'vitest'
import {
  createAgentSwarmController,
  type AgentSwarmDeps,
} from '../src/client/controllers/agent-swarm-controller.ts'
import type { LiveEntryLike } from '../src/client/live/live-tail.ts'
import type { LiveWindowLike } from '../src/client/controllers/graph-controller.ts'

const flush = async (): Promise<void> => { await new Promise(resolve => setTimeout(resolve, 0)) }

const catalog = (seq: number, childId: string, label?: string) => ({
  type: 'event' as const,
  event: { type: 'subagent/catalog', seq, data: { childId, childCreatedAt: seq, mode: 'continuable', ...(label === undefined ? {} : { label }) } },
})
const reasoningChunk = (seq: number, text: string): LiveEntryLike[] => [
  { type: 'transient', event: { type: 'assistant/live-chunk', seq, data: { attemptId: 'a1', turn: 0, step: 1, chunk: { type: 'block-start', index: 0, blockType: 'reasoning' } } } },
  { type: 'transient', event: { type: 'assistant/live-chunk', seq: seq + 1, data: { attemptId: 'a1', turn: 0, step: 1, chunk: { type: 'reasoning-delta', index: 0, text } } } },
]

interface WindowHandle {
  source: LiveWindowLike
  setEntries: (next: LiveEntryLike[]) => void
  emit: () => void
  release: ReturnType<typeof vi.fn>
}

const makeDeps = (options: {
  windows?: Record<string, LiveEntryLike[]>
  openFails?: string[]
  summaries?: { id: string; title?: string; running: boolean }[]
} = {}) => {
  const handles = new Map<string, WindowHandle>()
  const deps: AgentSwarmDeps = {
    liveWindow: async sessionId => {
      if (options.openFails?.includes(sessionId)) throw new Error('refused')
      const existing = handles.get(sessionId)
      if (existing !== undefined) return existing.source
      const listeners = new Set<() => void>()
      let entries: LiveEntryLike[] = options.windows?.[sessionId] ?? []
      const release = vi.fn()
      const source: LiveWindowLike = {
        sessionId,
        entries: () => entries,
        subscribe: listener => { listeners.add(listener); return () => { listeners.delete(listener) } },
        release,
      }
      handles.set(sessionId, { source, setEntries: next => { entries = next }, emit: () => { for (const l of [...listeners]) l() }, release })
      return source
    },
    listSummaries: () => options.summaries ?? [],
  }
  return { deps, handles }
}

describe('createAgentSwarmController', () => {
  it('builds the swarm from the root window catalog and opens a window per agent', async () => {
    const fake = makeDeps({ windows: { root: [catalog(1, 'a', '检索器'), catalog(2, 'b', '写手')] } })
    const controller = createAgentSwarmController(fake.deps, 'root')
    await flush()
    const state = controller.state()
    expect(state.agents.map(a => a.id).sort()).toEqual(['a', 'b'])
    expect(state.agents.find(a => a.id === 'a')?.label).toBe('检索器')
    expect(state.edges).toContainEqual({ from: 'root', to: 'a' })
    expect(fake.handles.has('a')).toBe(true)
    expect(fake.handles.has('b')).toBe(true)
    controller.dispose()
  })

  it('a fresh catalog event surfaces a new agent and opens its window', async () => {
    const fake = makeDeps({ windows: { root: [catalog(1, 'a')] } })
    const controller = createAgentSwarmController(fake.deps, 'root')
    await flush()
    const notified = vi.fn()
    controller.subscribe(notified)

    fake.handles.get('root')!.setEntries([catalog(1, 'a'), catalog(9, 'c', '新爬虫')])
    fake.handles.get('root')!.emit()
    await flush()

    expect(controller.state().agents.map(a => a.id)).toContain('c')
    expect(fake.handles.has('c')).toBe(true)
    expect(notified).toHaveBeenCalled()
    controller.dispose()
  })

  it('a child streaming reasoning shows the snippet and lights the edge', async () => {
    const fake = makeDeps({ windows: { root: [catalog(1, 'a', '检索器')] } })
    const controller = createAgentSwarmController(fake.deps, 'root')
    await flush()

    fake.handles.get('a')!.setEntries(reasoningChunk(10, '正在翻页'))
    fake.handles.get('a')!.emit()

    const state = controller.state()
    const a = state.agents.find(agent => agent.id === 'a')!
    expect(a.snippet).toMatchObject({ label: '推理' })
    expect(a.snippet?.text).toContain('正在翻页')
    expect(state.heat.get('a')).toBeGreaterThan(0)
    controller.dispose()
  })

  it('falls back to the list row for the title and the running flag', async () => {
    const fake = makeDeps({
      windows: { root: [catalog(1, 'a')] },
      summaries: [
        { id: 'root', title: '主会话', running: false },
        { id: 'a', title: '子任务', running: true },
      ],
    })
    const controller = createAgentSwarmController(fake.deps, 'root')
    await flush()
    const state = controller.state()
    expect(state.rootLabel).toBe('主会话')
    expect(state.agents.find(a => a.id === 'a')).toMatchObject({ label: '子任务', status: 'running' })
    controller.dispose()
  })

  it('a window that refuses to open costs the live view of that agent, not the swarm', async () => {
    const fake = makeDeps({ windows: { root: [catalog(1, 'a'), catalog(2, 'b')] }, openFails: ['b'] })
    const controller = createAgentSwarmController(fake.deps, 'root')
    await flush()
    const state = controller.state()
    expect(state.agents.map(a => a.id).sort()).toEqual(['a', 'b'])
    expect(state.agents.find(a => a.id === 'b')?.status).toBe('idle')
    controller.dispose()
  })

  it('dispose releases every window, including children opened later', async () => {
    const fake = makeDeps({ windows: { root: [catalog(1, 'a')] } })
    const controller = createAgentSwarmController(fake.deps, 'root')
    await flush()
    fake.handles.get('root')!.setEntries([catalog(1, 'a'), catalog(2, 'c')])
    fake.handles.get('root')!.emit()
    await flush()
    controller.dispose()
    expect(fake.handles.get('root')!.release).toHaveBeenCalledTimes(1)
    expect(fake.handles.get('a')!.release).toHaveBeenCalledTimes(1)
    expect(fake.handles.get('c')!.release).toHaveBeenCalledTimes(1)
  })
})

describe('root activity in the swarm', () => {
  it('derives turns and tools from the root window and heats the pending tool', async () => {
    const fake = makeDeps({ windows: { root: [
      { type: 'event', event: { type: 'turn/start', seq: 1, data: { turn: 0 } } },
      { type: 'event', event: { type: 'tool/call', seq: 2, data: { turn: 0, step: 1, callId: 'c1', name: 'read', arguments: '{}' } } },
      { type: 'event', event: { type: 'tool/result', seq: 3, data: { message: { toolCallId: 'c1' } } } },
      { type: 'event', event: { type: 'tool/call', seq: 4, data: { turn: 0, step: 2, callId: 'c2', name: 'grep', arguments: '{}' } } },
    ] } })
    const controller = createAgentSwarmController(fake.deps, 'root')
    await flush()
    const state = controller.state()
    expect(state.activity.openTurn).toBe(true)
    expect(state.activity.turnCount).toBe(0)
    expect(state.activity.tools.map(t => t.name)).toEqual(['read', 'grep'])
    expect(state.activity.pendingToolId).toBe('c2')
    expect(state.heat.get('tool:c2')).toBeGreaterThan(0)
    // The completed tool has no heat: it is not crawling.
    expect(state.heat.get('tool:c1')).toBeUndefined()
    controller.dispose()
  })

  it('a tool that just completed gets one heat stamp, then goes cold', async () => {
    const fake = makeDeps({ windows: { root: [
      { type: 'event', event: { type: 'tool/call', seq: 1, data: { turn: 0, step: 1, callId: 'c1', name: 'read', arguments: '{}' } } },
    ] } })
    const controller = createAgentSwarmController(fake.deps, 'root')
    await flush()
    expect(controller.state().heat.get('tool:c1')).toBeGreaterThan(0)

    fake.handles.get('root')!.setEntries([
      { type: 'event', event: { type: 'tool/call', seq: 1, data: { turn: 0, step: 1, callId: 'c1', name: 'read', arguments: '{}' } } },
      { type: 'event', event: { type: 'tool/result', seq: 2, data: { message: { toolCallId: 'c1' } } } },
    ] as never)
    fake.handles.get('root')!.emit()
    await flush()
    const stamped = controller.state().heat.get('tool:c1')
    expect(stamped).toBeGreaterThan(0)

    // No further refresh: the crawl finishes and fades.
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(controller.state().heat.get('tool:c1')).toBe(stamped)
    controller.dispose()
  })

  it('activity ignores the inherited prefix of a forked session', async () => {
    const fake = makeDeps({ windows: { root: [
      { type: 'event', event: { type: 'session/end-seed', seq: 4, data: { inherited: true } } },
      { type: 'event', event: { type: 'turn/start', seq: 1, data: { turn: 0 } } },
      { type: 'event', event: { type: 'turn/end', seq: 2, data: { turn: 0, reason: { kind: 'completed' } } } },
      { type: 'event', event: { type: 'turn/start', seq: 5, data: { turn: 1 } } },
    ] } })
    const controller = createAgentSwarmController(fake.deps, 'root')
    await flush()
    const state = controller.state()
    // The inherited turn (seq < 5, before the seed marker) does not count.
    expect(state.activity.turnCount).toBe(0)
    expect(state.activity.currentTurn).toBe(1)
    controller.dispose()
  })
})

describe('todos in the swarm', () => {
  it('folds the latest todo/write per node and clears it when absent', async () => {
    const fake = makeDeps({ windows: { root: [
      { type: 'event', event: { type: 'todo/write', seq: 1, data: { todos: [
        { content: '拆需求', status: 'completed' },
        { content: '写代码', status: 'in_progress' },
      ] } } },
    ] } })
    const controller = createAgentSwarmController(fake.deps, 'root')
    await flush()
    expect(controller.state().todos.get('root')?.map(t => t.content)).toEqual(['拆需求', '写代码'])
    controller.dispose()
  })

  it('a later snapshot replaces the list whole', async () => {
    const fake = makeDeps({ windows: { root: [
      { type: 'event', event: { type: 'todo/write', seq: 1, data: { todos: [{ content: '旧', status: 'pending' }] } } },
    ] } })
    const controller = createAgentSwarmController(fake.deps, 'root')
    await flush()
    fake.handles.get('root')!.setEntries([
      { type: 'event', event: { type: 'todo/write', seq: 1, data: { todos: [{ content: '旧', status: 'pending' }] } } },
      { type: 'event', event: { type: 'todo/write', seq: 2, data: { todos: [{ content: '新', status: 'in_progress' }] } } },
    ] as never)
    fake.handles.get('root')!.emit()
    await flush()
    expect(controller.state().todos.get('root')?.map(t => t.content)).toEqual(['新'])
    controller.dispose()
  })
})

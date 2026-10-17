import { describe, expect, it } from 'vitest'
import {
  agentsFromWindows,
  layoutSwarm,
  pulseProgress,
  swarmEdges,
  type SwarmEntrySource,
} from '../src/client/swarm/swarm-model.ts'

const catalog = (seq: number, childId: string, label?: string) => ({
  type: 'event' as const,
  event: { type: 'subagent/catalog', seq, data: { childId, childCreatedAt: seq, mode: 'continuable', ...(label === undefined ? {} : { label }) } },
})
const windowOf = (sessionId: string, entries: unknown[]): SwarmEntrySource => ({ sessionId, entries })

describe('agentsFromWindows', () => {
  it('lists direct children from the root window catalog events', () => {
    const agents = agentsFromWindows([
      windowOf('root', [
        { type: 'event', event: { type: 'user/message', seq: 1 } },
        catalog(2, 'a', '检索器'),
        catalog(3, 'b', '写手'),
      ]),
    ], 'root')
    expect(agents.map(a => a.id).sort()).toEqual(['a', 'b'])
    expect(agents.find(a => a.id === 'a')).toMatchObject({ parentId: 'root', depth: 1, label: '检索器' })
  })

  it('stitches grandchildren from child windows, one level deep at most per call', () => {
    const agents = agentsFromWindows([
      windowOf('root', [catalog(1, 'a'), catalog(2, 'b')]),
      windowOf('a', [catalog(5, 'a1', '爬虫')]),
    ], 'root')
    expect(agents.find(a => a.id === 'a1')).toMatchObject({ parentId: 'a', depth: 2, label: '爬虫' })
  })

  it('a later catalog event cannot remove an earlier child (append-only facts)', () => {
    const agents = agentsFromWindows([
      windowOf('root', [catalog(1, 'a'), catalog(2, 'b')]),
      windowOf('root2', [catalog(9, 'a')]),
    ], 'root')
    expect(agents.map(a => a.id).sort()).toEqual(['a', 'b'])
  })

  it('ignores malformed rows and non-catalog events', () => {
    const agents = agentsFromWindows([
      windowOf('root', [
        { type: 'event', event: { type: 'subagent/catalog', seq: 1 } },
        { type: 'event', event: { type: 'subagent/catalog', seq: 2, data: 'nope' } },
        catalog(3, 'a'),
        catalog(4, 'root'),
      ]),
    ], 'root')
    expect(agents.map(a => a.id)).toEqual(['a'])
  })

  it('caps the swarm size, keeping shallow agents first', () => {
    const entries = Array.from({ length: 30 }, (_, i) => catalog(i + 1, `c${i}`))
    const agents = agentsFromWindows([windowOf('root', entries)], 'root', 24)
    expect(agents.length).toBe(24)
  })
})

describe('layoutSwarm', () => {
  it('places the root at the center and children on one ring', () => {
    const agents = [
      { id: 'root', parentId: null, depth: 0, label: 'R', mode: 'continuable' as const },
      { id: 'a', parentId: 'root', depth: 1, label: 'A', mode: 'one-shot' as const },
      { id: 'b', parentId: 'root', depth: 1, label: 'B', mode: 'one-shot' as const },
    ]
    const layout = layoutSwarm(agents, 'root', { radius: 200 })
    expect(layout.positions.get('root')).toEqual({ x: 0, y: 0 })
    const a = layout.positions.get('a')
    const b = layout.positions.get('b')
    expect(Math.hypot(a!.x, a!.y)).toBeCloseTo(200, 5)
    expect(Math.hypot(b!.x, b!.y)).toBeCloseTo(200, 5)
    // Even angular spacing, deterministic order.
    expect(a!.x).toBeCloseTo(-b!.x, 5)
  })

  it('orbits grandchildren around their own parent at a smaller radius', () => {
    const agents = [
      { id: 'root', parentId: null, depth: 0, label: 'R', mode: 'continuable' as const },
      { id: 'a', parentId: 'root', depth: 1, label: 'A', mode: 'one-shot' as const },
      { id: 'a1', parentId: 'a', depth: 2, label: 'A1', mode: 'one-shot' as const },
    ]
    const layout = layoutSwarm(agents, 'root', { radius: 200, childRadius: 90 })
    const a = layout.positions.get('a')!
    const a1 = layout.positions.get('a1')!
    expect(Math.hypot(a1.x - a.x, a1.y - a.y)).toBeCloseTo(90, 5)
  })

  it('every agent gets a finite position, unreachable ones included', () => {
    const agents = [
      { id: 'root', parentId: null, depth: 0, label: 'R', mode: 'continuable' as const },
      { id: 'x', parentId: 'missing', depth: 1, label: 'X', mode: 'one-shot' as const },
    ]
    const layout = layoutSwarm(agents, 'root')
    for (const id of ['root', 'x']) {
      const p = layout.positions.get(id)!
      expect(Number.isFinite(p.x)).toBe(true)
      expect(Number.isFinite(p.y)).toBe(true)
    }
  })
})

describe('swarmEdges', () => {
  it('one edge per non-root agent, child to parent', () => {
    const agents = [
      { id: 'root', parentId: null, depth: 0, label: 'R', mode: 'continuable' as const },
      { id: 'a', parentId: 'root', depth: 1, label: 'A', mode: 'one-shot' as const },
      { id: 'a1', parentId: 'a', depth: 2, label: 'A1', mode: 'one-shot' as const },
    ]
    expect(swarmEdges(agents, 'root')).toEqual([
      { from: 'root', to: 'a' },
      { from: 'a', to: 'a1' },
    ])
  })
})

describe('pulseProgress', () => {
  it('cycles from 0 to 1 while the edge is hot, then goes cold', () => {
    expect(pulseProgress(10_000, 10_000, 2_000)).toBe(0)
    expect(pulseProgress(10_000, 11_000, 2_000)).toBe(0.5)
    expect(pulseProgress(10_000, 12_000, 2_000)).toBe(0)
    // Cold after the grace window: no pulse is drawn.
    expect(pulseProgress(10_000, 10_000 + 2_000 + 1_500 + 1, 2_000)).toBeNull()
  })
})

import { activityFromEntries, fitScale } from '../src/client/swarm/swarm-model.ts'
import { layoutActivity } from '../src/client/swarm/swarm-model.ts'

const call = (seq: number, callId: string, name: string) => ({
  type: 'event' as const,
  event: { type: 'tool/call', seq, data: { turn: 0, step: 1, callId, name, arguments: '{}' } },
})
const result = (seq: number, callId: string, error?: boolean) => ({
  type: 'event' as const,
  event: { type: 'tool/result', seq, data: { message: { toolCallId: callId }, ...(error ? { error: { message: 'x' } } : {}) } },
})
const turnStart = (seq: number, turn: number) => ({ type: 'event' as const, event: { type: 'turn/start', seq, data: { turn } } })
const turnEnd = (seq: number, turn: number) => ({ type: 'event' as const, event: { type: 'turn/end', seq, data: { turn, reason: { kind: 'completed' } } } })

describe('activityFromEntries', () => {
  it('pairs tool calls with results and flags the pending one', () => {
    const activity = activityFromEntries([
      turnStart(1, 0),
      call(2, 'c1', 'read'),
      result(3, 'c1'),
      call(4, 'c2', 'grep'),
    ])
    expect(activity.turnCount).toBe(0)
    expect(activity.openTurn).toBe(true)
    expect(activity.currentTurn).toBe(0)
    expect(activity.tools.map(t => t.status)).toEqual(['ok', 'pending'])
    expect(activity.pendingToolId).toBe('c2')
  })

  it('counts completed turns and reports no open turn when settled', () => {
    const activity = activityFromEntries([
      turnStart(1, 0), turnEnd(2, 0),
      turnStart(3, 1), turnEnd(4, 1),
    ])
    expect(activity.turnCount).toBe(2)
    expect(activity.openTurn).toBe(false)
    expect(activity.currentTurn).toBeNull()
    expect(activity.pendingToolId).toBeNull()
  })

  it('marks a tool whose result carried an error', () => {
    const activity = activityFromEntries([call(1, 'c1', 'shell'), result(2, 'c1', true)])
    expect(activity.tools[0]?.status).toBe('error')
  })

  it('keeps only the most recent tools', () => {
    const entries = Array.from({ length: 20 }, (_, i) => call(i + 1, `c${i}`, `t${i}`))
    const activity = activityFromEntries(entries, 12)
    expect(activity.tools.length).toBe(12)
    expect(activity.tools[0]?.id).toBe('c8')
    expect(activity.tools[11]?.id).toBe('c19')
  })

  it('skips malformed rows without throwing', () => {
    const activity = activityFromEntries([
      { type: 'event', event: { type: 'tool/call', seq: 1 } },
      call(2, 'c1', 'read'),
    ])
    expect(activity.tools.map(t => t.id)).toEqual(['c1'])
  })
})

describe('layoutActivity', () => {
  it('spirals outward in execution order, so the sequence is visible', () => {
    const activity = activityFromEntries([call(1, 'c1', 'a'), call(2, 'c2', 'b'), call(3, 'c3', 'c')])
    const layout = layoutActivity(activity.tools, { baseRadius: 240, radialStep: 26, angularStep: 0.62 })
    const radii = activity.tools.map(tool => {
      const p = layout.positions.get(tool.id)!
      return Math.hypot(p.x, p.y)
    })
    expect(radii[0]).toBeCloseTo(240, 5)
    expect(radii[1]).toBeCloseTo(266, 5)
    expect(radii[2]).toBeCloseTo(292, 5)
    expect(layout.maxRadius).toBeCloseTo(292, 5)
  })

  it('a turn boundary adds an angular gap and a radial lift', () => {
    const tools = [
      { id: 'a', name: 'x', status: 'ok' as const, turn: 0 },
      { id: 'b', name: 'y', status: 'ok' as const, turn: 1 },
    ]
    const layout = layoutActivity(tools, { baseRadius: 240, radialStep: 26, angularStep: 0.62, turnGap: 0.5, turnLift: 18 })
    const a = layout.positions.get('a')!
    const b = layout.positions.get('b')!
    const angleA = Math.atan2(a.y, a.x)
    const angleB = Math.atan2(b.y, b.x)
    // Step = 0.62 + turn gap 0.5 across the boundary.
    expect(angleB - angleA).toBeCloseTo(0.62 + 0.5, 5)
    expect(Math.hypot(b.x, b.y)).toBeCloseTo(240 + 26 + 18, 5)
  })

  it('an empty list has no positions and the base radius as its bound', () => {
    const layout = layoutActivity([])
    expect(layout.positions.size).toBe(0)
    expect(layout.maxRadius).toBe(240)
  })
})

describe('fitScale', () => {
  it('fits the plane into the container without enlarging past 1:1', () => {
    expect(fitScale(1960, 1600, 980, 800)).toBe(1)
    expect(fitScale(700, 800, 980, 800)).toBeCloseTo((700 - 32) / 980, 5)
  })

  it('never shrinks below the legibility floor and treats unknown sizes as 1', () => {
    expect(fitScale(100, 100, 980, 800)).toBe(0.35)
    expect(fitScale(0, 0, 980, 800)).toBe(1)
  })
})

import { todosFromEntries } from '../src/client/swarm/swarm-model.ts'

describe('todosFromEntries', () => {
  it('returns the last todo/write snapshot, last-write-wins', () => {
    const todos = todosFromEntries([
      { type: 'event', event: { type: 'todo/write', seq: 1, data: { todos: [{ content: '旧的', status: 'pending' }] } } },
      { type: 'event', event: { type: 'todo/write', seq: 2, data: { todos: [
        { content: '拆需求', status: 'completed' },
        { content: '写代码', status: 'in_progress' },
        { content: '测试', status: 'pending' },
      ] } } },
    ])
    expect(todos?.map(t => `${t.content}:${t.status}`)).toEqual(['拆需求:completed', '写代码:in_progress', '测试:pending'])
  })

  it('returns null before the first write and on malformed rows', () => {
    expect(todosFromEntries([])).toBeNull()
    expect(todosFromEntries([
      { type: 'event', event: { type: 'todo/write', seq: 1, data: 'nope' } },
      { type: 'event', event: { type: 'user/message', seq: 2, data: {} } },
    ])).toBeNull()
  })
})

import { sweepProgress } from '../src/client/swarm/swarm-model.ts'

describe('sweepProgress', () => {
  const opts = { period: 6000, step: 300, travel: 1500 }
  it('a pulse travels each edge in staggered order within a period', () => {
    // Edge 0 starts at phase 0; edge 1 at 300ms; edge 2 at 600ms.
    expect(sweepProgress(0, 0, opts)).toBe(0)
    expect(sweepProgress(1, 300, opts)).toBe(0)
    expect(sweepProgress(2, 600, opts)).toBe(0)
    expect(sweepProgress(0, 750, opts)).toBeCloseTo(0.5, 5)
    expect(sweepProgress(1, 750, opts)).toBeCloseTo(0.3, 5)
  })

  it('an edge is dark before its slot and after the travel window', () => {
    expect(sweepProgress(3, 0, opts)).toBeNull() // its slot has not come
    expect(sweepProgress(0, 1600, opts)).toBeNull() // travelled home
  })

  it('wraps at the period boundary, so the sweep keeps running', () => {
    expect(sweepProgress(0, 6000, opts)).toBe(0)
    expect(sweepProgress(0, 6500, opts)).toBeCloseTo(500 / 1500, 5)
  })
})

import { toolGlyph, turnGroups } from '../src/client/swarm/swarm-model.ts'

describe('toolGlyph', () => {
  it('maps common tool families to a glyph and a family color', () => {
    expect(toolGlyph('pwsh').glyph).toBe('▸')
    expect(toolGlyph('pwsh').color).toBe('#2f9e6f')
    expect(toolGlyph('read').glyph).toBe('◧')
    expect(toolGlyph('write').glyph).toBe('✎')
    expect(toolGlyph('edit').glyph).toBe('✎')
    expect(toolGlyph('grep').glyph).toBe('⌕')
    expect(toolGlyph('job_output').glyph).toBe('▤')
    expect(toolGlyph('todo').glyph).toBe('☑')
  })

  it('falls back to a generic glyph for unknown tools', () => {
    expect(toolGlyph('mystery_tool').glyph).toBe('⚙')
  })

  it('each family carries its own robot variant', () => {
    expect(toolGlyph('pwsh').variant).toBe('shell')
    expect(toolGlyph('job_output').variant).toBe('job')
    expect(toolGlyph('read').variant).toBe('read')
    expect(toolGlyph('edit').variant).toBe('write')
    expect(toolGlyph('grep').variant).toBe('search')
    expect(toolGlyph('todo').variant).toBe('todo')
    expect(toolGlyph('fetch').variant).toBe('fetch')
    expect(toolGlyph('mystery').variant).toBe('generic')
  })
})

describe('turnGroups', () => {
  const tool = (turn: number, name: string): { id: string; name: string; status: 'ok'; turn: number } =>
    ({ id: `${name}${turn}`, name, status: 'ok', turn })

  it('groups consecutive tools of the same turn', () => {
    const groups = turnGroups([tool(0, 'a'), tool(0, 'b'), tool(1, 'c'), tool(1, 'd'), tool(1, 'e'), tool(2, 'f')])
    expect(groups.map(g => ({ turn: g.turn, start: g.startIndex, end: g.endIndex }))).toEqual([
      { turn: 0, start: 0, end: 1 },
      { turn: 1, start: 2, end: 4 },
      { turn: 2, start: 5, end: 5 },
    ])
  })

  it('returns no groups for no tools', () => {
    expect(turnGroups([])).toEqual([])
  })
})

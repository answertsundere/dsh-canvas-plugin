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
    expect(g.nodes.get('b')?.depth).toBe(0)
  })

  it('breaks cycles instead of hanging', () => {
    const g = buildLineageGraph([s('a', { parentId: 'b' }), s('b', { parentId: 'a' })], new Set(['a', 'b']))
    expect(g.roots.length).toBeGreaterThan(0)
    expect(g.nodes.size).toBe(2)
    expect(g.roots).toEqual(['a'])
    expect(g.maxDepth).toBe(1)
    expect(g.nodes.get('a')?.parentId).toBe('b')
    expect(g.nodes.get('a')?.depth).toBe(0)
    expect(g.nodes.get('b')?.depth).toBe(1)
  })

  it('promotes the earlier-created node when breaking a cycle', () => {
    const g = buildLineageGraph(
      [s('a', { parentId: 'b', createdAt: 2 }), s('b', { parentId: 'a', createdAt: 1 })],
      new Set(['a', 'b']),
    )
    expect(g.roots).toEqual(['b'])
    expect(g.maxDepth).toBe(1)
    expect(g.nodes.get('b')?.depth).toBe(0)
    expect(g.nodes.get('a')?.depth).toBe(1)
  })

  it('computes depth across multiple levels', () => {
    const g = buildLineageGraph(
      [s('a', { createdAt: 1 }), s('b', { parentId: 'a', createdAt: 2 }), s('c', { parentId: 'b', createdAt: 3 })],
      new Set(['a', 'b', 'c']),
    )
    expect(g.roots).toEqual(['a'])
    expect(g.maxDepth).toBe(2)
    expect(g.nodes.get('a')?.depth).toBe(0)
    expect(g.nodes.get('b')?.depth).toBe(1)
    expect(g.nodes.get('c')?.depth).toBe(2)
  })

  it('excludes non-members', () => {
    const g = buildLineageGraph([s('a'), s('z')], new Set(['a']))
    expect([...g.nodes.keys()]).toEqual(['a'])
  })

  it('orders roots by createdAt ascending', () => {
    const g = buildLineageGraph(
      [s('late', { createdAt: 20 }), s('early', { createdAt: 10 }), s('mid', { createdAt: 15 })],
      new Set(['late', 'early', 'mid']),
    )
    expect(g.roots).toEqual(['early', 'mid', 'late'])
  })

  it('keeps the last summary when ids are duplicated', () => {
    const g = buildLineageGraph(
      [s('a', { createdAt: 1, title: 'first' }), s('a', { createdAt: 9, title: 'second' })],
      new Set(['a']),
    )
    expect(g.nodes.size).toBe(1)
    expect(g.nodes.get('a')?.title).toBe('second')
    expect(g.nodes.get('a')?.createdAt).toBe(9)
  })
})
import { hiddenByCollapse } from '../src/client/graph/graph-model.ts'

describe('hiddenByCollapse', () => {
  it('a collapsed node hides its entire descendant set but not itself', () => {
    const nodes = new Map([
      ['a', { id: 'a', parentId: null, externalParent: false, title: 'a', createdAt: 0, running: false, available: true, seeded: false, cwd: null, childCount: 1, depth: 0 }],
      ['b', { id: 'b', parentId: 'a', externalParent: false, title: 'b', createdAt: 0, running: false, available: true, seeded: false, cwd: null, childCount: 1, depth: 1 }],
      ['c', { id: 'c', parentId: 'b', externalParent: false, title: 'c', createdAt: 0, running: false, available: true, seeded: false, cwd: null, childCount: 0, depth: 2 }],
    ])
    expect([...hiddenByCollapse(nodes, new Set(['b']))]).toEqual(['c'])
  })

  it('collapsing a root hides everything below it', () => {
    const nodes = new Map([
      ['a', { id: 'a', parentId: null, externalParent: false, title: 'a', createdAt: 0, running: false, available: true, seeded: false, cwd: null, childCount: 1, depth: 0 }],
      ['b', { id: 'b', parentId: 'a', externalParent: false, title: 'b', createdAt: 0, running: false, available: true, seeded: false, cwd: null, childCount: 0, depth: 1 }],
    ])
    expect([...hiddenByCollapse(nodes, new Set(['a']))]).toEqual(['b'])
  })
})

describe('subagent folding', () => {
  const s = (id: string, extra: Partial<SessionSummaryLike> = {}): SessionSummaryLike =>
    ({ id, createdAt: 0, running: false, available: true, ...extra })

  it('lifts subagent-origin sessions out of the lineage and counts them on the parent', () => {
    const g = buildLineageGraph([
      s('a', { createdAt: 1 }),
      s('r1', { parentId: 'a', origin: 'subagent' }),
      s('r2', { parentId: 'a', origin: 'subagent' }),
      s('b', { parentId: 'a', createdAt: 3 }),
    ], new Set(['a', 'r1', 'r2', 'b']))
    expect(g.nodes.has('r1')).toBe(false)
    expect(g.nodes.has('r2')).toBe(false)
    expect(g.nodes.get('a')?.subagentCount).toBe(2)
    expect(g.nodes.get('a')?.childCount).toBe(1)
    expect(g.nodes.get('b')?.parentId).toBe('a')
    expect(g.maxDepth).toBe(1)
  })

  it('includeSubagents restores them as first-class nodes', () => {
    const members = [
      s('a', { createdAt: 1 }),
      s('r1', { parentId: 'a', origin: 'subagent' }),
      s('r2', { parentId: 'a', origin: 'subagent' }),
    ]
    const shown = buildLineageGraph(members, new Set(['a', 'r1', 'r2']), { includeSubagents: true })
    expect(shown.nodes.has('r1')).toBe(true)
    expect(shown.nodes.get('r1')?.depth).toBe(1)
    expect(shown.nodes.get('a')?.childCount).toBe(2)
  })

  it('drops a subagent whose parent is outside the workspace', () => {
    const g = buildLineageGraph([s('r1', { parentId: 'ghost', origin: 'subagent' })], new Set(['r1']))
    expect(g.nodes.size).toBe(0)
    expect(g.roots).toEqual([])
  })

  it('rows without an origin behave exactly as before', () => {
    const g = buildLineageGraph([
      s('a', { createdAt: 1 }),
      s('b', { parentId: 'a', createdAt: 2 }),
    ], new Set(['a', 'b']))
    expect(g.nodes.get('a')?.subagentCount).toBeUndefined()
    expect(g.nodes.get('b')?.parentId).toBe('a')
    expect(g.roots).toEqual(['a'])
  })
})

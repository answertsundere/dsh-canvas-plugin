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

  it('orders roots by createdAt ascending', () => {
    const g = buildLineageGraph(
      [s('late', { createdAt: 20 }), s('early', { createdAt: 10 }), s('mid', { createdAt: 15 })],
      new Set(['late', 'early', 'mid']),
    )
    expect(g.roots).toEqual(['early', 'mid', 'late'])
  })
})
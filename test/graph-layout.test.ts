import { describe, expect, it } from 'vitest'
import { layoutLayered } from '../src/client/graph/graph-layout.ts'
import type { CanvasGraph, CanvasNode } from '../src/shared/contracts.ts'

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

describe('layoutLayered', () => {
  it('places a single root at the origin', () => {
    const result = layoutLayered(graph([node('a')], ['a']))
    expect(result.positions.get('a')).toEqual({ x: 0, y: 0 })
  })

  it('places each depth in its own column', () => {
    const result = layoutLayered(graph(
      [node('a'), node('b', { parentId: 'a', depth: 1 }), node('c', { parentId: 'b', depth: 2 })],
      ['a'],
    ), { columnGap: 240 })
    expect(result.positions.get('a')?.x).toBe(0)
    expect(result.positions.get('b')?.x).toBe(240)
    expect(result.positions.get('c')?.x).toBe(480)
  })

  it('stacks siblings in the same column by the row gap', () => {
    const result = layoutLayered(graph(
      [
        node('a', { childCount: 2 }),
        node('b', { parentId: 'a', depth: 1, createdAt: 1 }),
        node('c', { parentId: 'a', depth: 1, createdAt: 2 }),
      ],
      ['a'],
    ), { rowGap: 96 })
    expect(result.positions.get('b')).toEqual({ x: 240, y: 0 })
    expect(result.positions.get('c')).toEqual({ x: 240, y: 96 })
  })

  it('keeps a linear chain on one row instead of drawing a staircase', () => {
    // The most common shape is a chain; giving every node its own row would
    // make the canvas tall and diagonal for no reason.
    const result = layoutLayered(graph(
      [node('a'), node('b', { parentId: 'a', depth: 1 }), node('c', { parentId: 'b', depth: 2 })],
      ['a'],
    ), { rowGap: 100 })
    expect(result.positions.get('a')?.y).toBe(0)
    expect(result.positions.get('b')?.y).toBe(0)
    expect(result.positions.get('c')?.y).toBe(0)
  })

  it('pushes a second branch to the next row and centres the parent between them', () => {
    const result = layoutLayered(graph(
      [
        node('a', { childCount: 2 }),
        node('b', { parentId: 'a', depth: 1, createdAt: 1 }),
        node('b1', { parentId: 'b', depth: 2, createdAt: 2 }),
        node('c', { parentId: 'a', depth: 1, createdAt: 3 }),
      ],
      ['a'],
    ), { rowGap: 100 })
    expect(result.positions.get('b')?.y).toBe(0)
    expect(result.positions.get('b1')?.y).toBe(0)
    expect(result.positions.get('c')?.y).toBe(100)
    // Centred between row 0 and row 100.
    expect(result.positions.get('a')?.y).toBe(50)
  })

  it('reports bounds that cover the last column and row', () => {
    const result = layoutLayered(graph(
      [node('a'), node('b', { parentId: 'a', depth: 1 })],
      ['a'],
    ), { columnGap: 240, rowGap: 96, nodeWidth: 200, nodeHeight: 72 })
    expect(result.width).toBe(440)
    expect(result.height).toBe(72)
  })

  it('returns empty bounds for an empty graph', () => {
    expect(layoutLayered(graph([], []))).toEqual({ positions: new Map(), width: 0, height: 0 })
  })

  it('honours custom gaps', () => {
    const result = layoutLayered(graph(
      [node('a', { childCount: 1 }), node('b', { parentId: 'a', depth: 1 })],
      ['a'],
    ), { columnGap: 10, rowGap: 20, nodeWidth: 1, nodeHeight: 1 })
    expect(result.positions.get('b')).toEqual({ x: 10, y: 0 })
    expect(result.width).toBe(11)
    expect(result.height).toBe(1)
  })

  it('terminates on a cycle and still positions every node', () => {
    // graph-model promotes one cycle member to a root but keeps its raw
    // parentId, so the layout must not walk that back-edge forever.
    const result = layoutLayered(graph(
      [node('a', { parentId: 'b', depth: 0 }), node('b', { parentId: 'a', depth: 1 })],
      ['a'],
    ))
    expect(result.positions.size).toBe(2)
    expect(result.positions.get('a')).toEqual({ x: 0, y: 0 })
    expect(result.positions.get('b')).toEqual({ x: 240, y: 0 })
  })

  it('positions a node that no root reaches', () => {
    const result = layoutLayered(graph([node('lonely')], []))
    expect(result.positions.get('lonely')).toEqual({ x: 0, y: 0 })
  })

  it('stacks separate roots in the first column', () => {
    const result = layoutLayered(graph([node('a'), node('b')], ['a', 'b']), { rowGap: 50 })
    expect(result.positions.get('a')).toEqual({ x: 0, y: 0 })
    expect(result.positions.get('b')).toEqual({ x: 0, y: 50 })
  })
})

import type { CanvasGraph, SessionId } from '../../shared/contracts.ts'

/**
 * Layered left-to-right layout for the lineage canvas.
 *
 * Pure and dependency-free. `CanvasNode.depth` picks the column and a
 * depth-first walk picks the row, so the layout agrees with the graph model's
 * cycle promotion by construction: a promoted root has depth 0 and keeps its
 * raw `parentId`, which puts a back-edge in the children map below.
 *
 * Rows are assigned to **leaves** in depth-first order, and a node with
 * children is centred between its first and last child. That is what keeps a
 * linear chain (a → b → c) on a single row instead of drawing a staircase, while
 * still pushing real branches apart vertically. Assigning every node its own
 * row would be simpler and would look wrong on the most common shape there is.
 *
 * A node already visited is never re-entered, so a cycle cannot recurse
 * forever, and a node no root reaches is still placed rather than rendered
 * nowhere.
 */

export interface LayoutOptions {
  readonly columnGap?: number
  readonly rowGap?: number
  readonly nodeWidth?: number
  readonly nodeHeight?: number
}

export interface LayoutPoint {
  readonly x: number
  readonly y: number
}

export interface LayoutResult {
  readonly positions: ReadonlyMap<SessionId, LayoutPoint>
  readonly width: number
  readonly height: number
}

const DEFAULT_COLUMN_GAP = 240
const DEFAULT_ROW_GAP = 96
const DEFAULT_NODE_WIDTH = 200
const DEFAULT_NODE_HEIGHT = 72

export function layoutLayered(graph: CanvasGraph, options: LayoutOptions = {}): LayoutResult {
  const columnGap = options.columnGap ?? DEFAULT_COLUMN_GAP
  const rowGap = options.rowGap ?? DEFAULT_ROW_GAP
  const nodeWidth = options.nodeWidth ?? DEFAULT_NODE_WIDTH
  const nodeHeight = options.nodeHeight ?? DEFAULT_NODE_HEIGHT

  const children = new Map<SessionId, SessionId[]>()
  for (const [id, node] of graph.nodes) {
    const parentId = node.parentId
    if (parentId === null || !graph.nodes.has(parentId)) continue
    const siblings = children.get(parentId)
    if (siblings === undefined) children.set(parentId, [id])
    else siblings.push(id)
  }

  /** Row index per node; fractional when a node is centred between two children. */
  const rows = new Map<SessionId, number>()
  const settled = new Set<SessionId>()
  let nextRow = 0

  const place = (id: SessionId): number | undefined => {
    if (settled.has(id)) return rows.get(id)
    // Marked before recursing: this guard is what stops a cycle.
    settled.add(id)
    const kids = (children.get(id) ?? []).filter(child => !settled.has(child))
    const childRows = kids
      .map(child => place(child))
      .filter((row): row is number => row !== undefined)
    const row = childRows.length === 0
      ? nextRow++
      : (Math.min(...childRows) + Math.max(...childRows)) / 2
    rows.set(id, row)
    return row
  }

  for (const root of graph.roots) place(root)
  for (const id of graph.nodes.keys()) place(id)

  const positions = new Map<SessionId, LayoutPoint>()
  let maxX = 0
  let maxY = 0
  for (const [id, row] of rows) {
    const node = graph.nodes.get(id)
    if (node === undefined) continue
    const point = { x: node.depth * columnGap, y: row * rowGap }
    positions.set(id, point)
    if (point.x > maxX) maxX = point.x
    if (point.y > maxY) maxY = point.y
  }

  if (positions.size === 0) return { positions, width: 0, height: 0 }
  return { positions, width: maxX + nodeWidth, height: maxY + nodeHeight }
}

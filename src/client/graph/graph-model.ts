import type { CanvasGraph, CanvasNode, SessionId } from '../../shared/contracts.ts'

export interface SessionSummaryLike {
  id: string
  parentId?: string
  title?: string
  createdAt: number
  running: boolean
  available: boolean
  seeded?: boolean
  cwd?: string
}

const byAge = (createdAt: (id: SessionId) => number) => (a: SessionId, b: SessionId): number => {
  const delta = createdAt(a) - createdAt(b)
  return delta !== 0 ? delta : a < b ? -1 : a > b ? 1 : 0
}

export function buildLineageGraph(
  summaries: SessionSummaryLike[],
  memberIds: ReadonlySet<string>,
): CanvasGraph {
  const members = new Map<SessionId, SessionSummaryLike>()
  for (const summary of summaries) {
    if (memberIds.has(summary.id)) members.set(summary.id, summary)
  }

  const children = new Map<SessionId, SessionId[]>()
  for (const [id, summary] of members) {
    const parentId = summary.parentId
    if (parentId == null || !members.has(parentId)) continue
    const siblings = children.get(parentId)
    if (siblings === undefined) children.set(parentId, [id])
    else siblings.push(id)
  }

  const createdAt = (id: SessionId): number => members.get(id)?.createdAt ?? 0
  const nodes = new Map<SessionId, CanvasNode>()
  for (const [id, summary] of members) {
    const parentId = summary.parentId ?? null
    nodes.set(id, {
      id,
      parentId,
      externalParent: parentId !== null && !memberIds.has(parentId),
      title: summary.title ?? id,
      createdAt: summary.createdAt,
      running: summary.running,
      available: summary.available,
      seeded: summary.seeded ?? false,
      cwd: summary.cwd ?? null,
      childCount: children.get(id)?.length ?? 0,
    })
  }

  const measureDepth = (roots: readonly SessionId[]): { depth: Map<SessionId, number>; maxDepth: number } => {
    const depth = new Map<SessionId, number>()
    const queue: SessionId[] = []
    let maxDepth = 0
    for (const root of roots) {
      if (depth.has(root)) continue
      depth.set(root, 0)
      queue.push(root)
    }
    for (let head = 0; head < queue.length; head += 1) {
      const id = queue[head]
      if (id === undefined) continue
      const at = depth.get(id) ?? 0
      for (const child of children.get(id) ?? []) {
        if (depth.has(child)) continue
        depth.set(child, at + 1)
        if (at + 1 > maxDepth) maxDepth = at + 1
        queue.push(child)
      }
    }
    return { depth, maxDepth }
  }

  const roots: SessionId[] = []
  for (const id of members.keys()) {
    const parentId = members.get(id)?.parentId
    if (parentId == null || !members.has(parentId)) roots.push(id)
  }

  let maxDepth = 0
  for (;;) {
    const { depth, maxDepth: reached } = measureDepth(roots)
    const unreached = [...members.keys()].filter(id => !depth.has(id))
    if (unreached.length === 0) {
      maxDepth = reached
      break
    }
    const next = [...unreached].sort(byAge(createdAt))[0]
    if (next === undefined) break
    roots.push(next)
  }

  roots.sort(byAge(createdAt))

  return { nodes, roots, maxDepth }
}
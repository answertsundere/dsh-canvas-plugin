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
  /** DSH's coarse durable origin; `'subagent'` marks conversation-internal agents. */
  origin?: 'subagent'
}

export interface LineageGraphOptions {
  /**
   * Show subagent-origin sessions as first-class nodes. Default false: the
   * outer canvas is the conversation-to-conversation lineage — subagents are
   * one conversation's internals, so they fold into the parent card as a
   * count and their real home is the ⌖ swarm view.
   */
  readonly includeSubagents?: boolean
}

const byAge = (createdAt: (id: SessionId) => number) => (a: SessionId, b: SessionId): number => {
  const delta = createdAt(a) - createdAt(b)
  return delta !== 0 ? delta : a < b ? -1 : a > b ? 1 : 0
}

/**
 * Builds the workspace lineage graph the canvas renders.
 *
 * Roots are members with no parent, an external (non-member) parent, or a parent
 * missing from the node map. A member still unreachable from those roots can
 * only sit inside a lineage cycle, so the earliest such member (by `createdAt`,
 * then id) is promoted to a root and the traversal repeats — at most
 * `members.size` iterations, since every pass appends exactly one root. A
 * promoted root keeps its raw `parentId`, so consumers must read `roots` and
 * `CanvasNode.depth` rather than testing for a parentless node.
 *
 * Duplicate ids in `summaries` are last-write-wins.
 */
export function buildLineageGraph(
  summaries: SessionSummaryLike[],
  memberIds: ReadonlySet<string>,
  options: LineageGraphOptions = {},
): CanvasGraph {
  const includeSubagents = options.includeSubagents ?? false
  const roster = new Map<SessionId, SessionSummaryLike>()
  for (const summary of summaries) {
    if (memberIds.has(summary.id)) roster.set(summary.id, summary)
  }

  // Subagent-origin sessions belong to the conversation that spawned them.
  // Unless explicitly included they are lifted out of the member set and
  // folded into their parent as `subagentCount`; one whose parent is absent
  // from the workspace is dropped with the rest of the orphans.
  const subagentCount = new Map<SessionId, number>()
  const members = new Map<SessionId, SessionSummaryLike>()
  for (const [id, summary] of roster) {
    if (summary.origin === 'subagent' && !includeSubagents) {
      if (summary.parentId != null && roster.has(summary.parentId)) {
        subagentCount.set(summary.parentId, (subagentCount.get(summary.parentId) ?? 0) + 1)
      }
      continue
    }
    members.set(id, summary)
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
        // visited guard: each node is placed once, so a back-edge inside a cycle is dropped
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

  let measured = measureDepth(roots)
  for (;;) {
    // cycle promotion: whatever the roots cannot reach is cycle-closed, so one
    // node per such component is promoted to a root and the BFS reruns
    const unreached = [...members.keys()].filter(id => !measured.depth.has(id))
    if (unreached.length === 0) break
    const next = [...unreached].sort(byAge(createdAt))[0]
    if (next === undefined) break
    roots.push(next)
    measured = measureDepth(roots)
  }
  const { depth, maxDepth } = measured

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
      depth: depth.get(id) ?? 0,
      ...(subagentCount.has(id) ? { subagentCount: subagentCount.get(id) } : {}),
    })
  }

  roots.sort(byAge(createdAt))

  return { nodes, roots, maxDepth }
}
/**
 * Nodes hidden because their subtree root is collapsed: each collapsed node
 * hides its entire descendant set (BFS over children), but never itself.
 */
export function hiddenByCollapse(
  nodes: ReadonlyMap<string, CanvasNode>,
  collapsed: ReadonlySet<string>,
): ReadonlySet<string> {
  const children = new Map<string, string[]>()
  for (const node of nodes.values()) {
    if (node.parentId === null) continue
    const bucket = children.get(node.parentId)
    if (bucket === undefined) children.set(node.parentId, [node.id])
    else bucket.push(node.id)
  }
  const hidden = new Set<string>()
  const queue: string[] = []
  for (const id of collapsed) {
    if (nodes.has(id)) queue.push(id)
  }
  while (queue.length > 0) {
    const current = queue.shift() as string
    for (const child of children.get(current) ?? []) {
      if (!hidden.has(child)) {
        hidden.add(child)
        queue.push(child)
      }
    }
  }
  return hidden
}

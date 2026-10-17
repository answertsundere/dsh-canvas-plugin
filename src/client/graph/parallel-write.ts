import type { CanvasGraph, SessionId } from '../../shared/contracts.ts'

/**
 * Which nodes should carry the 「⚠ 并行写入」 badge.
 *
 * A node is flagged when a **different running session shares its directory** —
 * someone else may be writing the same files. Two consequences worth stating:
 * a node that is the only running session in its directory has nobody to collide
 * with, so it is not flagged; and an *idle* node in a directory someone else is
 * running in **is** flagged, because forking it would put a second writer there.
 *
 * Counted per directory rather than scanned pairwise, so this stays linear on the
 * 500-node stress fixture.
 */
export function parallelWriteIds(graph: CanvasGraph): Set<SessionId> {
  const runningByCwd = new Map<string, number>()
  for (const node of graph.nodes.values()) {
    if (!node.running || node.cwd === null) continue
    runningByCwd.set(node.cwd, (runningByCwd.get(node.cwd) ?? 0) + 1)
  }

  const flagged = new Set<SessionId>()
  for (const node of graph.nodes.values()) {
    if (node.cwd === null) continue
    const others = (runningByCwd.get(node.cwd) ?? 0) - (node.running ? 1 : 0)
    if (others > 0) flagged.add(node.id)
  }
  return flagged
}

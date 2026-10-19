import type { CanvasGraph, SessionId } from '../../shared/contracts.ts';
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
export declare function parallelWriteIds(graph: CanvasGraph): Set<SessionId>;

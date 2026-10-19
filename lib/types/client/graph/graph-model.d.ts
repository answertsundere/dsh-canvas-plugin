import type { CanvasGraph, CanvasNode } from '../../shared/contracts.ts';
export interface SessionSummaryLike {
    id: string;
    parentId?: string;
    title?: string;
    createdAt: number;
    running: boolean;
    available: boolean;
    seeded?: boolean;
    cwd?: string;
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
export declare function buildLineageGraph(summaries: SessionSummaryLike[], memberIds: ReadonlySet<string>): CanvasGraph;
/**
 * Nodes hidden because their subtree root is collapsed: each collapsed node
 * hides its entire descendant set (BFS over children), but never itself.
 */
export declare function hiddenByCollapse(nodes: ReadonlyMap<string, CanvasNode>, collapsed: ReadonlySet<string>): ReadonlySet<string>;

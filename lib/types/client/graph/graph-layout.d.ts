import type { CanvasGraph, SessionId } from '../../shared/contracts.ts';
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
    readonly columnGap?: number;
    readonly rowGap?: number;
    readonly nodeWidth?: number;
    readonly nodeHeight?: number;
}
export interface LayoutPoint {
    readonly x: number;
    readonly y: number;
}
export interface LayoutResult {
    readonly positions: ReadonlyMap<SessionId, LayoutPoint>;
    readonly width: number;
    readonly height: number;
}
export declare function layoutLayered(graph: CanvasGraph, options?: LayoutOptions): LayoutResult;

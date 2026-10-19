import type { SessionSummaryLike } from '../graph/graph-model.ts';
/**
 * The subset of a client `WorkspaceView` row this adapter reads. `path` is the
 * canonical host directory, which is what a session's `cwd` is comparable to.
 */
export interface WorkspaceItemLike {
    readonly workspaceId: string;
    readonly path?: string;
    readonly sessionIds?: readonly string[];
}
export interface WorkspaceSelection {
    /** The workspace the canvas is scoped to, or null when it could not be resolved. */
    readonly workspaceId: string | null;
    readonly members: SessionSummaryLike[];
}
/**
 * The archived session ids the snapshot reports. Archived conversations belong
 * to the workspace's accounting but not to the canvas — the user put them
 * away, and a lineage map that keeps showing them is lying about the workspace.
 */
export declare function toArchivedIds(snapshot: unknown): ReadonlySet<string>;
/**
 * Narrows a workspace snapshot into the rows this adapter reads.
 *
 * Accepts the client `WorkspaceSnapshot` (`{ items }`) or a bare array, and
 * drops rows without a usable `workspaceId` rather than inventing one.
 */
export declare function toWorkspaceItems(snapshot: unknown): WorkspaceItemLike[];
/**
 * Resolves which sessions belong on the canvas for the current workspace.
 *
 * Membership is the union of two sources, not one:
 *   - `sessionIds`, the workspace's accounted set, which also supplies the
 *     manual order the sidebar shows;
 *   - a `cwd` match against the workspace's canonical `path`.
 *
 * The union matters because `sessionIds` is an accounting list: a session just
 * created in this directory may not be accounted to the workspace yet, and the
 * canvas must never hide the session the user is sitting in. Since a workspace
 * is keyed by its canonical cwd, a cwd match cannot pull in a foreign workspace.
 *
 * The caller resolves which workspace is current — the client workspace
 * snapshot has no `recentWorkspaceId` field. When that resolution fails, or the
 * workspace rows are unavailable, the supplied `fallbackCwd` is used, and the
 * workspace id is recovered from a row whose `path` matches it.
 *
 * When membership is genuinely undecidable the result is empty rather than
 * unfiltered: cross-workspace canvases are out of scope, so an unknown
 * workspace must render an empty canvas, never a global one.
 */
export declare function selectWorkspaceSummaries(workspaceItems: readonly WorkspaceItemLike[] | undefined, currentWorkspaceId: string | null | undefined, summaries: readonly SessionSummaryLike[], fallbackCwd: string | null, archived?: ReadonlySet<string>): WorkspaceSelection;

import type { SessionSummaryLike } from '../graph/graph-model.ts'

/**
 * The subset of a client `WorkspaceView` row this adapter reads. `path` is the
 * canonical host directory, which is what a session's `cwd` is comparable to.
 */
export interface WorkspaceItemLike {
  readonly workspaceId: string
  readonly path?: string
  readonly sessionIds?: readonly string[]
}

export interface WorkspaceSelection {
  /** The workspace the canvas is scoped to, or null when it could not be resolved. */
  readonly workspaceId: string | null
  readonly members: SessionSummaryLike[]
}

/**
 * Narrows a workspace snapshot into the rows this adapter reads.
 *
 * Accepts the client `WorkspaceSnapshot` (`{ items }`) or a bare array, and
 * drops rows without a usable `workspaceId` rather than inventing one.
 */
export function toWorkspaceItems(snapshot: unknown): WorkspaceItemLike[] {
  const rows = Array.isArray(snapshot)
    ? snapshot
    : typeof snapshot === 'object' && snapshot !== null && Array.isArray((snapshot as { items?: unknown }).items)
      ? (snapshot as { items: unknown[] }).items
      : []
  const items: WorkspaceItemLike[] = []
  for (const row of rows) {
    if (typeof row !== 'object' || row === null) continue
    const candidate = row as Record<string, unknown>
    if (typeof candidate.workspaceId !== 'string' || candidate.workspaceId === '') continue
    items.push({
      workspaceId: candidate.workspaceId,
      ...(typeof candidate.path === 'string' ? { path: candidate.path } : {}),
      ...(Array.isArray(candidate.sessionIds)
        ? { sessionIds: candidate.sessionIds.filter((id): id is string => typeof id === 'string') }
        : {}),
    })
  }
  return items
}

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
export function selectWorkspaceSummaries(
  workspaceItems: readonly WorkspaceItemLike[] | undefined,
  currentWorkspaceId: string | null | undefined,
  summaries: readonly SessionSummaryLike[],
  fallbackCwd: string | null,
): WorkspaceSelection {
  const items = workspaceItems ?? []
  const current = currentWorkspaceId == null
    ? undefined
    : items.find(item => item.workspaceId === currentWorkspaceId)

  if (current !== undefined) {
    const members: SessionSummaryLike[] = []
    const seen = new Set<string>()
    const byId = new Map(summaries.map(summary => [summary.id, summary]))

    for (const id of current.sessionIds ?? []) {
      const summary = byId.get(id)
      if (summary === undefined || seen.has(id)) continue
      seen.add(id)
      members.push(summary)
    }

    const cwd = current.path ?? fallbackCwd
    if (cwd !== null) {
      for (const summary of summaries) {
        if (seen.has(summary.id) || summary.cwd !== cwd) continue
        seen.add(summary.id)
        members.push(summary)
      }
    }

    return { workspaceId: current.workspaceId, members }
  }

  if (fallbackCwd === null) return { workspaceId: null, members: [] }
  return {
    workspaceId: items.find(item => item.path === fallbackCwd)?.workspaceId ?? null,
    members: summaries.filter(summary => summary.cwd === fallbackCwd),
  }
}

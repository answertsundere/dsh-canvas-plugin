import type { SessionSummaryLike } from '../graph/graph-model.ts'

/**
 * Narrows the Session list snapshot into the flat summaries the graph model
 * consumes, without ever throwing: the shape is owned by DSH and may differ
 * between a host list RPC and the client store projection.
 *
 * Accepted forms, in order of preference:
 *   - the client store snapshot `{ ids, byId }` (`SessionListState`)
 *   - the manager snapshot `{ items }` (`SessionListSnapshot`)
 *   - a bare array of rows
 *
 * Membership is taken from `ids` when present. That field alone expresses
 * Host-list membership; `byId` additionally carries retained subagent fallback
 * rows, which must not surface as canvas nodes. For the same reason a row whose
 * declared id is not a string is skipped rather than guessed at from its key.
 *
 * Two fields the graph model wants have no client-side source and are mapped
 * deliberately rather than invented:
 *   - `createdAt` falls back to `updatedAt`. The client row carries no creation
 *     instant, so ordering is activity-based. See the ledger note: root order
 *     is therefore *not* immutable creation order.
 *   - `available` is always true. The list snapshot exposes no availability or
 *     failure signal; `agentAvailable` is deliberately NOT used, because it
 *     means "this Session currently owns a live Agent" and is false for every
 *     cold session — mapping it here would misreport idle sessions as failed.
 *
 * `seeded` is left unset: seeded-ness is an event-stream fact
 * (`inheritedEventCount` / `session/end-seed`), not a list fact.
 */
export function toSummaries(listSnapshot: unknown): SessionSummaryLike[] {
  const out: SessionSummaryLike[] = []
  for (const [key, raw] of readRows(listSnapshot)) {
    const summary = toSummary(key, raw)
    if (summary !== undefined) out.push(summary)
  }
  return out
}

/** Every `[key, row]` pair a snapshot form offers, skipping absent rows. */
function readRows(listSnapshot: unknown): [string | undefined, unknown][] {
  if (Array.isArray(listSnapshot)) return listSnapshot.map(row => [undefined, row])
  if (!isRecord(listSnapshot)) return []

  const { ids, byId, items } = listSnapshot
  if (Array.isArray(ids)) {
    return ids.map(id => [
      typeof id === 'string' ? id : undefined,
      isRecord(byId) ? byId[typeof id === 'string' ? id : ''] : undefined,
    ])
  }
  if (Array.isArray(items)) return items.map(row => [undefined, row])
  return []
}

function toSummary(key: string | undefined, raw: unknown): SessionSummaryLike | undefined {
  if (!isRecord(raw)) return undefined

  const declared = raw.id ?? raw.sessionId
  if (declared !== undefined && (typeof declared !== 'string' || declared === '')) return undefined
  const id = typeof declared === 'string' ? declared : key
  if (id === undefined) return undefined

  return {
    id,
    parentId: text(raw.parentSessionId) ?? text(raw.parentId),
    title: text(raw.title) ?? text(raw.displayTitle) ?? id,
    cwd: text(raw.cwd),
    createdAt: finite(raw.createdAt) ?? finite(raw.updatedAt) ?? 0,
    running: raw.running === true,
    available: true,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value !== '' ? value : undefined
}

function finite(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

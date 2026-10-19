import type { SessionSummaryLike } from '../graph/graph-model.ts';
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
export declare function toSummaries(listSnapshot: unknown): SessionSummaryLike[];

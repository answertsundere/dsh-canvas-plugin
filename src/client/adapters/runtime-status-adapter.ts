import type { StatusKind } from '../../shared/status.ts'

/**
 * The only live signal the session summary carries is `running`; everything
 * finer-grained (thinking / tool / awaiting-approval) arrives as an event-stream
 * hint the caller passes in. Keeping the hint on the input — rather than
 * reaching into a stream here — is what makes this adapter a pure reducer.
 */
export type RuntimeHint = 'thinking' | 'tool' | 'awaiting-approval'

export interface RuntimeStatusInput {
  /** Stream link to the host. False ⇒ nothing below can be trusted. */
  readonly connected: boolean
  /** Session availability from the list snapshot; false means the session failed. */
  readonly available: boolean
  /** Confirmed fact from the list snapshot, not an inference. */
  readonly running: boolean
  /** Latest live hint, if one has been observed. */
  readonly lastHint?: RuntimeHint
}

/**
 * Reduces a session summary plus the latest live hint into a display status.
 *
 * Precedence is deliberate and total, so the caller never has to guess:
 *   1. disconnected  → `unknown`  (a stale `running:true` must not read as live)
 *   2. unavailable   → `failed`
 *   3. running       → the hint, else `thinking`
 *   4. stopped       → `idle`
 *
 * Two rules from the design spec drive the ordering. "Never infer idle from
 * silence" is why a running session without a hint degrades to `thinking`
 * (inferred, `badge().confirmed === false`) instead of `idle`. And because
 * `running:false` is a *confirmed* fact from the snapshot rather than an
 * absence of evidence, a lingering hint on a stopped session is treated as
 * stale and the result is `idle`.
 *
 * `done` and `queued` are intentionally unreachable here: turn completion and
 * queue depth are event-stream facts, so they are derived where those events
 * are read, never from a summary.
 */
export function deriveStatus(input: RuntimeStatusInput): StatusKind {
  if (!input.connected) return 'unknown'
  if (!input.available) return 'failed'
  if (input.running) return input.lastHint ?? 'thinking'
  return 'idle'
}

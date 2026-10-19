import type { BranchSegment } from '../../shared/contracts.ts';
/**
 * Branch segment extraction: the branch's *own* work, with the fork plumbing
 * identified and separated.
 *
 * Verified against the local checkout at `639ed01539` (`core/session/src/types.ts`):
 *
 *   turn/start  { turn }                       turn/end  { turn, reason: { kind } }
 *   step/start  { turn, step }                 step/end  { turn, step }
 *   user/message       UserMessage   = { id, role:'user', content: ContentBlock[], source: { kind } }
 *   assistant/message  { turn, step, message: AssistantMessage, stream, usage?, interrupted? }
 *   tool/call          { turn, step, callId, name, arguments }
 *   tool/result        { turn, step, message: ToolResultMessage, error?, meta? }
 *   session/end-seed   { inherited?: true }
 *
 * There is **no `text-chunks` event type**; assistant text lives in
 * `assistant/message.data.message.content` as `{ type:'text', text }` blocks.
 * `turn/end.reason.kind` is the discriminator (`completed | aborted | blocked |
 * error | max-tokens | interrupted | forked`).
 */
/**
 * The inherited prefix length of a fork child, read from its own event log.
 *
 * A fork child owns exactly one `session/end-seed { inherited: true }` marker
 * **at** its cut (`core/session/src/fork.ts`, `core/session/src/types.ts`), and
 * DSH's `inheritedEventCount` is `boundary + 1` for that same inclusive
 * boundary. Reading the marker keeps the number consistent with the log instead
 * of depending on a field the client surface does not expose. A session that was
 * never forked has no marker and therefore inherits nothing.
 */
export declare function inheritedPrefixLength(events: readonly SessionEventLike[]): number;
export interface SessionEventLike {
    readonly seq: number;
    readonly type: string;
    readonly data?: unknown;
}
/**
 * Extracts the turns a branch owns from its event window.
 *
 * `inheritedCount` is the fork's `inheritedEventCount`, which DSH computes as
 * `SessionLogOffset(boundary + 1)` for the inclusive cut `atSeq = boundary`
 * (`api/session-controller/src/commands.ts:273`). The inherited prefix is
 * therefore `seq < inheritedCount` and the branch's own work starts at exactly
 * `inheritedCount` — a boundary, not "after" it.
 *
 * That means the fork's synthetic balancing closers land **inside** this
 * segment: a cut inside an open turn leaves the child a `turn/end` with
 * `reason.kind === 'forked'` and no `turn/start` of its own, plus the
 * `session/end-seed` marker. Those turns are reported with `synthetic: true` so
 * the comparison can exclude them — they are identical in every branch by
 * construction, and counting them would put the same noise row in every diff.
 */
export declare function segmentFromEvents(sessionId: string, inheritedCount: number, events: readonly SessionEventLike[]): BranchSegment;
/** The detail panel bounds the conclusion so it informs without replacing the read. */
export declare const CONCLUSION_BOUND = 600;
/**
 * The session's latest conclusion: the last durable `assistant/message`'s text
 * blocks, concatenated, tail-anchored to `bound` characters — when a conclusion
 * is long, its end is the part that concludes. Null when the session has said
 * nothing yet.
 */
export declare function conclusionFromEvents(events: readonly SessionEventLike[], bound?: number): string | null;

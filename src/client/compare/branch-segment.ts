import type { BranchSegment, BranchTurn } from '../../shared/contracts.ts'

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
export function inheritedPrefixLength(events: readonly SessionEventLike[]): number {
  let length = 0
  for (const event of events) {
    if (event.type !== 'session/end-seed') continue
    if (!isRecord(event.data) || event.data.inherited !== true) continue
    if (!Number.isFinite(event.seq)) continue
    length = event.seq + 1
  }
  return length
}

export interface SessionEventLike {
  readonly seq: number
  readonly type: string
  readonly data?: unknown
}

/** Matches DSH's own `boundContextSummary`: a bounded one-line account. */
const ASSISTANT_SUMMARY_MAX_CHARS = 200

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
export function segmentFromEvents(
  sessionId: string,
  inheritedCount: number,
  events: readonly SessionEventLike[],
): BranchSegment {
  const ordered = events
    .filter(event => Number.isFinite(event.seq) && event.seq >= inheritedCount)
    .slice()
    .sort((left, right) => left.seq - right.seq)

  const turns: BranchTurn[] = []
  let draft: Draft | undefined

  const ensure = (): Draft => {
    draft ??= { userTexts: [], assistantTexts: [], tools: [], callIndex: new Map(), synthetic: false }
    return draft
  }
  const flush = (): void => {
    if (draft === undefined) return
    turns.push(toTurn(draft, turns.length))
    draft = undefined
  }

  for (const event of ordered) {
    const data = isRecord(event.data) ? event.data : undefined

    if (event.type === 'turn/start') {
      flush()
      touch(ensure(), event.seq)
      continue
    }

    const current = ensure()
    touch(current, event.seq)

    switch (event.type) {
      case 'turn/end': {
        // No open turn means the cut landed inside a turn that the source
        // session still had open, so the child only owns its synthetic closer.
        const kind = kindOf(data?.reason)
        if (kind !== undefined) current.endedAs = kind
        if (kind === 'forked') current.synthetic = true
        flush()
        break
      }
      case 'session/end-seed':
        current.synthetic = true
        break
      case 'user/message': {
        // A user/message also carries injected context (file-change notices,
        // AGENTS.md, skill content, cron). `source.kind` separates them, which
        // is the same test DSH's own list projection uses for lastPromptAt.
        if (kindOf(data?.source) === 'user') {
          const text = textOf(data)
          if (text !== undefined && text !== '') current.userTexts.push(text)
        }
        break
      }
      case 'assistant/message': {
        const text = textOf(data?.message)
        if (text !== undefined && text !== '') current.assistantTexts.push(text)
        break
      }
      case 'tool/call': {
        const name = typeof data?.name === 'string' ? data.name : undefined
        if (name === undefined) break
        current.callIndex.set(typeof data?.callId === 'string' ? data.callId : '', current.tools.length)
        current.tools.push({ name, status: 'pending' })
        break
      }
      case 'tool/result': {
        const callId = isRecord(data?.message) ? data.message.toolCallId : undefined
        const at = typeof callId === 'string' ? current.callIndex.get(callId) : undefined
        // A result whose call sits in the inherited prefix has no name to
        // report here; the call itself is inherited history, not branch work.
        if (at === undefined) break
        const failed = data?.error !== undefined
          || (isRecord(data?.message) && data.message.isError === true)
        const existing = current.tools[at]
        if (existing !== undefined) current.tools[at] = { name: existing.name, status: failed ? 'error' : 'ok' }
        break
      }
      default:
        break
    }
  }
  flush()

  return { sessionId, inheritedCount, turns }
}

interface Draft {
  userTexts: string[]
  assistantTexts: string[]
  tools: { name: string; status: string }[]
  callIndex: Map<string, number>
  firstSeq?: number
  lastSeq?: number
  endedAs?: string
  synthetic: boolean
}

function touch(draft: Draft, seq: number): void {
  if (draft.firstSeq === undefined) draft.firstSeq = seq
  draft.lastSeq = seq
}

function toTurn(draft: Draft, index: number): BranchTurn {
  const userMessage = draft.userTexts.join('\n')
  const assistantSummary = bound(draft.assistantTexts.join(''))
  return {
    index,
    firstSeq: draft.firstSeq ?? 0,
    lastSeq: draft.lastSeq ?? 0,
    ...(userMessage === '' ? {} : { userMessage }),
    ...(assistantSummary === undefined ? {} : { assistantSummary }),
    tools: draft.tools,
    ...(draft.endedAs === undefined ? {} : { endedAs: draft.endedAs }),
    synthetic: draft.synthetic,
  }
}

/** Joins the `{ type:'text' }` blocks of one message, ignoring reasoning and images. */
function textOf(message: unknown): string | undefined {
  if (!isRecord(message) || !Array.isArray(message.content)) return undefined
  let text = ''
  for (const block of message.content) {
    if (isRecord(block) && block.type === 'text' && typeof block.text === 'string') text += block.text
  }
  return text
}

function kindOf(value: unknown): string | undefined {
  return isRecord(value) && typeof value.kind === 'string' ? value.kind : undefined
}

function bound(text: string): string | undefined {
  if (text === '') return undefined
  return text.length <= ASSISTANT_SUMMARY_MAX_CHARS
    ? text
    : `${text.slice(0, ASSISTANT_SUMMARY_MAX_CHARS - 1)}…`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Fork transaction: the one place that must never fork twice.
 *
 * Verified against the local checkout at `639ed01539`
 * (`@deepseek-ai/dsh-api-session-controller/client`):
 *
 *   fork(opts: { sessionId; atSeq?; increaseTitle?; onCreated? }): Promise<SessionId>
 *
 * Two properties of that contract drive everything below.
 *
 * 1. `onCreated` observes the catalogued child **before** the optional title
 *    rename, and `fork` also rejects when only that rename fails after creation.
 *    A rejection therefore does not prove the child is absent — so the id
 *    captured by `onCreated` is checked before anything else, and it is a far
 *    stronger signal than reading the error text.
 * 2. `prompt(...)` returns `Promise<RemoteResult<{accepted:true}>>`: it does not
 *    reject on business errors, it resolves `{ ok: false }`. A send that only
 *    catches rejections would read a refused prompt as success.
 */

/** Outcome of one prompt attempt, already unwrapped from `RemoteResult`. */
export type PromptOutcome = { readonly ok: true } | { readonly ok: false; readonly error: string }

export type ForkPhase = 'validating' | 'forking' | 'launching' | 'done' | 'failed' | 'unverified'

export interface ForkResult {
  /** The child session id, or `''` when no child is known to exist. */
  readonly childId: string
  readonly phase: ForkPhase
  readonly error?: string
  readonly retriedPrompt: boolean
}

export interface ForkDeps {
  fork(req: {
    sessionId: string
    atSeq: number
    increaseTitle: boolean
    onCreated?: (childId: string) => void
  }): Promise<string>
  findChildByScan(parentId: string): Promise<string | undefined>
  using<T>(
    sessionId: string,
    op: (send: (text: string, requestId: string) => Promise<PromptOutcome>) => Promise<T>,
  ): Promise<T>
  newRequestId(): string
}

export interface ForkTransactionRequest {
  readonly sessionId: string
  /** Inclusive cut seq; a cut inside an open turn is balanced Host-side. */
  readonly atSeq: number
  readonly instruction?: string
  readonly launch: 'now' | 'later'
  /** One id per branch launch; retries reuse it so the Host can dedupe. */
  readonly requestId?: string
}

/**
 * Runs one branch launch: validate → fork once → optionally prompt with a single
 * retry.
 *
 * **Safety property:** `deps.fork` is called at most once on every path. Every
 * uncertain outcome resolves to `unverified` rather than a second fork, because
 * a duplicate child session is not recoverable by the user, while an
 * `unverified` node is visible and inspectable.
 *
 * Recovery does not depend on recognising the error text. A rejection with no
 * child observed always attempts a scan, so a lost receipt is recovered however
 * it was worded; the transport-vs-business heuristic only chooses between the
 * `unverified` and `failed` labels. A misclassification can therefore never
 * produce a duplicate fork — only a different label on an already-safe outcome.
 */
export async function runForkTransaction(
  deps: ForkDeps,
  req: ForkTransactionRequest,
): Promise<ForkResult> {
  const instruction = req.instruction?.trim() ?? ''

  if (!Number.isInteger(req.atSeq) || req.atSeq < 0) {
    return {
      childId: '',
      phase: 'failed',
      error: `atSeq must be a non-negative integer, received ${String(req.atSeq)}`,
      retriedPrompt: false,
    }
  }
  if (req.launch === 'now' && instruction === '') {
    return {
      childId: '',
      phase: 'failed',
      error: 'launch "now" requires a non-blank instruction',
      retriedPrompt: false,
    }
  }

  const requestId = req.requestId ?? deps.newRequestId()

  let observed: string | undefined
  let resolved: string | undefined
  let forkError: unknown
  try {
    resolved = await deps.fork({
      sessionId: req.sessionId,
      atSeq: req.atSeq,
      increaseTitle: true,
      onCreated: (childId) => { observed = childId },
    })
  } catch (error) {
    forkError = error
  }

  // A captured child proves creation even when the call threw (rename failure).
  let childId = resolved ?? observed
  if (childId === undefined) {
    childId = await deps.findChildByScan(req.sessionId)
    if (childId === undefined) {
      return {
        childId: '',
        phase: looksLikeLostReceipt(forkError) ? 'unverified' : 'failed',
        ...(forkError === undefined ? {} : { error: describe(forkError) }),
        retriedPrompt: false,
      }
    }
  }

  if (req.launch === 'later') return { childId, phase: 'done', retriedPrompt: false }

  const first = await sendOnce(deps, childId, instruction, requestId)
  if (first.ok) return { childId, phase: 'done', retriedPrompt: false }

  const second = await sendOnce(deps, childId, instruction, requestId)
  if (second.ok) return { childId, phase: 'done', retriedPrompt: true }

  return { childId, phase: 'failed', error: second.error, retriedPrompt: true }
}

async function sendOnce(
  deps: ForkDeps,
  childId: string,
  text: string,
  requestId: string,
): Promise<PromptOutcome> {
  try {
    return await deps.using(childId, send => send(text, requestId))
  } catch (error) {
    // `using` retains then releases; a failed retain is a prompt failure, not a
    // reason to abandon a child that already exists.
    return { ok: false, error: describe(error) }
  }
}

/** Whether an error reads as a transport failure whose receipt may have been lost. */
function looksLikeLostReceipt(error: unknown): boolean {
  if (error === undefined) return false
  return /ECONN|abort|timeout|timed out|network|socket|fetch|offline|reset/i.test(describe(error))
}

function describe(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return String(error)
}

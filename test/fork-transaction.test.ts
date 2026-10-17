import { describe, expect, it, vi } from 'vitest'
import {
  runForkTransaction,
  type ForkDeps,
  type PromptOutcome,
} from '../src/client/controllers/fork-controller.ts'

const ok: PromptOutcome = { ok: true }
const fail = (error: string): PromptOutcome => ({ ok: false, error })

interface FakeOptions {
  readonly forkRejects?: string
  readonly forkReturnsUndefined?: boolean
  readonly onCreatedFires?: boolean
  /** Children the parent already had before this fork. */
  readonly existingChildren?: readonly string[]
  readonly created?: string
  /** Siblings created by the same window, used to force an ambiguous recovery. */
  readonly extraCreated?: readonly string[]
  /** The fork threw only after the child was catalogued (a lost receipt). */
  readonly lostReceipt?: boolean
  readonly childrenThrows?: boolean
  readonly outcomes?: readonly PromptOutcome[]
  readonly usingThrows?: string
}

const makeDeps = (options: FakeOptions = {}) => {
  const created = options.created ?? 'child'
  const sent: { text: string; requestId: string }[] = []
  let call = 0
  let forked = false

  const fork = vi.fn(async (req: { onCreated?: (id: string) => void }) => {
    const creates = options.forkRejects === undefined || options.lostReceipt === true
    if (creates) {
      forked = true
      if (options.onCreatedFires !== false) req.onCreated?.(created)
    }
    if (options.forkRejects !== undefined) throw new Error(options.forkRejects)
    if (options.forkReturnsUndefined === true) return undefined as unknown as string
    return created
  })

  const childrenOf = vi.fn(async () => {
    if (options.childrenThrows === true) throw new Error('session list unavailable')
    const before = [...(options.existingChildren ?? [])]
    // Pre-existing children come first, so a naive "first child of the parent"
    // would pick one of them rather than the child this fork created.
    return forked ? [...before, created, ...(options.extraCreated ?? [])] : before
  })

  const deps: ForkDeps = {
    fork,
    childrenOf,
    using: async (sessionId, op) => {
      if (options.usingThrows !== undefined) throw new Error(options.usingThrows)
      return op(async (text, requestId) => {
        sent.push({ text, requestId })
        const outcome = options.outcomes?.[call]
        call += 1
        return outcome ?? ok
      })
    },
    newRequestId: () => 'generated-id',
  }
  return { deps, fork, childrenOf, sent }
}

const req = (extra: Record<string, unknown> = {}) =>
  ({ sessionId: 'src', atSeq: 47, launch: 'now' as const, requestId: 'req-1', instruction: 'go', ...extra })

describe('runForkTransaction', () => {
  it('forks once and prompts once with the caller request id', async () => {
    const fake = makeDeps()
    const result = await runForkTransaction(fake.deps, req())
    expect(result).toEqual({ childId: 'child', phase: 'done', retriedPrompt: false })
    expect(fake.fork).toHaveBeenCalledTimes(1)
    expect(fake.fork).toHaveBeenCalledWith(expect.objectContaining({
      sessionId: 'src', atSeq: 47, increaseTitle: true,
    }))
    expect(fake.sent).toEqual([{ text: 'go', requestId: 'req-1' }])
  })

  it('keeps the child when the fork rejects only because the title rename failed', async () => {
    // fork() observes the catalogued child via onCreated BEFORE the optional
    // rename, and rejects when that rename fails after creation. A captured id
    // therefore proves the child exists, so the list is not even re-read.
    const fake = makeDeps({ forkRejects: 'rename failed', lostReceipt: true })
    const result = await runForkTransaction(fake.deps, req())
    expect(result).toEqual({ childId: 'child', phase: 'done', retriedPrompt: false })
    expect(fake.fork).toHaveBeenCalledTimes(1)
    expect(fake.childrenOf).toHaveBeenCalledTimes(1)
    expect(fake.sent).toHaveLength(1)
  })

  it('recovers a lost fork receipt by diffing the parent\u2019s children', async () => {
    const fake = makeDeps({ forkRejects: 'ECONNRESET', lostReceipt: true, onCreatedFires: false })
    const result = await runForkTransaction(fake.deps, req())
    expect(result).toEqual({ childId: 'child', phase: 'done', retriedPrompt: false })
    expect(fake.fork).toHaveBeenCalledTimes(1)
    expect(fake.childrenOf).toHaveBeenCalledTimes(2)
    expect(fake.sent).toEqual([{ text: 'go', requestId: 'req-1' }])
  })

  it('never mistakes a pre-existing branch for the one this fork created', async () => {
    // A parent on a canvas almost always already has children. Picking "a child
    // of the parent" would return a pre-existing branch and deliver the prompt
    // to the wrong session; only the before/after difference is evidence.
    const fake = makeDeps({
      forkRejects: 'ECONNRESET',
      lostReceipt: true,
      onCreatedFires: false,
      existingChildren: ['old-1', 'old-2'],
    })
    const result = await runForkTransaction(fake.deps, req())
    expect(result.childId).toBe('child')
    expect(result.childId).not.toBe('old-1')
    expect(fake.sent).toEqual([{ text: 'go', requestId: 'req-1' }])
  })

  it('refuses to guess when several new children appeared at once', async () => {
    const fake = makeDeps({
      forkRejects: 'ECONNRESET',
      lostReceipt: true,
      onCreatedFires: false,
      extraCreated: ['other-1', 'other-2'],
    })
    const result = await runForkTransaction(fake.deps, req())
    expect(result.phase).toBe('unverified')
    expect(result.childId).toBe('')
    expect(fake.fork).toHaveBeenCalledTimes(1)
    expect(fake.sent).toHaveLength(0)
  })

  it('reports unverified when a lost receipt cannot be confirmed, and never re-forks', async () => {
    const fake = makeDeps({ forkRejects: 'ECONNRESET', onCreatedFires: false })
    const result = await runForkTransaction(fake.deps, req())
    expect(result.phase).toBe('unverified')
    expect(result.childId).toBe('')
    expect(result.error).toBe('ECONNRESET')
    expect(fake.fork).toHaveBeenCalledTimes(1)
    expect(fake.sent).toHaveLength(0)
  })

  it('reports unverified when the session list cannot be read at all', async () => {
    const fake = makeDeps({ forkRejects: 'boom', onCreatedFires: false, childrenThrows: true })
    const result = await runForkTransaction(fake.deps, req())
    expect(result.phase).toBe('unverified')
    expect(fake.sent).toHaveLength(0)
  })

  it('reports failed for a business rejection with no child to find', async () => {
    const fake = makeDeps({ forkRejects: 'session not found', onCreatedFires: false })
    const result = await runForkTransaction(fake.deps, req())
    expect(result.phase).toBe('failed')
    expect(fake.fork).toHaveBeenCalledTimes(1)
  })

  it('retries the prompt exactly once with the same request id, then fails', async () => {
    const fake = makeDeps({ outcomes: [fail('boom'), fail('boom again')] })
    const result = await runForkTransaction(fake.deps, req())
    expect(result).toEqual({
      childId: 'child', phase: 'failed', error: 'boom again', retriedPrompt: true,
    })
    expect(fake.fork).toHaveBeenCalledTimes(1)
    // Reusing the id is what lets the Host dedupe a re-delivered prompt.
    expect(fake.sent.map(s => s.requestId)).toEqual(['req-1', 'req-1'])
  })

  it('recovers when the retried prompt succeeds', async () => {
    const fake = makeDeps({ outcomes: [fail('boom'), ok] })
    const result = await runForkTransaction(fake.deps, req())
    expect(result).toEqual({ childId: 'child', phase: 'done', retriedPrompt: true })
    expect(fake.sent.map(s => s.requestId)).toEqual(['req-1', 'req-1'])
  })

  it('treats a thrown send as a prompt failure and retries it', async () => {
    const fake = makeDeps({ usingThrows: 'retain failed' })
    const result = await runForkTransaction(fake.deps, req())
    expect(result.phase).toBe('failed')
    expect(result.retriedPrompt).toBe(true)
    expect(fake.fork).toHaveBeenCalledTimes(1)
  })

  it('creates an empty branch without prompting when launch is later', async () => {
    const fake = makeDeps()
    const result = await runForkTransaction(fake.deps, req({ launch: 'later' }))
    expect(result).toEqual({ childId: 'child', phase: 'done', retriedPrompt: false })
    expect(fake.sent).toHaveLength(0)
  })

  it('rejects launch "now" without an instruction before touching the host', async () => {
    const fake = makeDeps()
    const blank = await runForkTransaction(fake.deps, req({ instruction: '   ' }))
    expect(blank.phase).toBe('failed')
    expect(fake.fork).not.toHaveBeenCalled()

    const missing = await runForkTransaction(fake.deps, req({ instruction: undefined }))
    expect(missing.phase).toBe('failed')
    expect(fake.fork).not.toHaveBeenCalled()
  })

  it('rejects an invalid cut seq before touching the host', async () => {
    for (const atSeq of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      const fake = makeDeps()
      const result = await runForkTransaction(fake.deps, req({ atSeq }))
      expect(result.phase).toBe('failed')
      expect(fake.fork).not.toHaveBeenCalled()
    }
  })

  it('mints a request id when the caller supplies none', async () => {
    const fake = makeDeps()
    await runForkTransaction(fake.deps, req({ requestId: undefined }))
    expect(fake.sent).toEqual([{ text: 'go', requestId: 'generated-id' }])
  })

  it('trims the instruction it sends', async () => {
    const fake = makeDeps()
    await runForkTransaction(fake.deps, req({ instruction: '  padded  ' }))
    expect(fake.sent[0]?.text).toBe('padded')
  })
})

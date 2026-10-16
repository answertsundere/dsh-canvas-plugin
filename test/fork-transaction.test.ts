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
  readonly scanned?: string
  readonly outcomes?: readonly PromptOutcome[]
  readonly usingThrows?: string
}

const makeDeps = (options: FakeOptions = {}) => {
  const sent: { text: string; requestId: string }[] = []
  let call = 0
  const fork = vi.fn(async (req: { onCreated?: (id: string) => void }) => {
    if (options.onCreatedFires !== false) req.onCreated?.('child')
    if (options.forkRejects !== undefined) throw new Error(options.forkRejects)
    if (options.forkReturnsUndefined === true) return undefined as unknown as string
    return 'child'
  })
  const findChildByScan = vi.fn(async () => options.scanned)
  const deps: ForkDeps = {
    fork,
    findChildByScan,
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
  return { deps, fork, findChildByScan, sent }
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
    // therefore proves the child exists, so no scan and no re-fork.
    const fake = makeDeps({ forkRejects: 'rename failed' })
    const result = await runForkTransaction(fake.deps, req())
    expect(result).toEqual({ childId: 'child', phase: 'done', retriedPrompt: false })
    expect(fake.fork).toHaveBeenCalledTimes(1)
    expect(fake.findChildByScan).not.toHaveBeenCalled()
    expect(fake.sent).toHaveLength(1)
  })

  it('recovers a lost fork receipt by scanning, and still forks exactly once', async () => {
    const fake = makeDeps({ forkRejects: 'ECONNRESET', onCreatedFires: false, scanned: 'recovered' })
    const result = await runForkTransaction(fake.deps, req())
    expect(result).toEqual({ childId: 'recovered', phase: 'done', retriedPrompt: false })
    expect(fake.fork).toHaveBeenCalledTimes(1)
    expect(fake.findChildByScan).toHaveBeenCalledWith('src')
    expect(fake.sent).toEqual([{ text: 'go', requestId: 'req-1' }])
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

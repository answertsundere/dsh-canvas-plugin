import { describe, expect, it } from 'vitest'
import { compareBranches } from '../src/client/compare/diff.ts'
import type { BranchSegment, BranchTurn } from '../src/shared/contracts.ts'

const turn = (index: number, extra: Partial<BranchTurn> = {}): BranchTurn =>
  ({ index, firstSeq: index * 10, lastSeq: index * 10 + 9, tools: [], synthetic: false, ...extra })

const segment = (sessionId: string, turns: readonly BranchTurn[], inheritedCount = 0): BranchSegment =>
  ({ sessionId, inheritedCount, turns })

describe('compareBranches', () => {
  it('aligns turns positionally and marks a missing side undefined', () => {
    const result = compareBranches(
      segment('a', [turn(0, { userMessage: 'one' })]),
      segment('b', [turn(0, { userMessage: 'one' }), turn(1, { userMessage: 'two' })]),
    )
    expect(result.turnDiffs).toHaveLength(2)
    expect(result.turnDiffs[0]).toEqual({ left: expect.anything(), right: expect.anything(), equal: true })
    expect(result.turnDiffs[1]?.left).toBeUndefined()
    expect(result.turnDiffs[1]?.right).toBeDefined()
    expect(result.turnDiffs[1]?.equal).toBe(false)
  })

  it('treats turns as equal only when the prompt and the tool-name sequence match', () => {
    const same = compareBranches(
      segment('a', [turn(0, { userMessage: 'ask', tools: [{ name: 'read', status: 'ok' }] })]),
      segment('b', [turn(0, { userMessage: 'ask', tools: [{ name: 'read', status: 'error' }] })]),
    )
    // Tool *outcome* differs but the call sequence does not: still aligned.
    expect(same.turnDiffs[0]?.equal).toBe(true)

    const differentTools = compareBranches(
      segment('a', [turn(0, { userMessage: 'ask', tools: [{ name: 'read', status: 'ok' }] })]),
      segment('b', [turn(0, { userMessage: 'ask', tools: [{ name: 'write', status: 'ok' }] })]),
    )
    expect(differentTools.turnDiffs[0]?.equal).toBe(false)

    const differentPrompt = compareBranches(
      segment('a', [turn(0, { userMessage: 'ask' })]),
      segment('b', [turn(0, { userMessage: 'other' })]),
    )
    expect(differentPrompt.turnDiffs[0]?.equal).toBe(false)
  })

  it('excludes synthetic fork-closer turns from the diff and the tool count', () => {
    // The synthetic closer is fork plumbing, identical by construction; showing
    // it as a diff row would be noise in every single comparison.
    const result = compareBranches(
      segment('a', [
        turn(0, { synthetic: true, endedAs: 'forked', tools: [{ name: 'ghost', status: 'ok' }] }),
        turn(1, { userMessage: 'ask', tools: [{ name: 'read', status: 'ok' }] }),
      ]),
      segment('b', [
        turn(0, { synthetic: true, endedAs: 'forked' }),
        turn(1, { userMessage: 'ask', tools: [{ name: 'read', status: 'ok' }, { name: 'grep', status: 'ok' }] }),
      ]),
    )
    expect(result.turnDiffs).toHaveLength(1)
    expect(result.toolCountDiff).toBe(1)
  })

  it('reports the tool-count difference as right minus left', () => {
    const result = compareBranches(
      segment('a', [turn(0, { tools: [{ name: 'a', status: 'ok' }, { name: 'b', status: 'ok' }] })]),
      segment('b', [turn(0, { tools: [{ name: 'a', status: 'ok' }] })]),
    )
    expect(result.toolCountDiff).toBe(-1)
  })

  it('reports bothFailed only when each side ended in error', () => {
    const failed = compareBranches(
      segment('a', [turn(0, { endedAs: 'error' })]),
      segment('b', [turn(0, { endedAs: 'error' })]),
    )
    expect(failed.bothFailed).toBe(true)

    const mixed = compareBranches(
      segment('a', [turn(0, { endedAs: 'error' })]),
      segment('b', [turn(0, { endedAs: 'completed' })]),
    )
    expect(mixed.bothFailed).toBe(false)

    const aborted = compareBranches(
      segment('a', [turn(0, { endedAs: 'aborted' })]),
      segment('b', [turn(0, { endedAs: 'aborted' })]),
    )
    expect(aborted.bothFailed).toBe(false)
  })

  it('picks the conclusion of the LAST turn per side, not the first', () => {
    // a's first turn holds a much longer summary than its last, so a naive
    // "longest summary wins" or "first turn wins" reading would report 'a'.
    const result = compareBranches(
      segment('a', [
        turn(0, { assistantSummary: 'a very long early conclusion indeed' }),
        turn(1, { assistantSummary: 'a-last' }),
      ]),
      segment('b', [turn(0, { assistantSummary: 'b-mid-length-conclusion' })]),
    )
    expect(result.lastConclusion).toEqual({ side: 'b', text: 'b-mid-length-conclusion' })
  })

  it('ignores a synthetic turn when picking the conclusion', () => {
    // The synthetic closer carries a long summary that would win if fork
    // plumbing were treated as branch work.
    const result = compareBranches(
      segment('a', [
        turn(0, { assistantSummary: 'a-short' }),
        turn(1, { synthetic: true, assistantSummary: 'a synthetic closer that is very long indeed' }),
      ]),
      segment('b', [turn(0, { assistantSummary: 'b-medium-conclusion' })]),
    )
    expect(result.lastConclusion).toEqual({ side: 'b', text: 'b-medium-conclusion' })
  })

  it('reports both when the two conclusions are identical', () => {
    const result = compareBranches(
      segment('a', [turn(0, { assistantSummary: 'same' })]),
      segment('b', [turn(0, { assistantSummary: 'same' })]),
    )
    expect(result.lastConclusion).toEqual({ side: 'both', text: 'same' })
  })

  it('breaks a conclusion tie towards the longer text, then towards a', () => {
    const longer = compareBranches(
      segment('a', [turn(0, { assistantSummary: 'short' })]),
      segment('b', [turn(0, { assistantSummary: 'much longer text' })]),
    )
    expect(longer.lastConclusion.side).toBe('b')

    const tie = compareBranches(
      segment('a', [turn(0, { assistantSummary: 'aaaa' })]),
      segment('b', [turn(0, { assistantSummary: 'bbbb' })]),
    )
    expect(tie.lastConclusion.side).toBe('a')
  })

  it('reports none when neither side concluded anything', () => {
    expect(compareBranches(segment('a', []), segment('b', []))).toMatchObject({
      turnDiffs: [], toolCountDiff: 0, bothFailed: false,
      lastConclusion: { side: 'none', text: '' },
    })
  })

  it('carries both segments through untouched', () => {
    const a = segment('a', [turn(0)])
    const b = segment('b', [turn(0)])
    const result = compareBranches(a, b)
    expect(result.a).toBe(a)
    expect(result.b).toBe(b)
  })
})

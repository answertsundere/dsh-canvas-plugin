import { describe, expect, it } from 'vitest'
import {
  inheritedPrefixLength,
  segmentFromEvents,
  type SessionEventLike,
} from '../src/client/compare/branch-segment.ts'

const ev = (seq: number, type: string, data?: unknown): SessionEventLike => ({ seq, type, data })

const userMessage = (text: string, kind = 'user') =>
  ({ role: 'user', content: [{ type: 'text', text }], source: { kind } })

const assistantMessage = (text: string) =>
  ({ turn: 1, step: 1, message: { role: 'assistant', content: [{ type: 'text', text }], source: { kind: 'model' } }, stream: [] })

describe('inheritedPrefixLength', () => {
  it('reads the inherited prefix off the seed marker', () => {
    // The marker sits AT the cut, and inheritedEventCount is boundary + 1.
    expect(inheritedPrefixLength([
      ev(0, 'turn/start', { turn: 1 }),
      ev(4, 'session/end-seed', { inherited: true }),
      ev(5, 'turn/end', { turn: 1, reason: { kind: 'forked' } }),
    ])).toBe(5)
  })

  it('is zero for a session that was never forked', () => {
    expect(inheritedPrefixLength([ev(0, 'turn/start', { turn: 1 })])).toBe(0)
    expect(inheritedPrefixLength([])).toBe(0)
  })

  it('uses the last tagged marker, which is the current cut', () => {
    expect(inheritedPrefixLength([
      ev(2, 'session/end-seed', { inherited: true }),
      ev(9, 'session/end-seed', { inherited: true }),
    ])).toBe(10)
  })

  it('ignores untagged markers, which are ordinary restore boundaries', () => {
    expect(inheritedPrefixLength([ev(7, 'session/end-seed', {})])).toBe(0)
    expect(inheritedPrefixLength([ev(7, 'session/end-seed', undefined)])).toBe(0)
  })
})

describe('segmentFromEvents', () => {
  it('keeps only events at or after the inherited count', () => {
    // The child inherits seqs [0, inheritedCount) — inheritedEventCount is
    // SessionLogOffset(boundary + 1), so the first branch-owned event sits at
    // exactly `inheritedCount`.
    const segment = segmentFromEvents('child', 10, [
      ev(9, 'turn/start', { turn: 1 }),
      ev(10, 'turn/start', { turn: 2 }),
      ev(11, 'user/message', userMessage('mine')),
    ])
    expect(segment.inheritedCount).toBe(10)
    expect(segment.sessionId).toBe('child')
    expect(segment.turns).toHaveLength(1)
    expect(segment.turns[0]?.userMessage).toBe('mine')
  })

  it('groups events into turns and records how each ended', () => {
    const segment = segmentFromEvents('s', 0, [
      ev(0, 'turn/start', { turn: 1 }),
      ev(1, 'user/message', userMessage('first')),
      ev(2, 'turn/end', { turn: 1, reason: { kind: 'completed' } }),
      ev(3, 'turn/start', { turn: 2 }),
      ev(4, 'user/message', userMessage('second')),
      ev(5, 'turn/end', { turn: 2, reason: { kind: 'error', error: { message: 'x', code: 'UNKNOWN' } } }),
    ])
    expect(segment.turns.map(t => t.index)).toEqual([0, 1])
    expect(segment.turns.map(t => t.userMessage)).toEqual(['first', 'second'])
    expect(segment.turns.map(t => t.endedAs)).toEqual(['completed', 'error'])
    expect(segment.turns.every(t => !t.synthetic)).toBe(true)
  })

  it('ignores injected context and keeps only genuine human prompts', () => {
    // A user/message event also carries agent.inject() context (file-change
    // notices, AGENTS.md, skill content, cron); source.kind separates them, and
    // DSH's own list projection uses exactly this test.
    const segment = segmentFromEvents('s', 0, [
      ev(0, 'turn/start', { turn: 1 }),
      ev(1, 'user/message', userMessage('AGENTS.md loaded', 'injected')),
      ev(2, 'user/message', userMessage('do the thing')),
      ev(3, 'turn/end', { turn: 1, reason: { kind: 'completed' } }),
    ])
    expect(segment.turns[0]?.userMessage).toBe('do the thing')
  })

  it('leaves userMessage undefined when a turn carries no human prompt', () => {
    const segment = segmentFromEvents('s', 0, [
      ev(0, 'turn/start', { turn: 1 }),
      ev(1, 'user/message', userMessage('context only', 'injected')),
      ev(2, 'turn/end', { turn: 1, reason: { kind: 'completed' } }),
    ])
    expect(segment.turns[0]?.userMessage).toBeUndefined()
  })

  it('summarizes the assistant text and bounds it to 200 characters', () => {
    const segment = segmentFromEvents('s', 0, [
      ev(0, 'turn/start', { turn: 1 }),
      ev(1, 'assistant/message', assistantMessage('hello ')),
      ev(2, 'assistant/message', assistantMessage('world')),
      ev(3, 'turn/end', { turn: 1, reason: { kind: 'completed' } }),
    ])
    expect(segment.turns[0]?.assistantSummary).toBe('hello world')

    const long = segmentFromEvents('s', 0, [
      ev(0, 'turn/start', { turn: 1 }),
      ev(1, 'assistant/message', assistantMessage('x'.repeat(500))),
      ev(2, 'turn/end', { turn: 1, reason: { kind: 'completed' } }),
    ])
    expect(long.turns[0]?.assistantSummary).toHaveLength(200)
    expect(long.turns[0]?.assistantSummary?.endsWith('…')).toBe(true)
  })

  it('collects tool calls with their outcome, including pending and failed ones', () => {
    // ToolResultMessage pairs with its call through the required toolCallId.
    const segment = segmentFromEvents('s', 0, [
      ev(0, 'turn/start', { turn: 1 }),
      ev(1, 'tool/call', { turn: 1, step: 1, callId: 'c1', name: 'read', arguments: '{}' }),
      ev(2, 'tool/result', { turn: 1, step: 1, message: { role: 'tool', toolCallId: 'c1', isError: false } }),
      ev(3, 'tool/call', { turn: 1, step: 2, callId: 'c2', name: 'write', arguments: '{}' }),
      ev(4, 'tool/result', {
        turn: 1, step: 2,
        message: { role: 'tool', toolCallId: 'c2', isError: true },
        error: { name: 'E', code: 'E' },
      }),
      ev(5, 'tool/call', { turn: 1, step: 3, callId: 'c3', name: 'bash', arguments: '{}' }),
      ev(6, 'turn/end', { turn: 1, reason: { kind: 'completed' } }),
    ])
    expect(segment.turns[0]?.tools).toEqual([
      { name: 'read', status: 'ok' },
      { name: 'write', status: 'error' },
      { name: 'bash', status: 'pending' },
    ])
  })

  it('ignores a tool result whose call sits in the inherited prefix', () => {
    // A cut between a tool/call and its tool/result leaves the child a result
    // with no call of its own; the call is inherited history, not branch work,
    // and a nameless tool row would be worse than none.
    const segment = segmentFromEvents('child', 10, [
      ev(10, 'turn/start', { turn: 1 }),
      ev(11, 'tool/result', { turn: 1, step: 1, message: { role: 'tool', toolCallId: 'inherited', isError: false } }),
      ev(12, 'turn/end', { turn: 1, reason: { kind: 'completed' } }),
    ])
    expect(segment.turns[0]?.tools).toEqual([])
  })

  it('flags the fork-seed closer turn as synthetic', () => {
    // A cut inside an open turn is balanced Host-side: the child gets a
    // turn/end{kind:'forked'} with no matching turn/start in its own segment.
    const segment = segmentFromEvents('child', 0, [
      ev(0, 'turn/end', { turn: 1, reason: { kind: 'forked' } }),
      ev(1, 'turn/start', { turn: 2 }),
      ev(2, 'user/message', userMessage('real work')),
      ev(3, 'turn/end', { turn: 2, reason: { kind: 'completed' } }),
    ])
    expect(segment.turns).toHaveLength(2)
    expect(segment.turns[0]?.synthetic).toBe(true)
    expect(segment.turns[0]?.endedAs).toBe('forked')
    expect(segment.turns[1]?.synthetic).toBe(false)
  })

  it('flags a turn containing the inherited-seed marker as synthetic', () => {
    const segment = segmentFromEvents('child', 0, [
      ev(0, 'turn/start', { turn: 1 }),
      ev(1, 'session/end-seed', { inherited: true }),
      ev(2, 'turn/end', { turn: 1, reason: { kind: 'forked' } }),
    ])
    expect(segment.turns[0]?.synthetic).toBe(true)
  })

  it('orders unsorted input by seq', () => {
    const segment = segmentFromEvents('s', 0, [
      ev(3, 'turn/end', { turn: 1, reason: { kind: 'completed' } }),
      ev(1, 'user/message', userMessage('later in array')),
      ev(0, 'turn/start', { turn: 1 }),
      ev(2, 'assistant/message', assistantMessage('reply')),
    ])
    expect(segment.turns[0]?.userMessage).toBe('later in array')
    expect(segment.turns[0]?.assistantSummary).toBe('reply')
    expect(segment.turns[0]?.endedAs).toBe('completed')
  })

  it('records the seq range each turn owns, so the UI can name a real cut point', () => {
    const segment = segmentFromEvents('s', 10, [
      ev(10, 'turn/start', { turn: 1 }),
      ev(11, 'user/message', userMessage('first')),
      ev(14, 'turn/end', { turn: 1, reason: { kind: 'completed' } }),
      ev(20, 'turn/start', { turn: 2 }),
      ev(23, 'user/message', userMessage('second')),
      ev(24, 'turn/end', { turn: 2, reason: { kind: 'completed' } }),
    ])
    expect(segment.turns[0]).toMatchObject({ firstSeq: 10, lastSeq: 14 })
    expect(segment.turns[1]).toMatchObject({ firstSeq: 20, lastSeq: 24 })
  })

  it('starts a turn at its own turn/start, not at the previous turn end', () => {
    const segment = segmentFromEvents('s', 0, [
      ev(0, 'turn/start', { turn: 1 }),
      ev(1, 'turn/end', { turn: 1, reason: { kind: 'completed' } }),
      ev(2, 'turn/start', { turn: 2 }),
      ev(3, 'turn/end', { turn: 2, reason: { kind: 'completed' } }),
    ])
    expect(segment.turns.map(t => [t.firstSeq, t.lastSeq])).toEqual([[0, 1], [2, 3]])
  })

  it('returns no turns for an empty or fully inherited window', () => {
    expect(segmentFromEvents('s', 0, []).turns).toEqual([])
    expect(segmentFromEvents('s', 50, [ev(1, 'turn/start', { turn: 1 })]).turns).toEqual([])
  })

  it('tolerates malformed event data without throwing', () => {
    const segment = segmentFromEvents('s', 0, [
      ev(0, 'turn/start', undefined),
      ev(1, 'user/message', undefined),
      ev(2, 'assistant/message', { message: null }),
      ev(3, 'tool/call', { name: 42 }),
      ev(4, 'tool/result', undefined),
      ev(5, 'turn/end', undefined),
    ])
    expect(segment.turns).toHaveLength(1)
    expect(segment.turns[0]?.userMessage).toBeUndefined()
    expect(segment.turns[0]?.endedAs).toBeUndefined()
  })
})

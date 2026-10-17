import { describe, expect, it } from 'vitest'
import { liveTailFromEntries, tailSnippet, type LiveEntryLike } from '../src/client/live/live-tail.ts'

/**
 * Fixtures mirror the window the host hands back through
 * `binding.eventSource.getSnapshot().entries`: durable rows under `type:'event'`
 * and client-only stream rows under `type:'transient'`
 * (`assistant/live-chunk`, contract/events.ts).
 */

const transient = (
  seq: number,
  attemptId: string,
  turn: number,
  step: number,
  chunk: unknown,
): LiveEntryLike => ({
  type: 'transient',
  event: { type: 'assistant/live-chunk', seq, data: { attemptId, turn, step, chunk } },
})

const durable = (seq: number, type: string, data?: unknown): LiveEntryLike => ({
  type: 'event',
  event: { type, seq, ...(data === undefined ? {} : { data }) },
})

const start = (index: number, blockType: string) => ({ type: 'block-start', index, blockType })
const textDelta = (index: number, text: string) => ({ type: 'text-delta', index, text })
const reasoningDelta = (index: number, text: string) => ({ type: 'reasoning-delta', index, text })
const toolDelta = (index: number, id: string, argumentsDelta: string, name?: string) => ({
  type: 'tool-call-delta', index, id, argumentsDelta, ...(name === undefined ? {} : { name }),
})

describe('liveTailFromEntries', () => {
  it('accumulates reasoning and text of one attempt in emission order', () => {
    const tail = liveTailFromEntries([
      transient(10, 'a1', 0, 1, start(0, 'reasoning')),
      transient(11, 'a1', 0, 1, reasoningDelta(0, '先看')),
      transient(12, 'a1', 0, 1, reasoningDelta(0, '需求。')),
      transient(13, 'a1', 0, 1, start(1, 'text')),
      transient(14, 'a1', 0, 1, textDelta(1, '好的')),
      transient(15, 'a1', 0, 1, textDelta(1, '，我来')),
    ])
    expect(tail).not.toBeNull()
    expect(tail?.reasoning).toBe('先看需求。')
    expect(tail?.text).toBe('好的，我来')
    expect(tail?.turn).toBe(0)
    expect(tail?.step).toBe(1)
    expect(tail?.seq).toBe(15)
  })

  it('accumulates a tool call and reports the tool phase while it is the last block', () => {
    const tail = liveTailFromEntries([
      transient(4, 'a1', 0, 1, start(0, 'tool-call')),
      transient(5, 'a1', 0, 1, toolDelta(0, 'c1', '{"pa', 'read')),
      transient(6, 'a1', 0, 1, toolDelta(0, 'c1', 'th":"x"}')),
    ])
    expect(tail?.tool).toEqual({ name: 'read', arguments: '{"path":"x"}' })
    expect(tail?.phase).toBe('tool')
    expect(tail?.text).toBe('')
    expect(tail?.reasoning).toBe('')
  })

  it('keeps the first non-empty tool name when later deltas omit it', () => {
    const tail = liveTailFromEntries([
      transient(1, 'a1', 0, 1, toolDelta(0, 'c1', '{"a"', 'grep')),
      transient(2, 'a1', 0, 1, toolDelta(0, 'c1', ':1}')),
    ])
    expect(tail?.tool?.name).toBe('grep')
  })

  it('falls back to the thinking phase once a text block starts after a tool call', () => {
    const tail = liveTailFromEntries([
      transient(1, 'a1', 0, 1, start(0, 'tool-call')),
      transient(2, 'a1', 0, 1, toolDelta(0, 'c1', '{}', 'read')),
      transient(3, 'a1', 0, 1, start(1, 'text')),
      transient(4, 'a1', 0, 1, textDelta(1, '结果如下')),
    ])
    expect(tail?.phase).toBe('thinking')
    expect(tail?.tool?.name).toBe('read')
  })

  it('picks the attempt with the highest seq when a retry streams alongside', () => {
    const tail = liveTailFromEntries([
      transient(5, 'old', 0, 1, start(0, 'text')),
      transient(6, 'old', 0, 1, textDelta(0, '废弃的')),
      transient(20, 'new', 0, 1, start(0, 'text')),
      transient(21, 'new', 0, 1, textDelta(0, '重试的')),
    ])
    expect(tail?.attemptId).toBe('new')
    expect(tail?.text).toBe('重试的')
  })

  it('a block-start re-initializes the block at its index', () => {
    const tail = liveTailFromEntries([
      transient(1, 'a1', 0, 1, textDelta(0, '残留')),
      transient(2, 'a1', 0, 1, start(0, 'text')),
      transient(3, 'a1', 0, 1, textDelta(0, '新的')),
    ])
    expect(tail?.text).toBe('新的')
  })

  it('returns null when no transient rows exist', () => {
    expect(liveTailFromEntries([
      durable(1, 'user/message'),
      durable(2, 'assistant/message', { turn: 0, step: 1 }),
    ])).toBeNull()
  })

  it('returns null when a durable assistant message has already settled the attempt', () => {
    // Normally the host drops the attempt's transient rows on settle; the guard
    // keeps a stale window from rendering a message that already landed.
    const tail = liveTailFromEntries([
      transient(10, 'a1', 0, 1, start(0, 'text')),
      transient(11, 'a1', 0, 1, textDelta(0, '已落地')),
      durable(12, 'assistant/message', { turn: 0, step: 1 }),
    ])
    expect(tail).toBeNull()
  })

  it('returns null when a durable assistant attempt has settled without a message', () => {
    const tail = liveTailFromEntries([
      transient(10, 'a1', 0, 1, start(0, 'text')),
      transient(11, 'a1', 0, 1, textDelta(0, '半截')),
      durable(12, 'assistant/attempt', { turn: 0, step: 1, stream: [] }),
    ])
    expect(tail).toBeNull()
  })

  it('still reports a live attempt of a later step after an earlier step settled', () => {
    const tail = liveTailFromEntries([
      durable(5, 'assistant/message', { turn: 0, step: 1 }),
      transient(10, 'a1', 0, 2, start(0, 'reasoning')),
      transient(11, 'a1', 0, 2, reasoningDelta(0, '第二步')),
    ])
    expect(tail?.step).toBe(2)
    expect(tail?.reasoning).toBe('第二步')
  })

  it('never throws on malformed rows and keeps the readable ones', () => {
    const tail = liveTailFromEntries([
      { type: 'transient', event: { type: 'assistant/live-chunk', seq: 1 } },
      { type: 'transient', event: { type: 'assistant/live-chunk', seq: 2, data: 'nope' } },
      transient(3, 'a1', 0, 1, 'not-a-chunk'),
      transient(4, 'a1', 0, 1, { type: 'text-delta' }),
      transient(5, 'a1', 0, 1, start(0, 'text')),
      transient(6, 'a1', 0, 1, textDelta(0, '好的')),
    ])
    expect(tail?.text).toBe('好的')
  })

  it('returns null for an empty window', () => {
    expect(liveTailFromEntries([])).toBeNull()
  })
})

describe('tailSnippet', () => {
  it('prefers the answer text, then reasoning, showing the most recent characters', () => {
    const tail = {
      attemptId: 'a1', turn: 0, step: 1, seq: 9, phase: 'thinking' as const,
      reasoning: '很长很长的推理过程', text: '0123456789',
    }
    expect(tailSnippet(tail, 6)).toEqual({ label: '输出', text: '456789' })
    expect(tailSnippet({ ...tail, text: '' }, 4)).toEqual({ label: '推理', text: '推理过程' })
  })

  it('reports the tool being emitted while a call streams', () => {
    const tail = {
      attemptId: 'a1', turn: 0, step: 1, seq: 9, phase: 'tool' as const,
      reasoning: '', text: '', tool: { name: 'read', arguments: '{}' },
    }
    expect(tailSnippet(tail, 40)).toEqual({ label: '工具', text: 'read' })
  })

  it('returns null when nothing has streamed yet', () => {
    const tail = {
      attemptId: 'a1', turn: 0, step: 1, seq: 9, phase: 'thinking' as const,
      reasoning: '', text: '',
    }
    expect(tailSnippet(tail, 40)).toBeNull()
  })
})

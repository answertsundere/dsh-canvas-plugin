/**
 * Live tail: one session's in-flight assistant output, as plain data.
 *
 * DSH streams an attempt as client-only `assistant/live-chunk` rows that sit
 * between durable seqs (`@deepseek-ai/dsh-api-session-controller/client`
 * contract/events.ts), and settles them atomically with a durable
 * `assistant/message` or `assistant/attempt` (the same pair the contract calls
 * `SessionAssistantSettlementEntry`). This module turns that stream into what
 * the canvas shows: the current attempt's reasoning text, answer text, and the
 * tool call being emitted.
 *
 * Everything here is defensive on purpose: window rows cross a transport
 * boundary, so malformed rows are skipped rather than thrown on — a broken row
 * must cost a frame, never the tab.
 */

/** Minimal shape of one window row; the real rows are `SessionEventLikeEntry`. */
export interface LiveEntryLike {
  readonly type: string
  readonly event: {
    readonly type: string
    readonly seq: number
    readonly data?: unknown
  }
}

/** What the canvas renders of an in-flight attempt. */
export interface LiveTail {
  readonly attemptId: string
  readonly turn: number
  readonly step: number
  /** Concatenated reasoning blocks, in emission order. */
  readonly reasoning: string
  /** Concatenated answer-text blocks, in emission order. */
  readonly text: string
  /** The most recent tool call being emitted, when one is in flight. */
  readonly tool?: { readonly name: string; readonly arguments: string }
  /**
   * Kind of the last block emitted — `tool` while a call streams, `thinking`
   * otherwise. Drives the node's status hint; the canvas never has to guess
   * from a timestamp.
   */
  readonly phase: 'thinking' | 'tool'
  /** Highest transient seq included; lets callers compare staleness. */
  readonly seq: number
}

type Block =
  | { readonly kind: 'text'; text: string }
  | { readonly kind: 'reasoning'; text: string }
  | { readonly kind: 'tool'; name: string; args: string }

interface Attempt {
  readonly attemptId: string
  turn: number
  step: number
  readonly blocks: Map<number, Block>
  /** Block indexes in first-emission order. */
  readonly order: number[]
  lastSeq: number
}

const SETTLERS = new Set(['assistant/message', 'assistant/attempt'])

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null ? value as Record<string, unknown> : null

const asNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null

const asString = (value: unknown): string | null =>
  typeof value === 'string' ? value : null

/**
 * The live tail of the window's most recent attempt, or null when nothing is
 * streaming (or the latest attempt already settled).
 */
export function liveTailFromEntries(entries: readonly LiveEntryLike[]): LiveTail | null {
  /** Settlement seqs by `turn:step`, from the durable rows. */
  const settledAt = new Map<string, number>()
  /** Live attempts by attemptId. */
  const attempts = new Map<string, Attempt>()

  for (const entry of entries) {
    if (entry === null || typeof entry !== 'object') continue
    const event = (entry as LiveEntryLike).event
    if (event === null || typeof event !== 'object') continue
    const seq = asNumber(event.seq)
    if (seq === null) continue

    if (entry.type === 'event') {
      if (SETTLERS.has(event.type)) {
        const data = asRecord(event.data)
        const turn = asNumber(data?.['turn'])
        const step = asNumber(data?.['step'])
        if (turn !== null && step !== null) {
          const key = `${turn}:${step}`
          const seen = settledAt.get(key)
          if (seen === undefined || seq > seen) settledAt.set(key, seq)
        }
      }
      continue
    }
    if (entry.type !== 'transient' || event.type !== 'assistant/live-chunk') continue

    const data = asRecord(event.data)
    const attemptId = asString(data?.['attemptId'])
    const turn = asNumber(data?.['turn'])
    const step = asNumber(data?.['step'])
    const chunk = asRecord(data?.['chunk'])
    if (attemptId === null || turn === null || step === null || chunk === null) continue

    let attempt = attempts.get(attemptId)
    if (attempt === undefined) {
      attempt = { attemptId, turn, step, blocks: new Map(), order: [], lastSeq: seq }
      attempts.set(attemptId, attempt)
    }
    if (seq > attempt.lastSeq) attempt.lastSeq = seq

    const index = asNumber(chunk['index'])
    const apply = (block: Block, at: number): void => {
      if (!attempt.blocks.has(at)) attempt.order.push(at)
      attempt.blocks.set(at, block)
    }
    switch (chunk['type']) {
      case 'block-start': {
        if (index === null) break
        const kind = asString(chunk['blockType'])
        if (kind === 'text') apply({ kind: 'text', text: '' }, index)
        else if (kind === 'reasoning') apply({ kind: 'reasoning', text: '' }, index)
        else if (kind === 'tool-call') apply({ kind: 'tool', name: '', args: '' }, index)
        // Other block types (image, …) carry nothing this panel shows.
        break
      }
      case 'text-delta': {
        if (index === null) break
        const text = asString(chunk['text'])
        if (text === null) break
        const previous = attempt.blocks.get(index)
        apply({ kind: 'text', text: (previous?.kind === 'text' ? previous.text : '') + text }, index)
        break
      }
      case 'reasoning-delta': {
        if (index === null) break
        const text = asString(chunk['text'])
        if (text === null) break
        const previous = attempt.blocks.get(index)
        apply(
          { kind: 'reasoning', text: (previous?.kind === 'reasoning' ? previous.text : '') + text },
          index,
        )
        break
      }
      case 'tool-call-delta': {
        if (index === null) break
        const previous = attempt.blocks.get(index)
        const base = previous?.kind === 'tool' ? previous : { kind: 'tool' as const, name: '', args: '' }
        apply({
          kind: 'tool',
          // The first delta normally carries the name; later ones may omit it.
          name: base.name !== '' ? base.name : asString(chunk['name']) ?? '',
          args: base.args + (asString(chunk['argumentsDelta']) ?? ''),
        }, index)
        break
      }
      // block-end and any future chunk kind are presentation-irrelevant here.
      default:
        break
    }
  }

  let latest: Attempt | undefined
  for (const attempt of attempts.values()) {
    if (latest === undefined || attempt.lastSeq > latest.lastSeq) latest = attempt
  }
  if (latest === undefined) return null
  const current = latest

  // A settled attempt's transient rows normally leave the window atomically;
  // this guard keeps a stale window from rendering output that already landed.
  const settled = settledAt.get(`${current.turn}:${current.step}`)
  if (settled !== undefined && settled > current.lastSeq) return null

  const ordered = current.order
    .map(index => current.blocks.get(index))
    .filter((block): block is Block => block !== undefined)
  const reasoning = ordered
    .filter((block): block is Extract<Block, { kind: 'reasoning' }> => block.kind === 'reasoning')
    .map(block => block.text)
    .join('\n')
  const text = ordered
    .filter((block): block is Extract<Block, { kind: 'text' }> => block.kind === 'text')
    .map(block => block.text)
    .join('\n')
  const lastBlock = ordered[ordered.length - 1]
  const toolBlocks = ordered.filter((block): block is Extract<Block, { kind: 'tool' }> => block.kind === 'tool')
  const tool = toolBlocks[toolBlocks.length - 1]

  return {
    attemptId: current.attemptId,
    turn: current.turn,
    step: current.step,
    reasoning,
    text,
    ...(tool === undefined ? {} : { tool: { name: tool.name, arguments: tool.args } }),
    phase: lastBlock?.kind === 'tool' ? 'tool' : 'thinking',
    seq: current.lastSeq,
  }
}

/** One-line preview of an in-flight attempt for a node card. */
export interface TailSnippet {
  readonly label: '输出' | '推理' | '工具'
  readonly text: string
}

/**
 * The most recent output as a bounded one-liner: the answer text wins, then
 * the reasoning. Both are shown tail-anchored — a streaming line is read from
 * its end, so the newest characters are the ones worth the width.
 */
export function tailSnippet(tail: LiveTail, limit: number): TailSnippet | null {
  if (tail.phase === 'tool' && tail.tool !== undefined) {
    return { label: '工具', text: tail.tool.name !== '' ? tail.tool.name : '…' }
  }
  const source = tail.text !== '' ? tail.text : tail.reasoning
  if (source === '') return null
  const collapsed = source.replace(/\s+/g, ' ').trim()
  if (collapsed === '') return null
  return {
    label: tail.text !== '' ? '输出' : '推理',
    text: collapsed.length <= limit ? collapsed : collapsed.slice(-limit),
  }
}

import { describe, expect, it, vi } from 'vitest'
import {
  CANVAS_RETAIN_SOURCE,
  openLiveWindow,
  openTimeline,
  type OpenStateLike,
} from '../src/client/adapters/event-stream-adapter.ts'

interface FakeOptions {
  readonly openState?: OpenStateLike
  readonly readyFails?: boolean
  readonly bindingThrows?: boolean
  readonly windowChanges?: boolean
}

const makeFake = (options: FakeOptions = {}) => {
  let window: unknown = { rows: [] }
  const unsubscribe = vi.fn()
  const targetSource = {
    getSnapshot: () => window,
    subscribe: vi.fn(() => unsubscribe),
  }
  const face = {
    getSnapshot: () => ({ openState: options.openState ?? 'open' }),
    subscribe: vi.fn(() => () => {}),
    loadOlder: vi.fn(async () => {
      if (options.windowChanges !== false) window = { rows: ['older'] }
    }),
  }
  const binding = { sessionId: 's1', session: face }
  const release = vi.fn()
  const sessions = {
    retain: vi.fn(() => ({
      sessionId: 's1',
      binding,
      ready: options.readyFails === true ? Promise.reject(new Error('open failed')) : Promise.resolve(binding),
      release,
    })),
  }
  const uiConversation = {
    binding: vi.fn(() => {
      if (options.bindingThrows === true) throw new Error('uiConversation.binding: inactive session "s1"')
      return { target: vi.fn(() => targetSource) }
    }),
  }
  return { sessions, uiConversation, face, targetSource, release, unsubscribe }
}

describe('openTimeline', () => {
  it('retains the session under the canvas source label before reading it', async () => {
    const fake = makeFake()
    const source = await openTimeline(fake.sessions, fake.uiConversation, 's1')
    expect(fake.sessions.retain).toHaveBeenCalledWith('s1', { source: CANVAS_RETAIN_SOURCE })
    expect(fake.uiConversation.binding).toHaveBeenCalledWith(fake.sessions.retain.mock.results[0]?.value.binding)
    expect(source.sessionId).toBe('s1')
  })

  it('exposes the chat target snapshot and subscription', async () => {
    const fake = makeFake()
    const source = await openTimeline(fake.sessions, fake.uiConversation, 's1')
    expect(source.snapshot()).toEqual({ rows: [] })
    const listener = () => {}
    const off = source.subscribe(listener)
    expect(fake.targetSource.subscribe).toHaveBeenCalledWith(listener)
    off()
    expect(fake.unsubscribe).toHaveBeenCalledTimes(1)
  })

  it('reads the live open state from the retained session snapshot', async () => {
    const fake = makeFake({ openState: 'error' })
    const source = await openTimeline(fake.sessions, fake.uiConversation, 's1')
    expect(source.openState()).toBe('error')
  })

  it('reports whether loadOlder actually extended the window', async () => {
    const changed = makeFake()
    const a = await openTimeline(changed.sessions, changed.uiConversation, 's1')
    expect(await a.loadOlder()).toBe(true)
    expect(changed.face.loadOlder).toHaveBeenCalledTimes(1)

    const unchanged = makeFake({ windowChanges: false })
    const b = await openTimeline(unchanged.sessions, unchanged.uiConversation, 's1')
    expect(await b.loadOlder()).toBe(false)
  })

  it('releases the retain when the open fails, so a failed read leaks nothing', async () => {
    const fake = makeFake({ readyFails: true })
    await expect(openTimeline(fake.sessions, fake.uiConversation, 's1')).rejects.toThrow('open failed')
    expect(fake.release).toHaveBeenCalledTimes(1)
    expect(fake.uiConversation.binding).not.toHaveBeenCalled()
  })

  it('releases the retain when the conversation binding refuses the session', async () => {
    // uiConversation.binding throws for an unknown or inactive session.
    const fake = makeFake({ bindingThrows: true })
    await expect(openTimeline(fake.sessions, fake.uiConversation, 's1')).rejects.toThrow('inactive session')
    expect(fake.release).toHaveBeenCalledTimes(1)
  })

  it('releases exactly once even when callers release twice', async () => {
    const fake = makeFake()
    const source = await openTimeline(fake.sessions, fake.uiConversation, 's1')
    source.release()
    source.release()
    expect(fake.release).toHaveBeenCalledTimes(1)
  })
})

const makeLiveFake = (options: { readyFails?: boolean; snapshot?: unknown } = {}) => {
  const entries = [
    { type: 'event', event: { type: 'user/message', seq: 1 } },
    { type: 'transient', event: { type: 'assistant/live-chunk', seq: 2, data: {} } },
  ]
  let window: unknown = 'snapshot' in options ? options.snapshot : { entries, hasMore: false, revision: 1 }
  const unsubscribe = vi.fn()
  const eventSource = {
    getSnapshot: vi.fn(() => window),
    subscribe: vi.fn(() => unsubscribe),
  }
  const binding = { sessionId: 's1', eventSource }
  const release = vi.fn()
  const sessions = {
    retain: vi.fn(() => ({
      sessionId: 's1',
      ready: options.readyFails === true ? Promise.reject(new Error('open failed')) : Promise.resolve(binding),
      release,
    })),
  }
  return { sessions, eventSource, release, unsubscribe, setWindow: (next: unknown) => { window = next } }
}

describe('openLiveWindow', () => {
  it('retains the session under the canvas source label before reading the window', async () => {
    const fake = makeLiveFake()
    const source = await openLiveWindow(fake.sessions, 's1')
    expect(fake.sessions.retain).toHaveBeenCalledWith('s1', { source: CANVAS_RETAIN_SOURCE })
    expect(source.sessionId).toBe('s1')
  })

  it('exposes the window entries and delegates the subscription', async () => {
    const fake = makeLiveFake()
    const source = await openLiveWindow(fake.sessions, 's1')
    expect(source.entries()).toHaveLength(2)
    const listener = () => {}
    const off = source.subscribe(listener)
    expect(fake.eventSource.subscribe).toHaveBeenCalledWith(listener)
    off()
    expect(fake.unsubscribe).toHaveBeenCalledTimes(1)
  })

  it('reads fresh entries on every snapshot call', async () => {
    const fake = makeLiveFake()
    const source = await openLiveWindow(fake.sessions, 's1')
    expect(source.entries()).toHaveLength(2)
    fake.setWindow({ entries: [{ type: 'event', event: { type: 'user/message', seq: 9 } }] })
    expect(source.entries()).toHaveLength(1)
  })

  it('degrades a malformed window to no entries instead of throwing', async () => {
    const fake = makeLiveFake({ snapshot: null })
    const source = await openLiveWindow(fake.sessions, 's1')
    expect(source.entries()).toEqual([])
  })

  it('releases the retain when the open fails, so a failed read leaks nothing', async () => {
    const fake = makeLiveFake({ readyFails: true })
    await expect(openLiveWindow(fake.sessions, 's1')).rejects.toThrow('open failed')
    expect(fake.release).toHaveBeenCalledTimes(1)
  })

  it('releases exactly once even when callers release twice', async () => {
    const fake = makeLiveFake()
    const source = await openLiveWindow(fake.sessions, 's1')
    source.release()
    source.release()
    expect(fake.release).toHaveBeenCalledTimes(1)
  })
})

import { describe, expect, it } from 'vitest'
import { toSummaries } from '../src/client/adapters/session-adapter.ts'

/**
 * Row shape taken verbatim from the client list store
 * (`SessionListState.byId` rows, session-controller client/sessions/service.ts).
 * Note what is absent: no `createdAt`, no availability flag, no `seeded`.
 */
const row = (id: string, extra: Record<string, unknown> = {}) => ({
  id,
  displayTitle: id,
  running: false,
  retainedBy: {},
  blank: false,
  updatedAt: 1_000,
  ...extra,
})

const snapshot = (ids: string[], byId: Record<string, unknown>, extra: Record<string, unknown> = {}) =>
  ({ ids, byId, phase: 'ready', projectionsBySession: {}, ...extra })

describe('toSummaries', () => {
  it('maps the client list store shape', () => {
    const out = toSummaries(snapshot(
      ['a', 'b'],
      {
        a: row('a', { title: 'Alpha', cwd: 'C:/w', updatedAt: 5 }),
        b: row('b', { parentId: 'a', running: true, updatedAt: 9 }),
      },
    ))
    expect(out).toEqual([
      { id: 'a', parentId: undefined, title: 'Alpha', cwd: 'C:/w', createdAt: 5, running: false, available: true },
      { id: 'b', parentId: 'a', title: 'b', cwd: undefined, createdAt: 9, running: true, available: true },
    ])
  })

  it('prefers the durable title, then displayTitle, then the id', () => {
    const out = toSummaries(snapshot(['a', 'b', 'c'], {
      a: row('a', { title: 'durable', displayTitle: 'display' }),
      b: row('b', { displayTitle: 'display' }),
      c: row('c', { displayTitle: '' }),
    }))
    expect(out.map(s => s.title)).toEqual(['durable', 'display', 'c'])
  })

  it('falls back to updatedAt for the ordering key, since the client row has no createdAt', () => {
    const out = toSummaries(snapshot(['a'], { a: row('a', { updatedAt: 42 }) }))
    expect(out[0]?.createdAt).toBe(42)
  })

  it('keeps host-list order from ids and ignores rows the host list does not claim', () => {
    // `ids` alone expresses host-list membership; byId also carries retained
    // subagent fallback rows that must not appear as canvas roots.
    const out = toSummaries(snapshot(['z', 'a'], {
      z: row('z', { updatedAt: 1 }),
      a: row('a', { updatedAt: 2 }),
      orphan: row('orphan', { parentId: 'z' }),
    }))
    expect(out.map(s => s.id)).toEqual(['z', 'a'])
  })

  it('accepts the manager items form and the bare array form', () => {
    const items = { items: [row('a', { parentSessionId: 'parent', cwd: 'C:/w' })], state: 'idle' }
    expect(toSummaries(items)).toEqual([
      { id: 'a', parentId: 'parent', title: 'a', cwd: 'C:/w', createdAt: 1_000, running: false, available: true },
    ])
    expect(toSummaries([row('a'), row('b')]).map(s => s.id)).toEqual(['a', 'b'])
  })

  it('accepts parentSessionId from the host shape as well as parentId', () => {
    const out = toSummaries([row('a', { parentSessionId: 'p', parentId: 'ignored' })])
    expect(out[0]?.parentId).toBe('p')
  })

  it('never sets seeded from list data alone', () => {
    // Seeded-ness is an event-stream fact (inheritedEventCount / session/end-seed),
    // so the list adapter must not invent it.
    expect(toSummaries(snapshot(['a'], { a: row('a', { seeded: true }) }))[0]?.seeded).toBeUndefined()
  })

  it('returns an empty list for absent or malformed snapshots instead of throwing', () => {
    for (const bad of [null, undefined, 0, '', 'nope', {}, { ids: 'x' }, { ids: ['a'] }, { byId: {} }, []]) {
      expect(toSummaries(bad)).toEqual([])
    }
  })

  it('skips malformed rows without dropping the well-formed ones', () => {
    const out = toSummaries(snapshot(['ok', 'bad'], {
      ok: row('ok'),
      bad: { id: 42, running: 'yes' },
    }))
    expect(out.map(s => s.id)).toEqual(['ok'])
  })

  it('coerces a missing running flag to false', () => {
    const out = toSummaries(snapshot(['a'], { a: { id: 'a' } }))
    expect(out[0]).toEqual({
      id: 'a', parentId: undefined, title: 'a', cwd: undefined, createdAt: 0, running: false, available: true,
    })
  })
})

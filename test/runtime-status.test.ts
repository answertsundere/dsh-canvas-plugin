import { describe, expect, it } from 'vitest'
import {
  deriveStatus,
  type RuntimeHint,
  type RuntimeStatusInput,
} from '../src/client/adapters/runtime-status-adapter.ts'

const input = (over: Partial<RuntimeStatusInput> = {}): RuntimeStatusInput =>
  ({ running: false, available: true, connected: true, ...over })

describe('deriveStatus', () => {
  it('reports unknown whenever the stream is disconnected', () => {
    expect(deriveStatus(input({ running: true, connected: false }))).toBe('unknown')
    expect(deriveStatus(input({ running: false, connected: false }))).toBe('unknown')
    expect(deriveStatus(input({ running: true, connected: false, lastHint: 'tool' }))).toBe('unknown')
  })

  it('lets disconnection outrank every other signal', () => {
    expect(deriveStatus(input({ running: true, available: false, connected: false }))).toBe('unknown')
    expect(deriveStatus(input({ running: true, available: false, connected: false, lastHint: 'awaiting-approval' })))
      .toBe('unknown')
  })

  it('reports failed for an unavailable session even while it claims to run', () => {
    expect(deriveStatus(input({ running: false, available: false }))).toBe('failed')
    expect(deriveStatus(input({ running: true, available: false }))).toBe('failed')
  })

  it('uses the last hint while running', () => {
    expect(deriveStatus(input({ running: true, lastHint: 'thinking' }))).toBe('thinking')
    expect(deriveStatus(input({ running: true, lastHint: 'tool' }))).toBe('tool')
    expect(deriveStatus(input({ running: true, lastHint: 'awaiting-approval' }))).toBe('awaiting-approval')
  })

  it('infers thinking for a running session with no hint, never idle', () => {
    expect(deriveStatus(input({ running: true }))).toBe('thinking')
  })

  it('reports idle for a stopped session and treats a lingering hint as stale', () => {
    expect(deriveStatus(input())).toBe('idle')
    expect(deriveStatus(input({ lastHint: 'tool' }))).toBe('idle')
    expect(deriveStatus(input({ lastHint: 'awaiting-approval' }))).toBe('idle')
  })

  it('never derives done or queued from the session summary alone', () => {
    const kinds = new Set<ReturnType<typeof deriveStatus>>()
    for (const running of [true, false]) {
      for (const available of [true, false]) {
        for (const connected of [true, false]) {
          for (const lastHint of [undefined, 'thinking', 'tool', 'awaiting-approval'] as (RuntimeHint | undefined)[]) {
            kinds.add(deriveStatus(input({ running, available, connected, lastHint })))
          }
        }
      }
    }
    expect([...kinds].sort()).toEqual(['awaiting-approval', 'failed', 'idle', 'thinking', 'tool', 'unknown'])
  })
})

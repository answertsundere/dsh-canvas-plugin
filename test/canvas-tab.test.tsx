import { describe, expect, it, vi } from 'vitest'
import { apply, inject } from '../src/client/index.ts'
import { CanvasTab } from '../src/client/ui/CanvasTab.tsx'

describe('canvas client plugin', () => {
  it('declares the services it needs', () => {
    expect(inject).toEqual(expect.arrayContaining(['slots', 'sessions', 'uiConversation', 'locale']))
  })

  it('registers the canvas conversation.view with id canvas and order 20', () => {
    const register = vi.fn()
    const injectSlots = vi.fn((_slot: string, fn: () => void) => { fn(); return () => {} })
    const locale = { register: vi.fn(), bind: () => (key: string) => key }
    const effect = vi.fn((fn: () => unknown) => { fn() })
    const ctx = { effect, slots: { inject: injectSlots, register }, locale }
    apply(ctx as never)
    expect(injectSlots).toHaveBeenCalledWith('conversation.view', expect.any(Function))
    const [options, component] = register.mock.calls[0] as never as [{ id: string; order: number }, unknown]
    expect(options.id).toBe('canvas')
    expect(options.order).toBe(20)
    expect(component).toBe(CanvasTab)
  })
})
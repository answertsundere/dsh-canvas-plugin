import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { apply, inject } from '../src/client/index.ts'
import { CanvasTab } from '../src/client/ui/CanvasTab.tsx'
import type { CanvasModel } from '../src/client/ui/canvas-model.ts'
import { badge } from '../src/shared/status.ts'
import type { CanvasGraph, CanvasNode } from '../src/shared/contracts.ts'

afterEach(cleanup)

const node = (id: string, extra: Partial<CanvasNode> = {}): CanvasNode => ({
  id,
  parentId: null,
  externalParent: false,
  title: id,
  createdAt: 0,
  running: false,
  available: true,
  seeded: false,
  cwd: null,
  childCount: 0,
  depth: 0,
  ...extra,
})

const graph = (nodes: readonly CanvasNode[], roots: readonly string[]): CanvasGraph => ({
  nodes: new Map(nodes.map(n => [n.id, n])),
  roots,
  maxDepth: nodes.reduce((max, n) => Math.max(max, n.depth), 0),
})

const model = (over: Partial<CanvasModel> = {}): CanvasModel => ({
  graph: graph([node('a'), node('b', { parentId: 'a', depth: 1, title: 'Branch B' })], ['a']),
  statusOf: () => badge('idle'),
  compareIds: [],
  view: { x: 0, y: 0, scale: 1 },
  onSelect: vi.fn(),
  onToggleCompare: vi.fn(),
  onViewChange: vi.fn(),
  search: vi.fn(),
  ...over,
})

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

describe('CanvasTab', () => {
  it('boots into an explicit unwired state rather than throwing', () => {
    // A client entry that throws during render is fatal for the whole page boot.
    const { container } = render(<CanvasTab />)
    expect(container.querySelector('[data-canvas-unwired="true"]')).not.toBeNull()
  })

  it('renders one card per graph node', () => {
    const { container } = render(<CanvasTab canvas={model()} />)
    expect(container.querySelectorAll('[data-canvas-node]')).toHaveLength(2)
    expect(container.querySelector('[data-canvas-node="b"]')?.textContent).toContain('Branch B')
  })

  it('selects a node on click', () => {
    const canvas = model()
    const { container } = render(<CanvasTab canvas={canvas} />)
    fireEvent.click(container.querySelector('[data-canvas-node="b"]') as Element)
    expect(canvas.onSelect).toHaveBeenCalledWith('b')
    expect(canvas.onToggleCompare).not.toHaveBeenCalled()
  })

  it('toggles comparison on ctrl/cmd click instead of selecting', () => {
    const canvas = model()
    const { container } = render(<CanvasTab canvas={canvas} />)
    fireEvent.click(container.querySelector('[data-canvas-node="b"]') as Element, { ctrlKey: true })
    expect(canvas.onToggleCompare).toHaveBeenCalledWith('b')
    expect(canvas.onSelect).not.toHaveBeenCalled()
  })

  it('reports the search query upward and highlights matches', () => {
    const canvas = model()
    const { container } = render(<CanvasTab canvas={canvas} />)
    fireEvent.change(container.querySelector('[data-canvas-search]') as Element, { target: { value: 'branch' } })
    expect(canvas.search).toHaveBeenCalledWith('branch')
    expect(container.querySelector('[data-canvas-node="b"]')?.getAttribute('data-highlight')).toBe('true')
    expect(container.querySelector('[data-canvas-node="a"]')?.getAttribute('data-highlight')).toBe('false')
  })

  it('marks the selected and compared nodes', () => {
    const { container } = render(<CanvasTab canvas={model({ selectedId: 'a', compareIds: ['b'] })} />)
    expect(container.querySelector('[data-canvas-node="a"]')?.getAttribute('data-selected')).toBe('true')
    expect(container.querySelector('[data-canvas-node="b"]')?.getAttribute('data-comparing')).toBe('true')
  })

  it('warns about a parallel write only when ANOTHER running session shares the directory', () => {
    const both = graph([
      node('a', { cwd: 'C:/w', running: true }),
      node('b', { parentId: 'a', depth: 1, cwd: 'C:/w', running: true }),
    ], ['a'])
    const pair = render(<CanvasTab canvas={model({ graph: both })} />)
    expect(pair.container.querySelector('[data-canvas-node="a"] [data-node-parallel-write]')).not.toBeNull()
    expect(pair.container.querySelector('[data-canvas-node="b"] [data-node-parallel-write]')).not.toBeNull()

    // An idle node in a directory someone else is writing is flagged too: forking
    // it would put a second writer there.
    const idleBesideRunning = graph([
      node('a', { cwd: 'C:/w', running: true }),
      node('b', { parentId: 'a', depth: 1, cwd: 'C:/w', running: false }),
    ], ['a'])
    const asymmetric = render(<CanvasTab canvas={model({ graph: idleBesideRunning })} />)
    expect(asymmetric.container.querySelector('[data-canvas-node="a"] [data-node-parallel-write]')).toBeNull()
    expect(asymmetric.container.querySelector('[data-canvas-node="b"] [data-node-parallel-write]')).not.toBeNull()

    const quiet = render(<CanvasTab canvas={model({
      graph: graph([node('a', { cwd: 'C:/w' }), node('b', { parentId: 'a', depth: 1, cwd: 'C:/w' })], ['a']),
    })} />)
    expect(quiet.container.querySelector('[data-node-parallel-write]')).toBeNull()

    const apart = render(<CanvasTab canvas={model({
      graph: graph([
        node('a', { cwd: 'C:/w', running: true }),
        node('b', { parentId: 'a', depth: 1, cwd: 'C:/other', running: true }),
      ], ['a']),
    })} />)
    expect(apart.container.querySelector('[data-node-parallel-write]')).toBeNull()
  })

  it('marks a seeded node and exposes its status kind', () => {
    const seeded = graph([node('a', { seeded: true })], ['a'])
    const { container } = render(<CanvasTab canvas={model({ graph: seeded })} />)
    expect(container.querySelector('[data-node-seeded="true"]')).not.toBeNull()
    expect(container.querySelector('[data-node-status="idle"]')).not.toBeNull()
  })

  it('fits the view by clamping the scale to the allowed range', () => {
    const canvas = model()
    const { container } = render(<CanvasTab canvas={canvas} />)
    fireEvent.click(container.querySelector('[data-canvas-fit]') as Element)
    const view = (canvas.onViewChange as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as { scale: number }
    expect(view.scale).toBeGreaterThanOrEqual(0.4)
    expect(view.scale).toBeLessThanOrEqual(2)
  })

  it('shows a refresh button only when the controller supplies one', () => {
    const without = render(<CanvasTab canvas={model()} />)
    expect(without.container.querySelector('[data-canvas-refresh]')).toBeNull()
    const withRefresh = render(<CanvasTab canvas={model({ refresh: vi.fn() })} />)
    expect(withRefresh.container.querySelector('[data-canvas-refresh]')).not.toBeNull()
  })

  it('draws one edge per non-root node', () => {
    const { container } = render(<CanvasTab canvas={model()} />)
    expect(container.querySelectorAll('[data-canvas-edges] path')).toHaveLength(1)
  })
})

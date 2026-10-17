import type { CanvasGraph } from '../../shared/contracts.ts'
import type { StatusBadge } from '../../shared/status.ts'

/**
 * Everything the canvas renders, as plain data.
 *
 * Keeping the view model free of any DSH context is deliberate: the component
 * tests then need no host, and the controller layer (Task 11) owns every
 * interaction with `ctx`. `search` reports the query upward; the component keeps
 * the input's own value locally, so highlighting needs no round trip.
 */
export interface CanvasView {
  readonly x: number
  readonly y: number
  readonly scale: number
}

export interface CanvasModel {
  readonly graph: CanvasGraph
  statusOf(id: string): StatusBadge
  readonly selectedId?: string
  readonly compareIds: readonly string[]
  readonly view: CanvasView
  onSelect(id: string): void
  onToggleCompare(id: string): void
  onViewChange(view: CanvasView): void
  search(text: string): void
  /** Optional: the toolbar only shows 刷新 when the controller supplies one. */
  refresh?(): void
  /**
   * Optional invalidation channel.
   *
   * The slot hands the tab one model object for the tab's lifetime, so the tab
   * cannot rely on being re-rendered with fresh props. The controller's model
   * exposes its state through getters and calls this on every change, which is
   * what keeps the canvas live. Tests can omit it and pass plain values.
   */
  subscribe?(listener: () => void): () => void
}

export const IDENTITY_VIEW: CanvasView = { x: 0, y: 0, scale: 1 }

/** The view a tab renders before the controller layer has been wired in. */
export function emptyCanvasModel(): CanvasModel {
  return {
    graph: { nodes: new Map(), roots: [], maxDepth: 0 },
    statusOf: () => ({ kind: 'unknown', confirmed: false, label: '状态未知', color: '#5b6472' }),
    compareIds: [],
    view: IDENTITY_VIEW,
    onSelect: () => {},
    onToggleCompare: () => {},
    onViewChange: () => {},
    search: () => {},
  }
}

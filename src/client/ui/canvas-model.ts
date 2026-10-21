import type { BranchTurn, CanvasGraph, ComparisonResult, LaunchMode } from '../../shared/contracts.ts'
import type { LiveTail } from '../live/live-tail.ts'
import type { AgentSwarmController } from '../controllers/agent-swarm-controller.ts'
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

/** One node's own turns, for the detail panel. */
export interface CanvasDetail {
  readonly sessionId: string
  readonly turns: readonly BranchTurn[]
  /** Events this session inherited from its own fork point. */
  readonly inheritedCount: number
  /** Another running session shares this directory. */
  readonly cwdWarning: boolean
  /** The session's latest conclusion (last assistant text, tail-bounded). */
  readonly conclusion?: string | null
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
  /** Jumps to the match after the current selection (Enter-to-cycle). */
  searchNext?(text: string): void
  /** Subtree roots currently collapsed (their descendants are hidden). */
  readonly collapsedNodes?: ReadonlySet<string>
  /** Toggles a subtree between collapsed and expanded. */
  toggleSubtree?(id: string): void
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
  /** Loads a node's turns. Absent → the tab shows no detail panel. */
  detail?(id: string): Promise<CanvasDetail | null>
  /**
   * Live-updating detail for a node whose event window is open (running
   * sessions). Null → fall back to `detail()`, which is a one-shot snapshot.
   */
  liveDetail?(id: string): CanvasDetail | null
  /** The node's in-flight assistant output, or null when nothing is streaming. */
  tailOf?(id: string): LiveTail | null
  /** Loads the comparison for the two picked branches. */
  comparison?(): Promise<ComparisonResult | null>
  /** Runs a fork from a timeline row. */
  forkFromRow?(sessionId: string, atSeq: number, instruction: string, launch: LaunchMode): Promise<ForkOutcome>
  /** Switches the app to a session. */
  openInChat?(id: string): void
  /** Drops the selection, which closes the right panel. */
  clearSelection?(): void
  /**
   * Opens the live agent-web view for one session. The caller owns the
   * returned controller and must dispose it on close.
   */
  inspectSwarm?(id: string): AgentSwarmController
  /** Subagent-origin sessions currently appear as lineage nodes. */
  showSubagents?: boolean
  /** Flips `showSubagents`; absent → the toolbar hides the 子代理 toggle. */
  toggleShowSubagents?(): void
}

/** The subset of `ForkResult` the tab shows. */
export interface ForkOutcome {
  readonly childId: string
  readonly phase: string
  readonly error?: string
  readonly retriedPrompt: boolean
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

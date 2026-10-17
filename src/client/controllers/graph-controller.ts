import type { CanvasGraph, ComparisonResult, LaunchMode, SessionId } from '../../shared/contracts.ts'
import { badge, type StatusBadge } from '../../shared/status.ts'
import { buildLineageGraph } from '../graph/graph-model.ts'
import { toSummaries } from '../adapters/session-adapter.ts'
import { selectWorkspaceSummaries, toWorkspaceItems } from '../adapters/workspace-adapter.ts'
import { deriveStatus, type RuntimeHint } from '../adapters/runtime-status-adapter.ts'
import { inheritedPrefixLength, segmentFromEvents, type SessionEventLike } from '../compare/branch-segment.ts'
import { compareBranches } from '../compare/diff.ts'
import { parallelWriteIds } from '../graph/parallel-write.ts'
import { runForkTransaction, type ForkDeps, type ForkResult } from './fork-controller.ts'
import { IDENTITY_VIEW, type CanvasDetail, type CanvasModel, type CanvasView } from '../ui/canvas-model.ts'

/**
 * Everything the controller needs from DSH, expressed structurally so tests
 * need no host and the DSH surface stays in `index.ts`.
 */
export interface GraphControllerDeps {
  /** Current session list snapshot, in either client shape. */
  listSnapshot(): unknown
  /** Current workspace snapshot. */
  workspaceSnapshot(): unknown
  /** Which workspace the canvas shows, and the cwd to fall back on. */
  scope(): { readonly workspaceId: string | null; readonly cwd: string | null }
  /** Whether the host link is up. Drives the `unknown` status. */
  isConnected(): boolean
  /** Latest live hint for a session, when one has been observed. */
  hintOf?(id: SessionId): RuntimeHint | undefined
  /** Switch the app to a session. */
  openSession(id: SessionId): void
  /** Fork transaction dependencies, already bound to the real host calls. */
  readonly forkDeps: ForkDeps
  /** Durable events of one session, for comparison. */
  readEvents(sessionId: SessionId): Promise<readonly SessionEventLike[]>
}

export interface GraphController {
  /** A live view: its properties are getters over the controller's state. */
  model(): CanvasModel
  refresh(): void
  select(id: SessionId): void
  toggleCompare(id: SessionId): void
  /** Records the term and locates the first match. */
  search(text: string): void
  openInChat(id: SessionId): void
  forkFromRow(sessionId: SessionId, atSeq: number, instruction: string, launch: LaunchMode): Promise<ForkResult>
  /** Null until exactly two branches are selected, or when their events cannot be read. */
  compare(): Promise<ComparisonResult | null>
  subscribe(listener: () => void): () => void
}

const EMPTY_GRAPH: CanvasGraph = { nodes: new Map(), roots: [], maxDepth: 0 }
const UNKNOWN: StatusBadge = badge('unknown')

export function createGraphController(deps: GraphControllerDeps): GraphController {
  let graph: CanvasGraph = EMPTY_GRAPH
  let statuses = new Map<SessionId, StatusBadge>()
  let selectedId: SessionId | undefined
  let compareIds: SessionId[] = []
  let view: CanvasView = IDENTITY_VIEW
  const listeners = new Set<() => void>()

  const notify = (): void => {
    for (const listener of [...listeners]) listener()
  }

  const refresh = (): void => {
    const summaries = toSummaries(deps.listSnapshot())
    const { workspaceId, cwd } = deps.scope()
    const selection = selectWorkspaceSummaries(
      toWorkspaceItems(deps.workspaceSnapshot()),
      workspaceId,
      summaries,
      cwd,
    )
    graph = buildLineageGraph(selection.members, new Set(selection.members.map(summary => summary.id)))

    const connected = deps.isConnected()
    statuses = new Map()
    for (const node of graph.nodes.values()) {
      const hint = deps.hintOf?.(node.id)
      statuses.set(node.id, badge(deriveStatus({
        connected,
        available: node.available,
        running: node.running,
        ...(hint === undefined ? {} : { lastHint: hint }),
      })))
    }

    // A selection or comparison that left the workspace must not linger.
    if (selectedId !== undefined && !graph.nodes.has(selectedId)) selectedId = undefined
    compareIds = compareIds.filter(id => graph.nodes.has(id))
    notify()
  }

  const select = (id: SessionId): void => {
    if (selectedId === id) return
    selectedId = id
    notify()
  }

  const toggleCompare = (id: SessionId): void => {
    if (compareIds.includes(id)) {
      compareIds = compareIds.filter(candidate => candidate !== id)
    } else if (compareIds.length < 2) {
      compareIds = [...compareIds, id]
    } else {
      // At most two sides; the oldest pick drops out rather than the new click
      // being ignored, which would look broken.
      compareIds = [compareIds[1] as SessionId, id]
    }
    notify()
  }

  const search = (text: string): void => {
    const needle = text.trim().toLowerCase()
    if (needle === '') return
    const hit = [...graph.nodes.values()].find(
      node => node.title.toLowerCase().includes(needle) || node.id.toLowerCase().includes(needle),
    )
    // 定位: typing jumps to the first match. Highlighting stays local to the tab.
    if (hit !== undefined && hit.id !== selectedId) {
      selectedId = hit.id
      notify()
    }
  }

  const openInChat = (id: SessionId): void => {
    deps.openSession(id)
  }

  const forkFromRow = async (
    sessionId: SessionId,
    atSeq: number,
    instruction: string,
    launch: LaunchMode,
  ): Promise<ForkResult> => {
    const result = await runForkTransaction(deps.forkDeps, { sessionId, atSeq, instruction, launch })
    // Refresh on every outcome: a child may exist even when the transaction
    // could not confirm it, and an `unverified` node must still appear.
    refresh()
    return result
  }

  const compare = async (): Promise<ComparisonResult | null> => {
    if (compareIds.length !== 2) return null
    const [leftId, rightId] = compareIds as [SessionId, SessionId]
    try {
      const [leftEvents, rightEvents] = await Promise.all([
        deps.readEvents(leftId),
        deps.readEvents(rightId),
      ])
      return compareBranches(
        segmentFromEvents(leftId, inheritedPrefixLength(leftEvents), leftEvents),
        segmentFromEvents(rightId, inheritedPrefixLength(rightEvents), rightEvents),
      )
    } catch {
      // A comparison we cannot build must read as "nothing to compare", never as
      // "the branches are identical".
      return null
    }
  }

  /**
   * One node's own turns for the detail panel.
   *
   * The read is one-shot — `readEvents` retains, reads, and releases — so
   * selecting a different node has nothing to clean up and a forgotten release
   * cannot pin a Session open. v1 therefore shows a snapshot of the branch, not a
   * live-updating one.
   */
  const detail = async (id: SessionId): Promise<CanvasDetail | null> => {
    try {
      const events = await deps.readEvents(id)
      const inheritedCount = inheritedPrefixLength(events)
      return {
        sessionId: id,
        turns: segmentFromEvents(id, inheritedCount, events).turns,
        inheritedCount,
        cwdWarning: parallelWriteIds(graph).has(id),
      }
    } catch {
      return null
    }
  }

  const model = (): CanvasModel => ({
    get graph() { return graph },
    statusOf: id => statuses.get(id) ?? UNKNOWN,
    get selectedId() { return selectedId },
    get compareIds() { return compareIds },
    get view() { return view },
    onSelect: select,
    onToggleCompare: toggleCompare,
    onViewChange: next => { view = next; notify() },
    search,
    refresh,
    subscribe: listener => {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    detail,
    comparison: compare,
    forkFromRow,
    openInChat,
    clearSelection: () => {
      if (selectedId === undefined) return
      selectedId = undefined
      notify()
    },
  })

  refresh()
  return { model, refresh, select, toggleCompare, search, openInChat, forkFromRow, compare, subscribe: listener => {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  } }
}

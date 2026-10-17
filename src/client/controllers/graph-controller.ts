import type { CanvasGraph, CanvasNode, ComparisonResult, LaunchMode, SessionId } from '../../shared/contracts.ts'
import { badge, type StatusBadge } from '../../shared/status.ts'
import { buildLineageGraph } from '../graph/graph-model.ts'
import { toSummaries } from '../adapters/session-adapter.ts'
import { selectWorkspaceSummaries, toWorkspaceItems } from '../adapters/workspace-adapter.ts'
import { deriveStatus, type RuntimeHint } from '../adapters/runtime-status-adapter.ts'
import { inheritedPrefixLength, segmentFromEvents, type SessionEventLike } from '../compare/branch-segment.ts'
import { compareBranches } from '../compare/diff.ts'
import { parallelWriteIds } from '../graph/parallel-write.ts'
import { liveTailFromEntries, type LiveEntryLike, type LiveTail } from '../live/live-tail.ts'
import { runForkTransaction, type ForkDeps, type ForkResult } from './fork-controller.ts'
import { IDENTITY_VIEW, type CanvasDetail, type CanvasModel, type CanvasView } from '../ui/canvas-model.ts'

/**
 * An open window over one session's event stream. Structural mirror of the
 * event-stream adapter's `LiveWindowSource`, so tests need no host.
 */
export interface LiveWindowLike {
  readonly sessionId: string
  entries(): readonly LiveEntryLike[]
  subscribe(listener: () => void): () => void
  release(): void
}

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
  /**
   * Opens a live event window for one running session. Absent → the canvas
   * has no live tails and falls back to the coarse running status.
   */
  liveWindow?(sessionId: SessionId): Promise<LiveWindowLike>
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
  /** Releases every open live window. Plugin unload must leave no retains. */
  dispose(): void
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

  /**
   * Live windows, one per running node. Bounded by the number of sessions that
   * are actually running (normally 0–2), and every one of them is released the
   * moment its session stops running or the controller is disposed.
   */
  const liveWindows = new Map<SessionId, { source: LiveWindowLike; off: () => void }>()
  const liveTails = new Map<SessionId, LiveTail | null>()
  const liveDetails = new Map<SessionId, CanvasDetail>()
  const pendingWindows = new Set<SessionId>()

  const notify = (): void => {
    for (const listener of [...listeners]) listener()
  }

  /**
   * One node's badge. A live tail is the best hint there is: a streaming tool
   * call reads as 工具执行, streaming text or reasoning as 思考中 — the running
   * status stops being a guess while the canvas can see the stream.
   */
  const statusFor = (node: CanvasNode, tail: LiveTail | null | undefined): StatusBadge => {
    const hint = tail == null
      ? deps.hintOf?.(node.id)
      : (tail.phase === 'tool' ? 'tool' : 'thinking')
    return badge(deriveStatus({
      connected: deps.isConnected(),
      available: node.available,
      running: node.running,
      ...(hint === undefined ? {} : { lastHint: hint }),
    }))
  }

  /** One node's own turns, derived from its open window, for the detail panel. */
  const deriveLiveDetail = (id: SessionId): CanvasDetail | null => {
    const held = liveWindows.get(id)
    if (held === undefined) return null
    const events: SessionEventLike[] = []
    for (const entry of held.source.entries()) {
      if (entry.type !== 'event') continue
      events.push({ seq: Number(entry.event.seq), type: entry.event.type, data: entry.event.data })
    }
    const inheritedCount = inheritedPrefixLength(events)
    return {
      sessionId: id,
      turns: segmentFromEvents(id, inheritedCount, events).turns,
      inheritedCount,
      cwdWarning: parallelWriteIds(graph).has(id),
    }
  }

  const refreshNode = (id: SessionId): void => {
    const node = graph.nodes.get(id)
    if (node === undefined) return
    statuses.set(id, statusFor(node, liveTails.get(id)))
  }

  const handleWindowChange = (id: SessionId, source: LiveWindowLike): void => {
    const held = liveWindows.get(id)
    // A window replaced or closed since the subscription was made must not write.
    if (held === undefined || held.source !== source) return
    liveTails.set(id, liveTailFromEntries(source.entries()))
    const detail = deriveLiveDetail(id)
    if (detail === null) liveDetails.delete(id)
    else liveDetails.set(id, detail)
    refreshNode(id)
    notify()
  }

  const closeLiveWindow = (id: SessionId): void => {
    const held = liveWindows.get(id)
    if (held === undefined) return
    liveWindows.delete(id)
    liveTails.delete(id)
    liveDetails.delete(id)
    held.off()
    held.source.release()
  }

  /** Opens windows for new running nodes and closes them for nodes that stopped. */
  const syncLiveWindows = (): void => {
    const open = deps.liveWindow
    if (open === undefined) return
    const running = new Set<SessionId>()
    for (const node of graph.nodes.values()) if (node.running) running.add(node.id)
    for (const id of [...liveWindows.keys()]) if (!running.has(id)) closeLiveWindow(id)
    for (const id of running) {
      if (liveWindows.has(id) || pendingWindows.has(id)) continue
      pendingWindows.add(id)
      void open(id).then(source => {
        pendingWindows.delete(id)
        // The session may have stopped, or a second window raced open first.
        if (graph.nodes.get(id)?.running !== true || liveWindows.has(id)) {
          source.release()
          return
        }
        const off = source.subscribe(() => { handleWindowChange(id, source) })
        liveWindows.set(id, { source, off })
        liveTails.set(id, liveTailFromEntries(source.entries()))
        const detail = deriveLiveDetail(id)
        if (detail !== null) liveDetails.set(id, detail)
        refreshNode(id)
        notify()
      }).catch(() => {
        // A window that refuses to open costs the live view, never the canvas.
        pendingWindows.delete(id)
      })
    }
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

    statuses = new Map()
    for (const node of graph.nodes.values()) statuses.set(node.id, statusFor(node, liveTails.get(node.id)))

    syncLiveWindows()

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
    liveDetail: id => liveDetails.get(id) ?? null,
    tailOf: id => liveTails.get(id) ?? null,
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
  return {
    model, refresh, select, toggleCompare, search, openInChat, forkFromRow, compare,
    subscribe: listener => {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    dispose: () => {
      for (const id of [...liveWindows.keys()]) closeLiveWindow(id)
      liveTails.clear()
      liveDetails.clear()
    },
  }
}

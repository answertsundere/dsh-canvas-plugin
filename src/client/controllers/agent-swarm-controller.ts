import {
  activityFromEntries,
  agentsFromWindows,
  layoutActivity,
  layoutSwarm,
  swarmEdges,
  todosFromEntries,
  type ActivityTool,
  type AgentNode,
  type SessionActivity,
  type SwarmTodo,
} from '../swarm/swarm-model.ts'
import { conclusionFromEvents, inheritedPrefixLength, type SessionEventLike } from '../compare/branch-segment.ts'
import { liveTailFromEntries, tailSnippet, type LiveTail, type TailSnippet } from '../live/live-tail.ts'
import type { LiveWindowLike } from './graph-controller.ts'

/** One team member as the projection publishes it. */
export interface TeamMemberLike {
  readonly id: string
  readonly name: string
  readonly role: 'lead' | 'teammate'
  readonly phase: string
}

/** One shared task as the projection publishes it. */
export interface TeamTaskLike {
  readonly id: string
  readonly subject: string
  readonly status: string
  readonly ownerName?: string
}

/** The DSH agent team rooted at the inspected session, when one exists. */
export interface TeamLike {
  readonly members: readonly TeamMemberLike[]
  readonly tasks: readonly TeamTaskLike[]
}

/** What the swarm needs from the host, structural so tests need no DSH. */
export interface AgentSwarmDeps {
  /** Live event window over one session — the same adapter the canvas uses. */
  liveWindow(sessionId: string): Promise<LiveWindowLike>
  /** Current session rows, for titles and coarse running flags. */
  listSummaries(): readonly { id: string; title?: string; running: boolean }[]
  /** The session's agent team (members + shared tasks), from the projection. */
  teamOf?(sessionId: string): TeamLike | null
}

/** One agent chip on the web. */
export interface AgentSwarmAgent {
  readonly id: string
  readonly label: string
  readonly depth: number
  readonly status: 'streaming' | 'running' | 'idle' | 'failed'
  /** What the agent is emitting right now, when anything is. */
  readonly snippet: TailSnippet | null
  /** The raw tail, for the detail side panel of the swarm view. */
  readonly tail: LiveTail | null
  /** Team role, when this agent is a member of the session's agent team. */
  readonly role?: 'lead' | 'teammate'
}

export interface AgentSwarmState {
  readonly rootId: string
  readonly rootLabel: string
  /** What the inspected session itself is emitting, when anything is. */
  readonly rootSnippet: TailSnippet | null
  readonly agents: readonly AgentSwarmAgent[]
  readonly edges: readonly { from: string; to: string }[]
  readonly layout: ReturnType<typeof layoutSwarm>
  /** The session's own work (turns and tools), for the activity ring. */
  readonly activity: SessionActivity
  readonly toolLayout: ReturnType<typeof layoutActivity>
  /** Each node's current todo list (root and agents), when it has written one. */
  readonly todos: ReadonlyMap<string, readonly SwarmTodo[]>
  /** The session's agent team, when one exists (members + shared tasks). */
  readonly team: TeamLike | null
  /** The session's latest conclusion, tail-anchored, for the root card. */
  readonly rootConclusion: string | null
  /**
   * Last activity per node id (agents and `tool:<callId>` entries — each
   * incoming edge's heat). The view feeds these into `pulseProgress` at each
   * animation frame — the controller never animates, it only timestamps.
   */
  readonly heat: ReadonlyMap<string, number>
}

export interface AgentSwarmController {
  state(): AgentSwarmState
  subscribe(listener: () => void): () => void
  /** Releases every open window. Closing the view must leave no retains. */
  dispose(): void
}

interface Held {
  source: LiveWindowLike
  off: () => void
}

const shortId = (id: string): string => (id.length > 10 ? id.slice(-6) : id)

/**
 * Live swarm over one session: the agent web for the 「实况」 view.
 *
 * Enumeration rides the parent's own event window (`subagent/catalog` durable
 * events), so a freshly spawned agent arrives as an ordinary window change.
 * Each agent gets the same live window the canvas uses, which is what feeds
 * both its snippet and its edge's heat.
 */
export function createAgentSwarmController(deps: AgentSwarmDeps, rootId: string): AgentSwarmController {
  const listeners = new Set<() => void>()
  const windows = new Map<string, Held>()
  const tails = new Map<string, LiveTail | null>()
  const todos = new Map<string, readonly SwarmTodo[]>()
  const heat = new Map<string, number>()
  const failed = new Set<string>()
  /** Catalog facts merged across refreshes; a window that went away must not retract an agent. */
  const knownWindows = new Map<string, readonly unknown[]>()

  let nodes: AgentNode[] = []
  let layout = layoutSwarm([], rootId)
  let edges: readonly { from: string; to: string }[] = []
  let activity: SessionActivity = activityFromEntries([])
  let toolLayout = layoutActivity([])
  let team: TeamLike | null = null
  let disposed = false

  const notify = (): void => {
    for (const listener of [...listeners]) listener()
  }

  const openWindow = (id: string): void => {
    if (windows.has(id) || failed.has(id) || disposed) return
    void deps.liveWindow(id).then(source => {
      if (disposed) { source.release(); return }
      const off = source.subscribe(() => { onWindowChange(id, source) })
      windows.set(id, { source, off })
      onWindowChange(id, source)
    }).catch(() => {
      // Unreadable agent: it stays on the web, grey, with no live view.
      failed.add(id)
      rebuild()
    })
  }

  /**
   * The root's own work, derived from its durable events minus the inherited
   * prefix (a fork's seed would otherwise count its parent's turns). A pending
   * tool stays hot while it runs; a tool that just completed gets one heat
   * stamp so its pulse crawls home and fades.
   */
  let rootConclusion: string | null = null

  const updateActivity = (source: LiveWindowLike): void => {
    const durable = source.entries().filter(entry => entry.type === 'event')
    const flat: SessionEventLike[] = durable.map(entry => ({
      seq: Number(entry.event.seq),
      type: entry.event.type,
      data: entry.event.data,
    }))
    const inherited = inheritedPrefixLength(flat)
    const ownFlat = flat.filter(event => event.seq >= inherited)
    const own = durable.filter(entry => Number(entry.event.seq) >= inherited)
    const next = activityFromEntries(own)
    rootConclusion = conclusionFromEvents(ownFlat)
    const now = Date.now()
    if (next.pendingToolId !== null) heat.set(`tool:${next.pendingToolId}`, now)
    const previousPending = activity.pendingToolId
    if (previousPending !== null && previousPending !== next.pendingToolId) {
      const settled = next.tools.find(tool => tool.id === previousPending)
      if (settled !== undefined && settled.status !== 'pending') heat.set(`tool:${previousPending}`, now)
    }
    activity = next
    toolLayout = layoutActivity(next.tools)
  }

  const onWindowChange = (id: string, source: LiveWindowLike): void => {
    knownWindows.set(id, source.entries())
    const tail = liveTailFromEntries(source.entries())
    tails.set(id, tail)
    const nodeTodos = todosFromEntries(source.entries())
    if (nodeTodos === null) todos.delete(id)
    else todos.set(id, nodeTodos)
    if (tail !== null) heat.set(id, Date.now())
    if (id === rootId) updateActivity(source)
    rebuild()
  }

  const rebuild = (): void => {
    team = deps.teamOf?.(rootId) ?? null
    const windowsSnapshot = [...knownWindows].map(([sessionId, entries]) => ({ sessionId, entries }))
    nodes = agentsFromWindows(windowsSnapshot, rootId)
    // Team members hang off the lead even when their session has no catalog
    // entry — without this they would all stack, unpositioned, at the center.
    const memberNodes: AgentNode[] = (team?.members ?? [])
      .filter(member => member.id !== rootId && !nodes.some(node => node.id === member.id))
      .map(member => ({ id: member.id, parentId: rootId, depth: 1, label: member.name, mode: 'continuable' as const }))
    nodes = [...nodes, ...memberNodes]
    layout = layoutSwarm(nodes, rootId)
    edges = swarmEdges(nodes, rootId)
    // New agents get a window; a vanished window (cannot happen for append-only
    // catalogs, but stay safe) loses its own. Team teammates are sessions too —
    // opening their windows is what makes the team live on the web.
    for (const node of nodes) openWindow(node.id)
    for (const member of team?.members ?? []) {
      if (member.id !== rootId) openWindow(member.id)
    }
    for (const id of [...windows.keys()]) {
      if (id !== rootId && !nodes.some(node => node.id === id)) closeWindow(id)
    }
    notify()
  }

  const closeWindow = (id: string): void => {
    const held = windows.get(id)
    if (held === undefined) return
    windows.delete(id)
    tails.delete(id)
    held.off()
    held.source.release()
  }

  const state = (): AgentSwarmState => {
    const rows = new Map(deps.listSummaries().map(row => [row.id, row]))
    const nodeById = new Map(nodes.map(node => [node.id, node]))
    const memberById = new Map((team?.members ?? []).map(member => [member.id, member]))
    const labelOf = (id: string): string =>
      // The root keeps its session title; a teammate's team name beats the
      // generic session title the list gives it.
      id === rootId
        ? rows.get(id)?.title ?? memberById.get(id)?.name ?? '本会话'
        : memberById.get(id)?.name
          ?? nodeById.get(id)?.label
          ?? rows.get(id)?.title
          ?? `agent ${shortId(id)}`

    const seen = new Set<string>()
    const statusRank: Record<AgentSwarmAgent['status'], number> = { streaming: 0, running: 1, failed: 2, idle: 3 }
    const agents: AgentSwarmAgent[] = []
    for (const id of [...windows.keys(), ...failed]) {
      if (id === rootId || seen.has(id)) continue
      seen.add(id)
      const tail = tails.get(id) ?? null
      const member = memberById.get(id)
      const status: AgentSwarmAgent['status'] = tail !== null
        ? 'streaming'
        : member?.phase === 'failed' ? 'failed'
          : rows.get(id)?.running === true || member?.phase === 'running' ? 'running' : 'idle'
      agents.push({
        id,
        label: labelOf(id),
        depth: nodeById.get(id)?.depth ?? 1,
        status,
        snippet: tail === null ? null : tailSnippet(tail, 46),
        tail,
        ...(member === undefined ? {} : { role: member.role }),
      })
    }
    // Team members whose window could not be opened still belong on the web —
    // the projection knows them even when their session is not readable.
    for (const member of team?.members ?? []) {
      if (member.id === rootId || seen.has(member.id)) continue
      seen.add(member.id)
      agents.push({
        id: member.id,
        label: member.name,
        depth: 1,
        status: member.phase === 'failed' ? 'failed' : member.phase === 'running' ? 'running' : 'idle',
        snippet: null,
        tail: null,
        role: member.role,
      })
    }
    // Active work floats to the top; idle members sink.
    agents.sort((a, b) => statusRank[a.status] - statusRank[b.status])
    return {
      rootId,
      rootLabel: labelOf(rootId),
      rootSnippet: (() => {
        const tail = tails.get(rootId) ?? null
        return tail === null ? null : tailSnippet(tail, 46)
      })(),
      agents,
      edges,
      layout,
      activity,
      toolLayout,
      todos: new Map(todos),
      team,
      rootConclusion,
      heat: new Map(heat),
    }
  }

  openWindow(rootId)
  rebuild()

  return {
    state,
    subscribe: listener => {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    dispose: () => {
      disposed = true
      for (const id of [...windows.keys()]) closeWindow(id)
      tails.clear()
      todos.clear()
      heat.clear()
    },
  }
}

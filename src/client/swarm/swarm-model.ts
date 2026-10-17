/**
 * Agent swarm model: who an agent's subagents are, where they sit on the web,
 * and how activity pulses crawl along the edges.
 *
 * Enumeration needs no extra service: a parent records one durable
 * `subagent/catalog` event per direct child in its own session log
 * (`@deepseek-ai/dsh-subagent` catalog.ts — `{ childId, childCreatedAt, mode,
 * label }`), so the event windows the canvas already opens carry the whole
 * swarm, and a freshly spawned agent arrives as an ordinary window change.
 */

import type { LiveEntryLike } from '../live/live-tail.ts'

/** Minimal shape of one window row; identical to the live-tail input. */
export interface SwarmEntrySource {
  readonly sessionId: string
  readonly entries: readonly unknown[]
}

export interface AgentNode {
  readonly id: string
  readonly parentId: string | null
  /** 0 = the inspected session, 1 = its direct subagents, 2 = theirs. */
  readonly depth: number
  readonly label?: string
  readonly mode: 'one-shot' | 'continuable' | 'unknown'
}

export interface SwarmEdge {
  readonly from: string
  readonly to: string
}

export interface SwarmLayout {
  readonly positions: ReadonlyMap<string, { x: number; y: number }>
  readonly radius: number
}

const MAX_DEPTH = 2

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null ? value as Record<string, unknown> : null

const catalogChildren = (entries: readonly unknown[]): { id: string; label?: string; mode: AgentNode['mode'] }[] => {
  const children: { id: string; label?: string; mode: AgentNode['mode'] }[] = []
  for (const entry of entries) {
    const row = asRecord(entry)
    if (row === null || row['type'] !== 'event') continue
    const event = asRecord(row['event'])
    if (event === null || event['type'] !== 'subagent/catalog') continue
    const data = asRecord(event['data'])
    if (data === null) continue
    const childId = typeof data['childId'] === 'string' ? data['childId'] : null
    if (childId === null) continue
    const mode = data['mode'] === 'one-shot' || data['mode'] === 'continuable' ? data['mode'] : 'unknown'
    children.push({
      id: childId,
      ...(typeof data['label'] === 'string' ? { label: data['label'] } : {}),
      mode,
    })
  }
  return children
}

/**
 * The swarm under `rootId`, merged append-only across the windows that were
 * readable. Only the root and already-known agents contribute children, so a
 * window we could not place never invents membership; the first sighting of a
 * child wins (catalog events are append-only facts, never retractions).
 */
export function agentsFromWindows(
  windows: readonly SwarmEntrySource[],
  rootId: string,
  cap = 24,
): AgentNode[] {
  const agents = new Map<string, AgentNode>()
  agents.set(rootId, { id: rootId, parentId: null, depth: 0, mode: 'continuable' })

  let changed = true
  while (changed && agents.size - 1 < cap) {
    changed = false
    for (const window of windows) {
      const parent = agents.get(window.sessionId)
      if (parent === undefined || parent.depth >= MAX_DEPTH) continue
      for (const child of catalogChildren(window.entries)) {
        if (agents.has(child.id) || child.id === rootId || agents.size - 1 >= cap) continue
        agents.set(child.id, {
          id: child.id,
          parentId: window.sessionId,
          depth: parent.depth + 1,
          ...(child.label === undefined ? {} : { label: child.label }),
          mode: child.mode,
        })
        changed = true
      }
    }
  }
  return [...agents.values()].filter(agent => agent.id !== rootId)
}

/** One spoke per non-root agent. Edges point parent → child. */
export function swarmEdges(agents: readonly AgentNode[], rootId: string): SwarmEdge[] {
  void rootId
  return agents
    .filter(agent => agent.parentId !== null)
    .map(agent => ({ from: agent.parentId as string, to: agent.id }))
}

/**
 * Radial web layout: the root at the origin, depth-1 agents evenly spaced on
 * the main ring, deeper agents orbiting their own parent on a smaller ring.
 * Deterministic — the same agent set always draws the same web.
 */
export function layoutSwarm(
  agents: readonly AgentNode[],
  rootId: string,
  opts: { radius?: number; childRadius?: number } = {},
): SwarmLayout {
  const radius = opts.radius ?? 230
  const childRadius = opts.childRadius ?? 95
  const positions = new Map<string, { x: number; y: number }>()
  positions.set(rootId, { x: 0, y: 0 })

  const byParent = new Map<string, AgentNode[]>()
  for (const agent of agents) {
    // The root sits at the center; it is never binned onto a ring.
    if (agent.id === rootId) continue
    const key = agent.parentId ?? '__orphan__'
    const bucket = byParent.get(key)
    if (bucket === undefined) byParent.set(key, [agent])
    else bucket.push(agent)
  }

  const ring = (center: { x: number; y: number }, ringRadius: number, nodes: readonly AgentNode[]): void => {
    const count = nodes.length
    nodes.forEach((node, index) => {
      // Start at the top and walk clockwise; one agent sits straight up.
      const angle = -Math.PI / 2 + (2 * Math.PI * index) / count
      positions.set(node.id, {
        x: center.x + ringRadius * Math.cos(angle),
        y: center.y + ringRadius * Math.sin(angle),
      })
    })
  }

  ring({ x: 0, y: 0 }, radius, byParent.get(rootId) ?? [])
  // Orphans (parent outside the readable windows) still get a place on an
  // outer ring, so nothing visible is missing a coordinate.
  ring({ x: 0, y: 0 }, radius + 60, byParent.get('__orphan__') ?? [])
  for (const [parentId, nodes] of byParent) {
    if (parentId === rootId || parentId === '__orphan__') continue
    const center = positions.get(parentId)
    if (center === undefined) continue
    ring(center, childRadius, nodes)
  }

  // Anything whose parent never got placed (deep chains beyond MAX_DEPTH are
  // excluded upstream, so this is defensive) lands on the outer ring.
  for (const agent of agents) {
    if (!positions.has(agent.id)) {
      positions.set(agent.id, { x: radius + 120, y: 0 })
    }
  }

  return { positions, radius }
}

/**
 * Crawl progress of an edge's pulse: 0→1 per cycle while the edge is hot
 * (recent activity), then one full grace cycle to crawl home, then `null` —
 * a cold edge draws no dot. Pure in `now`, so tests and the rAF loop share it.
 */
export function pulseProgress(lastActivityAt: number, now: number, cycleMs = 1_800, graceMs = 1_500): number | null {
  const elapsed = now - lastActivityAt
  if (elapsed < 0) return 0
  if (elapsed >= cycleMs + graceMs) return null
  return (elapsed % cycleMs) / cycleMs
}

/** One tool call the inspected session has made, for the activity ring. */
export interface ActivityTool {
  readonly id: string
  readonly name: string
  readonly status: 'pending' | 'ok' | 'error'
  readonly turn: number
}

/** What the inspected session itself is working through, from its own log. */
export interface SessionActivity {
  /** Completed turns. */
  readonly turnCount: number
  readonly openTurn: boolean
  readonly currentTurn: number | null
  /** Most recent tools, oldest first. */
  readonly tools: readonly ActivityTool[]
  readonly pendingToolId: string | null
}

const EMPTY_ACTIVITY: SessionActivity = {
  turnCount: 0, openTurn: false, currentTurn: null, tools: [], pendingToolId: null,
}

const ACTIVITY_TOOL_CAP = 12

/**
 * The session's own work, folded from its durable events: turn counting plus
 * `tool/call`→`tool/result` pairing (the same discriminator branch-segment
 * uses). A long single-agent task shows up here as turns accumulating and a
 * permanently pending tool while it runs.
 */
export function activityFromEntries(entries: readonly LiveEntryLike[], cap = ACTIVITY_TOOL_CAP): SessionActivity {
  let turnCount = 0
  let openTurn = false
  let currentTurn: number | null = null
  const tools: { id: string; name: string; status: ActivityTool['status']; turn: number }[] = []

  for (const entry of entries) {
    const row = asRecord(entry)
    if (row === null || row['type'] !== 'event') continue
    const event = asRecord(row['event'])
    if (event === null) continue
    const data = asRecord(event['data'])

    switch (event['type']) {
      case 'turn/start': {
        if (typeof data?.['turn'] === 'number') { openTurn = true; currentTurn = data['turn'] }
        break
      }
      case 'turn/end': {
        turnCount += 1
        openTurn = false
        currentTurn = null
        break
      }
      case 'tool/call': {
        const callId = data?.['callId']
        if (typeof callId !== 'string' || callId === '') break
        tools.push({
          id: callId,
          name: typeof data?.['name'] === 'string' ? data['name'] : '…',
          status: 'pending',
          turn: typeof data?.['turn'] === 'number' ? data['turn'] : 0,
        })
        if (tools.length > cap) tools.shift()
        break
      }
      case 'tool/result': {
        const message = asRecord(data?.['message'])
        const callId = message === null ? undefined : message['toolCallId']
        if (typeof callId !== 'string') break
        const tool = [...tools].reverse().find(candidate => candidate.id === callId && candidate.status === 'pending')
        if (tool !== undefined) tool.status = data !== null && data['error'] !== undefined ? 'error' : 'ok'
        break
      }
      default:
        break
    }
  }

  const pending = [...tools].reverse().find(tool => tool.status === 'pending')
  return {
    turnCount,
    openTurn,
    currentTurn,
    tools,
    pendingToolId: pending?.id ?? null,
  }
}

/**
 * The activity spiral: tools laid along a spider-web spiral in execution
 * order — each step turns further and drifts outward, and a turn boundary
 * adds an extra angular gap plus a small radial lift, so the shape reads as a
 * process (turn 1 here, turn 2 there) instead of a uniform ring. Newest work
 * sits furthest out, which is where the eye lands last.
 */
export function layoutActivity(
  tools: readonly ActivityTool[],
  opts: { baseRadius?: number; radialStep?: number; angularStep?: number; turnGap?: number; turnLift?: number } = {},
): { positions: ReadonlyMap<string, { x: number; y: number }>; maxRadius: number } {
  const baseRadius = opts.baseRadius ?? 240
  const radialStep = opts.radialStep ?? 26
  const angularStep = opts.angularStep ?? 0.62
  const turnGap = opts.turnGap ?? 0.5
  const turnLift = opts.turnLift ?? 18
  const positions = new Map<string, { x: number; y: number }>()
  let angle = -Math.PI / 2
  let radius = baseRadius
  let previousTurn: number | null = null
  tools.forEach(tool => {
    if (previousTurn !== null && tool.turn !== previousTurn) {
      angle += turnGap
      radius += turnLift
    }
    positions.set(tool.id, { x: radius * Math.cos(angle), y: radius * Math.sin(angle) })
    previousTurn = tool.turn
    angle += angularStep
    radius += radialStep
  })
  const maxRadius = tools.length === 0 ? baseRadius : radius - radialStep
  return { positions, maxRadius }
}

/**
 * Scale that fits the fixed-size web plane into the measured container
 * (never enlarging past 1:1, never shrinking past 0.35 so labels stay
 * legible). Zero or unknown measurements read as 1 — jsdom and the first
 * paint before measurement.
 */
export function fitScale(
  containerWidth: number,
  containerHeight: number,
  viewWidth: number,
  viewHeight: number,
  margin = 32,
): number {
  if (containerWidth <= 0 || containerHeight <= 0) return 1
  const scale = Math.min(
    (containerWidth - margin) / viewWidth,
    (containerHeight - margin) / viewHeight,
    1,
  )
  return Math.max(0.35, scale)
}

/** One line of an agent's todo list (`todo/write` whole-list snapshots). */
export interface SwarmTodo {
  readonly content: string
  readonly status: 'pending' | 'in_progress' | 'completed'
}

/**
 * The agent's current todo list: the last `todo/write` snapshot in its own
 * window (whole-list, last-write-wins — the same fold DSH's projection uses).
 * Null before the first write; malformed rows are skipped.
 */
export function todosFromEntries(entries: readonly LiveEntryLike[]): SwarmTodo[] | null {
  let todos: SwarmTodo[] | null = null
  for (const entry of entries) {
    const row = asRecord(entry)
    if (row === null || row['type'] !== 'event') continue
    const event = asRecord(row['event'])
    if (event === null || event['type'] !== 'todo/write') continue
    const data = asRecord(event['data'])
    const list = data === null ? undefined : data['todos']
    if (!Array.isArray(list)) continue
    const folded: SwarmTodo[] = []
    for (const item of list) {
      const record = asRecord(item)
      const content = record === null ? undefined : record['content']
      const status = record?.['status']
      if (typeof content !== 'string' || content === '') continue
      if (status !== 'pending' && status !== 'in_progress' && status !== 'completed') continue
      folded.push({ content, status })
    }
    if (folded.length > 0) todos = folded
  }
  return todos
}

/**
 * Ambient sweep: while nothing is hot, history still breathes. Each edge gets
 * a dim pulse in staggered order — one lap of the web per period — so an idle
 * session shows the ORDER its tools ran in, on repeat. Hot edges keep their
 * own brighter pulse; the sweep only fills the cold ones.
 */
export function sweepProgress(
  index: number,
  now: number,
  opts: { period?: number; step?: number; travel?: number } = {},
): number | null {
  const period = opts.period ?? 6000
  const step = opts.step ?? 300
  const travel = opts.travel ?? 1500
  const phase = ((now % period) + period) % period
  const t = phase - index * step
  if (t < 0 || t > travel) return null
  return t / travel
}

/** The robot body a node wears; each variant is its own drawing. */
export type RobotVariant =
  | 'generic' | 'shell' | 'job' | 'read' | 'write' | 'search' | 'todo' | 'fetch'
  | 'agent' | 'root'

/** Visual identity of one tool family: a text glyph, its color, and its robot. */
export interface ToolVisual {
  readonly glyph: string
  readonly color: string
  readonly variant: RobotVariant
}

const TOOL_VISUALS: readonly { readonly pattern: RegExp; readonly visual: ToolVisual }[] = [
  { pattern: /^(pwsh|powershell|shell|bash|cmd|terminal|subprocess)/i, visual: { glyph: '▸', color: '#2f9e6f', variant: 'shell' } },
  { pattern: /^job_/i, visual: { glyph: '▤', color: '#2f9e6f', variant: 'job' } },
  { pattern: /^(read|cat|view|open|ls|list)/i, visual: { glyph: '◧', color: '#4aa3df', variant: 'read' } },
  { pattern: /^(write|edit|create|patch|apply)/i, visual: { glyph: '✎', color: '#8a7dff', variant: 'write' } },
  { pattern: /^(grep|search|find|query)/i, visual: { glyph: '⌕', color: '#d98a2b', variant: 'search' } },
  { pattern: /^(todo|task|plan)/i, visual: { glyph: '☑', color: '#2f9e6f', variant: 'todo' } },
  { pattern: /^(fetch|web|http|curl)/i, visual: { glyph: '☍', color: '#4aa3df', variant: 'fetch' } },
]

const GENERIC_TOOL: ToolVisual = { glyph: '⚙', color: '#9aa4b2', variant: 'generic' }

/** The tool's family glyph and color — one home for the mapping the view draws. */
export function toolGlyph(name: string): ToolVisual {
  for (const { pattern, visual } of TOOL_VISUALS) {
    if (pattern.test(name)) return visual
  }
  return GENERIC_TOOL
}

/** One run of consecutive tools belonging to the same turn. */
export interface TurnGroup {
  readonly turn: number
  readonly startIndex: number
  readonly endIndex: number
}

/**
 * Consecutive same-turn tools as groups, so the ring can mark where each turn
 * begins and ends. Tools arrive in log order, so a turn's work is contiguous.
 */
export function turnGroups(tools: readonly ActivityTool[]): TurnGroup[] {
  const groups: TurnGroup[] = []
  tools.forEach((tool, index) => {
    const last = groups[groups.length - 1]
    if (last !== undefined && last.turn === tool.turn) {
      groups[groups.length - 1] = { turn: last.turn, startIndex: last.startIndex, endIndex: index }
    } else {
      groups.push({ turn: tool.turn, startIndex: index, endIndex: index })
    }
  })
  return groups
}

/** One selectable accent scheme for the web. */
export interface SwarmPalette {
  readonly id: string
  readonly label: string
  /** Fixed accent; absent means the animated gradient. */
  readonly accent?: string
}

export const SWARM_PALETTES: readonly SwarmPalette[] = [
  { id: 'aurora', label: '律动渐变' },
  { id: 'cyan', label: '极光青', accent: '#39d0d8' },
  { id: 'amber', label: '琥珀', accent: '#e0a23c' },
  { id: 'violet', label: '紫罗兰', accent: '#8a7dff' },
  { id: 'green', label: '松绿', accent: '#2f9e6f' },
]

/**
 * The palette's accent at `now`. A fixed palette is constant; the default
 * animated one walks the hue wheel slowly (a full cycle every 18s) so the
 * web's light keeps breathing even when nothing is running.
 */
export function paletteAccent(palette: SwarmPalette, now: number): string {
  if (palette.accent !== undefined) return palette.accent
  const hue = Math.round((now / 50) % 360)
  return `hsl(${hue}, 72%, 64%)`
}

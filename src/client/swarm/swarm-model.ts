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

import { describe, expect, it } from 'vitest'
import { buildLineageGraph, type SessionSummaryLike } from '../src/client/graph/graph-model.ts'
import { layoutLayered } from '../src/client/graph/graph-layout.ts'

/**
 * M0 gate 10: performance and termination at scale.
 *
 * The fixtures are generated from a fixed-seed LCG so every rerun builds the
 * exact same graph. Timings are recorded in docs/superpowers/m0-verification.md;
 * the assertions here are bounds loose enough to not flake on a slow machine
 * but tight enough to catch a quadratic blowup (O(n^2) would still pass, an
 * exponential or an accidental n^3 would not).
 */

const N = 500
const WALL_CLOCK_BUDGET_MS = 5000

/** Deterministic linear congruential generator — same sequence on every run. */
const lcg = (seed: number): (() => number) => {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }
}

const summary = (id: string, extra: Partial<SessionSummaryLike> = {}): SessionSummaryLike =>
  ({ id, createdAt: 0, running: false, available: true, ...extra })

const timed = (label: string, run: () => void): number => {
  const started = performance.now()
  run()
  const elapsed = performance.now() - started
  // Recorded by hand into the verification doc; printed so `vitest run` shows it.
  console.log(`    [gate 10] ${label}: ${elapsed.toFixed(1)} ms`)
  return elapsed
}

const randomLineage = (): SessionSummaryLike[] => {
  const rand = lcg(20261017)
  const out: SessionSummaryLike[] = []
  for (let i = 0; i < N; i += 1) {
    const id = `s${i}`
    // ~70% fork off an earlier node, the rest start their own lineage.
    const parent = i > 0 && rand() < 0.7 ? `s${Math.floor(rand() * i)}` : undefined
    out.push(summary(id, {
      parentId: parent,
      createdAt: i + 1,
      running: i % 17 === 0,
      cwd: i % 5 === 0 ? 'C:/work' : 'C:/other',
    }))
  }
  return out
}

const chain = (): SessionSummaryLike[] =>
  Array.from({ length: N }, (_, i) =>
    summary(`c${i}`, { parentId: i === 0 ? undefined : `c${i - 1}`, createdAt: i + 1 }))

const star = (): SessionSummaryLike[] => [
  summary('hub', { createdAt: 0 }),
  ...Array.from({ length: N - 1 }, (_, i) => summary(`leaf${i}`, { parentId: 'hub', createdAt: i + 1 })),
]

const ring = (): SessionSummaryLike[] =>
  Array.from({ length: N }, (_, i) => summary(`r${i}`, { parentId: `r${(i + 1) % N}`, createdAt: i + 1 }))

const memberSet = (summaries: readonly SessionSummaryLike[]): Set<string> =>
  new Set(summaries.map(s => s.id))

describe('gate 10: graph scale', () => {
  it('builds and lays out a 500-node random lineage within budget', () => {
    const summaries = randomLineage()
    const buildMs = timed('random lineage buildLineageGraph', () => {
      expect(buildLineageGraph(summaries, memberSet(summaries)).nodes.size).toBe(N)
    })
    const layoutMs = timed('random lineage layoutLayered', () => {
      const graph = buildLineageGraph(summaries, memberSet(summaries))
      expect(layoutLayered(graph).positions.size).toBe(N)
    })
    expect(buildMs).toBeLessThan(WALL_CLOCK_BUDGET_MS)
    expect(layoutMs).toBeLessThan(WALL_CLOCK_BUDGET_MS)
  })

  it('keeps a 500-deep chain on one row without blowing the recursion stack', () => {
    const summaries = chain()
    const result = timed('500 chain build + layout', () => {
      const graph = buildLineageGraph(summaries, memberSet(summaries))
      const laid = layoutLayered(graph)
      const ys = [...laid.positions.values()].map(p => p.y)
      expect(new Set(ys).size).toBe(1)
      expect(laid.positions.get(`c${N - 1}`)).toEqual({ x: (N - 1) * 240, y: 0 })
    })
    expect(result).toBeLessThan(WALL_CLOCK_BUDGET_MS)
  })

  it('lays out a 499-child star with distinct leaf rows', () => {
    // Also exercises the Math.min/max spread over a large sibling list.
    const summaries = star()
    const result = timed('499 star build + layout', () => {
      const graph = buildLineageGraph(summaries, memberSet(summaries))
      const laid = layoutLayered(graph)
      const leafRows = new Set(
        [...laid.positions.entries()]
          .filter(([id]) => graph.nodes.get(id)?.childCount === 0)
          .map(([, p]) => p.y),
      )
      expect(leafRows.size).toBe(N - 1)
      expect(laid.height).toBeLessThanOrEqual((N - 1) * 96 + 72)
    })
    expect(result).toBeLessThan(WALL_CLOCK_BUDGET_MS)
  })

  it('breaks a 500-node cycle instead of hanging', () => {
    const summaries = ring()
    const result = timed('500 ring build + layout', () => {
      const graph = buildLineageGraph(summaries, memberSet(summaries))
      expect(graph.nodes.size).toBe(N)
      expect(graph.roots.length).toBeGreaterThan(0)
      const laid = layoutLayered(graph)
      // Every node placed: a cycle must not leave nodes positionless.
      expect(laid.positions.size).toBe(N)
    })
    expect(result).toBeLessThan(WALL_CLOCK_BUDGET_MS)
  })

  it('sanity: positions stay finite and agree with depth', () => {
    const summaries = randomLineage()
    const graph = buildLineageGraph(summaries, memberSet(summaries))
    const laid = layoutLayered(graph)
    for (const [id, point] of laid.positions) {
      expect(Number.isFinite(point.x)).toBe(true)
      expect(Number.isFinite(point.y)).toBe(true)
      expect(point.y).toBeGreaterThanOrEqual(0)
      expect(point.x).toBe((graph.nodes.get(id)?.depth ?? 0) * 240)
    }
  })
})

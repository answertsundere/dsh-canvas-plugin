export type SessionId = string

export interface CanvasNode {
  readonly id: SessionId
  readonly parentId: SessionId | null
  readonly externalParent: boolean
  readonly title: string
  readonly createdAt: number
  readonly running: boolean
  readonly available: boolean
  readonly seeded: boolean
  readonly cwd: string | null
  readonly childCount: number
  /** BFS depth from the nearest root; 0 for roots, including external-parent and cycle-promoted roots. */
  readonly depth: number
}

export interface CanvasGraph {
  readonly nodes: ReadonlyMap<SessionId, CanvasNode>
  readonly roots: readonly SessionId[]
  readonly maxDepth: number
}

export type LaunchMode = 'now' | 'later'

export interface ForkRequest {
  readonly sessionId: SessionId
  readonly atSeq: number
  readonly instruction?: string
  readonly launch: LaunchMode
  readonly requestId: string
}

export interface BranchTurn {
  readonly index: number
  readonly userMessage?: string
  readonly assistantSummary?: string
  readonly tools: readonly { readonly name: string; readonly status: string }[]
  readonly endedAs?: string
  readonly synthetic: boolean
}

export interface BranchSegment {
  readonly sessionId: SessionId
  readonly inheritedCount: number
  readonly turns: readonly BranchTurn[]
}

export interface TurnDiff {
  readonly left?: BranchTurn
  readonly right?: BranchTurn
  readonly equal: boolean
}

export interface ComparisonResult {
  readonly a: BranchSegment
  readonly b: BranchSegment
  readonly turnDiffs: readonly TurnDiff[]
  readonly toolCountDiff: number
  readonly bothFailed: boolean
  readonly lastConclusion: { readonly side: 'a' | 'b' | 'both' | 'none'; text: string }
}
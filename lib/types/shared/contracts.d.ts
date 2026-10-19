export type SessionId = string;
export interface CanvasNode {
    readonly id: SessionId;
    readonly parentId: SessionId | null;
    readonly externalParent: boolean;
    readonly title: string;
    readonly createdAt: number;
    readonly running: boolean;
    readonly available: boolean;
    readonly seeded: boolean;
    readonly cwd: string | null;
    readonly childCount: number;
    /** BFS depth from the nearest root; 0 for roots, including external-parent and cycle-promoted roots. */
    readonly depth: number;
    /** Set when this session is a member of the workspace's agent team. */
    readonly teamRole?: 'lead' | 'teammate';
    /** In-progress shared task subjects owned by this session. */
    readonly teamTasks?: readonly string[];
}
export interface CanvasGraph {
    readonly nodes: ReadonlyMap<SessionId, CanvasNode>;
    readonly roots: readonly SessionId[];
    readonly maxDepth: number;
}
export type LaunchMode = 'now' | 'later';
export interface ForkRequest {
    readonly sessionId: SessionId;
    readonly atSeq: number;
    readonly instruction?: string;
    readonly launch: LaunchMode;
    readonly requestId: string;
}
export interface BranchTurn {
    readonly index: number;
    /**
     * First and last event seq this turn owns inside the branch segment.
     *
     * Required by the cut-point mapping the design spec pins down: a row's fork
     * `atSeq` is the seq immediately before the *next* row's first event, and the
     * last row cuts at its own last event. Without these the UI could not name a
     * real cut point, and M0 gate 3 is a per-seq check against known material.
     */
    readonly firstSeq: number;
    readonly lastSeq: number;
    readonly userMessage?: string;
    readonly assistantSummary?: string;
    readonly tools: readonly {
        readonly name: string;
        readonly status: string;
        /** One-line bounded preview of the call arguments. */
        readonly preview?: string;
    }[];
    readonly endedAs?: string;
    readonly synthetic: boolean;
}
export interface BranchSegment {
    readonly sessionId: SessionId;
    readonly inheritedCount: number;
    readonly turns: readonly BranchTurn[];
}
export interface TurnDiff {
    readonly left?: BranchTurn;
    readonly right?: BranchTurn;
    readonly equal: boolean;
}
export interface ComparisonResult {
    readonly a: BranchSegment;
    readonly b: BranchSegment;
    readonly turnDiffs: readonly TurnDiff[];
    readonly toolCountDiff: number;
    readonly bothFailed: boolean;
    readonly lastConclusion: {
        readonly side: 'a' | 'b' | 'both' | 'none';
        text: string;
    };
}

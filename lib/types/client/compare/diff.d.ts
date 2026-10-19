import type { BranchSegment, ComparisonResult } from '../../shared/contracts.ts';
/**
 * Deterministic branch comparison.
 *
 * Alignment is **positional over each branch's own work**: turn 1 against turn 1,
 * and so on. There is deliberately no semantic pairing — positional alignment is
 * the only rule that produces the same answer twice, and the design spec rejects
 * semantic matching for v1. Each side's inherited prefix length is reported by
 * its segment rather than normalized away, because two branches may inherit
 * different amounts.
 *
 * Synthetic fork-closer turns are dropped before alignment. They exist only to
 * balance a cut made inside an open turn, are identical in every branch by
 * construction, and would otherwise add the same noise row to every comparison.
 * They remain visible in the segment itself, so the timeline can still show them.
 */
export declare function compareBranches(a: BranchSegment, b: BranchSegment): ComparisonResult;

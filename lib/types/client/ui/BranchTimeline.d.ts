import { type FC } from 'react';
import type { LiveTail } from '../live/live-tail.ts';
import type { BranchTurn } from '../../shared/contracts.ts';
export interface BranchTimelineProps {
    readonly turns: readonly BranchTurn[];
    /** Events this session inherited from its own fork point; excluded from comparison. */
    readonly inheritedCount: number;
    onFork(rowIndex: number): void;
    /** Whether the shared-directory warning applies to this branch. */
    readonly cwdWarning: boolean;
    /**
     * The branch's in-flight assistant output, when one is streaming. Rendered
     * above the settled turns: it is where the newest output arrives, and it
     * disappears on its own when the durable message settles it.
     */
    readonly live?: LiveTail | null;
    /** The session's latest conclusion, so the answer is visible without opening 对话. */
    readonly conclusion?: string | null;
}
/**
 * The fork cut for a timeline row: the last event seq that row owns.
 *
 * The design spec words this as "the seq immediately before the next row's
 * first event", which is equivalent **only while seqs are contiguous**. They are
 * not: a gap between rows makes that value a seq that is not an event, and DSH
 * refuses a fork whose `atSeq` is not a real event
 * (`api/session-controller/src/commands.ts:246-254` — "event N does not exist").
 * This row's own last seq is always real, and cutting there inherits the row in
 * full while excluding the next one, which is exactly what "fork here" means.
 */
export declare function cutSeqAt(turns: readonly BranchTurn[], rowIndex: number): number | undefined;
export declare const BranchTimeline: FC<BranchTimelineProps>;

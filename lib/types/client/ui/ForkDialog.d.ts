import { type FC } from 'react';
import type { LaunchMode } from '../../shared/contracts.ts';
export interface ForkDialogProps {
    readonly open: boolean;
    /** Inclusive cut seq: the last event the new branch inherits. */
    readonly atSeq: number;
    /** The source session's own inherited prefix length, when it is itself a fork. */
    readonly inheritedCount: number;
    readonly busy?: boolean;
    readonly error?: string;
    onCancel(): void;
    onConfirm(instruction: string, mode: LaunchMode): void;
}
/**
 * The fork confirmation.
 *
 * It shows the real cut rather than a vague "from here": the number of events
 * the child will inherit is `atSeq + 1`, because DSH records
 * `inheritedEventCount = boundary + 1` for an inclusive boundary. The design
 * spec's own example prose says "seq 47 · inherits 47 events", which is off by
 * one; the code is what runs.
 *
 * The shared-directory warning is permanent, not a dismissible toast: v1
 * branches always share the source cwd (the fork API has no cwd parameter), so
 * two parallel branches can overwrite each other's files.
 */
export declare const ForkDialog: FC<ForkDialogProps>;

/**
 * Live tail: one session's in-flight assistant output, as plain data.
 *
 * DSH streams an attempt as client-only `assistant/live-chunk` rows that sit
 * between durable seqs (`@deepseek-ai/dsh-api-session-controller/client`
 * contract/events.ts), and settles them atomically with a durable
 * `assistant/message` or `assistant/attempt` (the same pair the contract calls
 * `SessionAssistantSettlementEntry`). This module turns that stream into what
 * the canvas shows: the current attempt's reasoning text, answer text, and the
 * tool call being emitted.
 *
 * Everything here is defensive on purpose: window rows cross a transport
 * boundary, so malformed rows are skipped rather than thrown on — a broken row
 * must cost a frame, never the tab.
 */
/** Minimal shape of one window row; the real rows are `SessionEventLikeEntry`. */
export interface LiveEntryLike {
    readonly type: string;
    readonly event: {
        readonly type: string;
        readonly seq: number;
        readonly data?: unknown;
    };
}
/** What the canvas renders of an in-flight attempt. */
export interface LiveTail {
    readonly attemptId: string;
    readonly turn: number;
    readonly step: number;
    /** Concatenated reasoning blocks, in emission order. */
    readonly reasoning: string;
    /** Concatenated answer-text blocks, in emission order. */
    readonly text: string;
    /** The most recent tool call being emitted, when one is in flight. */
    readonly tool?: {
        readonly name: string;
        readonly arguments: string;
    };
    /**
     * Kind of the last block emitted — `tool` while a call streams, `thinking`
     * otherwise. Drives the node's status hint; the canvas never has to guess
     * from a timestamp.
     */
    readonly phase: 'thinking' | 'tool';
    /** Highest transient seq included; lets callers compare staleness. */
    readonly seq: number;
}
/**
 * The live tail of the window's most recent attempt, or null when nothing is
 * streaming (or the latest attempt already settled).
 */
export declare function liveTailFromEntries(entries: readonly LiveEntryLike[]): LiveTail | null;
/** One-line preview of an in-flight attempt for a node card. */
export interface TailSnippet {
    readonly label: '输出' | '推理' | '工具';
    readonly text: string;
}
/**
 * The most recent output as a bounded one-liner: the answer text wins, then
 * the reasoning. Both are shown tail-anchored — a streaming line is read from
 * its end, so the newest characters are the ones worth the width.
 */
export declare function tailSnippet(tail: LiveTail, limit: number): TailSnippet | null;

import { type FC } from 'react';
import type { AgentSwarmState } from '../controllers/agent-swarm-controller.ts';
export interface AgentSwarmViewProps {
    readonly swarm: AgentSwarmState;
    onClose(): void;
    /** Clicking a teammate robot jumps the main canvas to that session. */
    onSelectAgent?(id: string): void;
    /** Double-clicking the root opens the session in the conversation. */
    onOpenRoot?(): void;
    /**
     * Frozen clock for tests and screenshots; absent → the view animates itself
     * (the controller only timestamps activity, the view is what moves).
     */
    readonly nowMs?: number;
}
/**
 * The 「Agent 实况」 overlay: one session's agent web.
 *
 * Structure: concentric silk rings, the root at the center, its subagents on
 * the inner ring, the session's own tool history on the outer ring grouped by
 * turn (each group's span marked on the rim). Motion: while an agent or tool
 * is hot, a comet crawls its silk toward the parent; when nothing is hot, a
 * dim sweep walks every thread in work order, on repeat — the web is never
 * still, and the sweep reads as the order the work actually ran in.
 */
export declare const AgentSwarmView: FC<AgentSwarmViewProps>;

import { layoutActivity, layoutSwarm, type SessionActivity, type SwarmTodo } from '../swarm/swarm-model.ts';
import { type LiveTail, type TailSnippet } from '../live/live-tail.ts';
import type { LiveWindowLike } from './graph-controller.ts';
/** One team member as the projection publishes it. */
export interface TeamMemberLike {
    readonly id: string;
    readonly name: string;
    readonly role: 'lead' | 'teammate';
    readonly phase: string;
}
/** One shared task as the projection publishes it. */
export interface TeamTaskLike {
    readonly id: string;
    readonly subject: string;
    readonly status: string;
    readonly ownerName?: string;
}
/** The DSH agent team rooted at the inspected session, when one exists. */
export interface TeamLike {
    readonly members: readonly TeamMemberLike[];
    readonly tasks: readonly TeamTaskLike[];
}
/** What the swarm needs from the host, structural so tests need no DSH. */
export interface AgentSwarmDeps {
    /** Live event window over one session — the same adapter the canvas uses. */
    liveWindow(sessionId: string): Promise<LiveWindowLike>;
    /** Current session rows, for titles and coarse running flags. */
    listSummaries(): readonly {
        id: string;
        title?: string;
        running: boolean;
    }[];
    /** The session's agent team (members + shared tasks), from the projection. */
    teamOf?(sessionId: string): TeamLike | null;
    /** Archived sessions are user-put-away; they never join the web. */
    isArchived?(sessionId: string): boolean;
}
/** One agent chip on the web. */
export interface AgentSwarmAgent {
    readonly id: string;
    readonly label: string;
    readonly depth: number;
    readonly status: 'streaming' | 'running' | 'idle' | 'failed';
    /** What the agent is emitting right now, when anything is. */
    readonly snippet: TailSnippet | null;
    /** The raw tail, for the detail side panel of the swarm view. */
    readonly tail: LiveTail | null;
    /** Team role, when this agent is a member of the session's agent team. */
    readonly role?: 'lead' | 'teammate';
    /** Tools this agent has run (from its own window). */
    readonly toolCount: number;
    /** The member's own latest conclusion, when one exists. */
    readonly conclusion: string | null;
    /** The lead's job description for this member. */
    readonly description?: string;
}
export interface AgentSwarmState {
    readonly rootId: string;
    readonly rootLabel: string;
    /** What the inspected session itself is emitting, when anything is. */
    readonly rootSnippet: TailSnippet | null;
    readonly agents: readonly AgentSwarmAgent[];
    readonly edges: readonly {
        from: string;
        to: string;
    }[];
    readonly layout: ReturnType<typeof layoutSwarm>;
    /** The session's own work (turns and tools), for the activity ring. */
    readonly activity: SessionActivity;
    readonly toolLayout: ReturnType<typeof layoutActivity>;
    /** Each node's current todo list (root and agents), when it has written one. */
    readonly todos: ReadonlyMap<string, readonly SwarmTodo[]>;
    /** The session's agent team, when one exists (members + shared tasks). */
    readonly team: TeamLike | null;
    /** The session's latest conclusion, tail-anchored, for the root card. */
    readonly rootConclusion: string | null;
    /**
     * Last activity per node id (agents and `tool:<callId>` entries — each
     * incoming edge's heat). The view feeds these into `pulseProgress` at each
     * animation frame — the controller never animates, it only timestamps.
     */
    readonly heat: ReadonlyMap<string, number>;
}
export interface AgentSwarmController {
    state(): AgentSwarmState;
    subscribe(listener: () => void): () => void;
    /** Releases every open window. Closing the view must leave no retains. */
    dispose(): void;
}
/**
 * Live swarm over one session: the agent web for the 「实况」 view.
 *
 * Enumeration rides the parent's own event window (`subagent/catalog` durable
 * events), so a freshly spawned agent arrives as an ordinary window change.
 * Each agent gets the same live window the canvas uses, which is what feeds
 * both its snippet and its edge's heat.
 */
export declare function createAgentSwarmController(deps: AgentSwarmDeps, rootId: string): AgentSwarmController;

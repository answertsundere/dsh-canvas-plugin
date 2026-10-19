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
import type { LiveEntryLike } from '../live/live-tail.ts';
/** Minimal shape of one window row; identical to the live-tail input. */
export interface SwarmEntrySource {
    readonly sessionId: string;
    readonly entries: readonly unknown[];
}
export interface AgentNode {
    readonly id: string;
    readonly parentId: string | null;
    /** 0 = the inspected session, 1 = its direct subagents, 2 = theirs. */
    readonly depth: number;
    readonly label?: string;
    readonly mode: 'one-shot' | 'continuable' | 'unknown';
    /** The lead's job description for this member (from team/member events). */
    readonly description?: string;
}
export interface SwarmEdge {
    readonly from: string;
    readonly to: string;
}
export interface SwarmLayout {
    readonly positions: ReadonlyMap<string, {
        x: number;
        y: number;
    }>;
    readonly radius: number;
}
/** Reads a cached team member description by session id. */
export declare function getTeamDescription(id: string): string | undefined;
/**
 * The swarm under `rootId`, merged append-only across the windows that were
 * readable. Only the root and already-known agents contribute children, so a
 * window we could not place never invents membership; the first sighting of a
 * child wins (catalog events are append-only facts, never retractions).
 */
export declare function agentsFromWindows(windows: readonly SwarmEntrySource[], rootId: string, cap?: number): AgentNode[];
/** One spoke per non-root agent. Edges point parent → child. */
export declare function swarmEdges(agents: readonly AgentNode[], rootId: string): SwarmEdge[];
/**
 * Radial web layout: the root at the origin, depth-1 agents evenly spaced on
 * the main ring, deeper agents orbiting their own parent on a smaller ring.
 * The ring radius adapts to the member count so station cards never overlap.
 * Deterministic — the same agent set always draws the same web.
 */
export declare function layoutSwarm(agents: readonly AgentNode[], rootId: string, opts?: {
    radius?: number;
    childRadius?: number;
    cardWidth?: number;
}): SwarmLayout;
/**
 * Crawl progress of an edge's pulse: 0→1 per cycle while the edge is hot
 * (recent activity), then one full grace cycle to crawl home, then `null` —
 * a cold edge draws no dot. Pure in `now`, so tests and the rAF loop share it.
 */
export declare function pulseProgress(lastActivityAt: number, now: number, cycleMs?: number, graceMs?: number): number | null;
/** One tool call the inspected session has made, for the activity ring. */
export interface ActivityTool {
    readonly id: string;
    readonly name: string;
    readonly status: 'pending' | 'ok' | 'error';
    readonly turn: number;
    /** One-line preview of the call arguments, bounded for the chip. */
    readonly preview?: string;
    /** The result's error message, when the tool failed. */
    readonly error?: string;
}
/** What the inspected session itself is working through, from its own log. */
export interface SessionActivity {
    /** Completed turns. */
    readonly turnCount: number;
    readonly openTurn: boolean;
    readonly currentTurn: number | null;
    /** Most recent tools, oldest first. */
    readonly tools: readonly ActivityTool[];
    readonly pendingToolId: string | null;
}
/**
 * The session's own work, folded from its durable events: turn counting plus
 * `tool/call`→`tool/result` pairing (the same discriminator branch-segment
 * uses). A long single-agent task shows up here as turns accumulating and a
 * permanently pending tool while it runs.
 */
export declare function activityFromEntries(entries: readonly LiveEntryLike[], cap?: number): SessionActivity;
/**
 * The activity spiral: tools laid along a spider-web spiral in execution
 * order — each step turns further and drifts outward, and a turn boundary
 * adds an extra angular gap plus a small radial lift, so the shape reads as a
 * process (turn 1 here, turn 2 there) instead of a uniform ring. Newest work
 * sits furthest out, which is where the eye lands last.
 */
export declare function layoutActivity(tools: readonly ActivityTool[], opts?: {
    baseRadius?: number;
    maxRadius?: number;
    angularStep?: number;
    turnGap?: number;
}): {
    positions: ReadonlyMap<string, {
        x: number;
        y: number;
    }>;
    maxRadius: number;
};
/**
 * Scale that fits the fixed-size web plane into the measured container
 * (never enlarging past 1:1, never shrinking past 0.35 so labels stay
 * legible). Zero or unknown measurements read as 1 — jsdom and the first
 * paint before measurement.
 */
export declare function fitScale(containerWidth: number, containerHeight: number, viewWidth: number, viewHeight: number, margin?: number): number;
/** One line of an agent's todo list (`todo/write` whole-list snapshots). */
export interface SwarmTodo {
    readonly content: string;
    readonly status: 'pending' | 'in_progress' | 'completed';
}
/**
 * The agent's current todo list: the last `todo/write` snapshot in its own
 * window (whole-list, last-write-wins — the same fold DSH's projection uses).
 * Null before the first write; malformed rows are skipped.
 */
export declare function todosFromEntries(entries: readonly LiveEntryLike[]): SwarmTodo[] | null;
/**
 * Ambient sweep: while nothing is hot, history still breathes. Each edge gets
 * a dim pulse in staggered order — one lap of the web per period — so an idle
 * session shows the ORDER its tools ran in, on repeat. Hot edges keep their
 * own brighter pulse; the sweep only fills the cold ones.
 */
export declare function sweepProgress(index: number, now: number, opts?: {
    period?: number;
    step?: number;
    travel?: number;
}): number | null;
/** The robot body a node wears; each variant is its own drawing. */
export type RobotVariant = 'generic' | 'shell' | 'job' | 'read' | 'write' | 'search' | 'todo' | 'fetch' | 'agent' | 'root';
/** Visual identity of one tool family: a text glyph, its color, and its robot. */
export interface ToolVisual {
    readonly glyph: string;
    readonly color: string;
    readonly variant: RobotVariant;
}
/** The tool's family glyph and color — one home for the mapping the view draws. */
export declare function toolGlyph(name: string): ToolVisual;
/** One run of consecutive tools belonging to the same turn. */
export interface TurnGroup {
    readonly turn: number;
    readonly startIndex: number;
    readonly endIndex: number;
}
/**
 * Consecutive same-turn tools as groups, so the ring can mark where each turn
 * begins and ends. Tools arrive in log order, so a turn's work is contiguous.
 */
export declare function turnGroups(tools: readonly ActivityTool[]): TurnGroup[];
/** One selectable accent scheme for the web. */
export interface SwarmPalette {
    readonly id: string;
    readonly label: string;
    /** Fixed accent; absent means the animated gradient. */
    readonly accent?: string;
}
export declare const SWARM_PALETTES: readonly SwarmPalette[];
/**
 * The palette's accent at `now`. A fixed palette is constant; the default
 * animated one walks the hue wheel slowly (a full cycle every 18s) so the
 * web's light keeps breathing even when nothing is running.
 */
export declare function paletteAccent(palette: SwarmPalette, now: number): string;
/** A team member as the session list's `agentTeam` projection publishes it. */
export interface TeamMemberRow {
    readonly id: string;
    readonly name: string;
    readonly role: 'lead' | 'teammate';
}
/**
 * Team members of every projected session, keyed by member session id — the
 * canvas uses this to show a teammate's team name instead of its prompt, and
 * to badge it as a team member.
 */
export declare function teamMembersFromList(snapshot: unknown): ReadonlyMap<string, TeamMemberRow>;
/**
 * Pan adjustment that keeps the point under the cursor fixed while the scale
 * changes from `oldScale` to `newScale` — zoom-at-cursor, not zoom-at-center.
 */
export declare function anchoredPan(pan: {
    x: number;
    y: number;
}, oldScale: number, newScale: number, cursor: {
    x: number;
    y: number;
}, center: {
    x: number;
    y: number;
}): {
    x: number;
    y: number;
};
/** One ring chip after collapsing consecutive same-name tools. */
export interface CollapsedTool {
    /** The most recent tool of the run — its id, status and preview represent the chip. */
    readonly tool: ActivityTool;
    readonly count: number;
}
/**
 * Collapse CONSECUTIVE same-name tools into one chip with a ×N badge — a
 * teammate that fired send_message four times in a row is one job done four
 * times, not four chips of clutter. Non-consecutive same-name tools stay
 * separate: their positions tell the order, and merging them would lie.
 */
export declare function collapseTools(tools: readonly ActivityTool[]): CollapsedTool[];
/**
 * Team tasks ordered for the board: in-progress work on top, then pending,
 * then finished — the order the user needs, not the order the log happened
 * to record. Stable within each band.
 */
export declare function orderTeamTasks<T extends {
    readonly status: string;
}>(tasks: readonly T[]): T[];
/**
 * In-progress shared task subjects per owning session, folded from every
 * projected team in the list snapshot — the canvas shows these on member
 * cards so the board and the map tell the same story.
 */
export declare function teamTasksByOwner(snapshot: unknown): ReadonlyMap<string, readonly string[]>;
/** Maps a raw tool name to its Chinese label; unknown tools keep the raw name. */
export declare function toolLabel(name: string): string;

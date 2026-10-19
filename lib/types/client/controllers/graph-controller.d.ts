import type { ComparisonResult, LaunchMode, SessionId } from '../../shared/contracts.ts';
import { type RuntimeHint } from '../adapters/runtime-status-adapter.ts';
import { type SessionEventLike } from '../compare/branch-segment.ts';
import { type LiveEntryLike } from '../live/live-tail.ts';
import { type ForkDeps, type ForkResult } from './fork-controller.ts';
import { type CanvasModel } from '../ui/canvas-model.ts';
/**
 * An open window over one session's event stream. Structural mirror of the
 * event-stream adapter's `LiveWindowSource`, so tests need no host.
 */
export interface LiveWindowLike {
    readonly sessionId: string;
    entries(): readonly LiveEntryLike[];
    subscribe(listener: () => void): () => void;
    release(): void;
}
/**
 * Everything the controller needs from DSH, expressed structurally so tests
 * need no host and the DSH surface stays in `index.ts`.
 */
export interface GraphControllerDeps {
    /** Current session list snapshot, in either client shape. */
    listSnapshot(): unknown;
    /** Current workspace snapshot. */
    workspaceSnapshot(): unknown;
    /** Which workspace the canvas shows, and the cwd to fall back on. */
    scope(): {
        readonly workspaceId: string | null;
        readonly cwd: string | null;
    };
    /** Whether the host link is up. Drives the `unknown` status. */
    isConnected(): boolean;
    /** Latest live hint for a session, when one has been observed. */
    hintOf?(id: SessionId): RuntimeHint | undefined;
    /** Switch the app to a session. */
    openSession(id: SessionId): void;
    /** Fork transaction dependencies, already bound to the real host calls. */
    readonly forkDeps: ForkDeps;
    /** Durable events of one session, for comparison. */
    readEvents(sessionId: SessionId): Promise<readonly SessionEventLike[]>;
    /**
     * Opens a live event window for one running session. Absent → the canvas
     * has no live tails and falls back to the coarse running status.
     */
    liveWindow?(sessionId: SessionId): Promise<LiveWindowLike>;
}
export interface GraphController {
    /** A live view: its properties are getters over the controller's state. */
    model(): CanvasModel;
    refresh(): void;
    select(id: SessionId): void;
    toggleCompare(id: SessionId): void;
    /** Records the term and locates the first match. */
    search(text: string): void;
    /** Jumps to the match AFTER the currently selected one (Enter-to-cycle). */
    searchNext(text: string): void;
    openInChat(id: SessionId): void;
    forkFromRow(sessionId: SessionId, atSeq: number, instruction: string, launch: LaunchMode): Promise<ForkResult>;
    /** Null until exactly two branches are selected, or when their events cannot be read. */
    compare(): Promise<ComparisonResult | null>;
    subscribe(listener: () => void): () => void;
    /** Subtree roots currently collapsed (their descendants are hidden). */
    readonly collapsedNodes: ReadonlySet<SessionId>;
    /** Toggles a subtree between collapsed and expanded. */
    toggleSubtree(id: SessionId): void;
    /** Releases every open live window. Plugin unload must leave no retains. */
    dispose(): void;
}
export declare function createGraphController(deps: GraphControllerDeps): GraphController;

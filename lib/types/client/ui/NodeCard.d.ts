import type { FC, MouseEvent } from 'react';
import type { CanvasNode } from '../../shared/contracts.ts';
import type { StatusBadge } from '../../shared/status.ts';
import type { TailSnippet } from '../live/live-tail.ts';
import type { LayoutPoint } from '../graph/graph-layout.ts';
export interface NodeCardProps {
    readonly node: CanvasNode;
    readonly status: StatusBadge;
    readonly position: LayoutPoint;
    readonly width: number;
    readonly height: number;
    readonly selected: boolean;
    readonly comparing: boolean;
    /** A running sibling shares this node's cwd, so a parallel write is possible. */
    readonly parallelWrite: boolean;
    /** The toolbar query matched this node. */
    readonly highlight: boolean;
    /** The node's in-flight output, when it is streaming. */
    readonly live?: TailSnippet | null;
    /**
     * The node is working right now (thinking/tool or a visible stream): the
     * card breathes a halo in the status's own color so a busy session reads
     * from across the room. The keyframes live in the canvas's injected style.
     */
    readonly active?: boolean;
    /** Older than a day: slightly dimmed so recent work reads first. */
    readonly dimmed?: boolean;
    readonly now: number;
    onClick(event: MouseEvent<HTMLDivElement>, id: string): void;
    /** Opens the session in the conversation view. */
    onOpen?(id: string): void;
    /** Opens the live agent-web view for this session. */
    onInspect?(id: string): void;
    /** Right-click: the canvas-level shortcut menu (fork / inspect / open). */
    onContext?(event: MouseEvent<HTMLDivElement>, id: string): void;
    /** Hover begins — the canvas highlights this node's spokes. */
    onMouseEnter?(id: string): void;
    /** Hover ends. */
    onMouseLeave?(id: string): void;
    /** Subtree collapse: visible when the node has children. */
    collapseToggle?: {
        readonly visible: boolean;
        readonly collapsed: boolean;
        onToggle(): void;
    };
}
export declare const NodeCard: FC<NodeCardProps>;
/** Coarse relative time; the canvas only needs "how long ago" at a glance. */
export declare function relativeTime(now: number, at: number): string;

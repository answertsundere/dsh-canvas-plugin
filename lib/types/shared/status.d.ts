export type StatusKind = 'idle' | 'queued' | 'thinking' | 'tool' | 'awaiting-approval' | 'failed' | 'done' | 'unknown';
export interface StatusBadge {
    readonly kind: StatusKind;
    readonly confirmed: boolean;
    readonly label: string;
    readonly color: string;
}
export declare function badge(kind: StatusKind): StatusBadge;

import type { FC, ReactNode } from 'react';
export type RightPanelTab = 'detail' | 'compare';
export interface RightPanelProps {
    readonly tab: RightPanelTab;
    readonly title?: string;
    /** One prominent action next to the title — the Agent 实况 entry lives here. */
    readonly headerAction?: {
        readonly label: string;
        readonly title?: string;
        onClick(): void;
    };
    onTabChange(tab: RightPanelTab): void;
    onClose(): void;
    readonly children: ReactNode;
}
/** Sliding right-hand container holding the 详情 and 对比 views. */
export declare const RightPanel: FC<RightPanelProps>;

import { type FC } from 'react';
import type { CanvasModel, CanvasView } from './canvas-model.ts';
export interface CanvasTabProps {
    /** Absent until the controller layer is wired in; the tab still boots. */
    readonly canvas?: CanvasModel;
}
export declare const CanvasTab: FC<CanvasTabProps>;
export type { CanvasView };

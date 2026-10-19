export declare const name = "dsh-canvas";
export interface CanvasConfig {
    readonly defaultLayout?: 'lineage' | 'timeline';
    readonly sharedCwdWarning?: boolean;
}
export declare function apply(_ctx: unknown, _config?: CanvasConfig): void;

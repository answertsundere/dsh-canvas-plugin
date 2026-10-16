// config only; must never throw at boot.
export const name = 'dsh-canvas'
export interface CanvasConfig { readonly defaultLayout?: 'lineage' | 'timeline'; readonly sharedCwdWarning?: boolean }
export function apply(_ctx: unknown, _config: CanvasConfig = {}): void { /* config validated in adapters */ }
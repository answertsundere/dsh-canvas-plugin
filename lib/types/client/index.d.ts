import type { Context } from '@deepseek-ai/cordis';
export declare const inject: string[];
/**
 * The canonical retain-label extension every DSH client plugin declares
 * (ui-workspace → workspaceOperation, ui-goal → goalActivation, …). The
 * packages above are devDependencies so the `/client` modules resolve and the
 * merge is checked — `retainOptions` needs no cast because 'canvasNode' is a
 * key of `SessionReferenceSourceMap` here.
 */
declare module '@deepseek-ai/dsh-api-session-controller/client' {
    interface SessionReferenceSourceMap {
        /** Canvas node reads: one-shot event windows and forked-branch prompts. */
        canvasNode: unknown;
    }
}
export declare function apply(ctx: Context): void;

/**
 * Fork transaction: the one place that must never fork twice.
 *
 * Verified against the local checkout at `639ed01539`
 * (`@deepseek-ai/dsh-api-session-controller/client`):
 *
 *   fork(opts: { sessionId; atSeq?; increaseTitle?; onCreated? }): Promise<SessionId>
 *
 * Two properties of that contract drive everything below.
 *
 * 1. `onCreated` observes the catalogued child **before** the optional title
 *    rename, and `fork` also rejects when only that rename fails after creation.
 *    A rejection therefore does not prove the child is absent — so the id
 *    captured by `onCreated` is checked before anything else, and it is a far
 *    stronger signal than reading the error text.
 * 2. `prompt(...)` returns `Promise<RemoteResult<{accepted:true}>>`: it does not
 *    reject on business errors, it resolves `{ ok: false }`. A send that only
 *    catches rejections would read a refused prompt as success.
 */
/** Outcome of one prompt attempt, already unwrapped from `RemoteResult`. */
export type PromptOutcome = {
    readonly ok: true;
} | {
    readonly ok: false;
    readonly error: string;
};
export type ForkPhase = 'validating' | 'forking' | 'launching' | 'done' | 'failed' | 'unverified';
export interface ForkResult {
    /** The child session id, or `''` when no child is known to exist. */
    readonly childId: string;
    readonly phase: ForkPhase;
    readonly error?: string;
    readonly retriedPrompt: boolean;
}
export interface ForkDeps {
    fork(req: {
        sessionId: string;
        atSeq: number;
        increaseTitle: boolean;
        onCreated?: (childId: string) => void;
    }): Promise<string>;
    /**
     * The children of `parentId` currently known to the list snapshot.
     *
     * Diffing this across the fork — rather than just listing the parent's
     * children — is what makes receipt-loss recovery safe. A parent on a canvas
     * almost always *already* has children, because branching is the point; taking
     * "a child of the parent" would return a pre-existing branch and the prompt
     * would be delivered to the wrong session.
     */
    childrenOf(parentId: string): Promise<readonly string[]>;
    using<T>(sessionId: string, op: (send: (text: string, requestId: string) => Promise<PromptOutcome>) => Promise<T>): Promise<T>;
    newRequestId(): string;
}
export interface ForkTransactionRequest {
    readonly sessionId: string;
    /** Inclusive cut seq; a cut inside an open turn is balanced Host-side. */
    readonly atSeq: number;
    readonly instruction?: string;
    readonly launch: 'now' | 'later';
    /** One id per branch launch; retries reuse it so the Host can dedupe. */
    readonly requestId?: string;
}
/**
 * Runs one branch launch: validate → fork once → optionally prompt with a single
 * retry.
 *
 * **Safety property:** `deps.fork` is called at most once on every path. Every
 * uncertain outcome resolves to `unverified` rather than a second fork, because
 * a duplicate child session is not recoverable by the user, while an
 * `unverified` node is visible and inspectable.
 *
 * Recovery does not depend on recognising the error text. A rejection with no
 * child observed always attempts a scan, so a lost receipt is recovered however
 * it was worded; the transport-vs-business heuristic only chooses between the
 * `unverified` and `failed` labels. A misclassification can therefore never
 * produce a duplicate fork — only a different label on an already-safe outcome.
 */
export declare function runForkTransaction(deps: ForkDeps, req: ForkTransactionRequest): Promise<ForkResult>;

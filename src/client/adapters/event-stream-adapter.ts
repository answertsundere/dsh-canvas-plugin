/**
 * Timeline event stream adapter: owns the retain lifecycle for one Session and
 * exposes its chat target as a read-only source.
 *
 * Every DSH touchpoint is expressed as a structural `*Like` interface so the
 * controller layer can inject fakes. The shapes below mirror the local checkout
 * at `639ed01539` (`@deepseek-ai/dsh-api-session-controller/client`,
 * `@deepseek-ai/dsh-client-ui-conversation/client`) rather than online docs.
 */

/**
 * The retain label this plugin owns, so M0 gate 11 can attribute every retain
 * via `retainInfo().retainedBy.canvasNode`.
 *
 * DSH declares the label set as a declaration-merge-extensible map
 * (`SessionReferenceSourceMap` in `@deepseek-ai/dsh-api-session-controller/client`),
 * which every other plugin extends. This plugin cannot: that package is not a
 * dependency here (Task 1 established that later tasks add no dependencies), so
 * a `declare module` block would be an unresolvable augmentation (TS2664). The
 * label therefore works at runtime — it is only a string key — but is untyped
 * until the merge is added alongside the real dependency in Task 13 packaging.
 */
export const CANVAS_RETAIN_SOURCE = 'canvasNode'

/** History-open lifecycle of a Session event window. */
export type OpenStateLike = 'cold' | 'loading' | 'open' | 'error'

/** Identity-stable reader over a value plus its change notifications. */
export interface ObservableSnapshotLike<V = unknown> {
  readonly getSnapshot: () => V
  readonly subscribe: (listener: () => void) => () => void
}

/**
 * The outward Session face. `loadOlder()` reports completion only — failures
 * land in the snapshot's `openState` / `loadingOlder`, not in the rejection.
 */
export interface SessionFaceLike extends ObservableSnapshotLike<{ readonly openState: OpenStateLike }> {
  loadOlder(): Promise<void>
}

export interface SessionBindingLike {
  readonly sessionId: string
  readonly session: SessionFaceLike
}

export interface SessionReferenceLike {
  readonly sessionId: string
  readonly binding: SessionBindingLike
  readonly ready: Promise<SessionBindingLike>
  release(): void
}

export interface SessionsLike {
  retain(target: string, options: { readonly source: string }): SessionReferenceLike
}

export interface ConversationBindingLike {
  target(name: string): ObservableSnapshotLike<unknown>
}

/**
 * `binding()` accepts either a retained binding or an id, and **throws** for an
 * unknown or inactive session — it may only be called once a retain has made the
 * session current.
 */
export interface UiConversationLike {
  binding(source: SessionBindingLike | string): ConversationBindingLike
}

export interface TimelineSource {
  readonly sessionId: string
  /** Live history-open lifecycle of the retained window. */
  openState(): OpenStateLike
  snapshot(): unknown
  subscribe(listener: () => void): () => void
  /** @returns whether the window actually changed; `loadOlder()` itself reports only completion. */
  loadOlder(): Promise<boolean>
  /** Idempotent: safe on close, on selection change, and on plugin unload. */
  release(): void
}

/**
 * Retains one Session and opens its chat target for reading.
 *
 * The binding is taken from `reference.ready` rather than borrowed via
 * `sessions.binding(id)`: the reference is the thing that keeps the Session
 * alive, so using its own resolved binding removes a second lookup and the
 * generation race that comes with it.
 *
 * Both failure paths release the retain before rethrowing. A read that fails
 * must not leave a Session pinned open — that is exactly the residue M0 gate 11
 * checks for after uninstall.
 */
export async function openTimeline(
  sessions: SessionsLike,
  uiConversation: UiConversationLike,
  sessionId: string,
): Promise<TimelineSource> {
  const reference = sessions.retain(sessionId, { source: CANVAS_RETAIN_SOURCE })

  let binding: SessionBindingLike
  try {
    binding = await reference.ready
  } catch (error) {
    reference.release()
    throw error
  }

  let target: ObservableSnapshotLike<unknown>
  try {
    target = uiConversation.binding(binding).target('chat')
  } catch (error) {
    reference.release()
    throw error
  }

  let released = false
  return {
    sessionId,
    openState: () => binding.session.getSnapshot().openState,
    snapshot: () => target.getSnapshot(),
    subscribe: listener => target.subscribe(listener),
    loadOlder: async () => {
      const before = target.getSnapshot()
      await binding.session.loadOlder()
      return target.getSnapshot() !== before
    },
    release: () => {
      if (released) return
      released = true
      reference.release()
    },
  }
}

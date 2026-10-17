/**
 * Timeline event stream adapter: owns the retain lifecycle for one Session and
 * exposes its chat target as a read-only source.
 *
 * Every DSH touchpoint is expressed as a structural `*Like` interface so the
 * controller layer can inject fakes. The shapes below mirror the local checkout
 * at `639ed01539` (`@deepseek-ai/dsh-api-session-controller/client`,
 * `@deepseek-ai/dsh-client-ui-conversation/client`) rather than online docs.
 */
import type { LiveEntryLike } from '../live/live-tail.ts'

/**
 * The retain label this plugin owns, so M0 gate 11 can attribute every retain
 * via `retainInfo().retainedBy.canvasNode`.
 *
 * DSH declares the label set as a declaration-merge-extensible map
 * (`SessionReferenceSourceMap` in `@deepseek-ai/dsh-api-session-controller/client`),
 * which every other plugin extends. `src/client/index.ts` extends it the same
 * way (`declare module` + the package as a devDependency), so this literal is
 * the typed key of the merge, not just a runtime string.
 */
export const CANVAS_RETAIN_SOURCE = 'canvasNode' as const

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

/** One window row as the host hands it over; shape-checked in the live-tail module. */
export interface LiveWindowBindingLike {
  readonly sessionId: string
  readonly eventSource: ObservableSnapshotLike<unknown>
}

export interface LiveWindowReferenceLike {
  readonly sessionId: string
  readonly ready: Promise<LiveWindowBindingLike>
  release(): void
}

export interface LiveWindowSessionsLike {
  retain(target: string, options: { readonly source: typeof CANVAS_RETAIN_SOURCE }): LiveWindowReferenceLike
}

/**
 * The live half of the timeline: the raw event window, transient stream rows
 * included. Unlike `openTimeline` this never touches `uiConversation.binding`,
 * so it cannot be refused by the inactive-session guard — the window is read
 * off the retain's own binding.
 */
export interface LiveWindowSource {
  readonly sessionId: string
  /** Fresh read of the window's entries; malformed windows read as empty. */
  entries(): readonly LiveEntryLike[]
  subscribe(listener: () => void): () => void
  /** Idempotent: safe on selection change, tab close, and plugin unload. */
  release(): void
}

/**
 * Retains one Session and keeps its event window open for live reading.
 *
 * Same lifecycle contract as `openTimeline`: release before rethrowing on
 * failure, and release idempotently. The default window page is the recent
 * tail, which is exactly what a live view needs; older pages are the
 * `openTimeline`/`loadOlder` path's job.
 */
export async function openLiveWindow(
  sessions: LiveWindowSessionsLike,
  sessionId: string,
): Promise<LiveWindowSource> {
  const reference = sessions.retain(sessionId, { source: CANVAS_RETAIN_SOURCE })

  let binding: LiveWindowBindingLike
  try {
    binding = await reference.ready
  } catch (error) {
    reference.release()
    throw error
  }

  const entries = (): readonly LiveEntryLike[] => {
    const snapshot = binding.eventSource.getSnapshot()
    if (snapshot === null || typeof snapshot !== 'object') return []
    const rows = (snapshot as { entries?: unknown }).entries
    return Array.isArray(rows) ? rows as readonly LiveEntryLike[] : []
  }

  let released = false
  return {
    sessionId,
    entries,
    subscribe: listener => binding.eventSource.subscribe(listener),
    release: () => {
      if (released) return
      released = true
      reference.release()
    },
  }
}

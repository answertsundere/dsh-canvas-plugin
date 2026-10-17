import type { Context } from '@deepseek-ai/cordis'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { SessionRequestId } from '@deepseek-ai/dsh-api-session-controller/types'
import type {} from '@deepseek-ai/dsh-api-session-controller/client'
import type {} from '@deepseek-ai/dsh-api-workspace-controller/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-workspace/client'
import { NS, en, zh } from './locales.ts'
import { CanvasTab } from './ui/CanvasTab.tsx'
import { CANVAS_RETAIN_SOURCE } from './adapters/event-stream-adapter.ts'
import { toSummaries } from './adapters/session-adapter.ts'
import { toWorkspaceItems } from './adapters/workspace-adapter.ts'
import { createGraphController, type GraphControllerDeps } from './controllers/graph-controller.ts'
import type { ForkDeps } from './controllers/fork-controller.ts'
import type { CanvasModel } from './ui/canvas-model.ts'
import type { SessionEventLike } from './compare/branch-segment.ts'

export const inject = ['slots', 'sessions', 'workspaces', 'uiWorkspace', 'uiConversation', 'locale']

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
    canvasNode: unknown
  }
}

/**
 * The DSH boundary. Everything below this file is written against plain strings
 * and structural interfaces; DSH brands `SessionId`/`SessionRequestId`, so the
 * brand casts live here and nowhere else.
 */
const asSessionId = (id: string): SessionId => id as unknown as SessionId

export function apply(ctx: Context): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-canvas: dictionaries')
  const t = ctx.locale.bind(NS)

  // One controller per conversation, cached so a re-render keeps the same model
  // object: the tab subscribes to that object for live updates, so handing out a
  // fresh model every render would drop the subscription each time.
  const models = new Map<string, CanvasModel>()

  const modelFor = (sessionId: string): CanvasModel => {
    const cached = models.get(sessionId)
    if (cached !== undefined) return cached
    const model = createGraphController(depsFor(ctx, sessionId)).model()
    models.set(sessionId, model)
    return model
  }

  // Session and workspace snapshots are the only live sources the canvas has, so
  // a parallel branch changing state reaches it without any user action.
  ctx.effect(() => {
    const offs: (() => void)[] = []
    for (const store of [ctx.sessions.list, ctx.workspaces.list]) {
      const subscribe = (store as { subscribe?: unknown }).subscribe
      if (typeof subscribe !== 'function') continue
      offs.push((subscribe as (listener: () => void) => () => void).call(store, () => {
        for (const model of models.values()) model.refresh?.()
      }))
    }
    return () => { for (const off of offs) off() }
  }, 'dsh-canvas: snapshot subscriptions')

  ctx.effect(() => () => { models.clear() }, 'dsh-canvas: controller lifetime')

  ctx.slots.inject('conversation.view', () => ctx.slots.register({
    name: 'conversation.view',
    id: 'canvas',
    order: 20,
    locale: NS,
    label: () => t('view.canvas'),
    inject: (sessionId: SessionId) => ({ canvas: modelFor(sessionId as unknown as string) }),
  }, CanvasTab))
}

function depsFor(ctx: Context, sessionId: string): GraphControllerDeps {
  /**
   * The canvas is scoped to the workspace that owns the conversation it renders
   * in, resolved through that session's cwd. The client workspace snapshot has
   * no "current workspace" field, and the conversation's own directory is the
   * honest answer to "which workspace am I looking at".
   */
  const scope = (): { workspaceId: string | null; cwd: string | null } => {
    const summaries = toSummaries(ctx.sessions.list.getSnapshot())
    const cwd = summaries.find(summary => summary.id === sessionId)?.cwd ?? null
    const items = toWorkspaceItems(ctx.workspaces.list.getSnapshot())
    const workspaceId = items.find(item => item.path === cwd)?.workspaceId
      ?? items[0]?.workspaceId
      ?? null
    return { workspaceId, cwd }
  }

  const forkDeps: ForkDeps = {
    fork: request => ctx.sessions.fork({
      sessionId: asSessionId(request.sessionId),
      atSeq: request.atSeq,
      increaseTitle: request.increaseTitle,
      ...(request.onCreated === undefined
        ? {}
        : { onCreated: childId => request.onCreated?.(childId) }),
    }),
    childrenOf: async parentId => toSummaries(ctx.sessions.list.getSnapshot())
      .filter(summary => summary.parentId === parentId)
      .map(summary => summary.id),
    using: (id, op) => ctx.sessions.using(asSessionId(id), { source: CANVAS_RETAIN_SOURCE }, async reference =>
      op(async (text, requestId) => {
        // `requestId` is the FOURTH parameter, after `signal`. Passing it third
        // would land it in `signal`, drop it, and silently disable the Host's
        // prompt dedupe — M0 gate 7 would fail with no visible error.
        const result = await reference.binding.session.prompt(
          [{ type: 'text', text }],
          'queue',
          undefined,
          requestId as SessionRequestId,
        )
        // prompt() resolves a RemoteResult; it does not reject on a refusal.
        return result.ok
          ? { ok: true as const }
          : { ok: false as const, error: result.error.message }
      })),
    newRequestId: () => crypto.randomUUID(),
  }

  return {
    listSnapshot: () => ctx.sessions.list.getSnapshot(),
    workspaceSnapshot: () => ctx.workspaces.list.getSnapshot(),
    scope,
    // A pending or failed list means the host has not delivered a usable view,
    // so nothing on the canvas can be trusted as live.
    isConnected: () => {
      const snapshot = ctx.sessions.list.getSnapshot() as unknown as { phase?: unknown; state?: unknown }
      return snapshot.phase === 'ready' && snapshot.state !== 'error'
    },
    openSession: id => ctx.uiWorkspace.openSession(asSessionId(id)),
    forkDeps,
    readEvents: async id => {
      // A one-shot retain: comparison reads the window and lets go immediately,
      // so nothing stays pinned open after the panel closes.
      const reference = ctx.sessions.retain(asSessionId(id), { source: CANVAS_RETAIN_SOURCE })
      try {
        const binding = await reference.ready
        const events: SessionEventLike[] = []
        for (const entry of binding.eventSource.getSnapshot().entries) {
          // `transient` entries are live assistant chunks, not durable log rows.
          if (entry.type !== 'event') continue
          events.push({ seq: Number(entry.event.seq), type: entry.event.type, data: entry.event.data })
        }
        return events
      } finally {
        reference.release()
      }
    },
  }
}

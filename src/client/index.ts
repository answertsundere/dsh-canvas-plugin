import type { Context } from '@deepseek-ai/cordis'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import { NS, en, zh } from './locales.ts'
import { CanvasTab } from './ui/CanvasTab.tsx'
import { emptyCanvasModel } from './ui/canvas-model.ts'

export const inject = ['slots', 'sessions', 'workspaces', 'uiWorkspace', 'uiConversation', 'locale']

/**
 * Built once at module scope so the placeholder keeps a stable identity across
 * renders. Task 11 replaces this with the controller-backed model; until then
 * the tab renders an empty canvas rather than failing, because a client entry
 * that throws during render is fatal for the whole page boot.
 */
const PLACEHOLDER = emptyCanvasModel()

export function apply(ctx: Context): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-canvas: dictionaries')
  const t = ctx.locale.bind(NS)
  ctx.slots.inject('conversation.view', () => ctx.slots.register({
    name: 'conversation.view',
    id: 'canvas',
    order: 20,
    locale: NS,
    label: () => t('view.canvas'),
    inject: (_sessionId: SessionId) => ({ canvas: PLACEHOLDER }),
  }, CanvasTab))
}
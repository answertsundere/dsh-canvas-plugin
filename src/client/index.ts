import type { Context } from '@deepseek-ai/cordis'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import { NS, en, zh } from './locales.ts'
import { CanvasTab } from './ui/CanvasTab.tsx'

export const inject = ['slots', 'sessions', 'workspaces', 'uiWorkspace', 'uiConversation', 'locale']

export function apply(ctx: Context): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-canvas: dictionaries')
  const t = ctx.locale.bind(NS)
  ctx.slots.inject('conversation.view', () => ctx.slots.register({
    name: 'conversation.view',
    id: 'canvas',
    order: 20,
    locale: NS,
    label: () => t('view.canvas'),
    inject: (_sessionId: SessionId) => ({}),
  }, CanvasTab))
}
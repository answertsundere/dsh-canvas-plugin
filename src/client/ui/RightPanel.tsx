import type { FC, ReactNode } from 'react'
import { theme } from '../theme.ts'

export type RightPanelTab = 'detail' | 'compare'

export interface RightPanelProps {
  readonly tab: RightPanelTab
  readonly title?: string
  /** One prominent action next to the title — the Agent 实况 entry lives here. */
  readonly headerAction?: { readonly label: string; readonly title?: string; onClick(): void }
  onTabChange(tab: RightPanelTab): void
  onClose(): void
  readonly children: ReactNode
}

/** Sliding right-hand container holding the 详情 and 对比 views. */
export const RightPanel: FC<RightPanelProps> = ({ tab, title, headerAction, onTabChange, onClose, children }) => (
  <aside
    data-right-panel
    style={{
      width: 360, flex: '0 0 360px', display: 'flex', flexDirection: 'column',
      background: theme.panel, borderLeft: `1px solid ${theme.border}`,
      font: '12px system-ui, sans-serif', color: theme.text,
    }}
  >
    <div
      data-panel-header
      style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
        borderBottom: `1px solid ${theme.border}`,
      }}
    >
      {(['detail', 'compare'] as const).map(candidate => (
        <button
          key={candidate}
          type="button"
          data-panel-tab={candidate}
          data-active={tab === candidate ? 'true' : 'false'}
          onClick={() => onTabChange(candidate)}
          style={{
            background: 'transparent',
            color: tab === candidate ? theme.text : theme.muted,
            border: 'none',
            borderBottom: `2px solid ${tab === candidate ? theme.accent : 'transparent'}`,
            padding: '4px 6px', font: 'inherit', cursor: 'pointer',
          }}
        >
          {candidate === 'detail' ? '详情' : '对比'}
        </button>
      ))}
      {title !== undefined && (
        <span style={{ color: theme.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {title}
        </span>
      )}
      {headerAction !== undefined && (
        <button
          type="button"
          data-panel-action
          title={headerAction.title}
          onClick={headerAction.onClick}
          style={{
            marginLeft: 'auto', background: theme.card, color: theme.accent,
            border: `1px solid ${theme.accent}66`, borderRadius: 6,
            padding: '3px 10px', font: 'inherit', cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {headerAction.label}
        </button>
      )}
      <button
        type="button"
        data-panel-close
        onClick={onClose}
        aria-label="关闭"
        style={{
          marginLeft: headerAction === undefined ? 'auto' : 0,
          background: 'transparent', color: theme.muted,
          border: 'none', font: 'inherit', cursor: 'pointer',
        }}
      >
        ✕
      </button>
    </div>
    <div data-panel-body style={{ flex: '1 1 auto', overflow: 'auto', position: 'relative' }}>
      {children}
    </div>
  </aside>
)

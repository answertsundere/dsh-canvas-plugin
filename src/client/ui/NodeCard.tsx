import type { FC, CSSProperties, MouseEvent } from 'react'
import type { CanvasNode } from '../../shared/contracts.ts'
import type { StatusBadge } from '../../shared/status.ts'
import type { TailSnippet } from '../live/live-tail.ts'
import { theme } from '../theme.ts'
import type { LayoutPoint } from '../graph/graph-layout.ts'

export interface NodeCardProps {
  readonly node: CanvasNode
  readonly status: StatusBadge
  readonly position: LayoutPoint
  readonly width: number
  readonly height: number
  readonly selected: boolean
  readonly comparing: boolean
  /** A running sibling shares this node's cwd, so a parallel write is possible. */
  readonly parallelWrite: boolean
  /** The toolbar query matched this node. */
  readonly highlight: boolean
  /** The node's in-flight output, when it is streaming. */
  readonly live?: TailSnippet | null
  /**
   * The node is working right now (thinking/tool or a visible stream): the
   * card breathes a halo in the status's own color so a busy session reads
   * from across the room. The keyframes live in the canvas's injected style.
   */
  readonly active?: boolean
  readonly now: number
  onClick(event: MouseEvent<HTMLDivElement>, id: string): void
  /** Opens the session in the conversation view. */
  onOpen?(id: string): void
  /** Opens the live agent-web view for this session. */
  onInspect?(id: string): void
  /** Right-click: the canvas-level shortcut menu (fork / inspect / open). */
  onContext?(event: MouseEvent<HTMLDivElement>, id: string): void
}

export const NodeCard: FC<NodeCardProps> = ({
  node, status, position, width, height, selected, comparing, parallelWrite, highlight, live = null, active = false, now, onClick, onOpen, onInspect, onContext,
}) => (
  <div
    data-canvas-node={node.id}
    title={node.title}
    data-selected={selected ? 'true' : 'false'}
    data-comparing={comparing ? 'true' : 'false'}
    data-highlight={highlight ? 'true' : 'false'}
    data-node-active={active ? 'true' : 'false'}
    onClick={event => onClick(event, node.id)}
    onDoubleClick={event => { event.stopPropagation(); onOpen?.(node.id) }}
    onContextMenu={onContext === undefined ? undefined : event => { event.preventDefault(); onContext(event, node.id) }}
    style={{
      position: 'absolute',
      left: position.x,
      top: position.y,
      width,
      height,
      boxSizing: 'border-box',
      padding: '8px 10px',
      borderRadius: 10,
      background: selected ? theme.cardActive : theme.card,
      border: `1px solid ${selected ? theme.accent : highlight ? theme.warn : theme.border}`,
      outline: comparing ? `2px solid ${theme.accent}` : undefined,
      outlineOffset: 2,
      color: theme.text,
      font: '12px/1.45 system-ui, sans-serif',
      cursor: 'pointer',
      overflow: 'hidden',
      userSelect: 'none',
      ...(active
        ? {
            animation: 'dshCanvasBreath 1.6s ease-in-out infinite',
            ['--breath-color' as never]: status.color,
          } as CSSProperties
        : {}),
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span
        data-node-status={status.kind}
        title={status.confirmed ? status.label : `${status.label}（推断）`}
        style={{
          width: 8, height: 8, borderRadius: 4, flex: '0 0 auto',
          background: status.color,
          opacity: status.confirmed ? 1 : 0.65,
        }}
      />
      <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {node.title}
      </span>
      {node.seeded && (
        <span data-node-seeded="true" title="分叉会话" style={{ color: theme.accent, flex: '0 0 auto' }}>⑂</span>
      )}
      {node.teamRole !== undefined && (
        <span
          data-node-team={node.teamRole}
          title={node.teamRole === 'lead' ? '团队主管' : '团队成员'}
          style={{
            flex: '0 0 auto', color: theme.warn, border: `1px solid ${theme.warn}88`,
            borderRadius: 4, padding: '0 3px', fontSize: 10, lineHeight: '14px',
          }}
        >
          {node.teamRole === 'lead' ? '主管' : '成员'}
        </span>
      )}
    </div>
    <div style={{ color: theme.muted, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {status.label} · {relativeTime(now, node.createdAt)} · {node.childCount} 分支
      {node.externalParent && <span title="父会话不在当前工作区"> · 外部父</span>}
    </div>
    {onInspect !== undefined && (
      <button
        type="button"
        data-node-inspect={node.id}
        title="Agent 实况：查看这个会话的 agent 蛛网"
        className="dsh-canvas-inspect"
        onClick={event => { event.stopPropagation(); onInspect(node.id) }}
        style={{
          position: 'absolute', top: 5, right: 5,
          width: 20, height: 20, lineHeight: '17px', textAlign: 'center',
          background: theme.card, color: theme.muted,
          border: `1px solid ${theme.border}`, borderRadius: 6,
          font: '12px system-ui, sans-serif', cursor: 'pointer', padding: 0,
        }}
      >
        ⌖
      </button>
    )}
    {live != null && (
      <div
        data-node-live
        style={{
          display: 'flex', gap: 4, marginTop: 2, overflow: 'hidden',
          whiteSpace: 'nowrap', color: theme.muted,
        }}
      >
        <span
          data-node-live-label
          style={{ flex: '0 0 auto', color: live.label === '工具' ? theme.accent : theme.muted }}
        >
          {live.label}
        </span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{live.text}</span>
      </div>
    )}
    {parallelWrite && (
      <div data-node-parallel-write="true" style={{ color: theme.warn, marginTop: 2 }}>
        ⚠ 并行写入
      </div>
    )}
  </div>
)

/** Coarse relative time; the canvas only needs "how long ago" at a glance. */
export function relativeTime(now: number, at: number): string {
  const seconds = Math.max(0, Math.round((now - at) / 1000))
  if (seconds < 60) return '刚刚'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} 分钟前`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} 小时前`
  return `${Math.round(hours / 24)} 天前`
}

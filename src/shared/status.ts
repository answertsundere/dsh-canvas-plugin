export type StatusKind =
  | 'idle' | 'queued' | 'thinking' | 'tool' | 'awaiting-approval' | 'failed' | 'done' | 'unknown'

export interface StatusBadge {
  readonly kind: StatusKind
  readonly confirmed: boolean
  readonly label: string
  readonly color: string
}

const BADGES: Record<StatusKind, StatusBadge> = {
  idle:           { kind: 'idle', confirmed: true, label: '空闲', color: '#9aa4b2' },
  queued:         { kind: 'queued', confirmed: true, label: '排队', color: '#8a7dff' },
  thinking:       { kind: 'thinking', confirmed: false, label: '思考中', color: '#f2a33c' },
  tool:           { kind: 'tool', confirmed: false, label: '工具执行', color: '#2f9e6f' },
  'awaiting-approval': { kind: 'awaiting-approval', confirmed: true, label: '待批准', color: '#d98a2b' },
  failed:         { kind: 'failed', confirmed: true, label: '失败', color: '#e0554d' },
  done:           { kind: 'done', confirmed: true, label: '已完成', color: '#4aa3df' },
  unknown:        { kind: 'unknown', confirmed: false, label: '状态未知', color: '#5b6472' },
}

export function badge(kind: StatusKind): StatusBadge { return BADGES[kind] }
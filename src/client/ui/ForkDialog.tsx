import { useState, type FC } from 'react'
import type { LaunchMode } from '../../shared/contracts.ts'
import { theme } from '../theme.ts'

export interface ForkDialogProps {
  readonly open: boolean
  /** Inclusive cut seq: the last event the new branch inherits. */
  readonly atSeq: number
  /** The source session's own inherited prefix length, when it is itself a fork. */
  readonly inheritedCount: number
  readonly busy?: boolean
  readonly error?: string
  onCancel(): void
  onConfirm(instruction: string, mode: LaunchMode): void
}

/**
 * The fork confirmation.
 *
 * It shows the real cut rather than a vague "from here": the number of events
 * the child will inherit is `atSeq + 1`, because DSH records
 * `inheritedEventCount = boundary + 1` for an inclusive boundary. The design
 * spec's own example prose says "seq 47 · inherits 47 events", which is off by
 * one; the code is what runs.
 *
 * The shared-directory warning is permanent, not a dismissible toast: v1
 * branches always share the source cwd (the fork API has no cwd parameter), so
 * two parallel branches can overwrite each other's files.
 */
export const ForkDialog: FC<ForkDialogProps> = ({
  open, atSeq, inheritedCount, busy = false, error, onCancel, onConfirm,
}) => {
  const [instruction, setInstruction] = useState('')
  const [mode, setMode] = useState<LaunchMode>('now')

  if (!open) return null

  const trimmed = instruction.trim()
  // Mirrors the fork transaction's own validation, so the button cannot submit
  // a request that is guaranteed to fail before it touches the host.
  const blocked = mode === 'now' && trimmed === ''

  return (
    <div
      data-fork-dialog
      style={{
        position: 'absolute', right: 16, bottom: 16, width: 320, zIndex: 5,
        background: theme.panel, border: `1px solid ${theme.border}`, borderRadius: 10,
        padding: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
        font: '12px system-ui, sans-serif', color: theme.text,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 6 }}>从此分叉</div>

      <div data-fork-cut style={{ color: theme.muted, marginBottom: 8 }}>
        切点：seq {atSeq} · 新分支继承 {atSeq + 1} 个事件
        {inheritedCount > 0 && <>（其中 {inheritedCount} 个来自更上游）</>}
      </div>

      <textarea
        data-fork-instruction
        value={instruction}
        onChange={event => setInstruction(event.target.value)}
        placeholder="给新分支的指令"
        rows={3}
        style={{
          width: '100%', boxSizing: 'border-box', resize: 'vertical',
          background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`,
          borderRadius: 6, padding: 6, font: 'inherit',
        }}
      />

      <div style={{ display: 'flex', gap: 12, margin: '8px 0' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <input
            type="radio"
            name="dsh-canvas-fork-mode"
            data-fork-mode="now"
            checked={mode === 'now'}
            onChange={() => setMode('now')}
          />
          立即开跑
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <input
            type="radio"
            name="dsh-canvas-fork-mode"
            data-fork-mode="later"
            checked={mode === 'later'}
            onChange={() => setMode('later')}
          />
          只建分支
        </label>
      </div>

      <div data-fork-cwd-warning style={{ color: theme.warn, marginBottom: 8 }}>
        ⚠ 并行分支共享同一工作目录，同时写文件可能互相覆盖
      </div>

      {error !== undefined && (
        <div data-fork-error style={{ color: theme.warn, marginBottom: 8 }}>{error}</div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button type="button" data-fork-cancel onClick={onCancel} style={buttonStyle}>取消</button>
        <button
          type="button"
          data-fork-confirm
          disabled={blocked || busy}
          onClick={() => onConfirm(trimmed, mode)}
          style={{ ...buttonStyle, borderColor: theme.accent, opacity: blocked || busy ? 0.5 : 1 }}
        >
          创建
        </button>
      </div>
    </div>
  )
}

const buttonStyle = {
  background: theme.card, color: theme.text, border: `1px solid ${theme.border}`,
  borderRadius: 6, padding: '3px 12px', font: 'inherit', cursor: 'pointer',
} as const

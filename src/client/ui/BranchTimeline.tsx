import type { FC } from 'react'
import type { BranchTurn } from '../../shared/contracts.ts'
import { theme } from '../theme.ts'

export interface BranchTimelineProps {
  readonly turns: readonly BranchTurn[]
  /** Events this session inherited from its own fork point; excluded from comparison. */
  readonly inheritedCount: number
  onFork(rowIndex: number): void
  /** Whether the shared-directory warning applies to this branch. */
  readonly cwdWarning: boolean
}

/**
 * The fork cut for a timeline row: the last event seq that row owns.
 *
 * The design spec words this as "the seq immediately before the next row's
 * first event", which is equivalent **only while seqs are contiguous**. They are
 * not: a gap between rows makes that value a seq that is not an event, and DSH
 * refuses a fork whose `atSeq` is not a real event
 * (`api/session-controller/src/commands.ts:246-254` — "event N does not exist").
 * This row's own last seq is always real, and cutting there inherits the row in
 * full while excluding the next one, which is exactly what "fork here" means.
 */
export function cutSeqAt(turns: readonly BranchTurn[], rowIndex: number): number | undefined {
  return turns[rowIndex]?.lastSeq
}

export const BranchTimeline: FC<BranchTimelineProps> = ({ turns, inheritedCount, onFork, cwdWarning }) => (
  <div data-branch-timeline style={{ font: '12px/1.5 system-ui, sans-serif', color: theme.text }}>
    <div data-timeline-inherited style={{ color: theme.muted, padding: '6px 10px', borderBottom: `1px solid ${theme.border}` }}>
      继承 {inheritedCount} 个事件（不计入对比）
    </div>
    {cwdWarning && (
      <div data-timeline-cwd-warning style={{ color: theme.warn, padding: '6px 10px' }}>
        ⚠ 并行分支共享同一工作目录，同时写文件可能互相覆盖
      </div>
    )}

    {turns.length === 0 && (
      <div data-timeline-empty style={{ color: theme.muted, padding: 10 }}>该分支还没有自己的事件</div>
    )}

    {turns.map(turn => (
      <div
        key={turn.index}
        data-timeline-row={turn.index}
        data-row-synthetic={turn.synthetic ? 'true' : 'false'}
        style={{
          padding: '8px 10px',
          borderBottom: `1px solid ${theme.border}`,
          opacity: turn.synthetic ? 0.6 : 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: theme.muted }}>
          <span data-row-seq>{`seq ${turn.firstSeq}–${turn.lastSeq}`}</span>
          <span>第 {turn.index + 1} 轮</span>
          {turn.endedAs !== undefined && <span data-row-ended>{turn.endedAs}</span>}
          {turn.synthetic && <span data-row-synthetic-marker title="分叉时合成的事件">合成</span>}
          <span style={{ marginLeft: 'auto' }}>{turn.tools.length} 次工具</span>
          <button
            type="button"
            data-fork-row={turn.index}
            // Forking at fork plumbing would cut at a synthetic closer, which is
            // never what the user means.
            disabled={turn.synthetic}
            onClick={() => onFork(turn.index)}
            style={{
              background: theme.card, color: theme.text, border: `1px solid ${theme.border}`,
              borderRadius: 6, padding: '2px 8px', font: 'inherit',
              cursor: turn.synthetic ? 'not-allowed' : 'pointer',
              opacity: turn.synthetic ? 0.5 : 1,
            }}
          >
            ⑂ 从此分叉
          </button>
        </div>
        <div data-row-user style={{ marginTop: 2 }}>
          {turn.userMessage ?? <span style={{ color: theme.muted }}>（无用户消息）</span>}
        </div>
        {turn.assistantSummary !== undefined && (
          <div data-row-assistant style={{ color: theme.muted, marginTop: 2 }}>{turn.assistantSummary}</div>
        )}
      </div>
    ))}
  </div>
)

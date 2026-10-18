import { useState, type FC } from 'react'
import type { LiveTail } from '../live/live-tail.ts'
import type { BranchTurn } from '../../shared/contracts.ts'
import { theme } from '../theme.ts'

export interface BranchTimelineProps {
  readonly turns: readonly BranchTurn[]
  /** Events this session inherited from its own fork point; excluded from comparison. */
  readonly inheritedCount: number
  onFork(rowIndex: number): void
  /** Whether the shared-directory warning applies to this branch. */
  readonly cwdWarning: boolean
  /**
   * The branch's in-flight assistant output, when one is streaming. Rendered
   * above the settled turns: it is where the newest output arrives, and it
   * disappears on its own when the durable message settles it.
   */
  readonly live?: LiveTail | null
  /** The session's latest conclusion, so the answer is visible without opening 对话. */
  readonly conclusion?: string | null
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

export const BranchTimeline: FC<BranchTimelineProps> = ({ turns, inheritedCount, onFork, cwdWarning, live = null, conclusion }) => {
  const [copied, setCopied] = useState(false)
  const [expandedArgs, setExpandedArgs] = useState<ReadonlySet<number>>(() => new Set())
  const toggleArgs = (index: number): void => {
    setExpandedArgs(current => {
      const next = new Set(current)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }
  const copyConclusion = (): void => {
    if (conclusion === null || conclusion === undefined) return
    const clipboard = (globalThis as {
      navigator?: { clipboard?: { writeText(text: string): Promise<void> } }
    }).navigator?.clipboard
    if (clipboard === undefined) return
    void clipboard.writeText(conclusion).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    }).catch(() => { /* private mode: the button simply does nothing */ })
  }
  return (
  <div data-branch-timeline style={{ font: '12px/1.5 system-ui, sans-serif', color: theme.text }}>
    <div
      data-detail-conclusion
      style={{ padding: '8px 10px', borderBottom: `1px solid ${theme.border}`, background: theme.card }}
    >
      <div style={{ color: theme.muted, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>{live != null ? '最新结论（正在产出…）' : '最新结论'}</span>
        {conclusion != null && (
          <button
            type="button"
            data-copy-conclusion
            onClick={copyConclusion}
            style={{
              background: 'transparent', color: theme.accent, border: 'none',
              font: 'inherit', cursor: 'pointer', padding: 0,
            }}
          >
            复制
          </button>
        )}
        {copied && <span data-copy-done style={{ color: theme.accent }}>已复制</span>}
      </div>
      {conclusion
        ? <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{conclusion}</div>
        : live != null
          ? <div data-conclusion-waiting style={{ color: theme.accent }}>▍正在产出结论…</div>
          : <div style={{ color: theme.muted }}>还没有结论</div>}
    </div>
    <div data-timeline-inherited style={{ color: theme.muted, padding: '6px 10px', borderBottom: `1px solid ${theme.border}` }}>
      继承 {inheritedCount} 个事件（不计入对比）
    </div>
    {cwdWarning && (
      <div data-timeline-cwd-warning style={{ color: theme.warn, padding: '6px 10px' }}>
        ⚠ 并行分支共享同一工作目录，同时写文件可能互相覆盖
      </div>
    )}

    {live != null && (
      <div
        data-live-tail
        data-live-phase={live.phase}
        style={{ padding: '8px 10px', borderBottom: `1px solid ${theme.border}`, background: theme.card }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: theme.muted }}>
          <span data-live-cursor style={{ color: theme.accent }}>▍</span>
          <span>{live.phase === 'tool' ? '工具执行中' : '正在输出'}</span>
          <span>第 {live.turn + 1} 轮 · 步骤 {live.step + 1}</span>
        </div>
        {live.reasoning !== '' && (
          <div
            data-live-reasoning
            style={{ color: theme.muted, fontStyle: 'italic', marginTop: 4, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
          >
            {live.reasoning}
          </div>
        )}
        {live.text !== '' && (
          <div data-live-text style={{ marginTop: 4, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{live.text}</div>
        )}
        {live.tool !== undefined && (
          <div
            data-live-tool
            style={{ color: theme.accent, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            title={`${live.tool.name} ${live.tool.arguments}`}
          >
            ⚙ {live.tool.name} {live.tool.arguments}
          </div>
        )}
      </div>
    )}

    {turns.length === 0 && live == null && (
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
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>{turn.tools.length} 次工具</span>
            {turn.tools.length > 0 && (
              <span data-row-tool-names style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 }}>
                {turn.tools.map((tool, index) => (
                  <span
                    key={`${index}-${tool.name}`}
                    data-row-tool-error={tool.status === 'error' ? 'true' : undefined}
                    style={{ color: tool.status === 'error' ? '#e0554d' : 'inherit' }}
                  >
                    {index > 0 && ' · '}
                    {tool.name}
                    {tool.preview !== undefined && (
                      <span
                        data-row-tool-args
                        title="点击展开本轮参数"
                        onClick={() => toggleArgs(turn.index)}
                        style={{ cursor: 'pointer', opacity: 0.75 }}
                      >
                        {' '}{expandedArgs.has(turn.index) ? '⌃' : '⌄'}
                      </span>
                    )}
                  </span>
                ))}
              </span>
            )}
          </span>
          {expandedArgs.has(turn.index) && (
            <div
              data-row-args-detail
              style={{ marginTop: 4, padding: '4px 8px', borderRadius: 6, background: theme.card, color: theme.muted, font: '11px/1.6 ui-monospace, monospace' }}
            >
              {turn.tools.filter(tool => tool.preview !== undefined).map((tool, index) => (
                <div key={`${index}-${tool.name}`}>
                  {tool.name}: {tool.preview}
                </div>
              ))}
            </div>
          )}
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
}

import { useState, type FC } from 'react'
import type { ComparisonResult } from '../../shared/contracts.ts'
import { theme } from '../theme.ts'

export interface ComparePanelProps {
  readonly result: ComparisonResult | null
  onContinue(side: 'a' | 'b'): void
  onCarry(side: 'a' | 'b', draft: string): void
}

const SIDES = ['a', 'b'] as const

/**
 * Deterministic A|B comparison.
 *
 * 「带回结论」 deliberately stops at an **editable draft**. The other branch's
 * conclusion is reference material, not an instruction: it carries no execution
 * authority, so it is never submitted on the user's behalf. A second, explicit
 * action is what hands the text over, and by then the user has seen and edited it.
 *
 * Only each branch's own work is shown — the diff rows come from
 * `ComparisonResult.turnDiffs`, which already excludes the inherited prefix and
 * the synthetic fork closers. Each side's inherited count is displayed rather
 * than normalized away, because two branches may inherit different amounts.
 */
export const ComparePanel: FC<ComparePanelProps> = ({ result, onContinue, onCarry }) => {
  const [draft, setDraft] = useState<string | null>(null)
  const [draftSide, setDraftSide] = useState<'a' | 'b'>('a')

  if (result === null) {
    return (
      <div data-compare-empty style={{ padding: 16, color: theme.muted, font: '12px system-ui, sans-serif' }}>
        选择两个分支进行对比
      </div>
    )
  }

  const lastSummary = (side: 'a' | 'b'): string => {
    const segment = side === 'a' ? result.a : result.b
    return segment.turns.filter(turn => !turn.synthetic).at(-1)?.assistantSummary ?? ''
  }

  const conclusionOf = (side: 'a' | 'b'): string => {
    const text = lastSummary(side === 'a' ? 'b' : 'a')
    return text === '' ? '（对方没有结论）' : text
  }

  return (
    <div data-compare-panel style={{ font: '12px/1.6 system-ui, sans-serif', color: theme.text }}>
      <div data-compare-summary style={{ padding: '8px 10px', borderBottom: `1px solid ${theme.border}` }}>
        {SIDES.map(side => {
          const segment = side === 'a' ? result.a : result.b
          const tools = segment.turns.filter(t => !t.synthetic).reduce((n, t) => n + t.tools.length, 0)
          return (
            <div key={side} data-compare-side={side}>
              <span style={{ fontWeight: 600 }}>{side.toUpperCase()}</span>
              <span style={{ color: theme.muted }}>
                {' '}· 继承 {segment.inheritedCount} 个事件 · {tools} 次工具
              </span>
            </div>
          )
        })}
        <div data-compare-tool-diff style={{ color: theme.muted }}>
          工具调用差：{result.toolCountDiff > 0 ? `+${result.toolCountDiff}` : result.toolCountDiff}
        </div>
        {result.bothFailed && <div data-compare-both-failed style={{ color: theme.warn }}>两边都以失败结束</div>}
      </div>

      <div data-compare-conclusions style={{ display: 'flex', gap: 8, padding: '8px 10px', borderBottom: `1px solid ${theme.border}` }}>
        {SIDES.map(side => (
          <div key={side} data-conclusion-side={side} style={{ flex: '1 1 0', minWidth: 0 }}>
            <div style={{ color: theme.muted }}>
              {side.toUpperCase()} 最后结论
              {result.lastConclusion.side === 'both' && <span data-conclusion-note> · 两边一致</span>}
              {result.lastConclusion.side === side && <span data-conclusion-note> · 更完整</span>}
            </div>
            <div data-conclusion-text>{lastSummary(side) === '' ? '—' : lastSummary(side)}</div>
          </div>
        ))}
      </div>

      <div data-compare-rows>
        {result.turnDiffs.map((row, index) => (
          <div
            key={index}
            data-compare-row={index}
            data-row-equal={row.equal ? 'true' : 'false'}
            style={{ display: 'flex', gap: 8, padding: '6px 10px', borderBottom: `1px solid ${theme.border}` }}
          >
            <div data-compare-left style={{ flex: '1 1 0', minWidth: 0, color: row.equal ? theme.muted : theme.text }}>
              {row.left?.userMessage ?? <span style={{ color: theme.muted }}>—</span>}
            </div>
            <div data-compare-right style={{ flex: '1 1 0', minWidth: 0, color: row.equal ? theme.muted : theme.text }}>
              {row.right?.userMessage ?? <span style={{ color: theme.muted }}>—</span>}
            </div>
          </div>
        ))}
      </div>

      <div data-compare-actions style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: 10 }}>
        {SIDES.map(side => (
          <button
            key={`continue-${side}`}
            type="button"
            data-continue={side}
            onClick={() => onContinue(side)}
            style={buttonStyle}
          >
            切换至 {side.toUpperCase()} 继续
          </button>
        ))}
        {SIDES.map(side => (
          <button
            key={`carry-${side}`}
            type="button"
            data-carry={side}
            onClick={() => {
              // Fills an editable draft only. Carrying a conclusion never sends
              // anything: the other branch's summary is reference, not an order.
              setDraftSide(side)
              setDraft(`参考另一分支的结论：${conclusionOf(side)}。现在结合两者继续：`)
            }}
            style={buttonStyle}
          >
            带回 {side === 'a' ? 'B' : 'A'} 的结论
          </button>
        ))}
      </div>

      {draft !== null && (
        <div data-carry-editor style={{ padding: '0 10px 10px' }}>
          <textarea
            data-carry-draft
            value={draft}
            rows={3}
            onChange={event => setDraft(event.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box', resize: 'vertical',
              background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`,
              borderRadius: 6, padding: 6, font: 'inherit',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 6 }}>
            <button type="button" data-carry-discard onClick={() => setDraft(null)} style={buttonStyle}>取消</button>
            <button
              type="button"
              data-carry-send
              onClick={() => onCarry(draftSide, draft)}
              style={{ ...buttonStyle, borderColor: theme.accent }}
            >
              放入输入框
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const buttonStyle = {
  background: theme.card, color: theme.text, border: `1px solid ${theme.border}`,
  borderRadius: 6, padding: '3px 10px', font: 'inherit', cursor: 'pointer',
} as const

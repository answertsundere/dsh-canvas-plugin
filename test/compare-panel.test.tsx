import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { ComparePanel } from '../src/client/ui/ComparePanel.tsx'
import type { BranchSegment, BranchTurn, ComparisonResult } from '../src/shared/contracts.ts'

afterEach(cleanup)

const turn = (index: number, extra: Partial<BranchTurn> = {}): BranchTurn => ({
  index,
  firstSeq: index * 10,
  lastSeq: index * 10 + 4,
  tools: [],
  synthetic: false,
  ...extra,
})

const segment = (sessionId: string, inheritedCount: number, turns: readonly BranchTurn[]): BranchSegment =>
  ({ sessionId, inheritedCount, turns })

const result = (over: Partial<ComparisonResult> = {}): ComparisonResult => {
  const a = segment('a', 47, [turn(0, { userMessage: '问 A', assistantSummary: 'A 的结论', tools: [{ name: 'read', status: 'ok' }] })])
  const b = segment('b', 12, [
    turn(0, {
      userMessage: '问 B',
      assistantSummary: 'B 的结论',
      tools: [{ name: 'read', status: 'ok' }, { name: 'grep', status: 'ok' }],
    }),
  ])
  return {
    a,
    b,
    turnDiffs: [
      { left: a.turns[0], right: b.turns[0], equal: false },
      { left: turn(1, { userMessage: '只有 A 有' }), equal: false },
    ],
    toolCountDiff: 1,
    bothFailed: false,
    lastConclusion: { side: 'b', text: 'B 的结论' },
    ...over,
  }
}

const panel = (over: ComparisonResult | null = result()) => ({
  result: over,
  onContinue: vi.fn(),
  onCarry: vi.fn(),
})

describe('ComparePanel', () => {
  it('shows an empty state until two branches are chosen', () => {
    const { container } = render(<ComparePanel {...panel(null)} />)
    expect(container.querySelector('[data-compare-empty]')?.textContent).toContain('选择两个分支')
    expect(container.querySelector('[data-compare-panel]')).toBeNull()
  })

  it('shows each side\u2019s inherited prefix and tool count', () => {
    const { container } = render(<ComparePanel {...panel()} />)
    const a = container.querySelector('[data-compare-side="a"]')?.textContent ?? ''
    const b = container.querySelector('[data-compare-side="b"]')?.textContent ?? ''
    expect(a).toContain('继承 47 个事件')
    expect(a).toContain('1 次工具')
    expect(b).toContain('继承 12 个事件')
    expect(b).toContain('2 次工具')
    expect(container.querySelector('[data-compare-tool-diff]')?.textContent).toContain('+1')
  })

  it('renders one diff row per aligned turn, marking unequal ones', () => {
    const { container } = render(<ComparePanel {...panel()} />)
    expect(container.querySelectorAll('[data-compare-row]')).toHaveLength(2)
    expect(container.querySelector('[data-compare-row="0"]')?.getAttribute('data-row-equal')).toBe('false')
    expect(container.querySelector('[data-compare-row="1"] [data-compare-left]')?.textContent).toBe('只有 A 有')
    expect(container.querySelector('[data-compare-row="1"] [data-compare-right]')?.textContent).toContain('—')
  })

  it('shows both conclusions and flags the identical case', () => {
    const { container } = render(<ComparePanel {...panel()} />)
    expect(container.querySelector('[data-conclusion-side="a"] [data-conclusion-text]')?.textContent).toBe('A 的结论')
    expect(container.querySelector('[data-conclusion-side="b"] [data-conclusion-text]')?.textContent).toBe('B 的结论')
    expect(container.querySelector('[data-conclusion-side="b"] [data-conclusion-note]')?.textContent).toContain('更完整')

    const same = render(<ComparePanel {...panel(result({ lastConclusion: { side: 'both', text: 'x' } }))} />)
    expect(same.container.querySelector('[data-conclusion-note]')?.textContent).toContain('两边一致')
  })

  it('reports when both sides failed', () => {
    const failed = render(<ComparePanel {...panel(result({ bothFailed: true }))} />)
    expect(failed.container.querySelector('[data-compare-both-failed]')).not.toBeNull()
    const fine = render(<ComparePanel {...panel()} />)
    expect(fine.container.querySelector('[data-compare-both-failed]')).toBeNull()
  })

  it('continues in the chosen branch', () => {
    const props = panel()
    const { container } = render(<ComparePanel {...props} />)
    fireEvent.click(container.querySelector('[data-continue="b"]') as Element)
    expect(props.onContinue).toHaveBeenCalledWith('b')
    expect(props.onCarry).not.toHaveBeenCalled()
  })

  it('fills an editable draft without submitting anything', () => {
    const props = panel()
    const { container } = render(<ComparePanel {...props} />)
    expect(container.querySelector('[data-carry-editor]')).toBeNull()

    fireEvent.click(container.querySelector('[data-carry="a"]') as Element)
    // Carrying is a draft, not a send: the other branch's conclusion is
    // reference material and carries no execution authority.
    expect(props.onCarry).not.toHaveBeenCalled()
    const draft = container.querySelector('[data-carry-draft]') as HTMLTextAreaElement
    expect(draft.value).toContain('参考另一分支的结论：B 的结论')
    expect(draft.value).toContain('现在结合两者继续：')
  })

  it('hands the EDITED draft over on an explicit second action', () => {
    const props = panel()
    const { container } = render(<ComparePanel {...props} />)
    fireEvent.click(container.querySelector('[data-carry="a"]') as Element)
    fireEvent.change(container.querySelector('[data-carry-draft]') as Element, {
      target: { value: '我改过的草稿' },
    })
    fireEvent.click(container.querySelector('[data-carry-send]') as Element)
    expect(props.onCarry).toHaveBeenCalledWith('a', '我改过的草稿')
  })

  it('carries the other side\u2019s conclusion in both directions', () => {
    const props = panel()
    const { container } = render(<ComparePanel {...props} />)
    fireEvent.click(container.querySelector('[data-carry="b"]') as Element)
    expect((container.querySelector('[data-carry-draft]') as HTMLTextAreaElement).value).toContain('A 的结论')
    fireEvent.click(container.querySelector('[data-carry-send]') as Element)
    expect(props.onCarry).toHaveBeenCalledWith('b', expect.stringContaining('A 的结论'))
  })

  it('says so when the other branch has no conclusion to carry', () => {
    const bare = result({
      b: segment('b', 0, [turn(0, { userMessage: '问 B' })]),
      lastConclusion: { side: 'a', text: 'A 的结论' },
    })
    const { container } = render(<ComparePanel {...panel(bare)} />)
    fireEvent.click(container.querySelector('[data-carry="a"]') as Element)
    expect((container.querySelector('[data-carry-draft]') as HTMLTextAreaElement).value).toContain('（对方没有结论）')
  })

  it('discards a draft without handing it over', () => {
    const props = panel()
    const { container } = render(<ComparePanel {...props} />)
    fireEvent.click(container.querySelector('[data-carry="a"]') as Element)
    fireEvent.click(container.querySelector('[data-carry-discard]') as Element)
    expect(container.querySelector('[data-carry-editor]')).toBeNull()
    expect(props.onCarry).not.toHaveBeenCalled()
  })
})

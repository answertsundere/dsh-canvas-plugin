import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { BranchTimeline, cutSeqAt } from '../src/client/ui/BranchTimeline.tsx'
import { ForkDialog } from '../src/client/ui/ForkDialog.tsx'
import { RightPanel } from '../src/client/ui/RightPanel.tsx'
import type { LiveTail } from '../src/client/live/live-tail.ts'
import type { BranchTurn } from '../src/shared/contracts.ts'

afterEach(cleanup)

const turn = (index: number, extra: Partial<BranchTurn> = {}): BranchTurn => ({
  index,
  firstSeq: index * 10,
  lastSeq: index * 10 + 4,
  tools: [],
  synthetic: false,
  ...extra,
})

const rows = [
  turn(0, { userMessage: '第一个问题', assistantSummary: '答完了', tools: [{ name: 'read', status: 'ok' }], endedAs: 'completed' }),
  turn(1, { userMessage: '第二个问题', endedAs: 'error' }),
]

const timeline = (over: Partial<Parameters<typeof BranchTimeline>[0]> = {}) => ({
  turns: rows,
  inheritedCount: 47,
  onFork: vi.fn(),
  cwdWarning: false,
  ...over,
})

describe('cutSeqAt', () => {
  it('cuts at the row\u2019s own last event', () => {
    expect(cutSeqAt(rows, 0)).toBe(4)
    expect(cutSeqAt(rows, 1)).toBe(14)
  })

  it('stays a real event seq even when rows are not contiguous', () => {
    // The spec words the cut as "the seq before the next row's first event".
    // With a gap (4 -> 20) that yields 19, which is not an event, and DSH
    // rejects a fork whose atSeq does not exist. The row's own last seq is real.
    const gapped = [turn(0, { firstSeq: 0, lastSeq: 4 }), turn(1, { firstSeq: 20, lastSeq: 24 })]
    expect(cutSeqAt(gapped, 0)).toBe(4)
    expect(cutSeqAt(gapped, 0)).not.toBe(gapped[1]!.firstSeq - 1)
  })

  it('returns undefined for a row that is not there', () => {
    expect(cutSeqAt(rows, 9)).toBeUndefined()
    expect(cutSeqAt([], 0)).toBeUndefined()
  })
})

describe('BranchTimeline', () => {
  it('renders one row per turn with its seq range and outcome', () => {
    const { container } = render(<BranchTimeline {...timeline()} />)
    expect(container.querySelectorAll('[data-timeline-row]')).toHaveLength(2)
    expect(container.querySelector('[data-timeline-row="0"] [data-row-seq]')?.textContent).toBe('seq 0–4')
    expect(container.querySelector('[data-timeline-row="1"] [data-row-seq]')?.textContent).toBe('seq 10–14')
    expect(container.querySelector('[data-timeline-row="1"] [data-row-ended]')?.textContent).toBe('error')
  })

  it('shows the inherited prefix size as excluded from comparison', () => {
    const { container } = render(<BranchTimeline {...timeline()} />)
    expect(container.querySelector('[data-timeline-inherited]')?.textContent).toContain('47')
  })

  it('calls onFork with the row index of the clicked button', () => {
    const props = timeline()
    const { container } = render(<BranchTimeline {...props} />)
    fireEvent.click(container.querySelector('[data-fork-row="1"]') as Element)
    expect(props.onFork).toHaveBeenCalledWith(1)
  })

  it('refuses to fork at a synthetic closer row', () => {
    const props = timeline({ turns: [turn(0, { synthetic: true, endedAs: 'forked' }), turn(1)] })
    const { container } = render(<BranchTimeline {...props} />)
    const button = container.querySelector('[data-fork-row="0"]') as HTMLButtonElement
    expect(button.disabled).toBe(true)
    fireEvent.click(button)
    expect(props.onFork).not.toHaveBeenCalled()
  })

  it('shows the shared-directory warning only when it applies', () => {
    const quiet = render(<BranchTimeline {...timeline()} />)
    expect(quiet.container.querySelector('[data-timeline-cwd-warning]')).toBeNull()
    const warned = render(<BranchTimeline {...timeline({ cwdWarning: true })} />)
    expect(warned.container.querySelector('[data-timeline-cwd-warning]')).not.toBeNull()
  })

  it('says so when the branch has no events of its own', () => {
    const { container } = render(<BranchTimeline {...timeline({ turns: [] })} />)
    expect(container.querySelector('[data-timeline-empty]')).not.toBeNull()
  })

  it('falls back to a placeholder when a turn carries no human prompt', () => {
    const { container } = render(<BranchTimeline {...timeline({ turns: [turn(0)] })} />)
    expect(container.querySelector('[data-timeline-row="0"] [data-row-user]')?.textContent).toContain('无用户消息')
  })
})

describe('ForkDialog', () => {
  it('renders nothing while closed', () => {
    const { container } = render(
      <ForkDialog open={false} atSeq={4} inheritedCount={0} onCancel={vi.fn()} onConfirm={vi.fn()} />,
    )
    expect(container.querySelector('[data-fork-dialog]')).toBeNull()
  })

  it('names the real cut and the inherited event count', () => {
    const { container } = render(
      <ForkDialog open atSeq={46} inheritedCount={47} onCancel={vi.fn()} onConfirm={vi.fn()} />,
    )
    // inheritedEventCount = atSeq + 1, so a cut at 46 inherits 47 events.
    expect(container.querySelector('[data-fork-cut]')?.textContent).toContain('seq 46')
    expect(container.querySelector('[data-fork-cut]')?.textContent).toContain('继承 47 个事件')
    expect(container.querySelector('[data-fork-cut]')?.textContent).toContain('更上游')
  })

  it('always shows the shared-directory warning', () => {
    const { container } = render(
      <ForkDialog open atSeq={1} inheritedCount={0} onCancel={vi.fn()} onConfirm={vi.fn()} />,
    )
    expect(container.querySelector('[data-fork-cwd-warning]')?.textContent).toContain('共享同一工作目录')
  })

  it('confirms with the typed instruction and the chosen mode', () => {
    const onConfirm = vi.fn()
    const { container } = render(
      <ForkDialog open atSeq={1} inheritedCount={0} onCancel={vi.fn()} onConfirm={onConfirm} />,
    )
    fireEvent.change(container.querySelector('[data-fork-instruction]') as Element, {
      target: { value: '  试另一条路  ' },
    })
    fireEvent.click(container.querySelector('[data-fork-mode="later"]') as Element)
    fireEvent.click(container.querySelector('[data-fork-confirm]') as Element)
    expect(onConfirm).toHaveBeenCalledWith('试另一条路', 'later')
  })

  it('defaults to running immediately', () => {
    const onConfirm = vi.fn()
    const { container } = render(
      <ForkDialog open atSeq={1} inheritedCount={0} onCancel={vi.fn()} onConfirm={onConfirm} />,
    )
    fireEvent.change(container.querySelector('[data-fork-instruction]') as Element, { target: { value: 'go' } })
    fireEvent.click(container.querySelector('[data-fork-confirm]') as Element)
    expect(onConfirm).toHaveBeenCalledWith('go', 'now')
  })

  it('blocks an immediate run with a blank instruction, but allows an empty branch', () => {
    // Submitting a blank "run now" is guaranteed to fail validation in the fork
    // transaction, so the button refuses it instead of burning a round trip.
    const onConfirm = vi.fn()
    const { container } = render(
      <ForkDialog open atSeq={1} inheritedCount={0} onCancel={vi.fn()} onConfirm={onConfirm} />,
    )
    const confirm = container.querySelector('[data-fork-confirm]') as HTMLButtonElement
    expect(confirm.disabled).toBe(true)

    fireEvent.click(container.querySelector('[data-fork-mode="later"]') as Element)
    expect(confirm.disabled).toBe(false)
    fireEvent.click(confirm)
    expect(onConfirm).toHaveBeenCalledWith('', 'later')
  })

  it('cancels', () => {
    const onCancel = vi.fn()
    const { container } = render(
      <ForkDialog open atSeq={1} inheritedCount={0} onCancel={onCancel} onConfirm={vi.fn()} />,
    )
    fireEvent.click(container.querySelector('[data-fork-cancel]') as Element)
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('surfaces an error and disables confirm while busy', () => {
    const { container } = render(
      <ForkDialog open atSeq={1} inheritedCount={0} busy error="分支创建失败" onCancel={vi.fn()} onConfirm={vi.fn()} />,
    )
    expect(container.querySelector('[data-fork-error]')?.textContent).toBe('分支创建失败')
    expect((container.querySelector('[data-fork-confirm]') as HTMLButtonElement).disabled).toBe(true)
  })
})

describe('RightPanel', () => {
  it('switches tabs and closes', () => {
    const onTabChange = vi.fn()
    const onClose = vi.fn()
    const { container } = render(
      <RightPanel tab="detail" onTabChange={onTabChange} onClose={onClose}>
        <div data-panel-content />
      </RightPanel>,
    )
    expect(container.querySelector('[data-panel-tab="detail"]')?.getAttribute('data-active')).toBe('true')
    fireEvent.click(container.querySelector('[data-panel-tab="compare"]') as Element)
    expect(onTabChange).toHaveBeenCalledWith('compare')
    fireEvent.click(container.querySelector('[data-panel-close]') as Element)
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(container.querySelector('[data-panel-content]')).not.toBeNull()
  })
})

const liveTailFixture: LiveTail = {
  attemptId: 'a1', turn: 0, step: 1, seq: 9, phase: 'thinking',
  reasoning: '先确认目录', text: '好的，我来处理', tool: { name: 'read', arguments: '{"path":"a"}' },
}

describe('BranchTimeline live output', () => {
  it('renders the in-flight reasoning, answer and tool while a branch streams', () => {
    render(
      <BranchTimeline
        turns={[]}
        inheritedCount={0}
        cwdWarning={false}
        onFork={() => {}}
        live={liveTailFixture}
      />,
    )
    expect(document.querySelector('[data-live-tail]')).not.toBeNull()
    expect(document.querySelector('[data-live-reasoning]')?.textContent).toContain('先确认目录')
    expect(document.querySelector('[data-live-text]')?.textContent).toContain('好的，我来处理')
    expect(document.querySelector('[data-live-tool]')?.textContent).toContain('read')
  })

  it('renders no live block when nothing is streaming', () => {
    render(<BranchTimeline turns={[]} inheritedCount={0} cwdWarning={false} onFork={() => {}} live={null} />)
    expect(document.querySelector('[data-live-tail]')).toBeNull()
    render(<BranchTimeline turns={[]} inheritedCount={0} cwdWarning={false} onFork={() => {}} />)
    expect(document.querySelector('[data-live-tail]')).toBeNull()
  })

  it('marks the tool phase so a running call is distinguishable from reasoning', () => {
    render(
      <BranchTimeline
        turns={[]}
        inheritedCount={0}
        cwdWarning={false}
        onFork={() => {}}
        live={{ ...liveTailFixture, reasoning: '', text: '', phase: 'tool' }}
      />,
    )
    expect(document.querySelector('[data-live-tail]')?.getAttribute('data-live-phase')).toBe('tool')
    expect(document.querySelector('[data-live-reasoning]')).toBeNull()
    expect(document.querySelector('[data-live-text]')).toBeNull()
  })
})

describe('RightPanel header action', () => {
  it('renders the prominent action and fires it', () => {
    const onAction = vi.fn()
    render(
      <RightPanel
        tab="detail"
        title="会话"
        headerAction={{ label: '⌖ Agent 实况', title: '蛛网', onClick: onAction }}
        onTabChange={() => {}}
        onClose={() => {}}
      >
        <div>body</div>
      </RightPanel>,
    )
    const action = document.querySelector('[data-panel-action]') as HTMLButtonElement
    expect(action.textContent).toBe('⌖ Agent 实况')
    fireEvent.click(action)
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('renders no action when none is given', () => {
    render(<RightPanel tab="detail" onTabChange={() => {}} onClose={() => {}}><div /></RightPanel>)
    expect(document.querySelector('[data-panel-action]')).toBeNull()
  })
})

describe('conclusion block', () => {
  it('shows the latest conclusion at the top of the detail panel', () => {
    render(<BranchTimeline turns={[]} inheritedCount={0} cwdWarning={false} onFork={() => {}} conclusion="最终结论：全部完成" />)
    const block = document.querySelector('[data-detail-conclusion]')
    expect(block?.textContent).toContain('最新结论')
    expect(block?.textContent).toContain('最终结论：全部完成')
  })

  it('says so when there is no conclusion yet', () => {
    render(<BranchTimeline turns={[]} inheritedCount={0} cwdWarning={false} onFork={() => {}} conclusion={null} />)
    expect(document.querySelector('[data-detail-conclusion]')?.textContent).toContain('还没有结论')
  })
})

describe('conclusion copy', () => {
  it('the 复制 button writes the conclusion to the clipboard', async () => {
    const writeText = vi.fn(async () => {})
    Object.assign(navigator, { clipboard: { writeText } })
    render(<BranchTimeline turns={[]} inheritedCount={0} cwdWarning={false} onFork={() => {}} conclusion="全部校验通过" />)
    fireEvent.click(document.querySelector('[data-copy-conclusion]') as Element)
    await waitFor(() => { expect(writeText).toHaveBeenCalledWith('全部校验通过') })
    await waitFor(() => { expect(document.querySelector('[data-copy-done]')?.textContent).toBe('已复制') })
  })

  it('no 复制 button when there is nothing to copy', () => {
    render(<BranchTimeline turns={[]} inheritedCount={0} cwdWarning={false} onFork={() => {}} conclusion={null} />)
    expect(document.querySelector('[data-copy-conclusion]')).toBeNull()
  })
})

describe('tool names in rows', () => {
  const turnWithTools = (tools: BranchTurn['tools']): BranchTurn => ({
    index: 0, userMessage: '问', tools, firstSeq: 1, lastSeq: 9, synthetic: false,
  })

  it('shows each tool name in sequence, errors in red', () => {
    render(<BranchTimeline
      turns={[turnWithTools([
        { name: 'read', status: 'ok' },
        { name: 'pwsh', status: 'error', preview: 'exit 1' },
      ])]}
      inheritedCount={0}
      cwdWarning={false}
      onFork={() => {}}
    />)
    const names = document.querySelector('[data-row-tool-names]')
    expect(names?.textContent).toContain('read')
    expect(names?.textContent).toContain('pwsh')
    const errSpan = names?.querySelector('[data-row-tool-error="true"]')
    expect(errSpan?.textContent).toContain('pwsh')
  })

  it('a turn without tools shows no name list', () => {
    render(<BranchTimeline turns={[turnWithTools([])]} inheritedCount={0} cwdWarning={false} onFork={() => {}} />)
    expect(document.querySelector('[data-row-tool-names]')).toBeNull()
  })
})

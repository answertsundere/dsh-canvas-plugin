import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { AgentSwarmView } from '../src/client/ui/AgentSwarmView.tsx'
import type { AgentSwarmState } from '../src/client/controllers/agent-swarm-controller.ts'
import { layoutSwarm } from '../src/client/swarm/swarm-model.ts'

afterEach(cleanup)

const NOW = 50_000

const swarmState = (over: Partial<AgentSwarmState> = {}): AgentSwarmState => ({
  rootId: 'root',
  rootLabel: '长任务会话',
  rootSnippet: { label: '输出', text: '正在汇总各路结果' },
  agents: [
    { id: 'a', label: '检索器', depth: 1, status: 'streaming', snippet: { label: '推理', text: '正在翻资料' }, tail: null },
    { id: 'b', label: '写手', depth: 1, status: 'idle', snippet: null, tail: null },
  ],
  edges: [
    { from: 'root', to: 'a' },
    { from: 'root', to: 'b' },
  ],
  layout: layoutSwarm([
    { id: 'a', parentId: 'root', depth: 1, mode: 'continuable' },
    { id: 'b', parentId: 'root', depth: 1, mode: 'continuable' },
  ], 'root'),
  heat: new Map([['a', NOW - 500]]),
  ...over,
})

describe('AgentSwarmView', () => {
  it('renders the web: header counts, one chip per agent, one edge per spoke', () => {
    const { container } = render(<AgentSwarmView swarm={swarmState()} onClose={() => {}} nowMs={NOW} />)
    expect(document.querySelector('[data-swarm-root]')).not.toBeNull()
    expect(container.textContent).toContain('2 个 agent')
    expect(container.textContent).toContain('1 个活跃')
    expect(container.textContent).toContain('检索器')
    expect(container.textContent).toContain('写手')
    expect(document.querySelectorAll('[data-swarm-edge]')).toHaveLength(2)
    expect(document.querySelectorAll('[data-swarm-agent]')).toHaveLength(3) // root + 2
  })

  it('a hot edge crawls a pulse toward the parent; a cold edge draws none', () => {
    const { container } = render(<AgentSwarmView swarm={swarmState()} onClose={() => {}} nowMs={NOW} />)
    expect(document.querySelectorAll('[data-swarm-pulse]')).toHaveLength(1)
    expect(container.querySelector('[data-swarm-edge="root->a"]')?.getAttribute('stroke')).toBe('#6af')
    expect(container.querySelector('[data-swarm-edge="root->b"]')?.getAttribute('stroke')).not.toBe('#6af')
  })

  it('shows the streaming agent snippet', () => {
    render(<AgentSwarmView swarm={swarmState()} onClose={() => {}} nowMs={NOW} />)
    const chip = document.querySelector('[data-swarm-agent="a"]')
    expect(chip?.querySelector('[data-swarm-snippet]')?.textContent).toContain('正在翻资料')
    expect(chip?.querySelector('[data-swarm-status]')?.getAttribute('data-swarm-status')).toBe('streaming')
  })

  it('the root chip shows what the inspected session itself is emitting', () => {
    render(<AgentSwarmView swarm={swarmState()} onClose={() => {}} nowMs={NOW} />)
    const root = document.querySelector('[data-swarm-root-agent="true"]')
    expect(root?.querySelector('[data-swarm-snippet]')?.textContent).toContain('正在汇总各路结果')
  })

  it('the close button hands control back to the canvas', () => {
    const onClose = vi.fn()
    render(<AgentSwarmView swarm={swarmState()} onClose={onClose} nowMs={NOW} />)
    fireEvent.click(document.querySelector('[data-swarm-close]') as Element)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})

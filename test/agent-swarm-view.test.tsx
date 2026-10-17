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
  activity: { turnCount: 0, openTurn: false, currentTurn: null, tools: [], pendingToolId: null },
  toolLayout: { positions: new Map() },
  todos: new Map(),
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
    expect(container.textContent).toContain('近 0 轮')
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

const activityState = (over: Partial<AgentSwarmState> = {}): AgentSwarmState => swarmState({
  activity: {
    turnCount: 15,
    openTurn: true,
    currentTurn: 15,
    tools: [
      { id: 'c1', name: 'read', status: 'ok', turn: 15 },
      { id: 'c2', name: 'grep', status: 'pending', turn: 15 },
    ],
    pendingToolId: 'c2',
  },
  toolLayout: {
    positions: new Map([['c1', { x: 120, y: -200 }], ['c2', { x: -120, y: -200 }]]),
  },
  heat: new Map([['a', NOW - 500], ['tool:c2', NOW - 300]]),
  ...over,
})

describe('AgentSwarmView activity ring', () => {
  it('renders tool chips with status marks and the header progress line', () => {
    const { container } = render(<AgentSwarmView swarm={activityState()} onClose={() => {}} nowMs={NOW} />)
    expect(container.textContent).toContain('近 16 轮')
    expect(container.textContent).toContain('正在 grep')
    const pending = document.querySelector('[data-swarm-tool="c2"]')
    expect(pending?.getAttribute('data-swarm-tool-status')).toBe('pending')
    expect(pending?.textContent).toContain('grep')
    const done = document.querySelector('[data-swarm-tool="c1"]')
    expect(done?.getAttribute('data-swarm-tool-status')).toBe('ok')
  })

  it('a pending tool draws a hot edge and a crawling pulse; a settled one is dashed and cold', () => {
    render(<AgentSwarmView swarm={activityState()} onClose={() => {}} nowMs={NOW} />)
    expect(document.querySelectorAll('[data-swarm-pulse]')).toHaveLength(2) // agent a + pending tool
    expect(document.querySelector('[data-swarm-pulse="tool:c2"]')).not.toBeNull()
    expect(document.querySelector('[data-swarm-tool-edge="c2"]')?.getAttribute('stroke')).toBe('#6af')
    const settledEdge = document.querySelector('[data-swarm-tool-edge="c1"]')
    expect(settledEdge?.getAttribute('stroke-dasharray')).toBe('3 4')
  })
})

describe('AgentSwarmView todo checklist', () => {
  it('renders the root checklist with progress and glyph states', () => {
    const state = swarmState({
      todos: new Map([['root', [
        { content: '拆需求', status: 'completed' },
        { content: '写代码', status: 'in_progress' },
        { content: '测试', status: 'pending' },
      ]]]),
    })
    const { container } = render(<AgentSwarmView swarm={state} onClose={() => {}} nowMs={NOW} />)
    expect(container.textContent).toContain('任务 1/3')
    const done = container.querySelector('[data-swarm-todo-status="completed"]')
    const active = container.querySelector('[data-swarm-todo-status="in_progress"]')
    expect(done?.textContent).toContain('拆需求')
    expect(active?.textContent).toContain('写代码')
  })

  it('renders an agent checklist on its chip too', () => {
    const state = swarmState({
      todos: new Map([['a', [{ content: '抓取页面', status: 'in_progress' }]]]),
    })
    render(<AgentSwarmView swarm={state} onClose={() => {}} nowMs={NOW} />)
    const chip = document.querySelector('[data-swarm-agent="a"]')
    expect(chip?.querySelector('[data-swarm-todos]')?.textContent).toContain('抓取页面')
  })
})

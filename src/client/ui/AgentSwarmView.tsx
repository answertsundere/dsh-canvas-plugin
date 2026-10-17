import { useEffect, useState, type CSSProperties, type FC } from 'react'
import type { AgentSwarmState } from '../controllers/agent-swarm-controller.ts'
import { pulseProgress, type SwarmTodo } from '../swarm/swarm-model.ts'
import { theme } from '../theme.ts'

export interface AgentSwarmViewProps {
  readonly swarm: AgentSwarmState
  onClose(): void
  /**
   * Frozen clock for tests and screenshots; absent → the view animates itself
   * (the controller only timestamps activity, the view is what moves).
   */
  readonly nowMs?: number
}

const VIEW = { width: 960, height: 660 }

const chipStyle = (streaming: boolean): CSSProperties => ({
  position: 'absolute',
  transform: 'translate(-50%, -50%)',
  maxWidth: 190,
  padding: '6px 10px',
  borderRadius: 10,
  background: theme.card,
  border: `1px solid ${streaming ? theme.accent : theme.border}`,
  boxShadow: streaming ? `0 0 12px ${theme.accent}55` : 'none',
  color: theme.text,
  font: '12px/1.4 system-ui, sans-serif',
  cursor: 'default',
  userSelect: 'none',
})

const statusColor = (status: 'streaming' | 'running' | 'idle'): string =>
  status === 'streaming' ? theme.accent : status === 'running' ? theme.warn : theme.muted

const TODO_GLYPH: Record<SwarmTodo['status'], { glyph: string; color: string }> = {
  completed: { glyph: '✓', color: '#2f9e6f' },
  in_progress: { glyph: '◐', color: theme.warn },
  pending: { glyph: '○', color: theme.muted },
}

/**
 * The agent's checklist — the task list its own todo tool wrote into the
 * session log (`todo/write`, whole-list snapshots). Completed count first, so
 * progress is readable at a glance.
 */
const TodoList: FC<{ readonly items: readonly SwarmTodo[]; readonly limit: number }> = ({ items, limit }) => {
  const done = items.filter(item => item.status === 'completed').length
  return (
    <div data-swarm-todos style={{ marginTop: 4 }}>
      <div style={{ color: theme.muted, marginBottom: 2 }}>
        任务 {done}/{items.length}
      </div>
      {items.slice(0, limit).map(item => (
        <div
          key={item.content}
          data-swarm-todo-status={item.status}
          style={{ display: 'flex', gap: 4, color: item.status === 'completed' ? theme.muted : theme.text }}
        >
          <span style={{ color: TODO_GLYPH[item.status].color, flex: '0 0 auto' }}>{TODO_GLYPH[item.status].glyph}</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.content}</span>
        </div>
      ))}
      {items.length > limit && (
        <div style={{ color: theme.muted }}>+{items.length - limit} 项</div>
      )}
    </div>
  )
}

/**
 * The 「Agent 实况」 overlay: one session's agent web.
 *
 * The root sits at the center, its subagents on the ring around it, theirs on
 * smaller rings. Activity is the spider part: while an agent emits, a glowing
 * dot crawls along its spoke toward the parent, and the edge itself glows;
 * after the stream stops the dot crawls home once and the edge goes dark.
 */
export const AgentSwarmView: FC<AgentSwarmViewProps> = ({ swarm, onClose, nowMs }) => {
  const [tick, setTick] = useState(() => Date.now())
  useEffect(() => {
    if (nowMs !== undefined) return
    const timer = window.setInterval(() => setTick(Date.now()), 60)
    return () => { window.clearInterval(timer) }
  }, [nowMs])
  const now = nowMs ?? tick

  const positionOf = (id: string): { x: number; y: number } => swarm.layout.positions.get(id) ?? { x: 0, y: 0 }
  const toolPositionOf = (id: string): { x: number; y: number } => swarm.toolLayout.positions.get(id) ?? { x: 0, y: 0 }
  const agents = swarm.agents
  const pendingTool = swarm.activity.tools.find(tool => tool.id === swarm.activity.pendingToolId) ?? null

  return (
    <div
      data-swarm-root
      style={{
        position: 'absolute', inset: 0, zIndex: 5,
        background: theme.bg, color: theme.text,
        display: 'flex', flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
          borderBottom: `1px solid ${theme.border}`, background: theme.panel,
          font: '13px system-ui, sans-serif',
        }}
      >
        <span style={{ fontWeight: 600 }}>Agent 实况</span>
        <span style={{ color: theme.muted }}>{swarm.rootLabel}</span>
        <span style={{ color: theme.muted }}>
          {swarm.agents.length} 个 agent · 近 {swarm.activity.turnCount + (swarm.activity.openTurn ? 1 : 0)} 轮
          {swarm.activity.openTurn ? '（进行中）' : ''}
          {pendingTool !== null ? ` · 正在 ${pendingTool.name}` : ''}
        </span>
        <button
          type="button"
          data-swarm-close
          onClick={onClose}
          style={{
            marginLeft: 'auto', background: theme.card, color: theme.text,
            border: `1px solid ${theme.border}`, borderRadius: 6,
            padding: '3px 10px', font: 'inherit', cursor: 'pointer',
          }}
        >
          返回画布
        </button>
      </div>

      <div style={{ position: 'relative', flex: '1 1 auto', overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute', left: '50%', top: '50%',
            width: VIEW.width, height: VIEW.height,
            marginLeft: -VIEW.width / 2, marginTop: -VIEW.height / 2,
          }}
        >
          <svg
            data-swarm-web
            width={VIEW.width}
            height={VIEW.height}
            style={{ position: 'absolute', inset: 0 }}
          >
            <g transform={`translate(${VIEW.width / 2}, ${VIEW.height / 2})`}>
              {swarm.edges.map(edge => {
                const from = positionOf(edge.from)
                const to = positionOf(edge.to)
                const heatAt = swarm.heat.get(edge.to)
                const progress = heatAt === undefined ? null : pulseProgress(heatAt, now)
                return (
                  <g key={`${edge.from}->${edge.to}`}>
                    <line
                      data-swarm-edge={`${edge.from}->${edge.to}`}
                      x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                      stroke={progress === null ? theme.border : theme.accent}
                      strokeWidth={progress === null ? 1.2 : 1.8}
                      opacity={progress === null ? 0.9 : 1}
                    />
                    {progress !== null && (
                      <circle
                        data-swarm-pulse={`${edge.from}->${edge.to}`}
                        cx={to.x + (from.x - to.x) * progress}
                        cy={to.y + (from.y - to.y) * progress}
                        r={4}
                        fill={theme.accent}
                      />
                    )}
                  </g>
                )
              })}
              {swarm.activity.tools.map(tool => {
                const to = toolPositionOf(tool.id)
                const heatAt = swarm.heat.get(`tool:${tool.id}`)
                const progress = heatAt === undefined ? null : pulseProgress(heatAt, now)
                return (
                  <g key={`tool->${tool.id}`}>
                    <line
                      data-swarm-tool-edge={tool.id}
                      x1={0} y1={0} x2={to.x} y2={to.y}
                      stroke={progress === null ? theme.border : theme.accent}
                      strokeWidth={progress === null ? 1 : 1.6}
                      strokeDasharray={tool.status === 'pending' ? undefined : '3 4'}
                      opacity={progress === null ? 0.7 : 1}
                    />
                    {progress !== null && (
                      <circle
                        data-swarm-pulse={`tool:${tool.id}`}
                        cx={to.x + (0 - to.x) * progress}
                        cy={to.y + (0 - to.y) * progress}
                        r={4}
                        fill={theme.accent}
                      />
                    )}
                  </g>
                )
              })}
            </g>
          </svg>

          {agents.map(agent => {
            const p = positionOf(agent.id)
            return (
              <div key={agent.id} data-swarm-agent={agent.id} style={{ ...chipStyle(agent.status === 'streaming'), left: VIEW.width / 2 + p.x, top: VIEW.height / 2 + p.y }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    data-swarm-status={agent.status}
                    style={{ width: 8, height: 8, borderRadius: 4, background: statusColor(agent.status), flex: '0 0 auto' }}
                  />
                  <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {agent.label}
                  </span>
                </div>
                {agent.snippet !== null && (
                  <div
                    data-swarm-snippet
                    style={{ color: theme.muted, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    <span style={{ color: agent.snippet.label === '工具' ? theme.accent : theme.muted }}>{agent.snippet.label}</span>
                    {' '}
                    {agent.snippet.text}
                  </div>
                )}
                {(() => {
                  const agentTodos = swarm.todos.get(agent.id)
                  return agentTodos === undefined ? null : <TodoList items={agentTodos} limit={4} />
                })()}
              </div>
            )
          })}

          {swarm.activity.tools.map(tool => {
            const p = toolPositionOf(tool.id)
            const pending = tool.status === 'pending'
            return (
              <div
                key={tool.id}
                data-swarm-tool={tool.id}
                data-swarm-tool-status={tool.status}
                style={{
                  position: 'absolute',
                  transform: 'translate(-50%, -50%)',
                  left: VIEW.width / 2 + p.x,
                  top: VIEW.height / 2 + p.y,
                  maxWidth: 170,
                  padding: '3px 9px',
                  borderRadius: 8,
                  background: theme.card,
                  border: `1px solid ${pending ? theme.accent : tool.status === 'error' ? '#e0554d' : theme.border}`,
                  boxShadow: pending ? `0 0 12px ${theme.accent}55` : 'none',
                  color: pending ? theme.text : theme.muted,
                  font: '11px/1.4 system-ui, sans-serif',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  userSelect: 'none',
                }}
              >
                {pending ? '⚙ ' : tool.status === 'error' ? '✗ ' : '✓ '}
                {tool.name}
              </div>
            )
          })}

          <div
            data-swarm-agent={swarm.rootId}
            data-swarm-root-agent="true"
            style={{
              ...chipStyle(swarm.heat.get(swarm.rootId) !== undefined
                && pulseProgress(swarm.heat.get(swarm.rootId) as number, now) !== null),
              left: VIEW.width / 2,
              top: VIEW.height / 2,
              borderWidth: 1.5,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: theme.text, flex: '0 0 auto' }} />
              <span style={{ fontWeight: 700 }}>{swarm.rootLabel}</span>
            </div>
            {swarm.rootSnippet !== null && (
              <div
                data-swarm-snippet
                style={{ color: theme.muted, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}
              >
                <span style={{ color: swarm.rootSnippet.label === '工具' ? theme.accent : theme.muted }}>{swarm.rootSnippet.label}</span>
                {' '}
                {swarm.rootSnippet.text}
              </div>
            )}
            {(() => {
              const rootTodos = swarm.todos.get(swarm.rootId)
              return rootTodos === undefined ? null : <TodoList items={rootTodos} limit={7} />
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}

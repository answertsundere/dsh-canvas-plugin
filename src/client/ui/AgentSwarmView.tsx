import { useEffect, useState, type CSSProperties, type FC } from 'react'
import type { AgentSwarmState } from '../controllers/agent-swarm-controller.ts'
import {
  pulseProgress,
  sweepProgress,
  toolGlyph,
  turnGroups,
  type SwarmTodo,
} from '../swarm/swarm-model.ts'
import { theme } from '../theme.ts'
import { RobotAvatar, type RobotState } from './RobotAvatar.tsx'

export interface AgentSwarmViewProps {
  readonly swarm: AgentSwarmState
  onClose(): void
  /**
   * Frozen clock for tests and screenshots; absent → the view animates itself
   * (the controller only timestamps activity, the view is what moves).
   */
  readonly nowMs?: number
}

// Must fit the layout radii the controller produces: agents at 230, tools at
// 340, plus the turn arcs and labels outside the tool ring.
const VIEW = { width: 980, height: 800 }
const RING = 230
const TOOL_RING = 340

const chipStyle = (streaming: boolean): CSSProperties => ({
  position: 'absolute',
  transform: 'translate(-50%, -50%)',
  maxWidth: 200,
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

const AGENT_ROBOT: Record<'streaming' | 'running' | 'idle', RobotState> = {
  streaming: 'working',
  running: 'working',
  idle: 'idle',
}

const TOOL_ROBOT: Record<'pending' | 'ok' | 'error', RobotState> = {
  pending: 'working',
  ok: 'done',
  error: 'failed',
}

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
 * A silk thread: the spoke sags to one side of the straight line, so the web
 * reads as woven rather than as a sunburst. Deterministic per endpoint pair.
 */
function silkPath(from: { x: number; y: number }, to: { x: number; y: number }, index: number): string {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const length = Math.hypot(dx, dy) || 1
  const sag = Math.min(46, length * 0.14) * (index % 2 === 0 ? 1 : -1)
  const cx = (from.x + to.x) / 2 + (-dy / length) * sag
  const cy = (from.y + to.y) / 2 + (dx / length) * sag
  return `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`
}

/** Point at `t` along the same quadratic the silk draws. */
function silkPoint(from: { x: number; y: number }, to: { x: number; y: number }, index: number, t: number): { x: number; y: number } {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const length = Math.hypot(dx, dy) || 1
  const sag = Math.min(46, length * 0.14) * (index % 2 === 0 ? 1 : -1)
  const cx = (from.x + to.x) / 2 + (-dy / length) * sag
  const cy = (from.y + to.y) / 2 + (dx / length) * sag
  const u = 1 - t
  return {
    x: u * u * from.x + 2 * u * t * cx + t * t * to.x,
    y: u * u * from.y + 2 * u * t * cy + t * t * to.y,
  }
}

/** A comet: the bright head plus two fading tail dots. */
const Comet: FC<{
  readonly from: { x: number; y: number }
  readonly to: { x: number; y: number }
  readonly index: number
  readonly progress: number
  readonly attr: string
  readonly label: string
}> = ({ from, to, index, progress, attr, label }) => (
  <>
    {[0, 0.05, 0.1].map((lag, lagIndex) => {
      const t = Math.max(0, progress - lag)
      const point = silkPoint(from, to, index, t)
      const head = lagIndex === 0
      return (
        <circle
          key={lag}
          {...{ [attr]: head ? label : undefined }}
          data-swarm-pulse-tail={head ? undefined : label}
          cx={point.x}
          cy={point.y}
          r={head ? 4 : 3 - lagIndex * 0.6}
          fill={theme.accent}
          opacity={head ? 1 : 0.5 - lagIndex * 0.15}
        />
      )
    })}
  </>
)

/**
 * The 「Agent 实况」 overlay: one session's agent web.
 *
 * Structure: concentric silk rings, the root at the center, its subagents on
 * the inner ring, the session's own tool history on the outer ring grouped by
 * turn (each group's span marked on the rim). Motion: while an agent or tool
 * is hot, a comet crawls its silk toward the parent; when nothing is hot, a
 * dim sweep walks every thread in work order, on repeat — the web is never
 * still, and the sweep reads as the order the work actually ran in.
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
  const tools = swarm.activity.tools
  const pendingTool = tools.find(tool => tool.id === swarm.activity.pendingToolId) ?? null
  const groups = turnGroups(tools)
  const rootTodos = swarm.todos.get(swarm.rootId)
  const rootHeat = swarm.heat.get(swarm.rootId)
  const rootHot = rootHeat !== undefined && pulseProgress(rootHeat, now) !== null

  const angleOf = (index: number): number => -Math.PI / 2 + (2 * Math.PI * index) / Math.max(tools.length, 1)
  const polar = (angle: number, radius: number): { x: number; y: number } =>
    ({ x: radius * Math.cos(angle), y: radius * Math.sin(angle) })

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
          {agents.length} 个 agent · 近 {swarm.activity.turnCount + (swarm.activity.openTurn ? 1 : 0)} 轮
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
              {/* Silk texture: concentric rings under everything. */}
              {[RING * 0.55, RING, TOOL_RING, TOOL_RING + 70].map(radius => (
                <circle
                  key={radius}
                  data-swarm-guide={Math.round(radius)}
                  cx={0} cy={0} r={radius}
                  fill="none"
                  stroke={theme.border}
                  strokeWidth={1}
                  opacity={radius === RING || radius === TOOL_RING ? 0.55 : 0.25}
                />
              ))}

              {/* Turn spans on the rim: where one turn's work begins and ends. */}
              {tools.length > 1 && groups.map(group => {
                if (group.endIndex <= group.startIndex) return null
                const startAngle = angleOf(group.startIndex)
                const endAngle = angleOf(group.endIndex)
                const start = polar(startAngle, TOOL_RING + 26)
                const end = polar(endAngle, TOOL_RING + 26)
                const mid = polar((startAngle + endAngle) / 2, TOOL_RING + 52)
                return (
                  <g key={`turn-${group.turn}`}>
                    <path
                      data-swarm-turn-arc={group.turn}
                      d={`M ${start.x} ${start.y} A ${TOOL_RING + 26} ${TOOL_RING + 26} 0 0 1 ${end.x} ${end.y}`}
                      fill="none"
                      stroke={theme.accent}
                      strokeWidth={1}
                      opacity={0.35}
                    />
                    <text
                      data-swarm-turn-label={group.turn}
                      x={mid.x}
                      y={mid.y}
                      fill={theme.muted}
                      fontSize={10}
                      textAnchor="middle"
                    >
                      第 {group.turn + 1} 轮
                    </text>
                  </g>
                )
              })}

              {swarm.edges.map((edge, edgeIndex) => {
                const from = positionOf(edge.from)
                const to = positionOf(edge.to)
                const heatAt = swarm.heat.get(edge.to)
                const progress = heatAt === undefined ? null : pulseProgress(heatAt, now)
                const sweep = progress === null
                  ? sweepProgress(tools.length + edgeIndex, now)
                  : null
                const silk = silkPath(from, to, tools.length + edgeIndex)
                return (
                  <g key={`${edge.from}->${edge.to}`}>
                    <path
                      data-swarm-edge={`${edge.from}->${edge.to}`}
                      d={silk}
                      fill="none"
                      stroke={progress === null ? theme.border : theme.accent}
                      strokeWidth={progress === null ? 1.2 : 1.8}
                      opacity={progress === null ? 0.9 : 1}
                      className={progress === null ? undefined : 'dsh-swarm-hot'}
                    />
                    {progress !== null && (
                      <Comet from={from} to={to} index={tools.length + edgeIndex} progress={progress} attr="data-swarm-pulse" label={`${edge.from}->${edge.to}`} />
                    )}
                    {sweep !== null && (
                      <circle
                        data-swarm-sweep={`${edge.from}->${edge.to}`}
                        cx={silkPoint(from, to, tools.length + edgeIndex, sweep).x}
                        cy={silkPoint(from, to, tools.length + edgeIndex, sweep).y}
                        r={3}
                        fill={theme.accent}
                        opacity={0.55}
                      />
                    )}
                  </g>
                )
              })}
              {tools.map((tool, toolIndex) => {
                const to = toolPositionOf(tool.id)
                const heatAt = swarm.heat.get(`tool:${tool.id}`)
                const progress = heatAt === undefined ? null : pulseProgress(heatAt, now)
                const sweep = progress === null ? sweepProgress(toolIndex, now) : null
                return (
                  <g key={`tool->${tool.id}`}>
                    <path
                      data-swarm-tool-edge={tool.id}
                      d={silkPath({ x: 0, y: 0 }, to, toolIndex)}
                      fill="none"
                      stroke={progress === null ? theme.border : theme.accent}
                      strokeWidth={progress === null ? 1 : 1.6}
                      strokeDasharray={tool.status === 'pending' ? undefined : '3 4'}
                      opacity={progress === null ? 0.7 : 1}
                      className={progress === null ? undefined : 'dsh-swarm-hot'}
                    />
                    {progress !== null && (
                      <Comet from={{ x: 0, y: 0 }} to={to} index={toolIndex} progress={progress} attr="data-swarm-pulse" label={`tool:${tool.id}`} />
                    )}
                    {sweep !== null && (
                      <circle
                        data-swarm-sweep={`tool:${tool.id}`}
                        cx={silkPoint({ x: 0, y: 0 }, to, toolIndex, sweep).x}
                        cy={silkPoint({ x: 0, y: 0 }, to, toolIndex, sweep).y}
                        r={3}
                        fill={theme.accent}
                        opacity={0.55}
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
                  <RobotAvatar
                    size={26}
                    color={statusColor(agent.status)}
                    state={AGENT_ROBOT[agent.status]}
                    statusAttr={{ name: 'data-swarm-status', value: agent.status }}
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

          {tools.map(tool => {
            const p = toolPositionOf(tool.id)
            const pending = tool.status === 'pending'
            const failed = tool.status === 'error'
            const visual = toolGlyph(tool.name)
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
                  display: 'flex', alignItems: 'center', gap: 6,
                  maxWidth: 180,
                  padding: '4px 10px 4px 8px',
                  borderRadius: 8,
                  background: theme.card,
                  border: `1px solid ${pending ? theme.accent : failed ? '#e0554d' : theme.border}`,
                  borderLeft: `3px solid ${failed ? '#e0554d' : visual.color}`,
                  boxShadow: pending ? `0 0 12px ${theme.accent}55` : 'none',
                  color: pending ? theme.text : failed ? '#e0554d' : theme.muted,
                  font: '11px/1.4 system-ui, sans-serif',
                  whiteSpace: 'nowrap',
                  userSelect: 'none',
                }}
              >
                <RobotAvatar
                  size={20}
                  color={failed ? '#e0554d' : visual.color}
                  state={TOOL_ROBOT[tool.status]}
                />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{tool.name}</span>
                <span style={{ flex: '0 0 auto', color: failed ? '#e0554d' : theme.muted }}>
                  {pending ? '…' : failed ? '✗' : '✓'}
                </span>
              </div>
            )
          })}

          <div
            data-swarm-agent={swarm.rootId}
            data-swarm-root-agent="true"
            style={{
              position: 'absolute',
              transform: 'translate(-50%, -50%)',
              left: VIEW.width / 2,
              top: VIEW.height / 2,
              maxWidth: 280,
              padding: '10px 14px',
              borderRadius: 12,
              background: theme.cardActive,
              border: `1.5px solid ${rootHot ? theme.accent : theme.border}`,
              boxShadow: rootHot ? `0 0 16px ${theme.accent}66` : 'none',
              color: theme.text,
              font: '12px/1.5 system-ui, sans-serif',
              userSelect: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <RobotAvatar size={38} color={theme.text} state={rootHot ? 'working' : 'idle'} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {swarm.rootLabel}
                </div>
                <div style={{ color: theme.muted }}>
                  {agents.length} 个 agent · {tools.length} 个工具
                </div>
              </div>
            </div>
            {swarm.rootSnippet !== null && (
              <div
                data-swarm-snippet
                style={{ color: theme.muted, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }}
              >
                <span style={{ color: swarm.rootSnippet.label === '工具' ? theme.accent : theme.muted }}>{swarm.rootSnippet.label}</span>
                {' '}
                {swarm.rootSnippet.text}
              </div>
            )}
            {rootTodos === undefined ? null : <TodoList items={rootTodos} limit={7} />}
          </div>
        </div>
      </div>
    </div>
  )
}

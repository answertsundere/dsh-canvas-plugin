import {
  useEffect, useReducer, useRef, useState,
  type CSSProperties, type FC, type MouseEvent as ReactMouseEvent,
} from 'react'
import type { ComparisonResult, LaunchMode, SessionId } from '../../shared/contracts.ts'
import { theme } from '../theme.ts'
import { layoutLayered, type LayoutPoint } from '../graph/graph-layout.ts'
import { parallelWriteIds } from '../graph/parallel-write.ts'
import { tailSnippet } from '../live/live-tail.ts'
import { NodeCard } from './NodeCard.tsx'
import { RightPanel, type RightPanelTab } from './RightPanel.tsx'
import { BranchTimeline, cutSeqAt } from './BranchTimeline.tsx'
import { ForkDialog } from './ForkDialog.tsx'
import { ComparePanel } from './ComparePanel.tsx'
import { AgentSwarmView } from './AgentSwarmView.tsx'
import type { AgentSwarmController } from '../controllers/agent-swarm-controller.ts'
import type { CanvasDetail, CanvasModel, CanvasView } from './canvas-model.ts'

export interface CanvasTabProps {
  /** Absent until the controller layer is wired in; the tab still boots. */
  readonly canvas?: CanvasModel
}

const NODE_WIDTH = 200
const NODE_HEIGHT = 72
const MIN_SCALE = 0.4
const MAX_SCALE = 2
/** Nominal viewport the fit-view button targets, in canvas units. */
const FIT_VIEWPORT = { width: 1000, height: 600 }

/**
 * The canvas has no CSS pipeline (inline styles only), so the few things that
 * need real CSS — the breathing halo keyframes and the ⌖ hover — ride in as a
 * single injected sheet. The halo color comes from each card's --breath-color,
 * which is the status's own color.
 */
const CANVAS_CSS = `
@keyframes dshCanvasBreath {
  0%, 100% { box-shadow: 0 0 0 0 transparent; }
  50% { box-shadow: 0 0 18px 3px var(--breath-color); }
}
.dsh-canvas-inspect:hover { color: ${theme.text}; border-color: ${theme.accent}; }
`

export const CanvasTab: FC<CanvasTabProps> = ({ canvas }) => {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<RightPanelTab>('detail')
  const [detail, setDetail] = useState<CanvasDetail | null>(null)
  const [comparison, setComparison] = useState<ComparisonResult | null>(null)
  const [fork, setFork] = useState<{ rowIndex: number; atSeq: number } | null>(null)
  const [forkBusy, setForkBusy] = useState(false)
  const [forkError, setForkError] = useState<string | undefined>(undefined)
  const [carried, setCarried] = useState(false)
  const [swarm, setSwarm] = useState<AgentSwarmController | null>(null)
  const drag = useRef<{ startX: number; startY: number; viewX: number; viewY: number } | null>(null)
  const [, bump] = useReducer((tick: number) => tick + 1, 0)

  const selectedId = canvas?.selectedId
  const compareKey = canvas?.compareIds.join('\u0000') ?? ''

  // A running node has a live window; its detail updates in place, so the tab
  // must not pay for (or overwrite it with) the one-shot read. Everything that
  // acts on "the detail the user is looking at" — rows, fork cut, session id —
  // reads this effective value, not the one-shot state.
  const liveDetail = selectedId === undefined ? null : canvas?.liveDetail?.(selectedId) ?? null
  const effectiveDetail = liveDetail ?? detail
  const tail = selectedId === undefined ? null : canvas?.tailOf?.(selectedId) ?? null

  // The slot hands the tab a single model object for its lifetime, so live
  // updates arrive through the model's own invalidation channel rather than
  // through new props.
  useEffect(() => canvas?.subscribe?.(() => { bump() }), [canvas])

  // The swarm view owns its controller: every open window is a retain, so the
  // tab disposes it on close and on unmount.
  const swarmRef = useRef<AgentSwarmController | null>(null)
  swarmRef.current = swarm
  useEffect(() => swarm?.subscribe(() => { bump() }), [swarm])
  useEffect(() => () => { swarmRef.current?.dispose() }, [])

  const openSwarm = (id: string): void => {
    if (canvas?.inspectSwarm === undefined) return
    swarmRef.current?.dispose()
    const next = canvas.inspectSwarm(id)
    swarmRef.current = next
    setSwarm(next)
  }
  const closeSwarm = (): void => {
    swarmRef.current?.dispose()
    swarmRef.current = null
    setSwarm(null)
  }

  // Right-click fork: selecting a node whose detail has not loaded yet means
  // the cut point arrives later — remember the intent, open the dialog when
  // the effective detail shows up.
  const [pendingForkFor, setPendingForkFor] = useState<string | null>(null)
  useEffect(() => {
    if (pendingForkFor === null || effectiveDetail?.sessionId !== pendingForkFor) return
    const rows = effectiveDetail.turns
    let lastIdx = -1
    for (let i = rows.length - 1; i >= 0; i -= 1) {
      const row = rows[i]
      if (row !== undefined && !row.synthetic) { lastIdx = i; break }
    }
    setPendingForkFor(null)
    if (lastIdx < 0) return
    const atSeq = cutSeqAt(rows, lastIdx)
    if (atSeq === undefined) return
    setTab('detail')
    setFork({ rowIndex: lastIdx, atSeq })
  }, [pendingForkFor, effectiveDetail])

  const [menu, setMenu] = useState<{ x: number; y: number; id: string } | null>(null)
  const openContext = (event: ReactMouseEvent<HTMLDivElement>, id: string): void => {
    setMenu({ x: event.clientX, y: event.clientY, id })
  }
  const menuFork = (): void => {
    const id = menu?.id
    setMenu(null)
    if (id === undefined) return
    if (canvas?.selectedId !== id) canvas?.onSelect(id)
    setPendingForkFor(id)
  }

  // A node's turns come from its live window while one is open, and from a
  // one-shot read otherwise — including when a running session stops and its
  // window closes under the selection.
  const hasLiveDetail = liveDetail !== null
  useEffect(() => {
    setTab('detail')
    // A pending right-click fork opens the dialog for this very selection in
    // the same commit; resetting here would clear it before it is seen.
    if (pendingForkFor === null) {
      setFork(null)
      setForkError(undefined)
    }
    if (canvas?.detail === undefined || selectedId === undefined || hasLiveDetail) {
      setDetail(null)
      return
    }
    let live = true
    void canvas.detail(selectedId).then(next => { if (live) setDetail(next) })
    return () => { live = false }
  }, [canvas, selectedId, hasLiveDetail])

  useEffect(() => {
    if (tab !== 'compare' || canvas?.comparison === undefined) return
    let live = true
    void canvas.comparison().then(next => { if (live) setComparison(next) })
    return () => { live = false }
  }, [canvas, tab, compareKey])

  if (canvas === undefined) {
    return (
      <div
        data-canvas-root
        data-canvas-unwired="true"
        style={{ height: '100%', background: theme.bg, color: theme.muted, padding: 16, font: '12px system-ui, sans-serif' }}
      >
        画布尚未接线
      </div>
    )
  }

  const layout = layoutLayered(canvas.graph, { nodeWidth: NODE_WIDTH, nodeHeight: NODE_HEIGHT })
  const parallelWrite = parallelWriteIds(canvas.graph)
  const now = Date.now()
  const needle = query.trim().toLowerCase()
  const selectedNode = selectedId === undefined ? undefined : canvas.graph.nodes.get(selectedId)

  const handleNodeClick = (event: ReactMouseEvent<HTMLDivElement>, id: SessionId): void => {
    if (event.metaKey || event.ctrlKey) canvas.onToggleCompare(id)
    else canvas.onSelect(id)
  }

  const fit = (): void => {
    if (layout.width === 0 || layout.height === 0) {
      canvas.onViewChange({ x: 0, y: 0, scale: 1 })
      return
    }
    const scale = clamp(Math.min(
      FIT_VIEWPORT.width / layout.width,
      FIT_VIEWPORT.height / layout.height,
      1,
    ), MIN_SCALE, MAX_SCALE)
    canvas.onViewChange({
      x: (FIT_VIEWPORT.width - layout.width * scale) / 2,
      y: (FIT_VIEWPORT.height - layout.height * scale) / 2,
      scale,
    })
  }

  const openFork = (rowIndex: number): void => {
    const atSeq = cutSeqAt(effectiveDetail?.turns ?? [], rowIndex)
    if (atSeq === undefined) return
    setForkError(undefined)
    setFork({ rowIndex, atSeq })
  }

  const confirmFork = async (instruction: string, mode: LaunchMode): Promise<void> => {
    const sessionId = effectiveDetail?.sessionId
    if (sessionId === undefined || fork === null || canvas.forkFromRow === undefined) return
    setForkBusy(true)
    setForkError(undefined)
    const outcome = await canvas.forkFromRow(sessionId, fork.atSeq, instruction, mode)
    setForkBusy(false)
    if (outcome.phase === 'done') {
      setFork(null)
      return
    }
    // `unverified` is not a failure — the child may exist. Saying so is the whole
    // reason the phase is kept separate from `failed`.
    setForkError(outcome.error ?? (outcome.phase === 'unverified'
      ? '分支可能已创建，但无法确认，请刷新后检查'
      : '分支创建失败'))
  }

  const carry = (draft: string): void => {
    // v1 has no composer handle, so the draft goes to the clipboard rather than
    // being submitted anywhere. The user still ends up with the text.
    const clipboard = (globalThis as {
      navigator?: { clipboard?: { writeText(text: string): Promise<void> } }
    }).navigator?.clipboard
    void clipboard?.writeText(draft)
    setCarried(true)
  }

  return (
    <div
      data-canvas-root
      style={{ height: '100%', display: 'flex', flexDirection: 'column', background: theme.bg, color: theme.text, position: 'relative' }}
    >
      <style>{CANVAS_CSS}</style>
      {swarm !== null && (
        <AgentSwarmView swarm={swarm.state()} onClose={closeSwarm} />
      )}
      {menu !== null && (
        <>
          <div
            data-context-backdrop
            onClick={() => setMenu(null)}
            onContextMenu={event => { event.preventDefault(); setMenu(null) }}
            style={{ position: 'fixed', inset: 0, zIndex: 20 }}
          />
          <div
            data-context-menu
            style={{
              position: 'fixed', left: menu.x, top: menu.y, zIndex: 21,
              minWidth: 180, padding: 4,
              background: theme.panel, border: `1px solid ${theme.border}`, borderRadius: 8,
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              font: '12px system-ui, sans-serif', color: theme.text,
            }}
          >
            {[
              { key: 'fork', label: '⑂ 从最新消息分叉', run: menuFork },
              ...(canvas.inspectSwarm !== undefined
                ? [{ key: 'inspect', label: '⌖ Agent 实况', run: () => { setMenu(null); openSwarm(menu.id) } }]
                : []),
              ...(canvas.openInChat !== undefined
                ? [{ key: 'open', label: '打开对话', run: () => { setMenu(null); canvas.openInChat?.(menu.id) } }]
                : []),
            ].map(item => (
              <div
                key={item.key}
                data-context-item={item.key}
                onClick={item.run}
                style={{ padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}
                onMouseEnter={event => { event.currentTarget.style.background = theme.cardActive }}
                onMouseLeave={event => { event.currentTarget.style.background = 'transparent' }}
              >
                {item.label}
              </div>
            ))}
          </div>
        </>
      )}
      <div
        data-canvas-toolbar
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
          borderBottom: `1px solid ${theme.border}`, background: theme.panel,
          font: '12px system-ui, sans-serif',
        }}
      >
        <input
          data-canvas-search
          value={query}
          placeholder="搜索会话"
          aria-label="搜索会话"
          onChange={event => {
            setQuery(event.target.value)
            canvas.search(event.target.value)
          }}
          style={{
            background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`,
            borderRadius: 6, padding: '3px 8px', width: 180, font: 'inherit',
          }}
        />
        <span style={{ color: theme.muted }}>{canvas.graph.nodes.size} 个会话</span>
        <button type="button" data-canvas-fit onClick={fit} style={buttonStyle}>适配视图</button>
        {canvas.refresh !== undefined && (
          <button type="button" data-canvas-refresh onClick={() => canvas.refresh?.()} style={buttonStyle}>刷新</button>
        )}
      </div>

      <div style={{ display: 'flex', flex: '1 1 auto', minHeight: 0 }}>
        <div
          data-canvas-surface
          onMouseDown={event => {
            drag.current = {
              startX: event.clientX, startY: event.clientY,
              viewX: canvas.view.x, viewY: canvas.view.y,
            }
          }}
          onMouseMove={event => {
            const started = drag.current
            if (started === null) return
            canvas.onViewChange({
              x: started.viewX + (event.clientX - started.startX),
              y: started.viewY + (event.clientY - started.startY),
              scale: canvas.view.scale,
            })
          }}
          onMouseUp={() => { drag.current = null }}
          onMouseLeave={() => { drag.current = null }}
          onWheel={event => {
            const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1
            canvas.onViewChange({ ...canvas.view, scale: clamp(canvas.view.scale * factor, MIN_SCALE, MAX_SCALE) })
          }}
          style={{ position: 'relative', flex: '1 1 auto', overflow: 'hidden', cursor: 'grab' }}
        >
          <div
            data-canvas-plane
            style={{
              position: 'absolute',
              inset: 0,
              transform: `translate(${canvas.view.x}px, ${canvas.view.y}px) scale(${canvas.view.scale})`,
              transformOrigin: '0 0',
            }}
          >
            <svg
              data-canvas-edges
              width={Math.max(layout.width, 1)}
              height={Math.max(layout.height, 1)}
              style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}
            >
              {edgePaths(canvas, layout.positions).map(edge => (
                <path
                  key={`${edge.from}->${edge.to}`}
                  d={edge.d}
                  fill="none"
                  stroke={edge.active ? theme.accent : theme.border}
                  strokeWidth={1.5}
                />
              ))}
            </svg>

            {[...canvas.graph.nodes.values()].map(node => {
              const nodeTail = canvas.tailOf?.(node.id) ?? null
              const nodeStatus = canvas.statusOf(node.id)
              return (
                <NodeCard
                  key={node.id}
                  node={node}
                  status={nodeStatus}
                  position={layout.positions.get(node.id) ?? { x: 0, y: 0 }}
                  width={NODE_WIDTH}
                  height={NODE_HEIGHT}
                  selected={canvas.selectedId === node.id}
                  comparing={canvas.compareIds.includes(node.id)}
                  parallelWrite={parallelWrite.has(node.id)}
                  highlight={needle !== '' && matches(node.title, node.id, needle)}
                  live={nodeTail === null ? null : tailSnippet(nodeTail, 40)}
                  active={nodeStatus.kind === 'thinking' || nodeStatus.kind === 'tool' || nodeTail !== null}
                  now={now}
                  onClick={handleNodeClick}
                  onOpen={id => canvas.openInChat?.(id)}
                  onInspect={canvas.inspectSwarm === undefined ? undefined : openSwarm}
                  onContext={openContext}
                />
              )
            })}
          </div>
        </div>

        {selectedId !== undefined && (
          <RightPanel
            tab={tab}
            title={selectedNode?.title}
            headerAction={canvas.inspectSwarm !== undefined && selectedId !== undefined
              ? {
                  label: '⌖ Agent 实况',
                  title: '查看这个会话的 agent 蛛网：谁在跑、正在输出什么',
                  onClick: () => openSwarm(selectedId),
                }
              : undefined}
            onTabChange={setTab}
            onClose={() => canvas.clearSelection?.()}
          >
            {tab === 'detail' ? (
              <BranchTimeline
                turns={effectiveDetail?.turns ?? []}
                inheritedCount={effectiveDetail?.inheritedCount ?? 0}
                cwdWarning={effectiveDetail?.cwdWarning ?? false}
                conclusion={effectiveDetail?.conclusion ?? null}
                live={tail}
                onFork={openFork}
              />
            ) : (
              <>
                <ComparePanel
                  result={comparison}
                  onContinue={side => {
                    const id = canvas.compareIds[side === 'a' ? 0 : 1]
                    if (id !== undefined) canvas.onSelect(id)
                  }}
                  onCarry={(_side, draft) => { carry(draft) }}
                />
                {carried && (
                  <div data-carry-done style={{ color: theme.accent, padding: '0 10px 10px' }}>已复制到剪贴板</div>
                )}
              </>
            )}

            <ForkDialog
              open={fork !== null}
              atSeq={fork?.atSeq ?? 0}
              inheritedCount={effectiveDetail?.inheritedCount ?? 0}
              busy={forkBusy}
              {...(forkError === undefined ? {} : { error: forkError })}
              onCancel={() => { setFork(null); setForkError(undefined) }}
              onConfirm={(instruction, mode) => { void confirmFork(instruction, mode) }}
            />
          </RightPanel>
        )}
      </div>
    </div>
  )
}

function edgePaths(canvas: CanvasModel, positions: ReadonlyMap<SessionId, LayoutPoint>) {
  const edges: { from: SessionId; to: SessionId; d: string; active: boolean }[] = []
  for (const node of canvas.graph.nodes.values()) {
    if (node.parentId === null) continue
    const from = positions.get(node.parentId)
    const to = positions.get(node.id)
    if (from === undefined || to === undefined) continue
    const x1 = from.x + NODE_WIDTH
    const y1 = from.y + NODE_HEIGHT / 2
    const x2 = to.x
    const y2 = to.y + NODE_HEIGHT / 2
    edges.push({
      from: node.parentId,
      to: node.id,
      d: `M ${x1} ${y1} C ${x1 + 40} ${y1}, ${x2 - 40} ${y2}, ${x2} ${y2}`,
      active: canvas.selectedId === node.id || canvas.compareIds.includes(node.id),
    })
  }
  return edges
}

function matches(title: string, id: string, needle: string): boolean {
  return title.toLowerCase().includes(needle) || id.toLowerCase().includes(needle)
}

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value
}

const buttonStyle: CSSProperties = {
  background: theme.card, color: theme.text, border: `1px solid ${theme.border}`,
  borderRadius: 6, padding: '3px 10px', font: 'inherit', cursor: 'pointer',
}

export type { CanvasView }

import {
  useEffect, useReducer, useRef, useState,
  type CSSProperties, type FC, type MouseEvent as ReactMouseEvent,
} from 'react'
import type { SessionId } from '../../shared/contracts.ts'
import { theme } from '../theme.ts'
import { layoutLayered, type LayoutPoint } from '../graph/graph-layout.ts'
import { NodeCard } from './NodeCard.tsx'
import type { CanvasModel, CanvasView } from './canvas-model.ts'

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

export const CanvasTab: FC<CanvasTabProps> = ({ canvas }) => {
  const [query, setQuery] = useState('')
  const drag = useRef<{ startX: number; startY: number; viewX: number; viewY: number } | null>(null)
  const [, bump] = useReducer((tick: number) => tick + 1, 0)

  // The slot hands the tab a single model object for its lifetime, so live
  // updates arrive through the model's own invalidation channel rather than
  // through new props.
  useEffect(() => canvas?.subscribe?.(() => { bump() }), [canvas])

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
  const parallelWrite = parallelWriteIds(canvas)
  const now = Date.now()
  const needle = query.trim().toLowerCase()

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

  return (
    <div
      data-canvas-root
      style={{ height: '100%', display: 'flex', flexDirection: 'column', background: theme.bg, color: theme.text }}
    >
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

          {[...canvas.graph.nodes.values()].map(node => (
            <NodeCard
              key={node.id}
              node={node}
              status={canvas.statusOf(node.id)}
              position={layout.positions.get(node.id) ?? { x: 0, y: 0 }}
              width={NODE_WIDTH}
              height={NODE_HEIGHT}
              selected={canvas.selectedId === node.id}
              comparing={canvas.compareIds.includes(node.id)}
              parallelWrite={parallelWrite.has(node.id)}
              highlight={needle !== '' && matches(node.title, node.id, needle)}
              now={now}
              onClick={handleNodeClick}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * A node is flagged when a *different* running session shares its directory —
 * i.e. someone else may be writing the same files. A node that is the only
 * running session in its directory has nobody to collide with, so it is not
 * flagged; an idle node in a directory someone else is writing *is*, because
 * forking it would put a second writer there.
 */
function parallelWriteIds(canvas: CanvasModel): Set<SessionId> {
  const runningByCwd = new Map<string, number>()
  for (const node of canvas.graph.nodes.values()) {
    if (!node.running || node.cwd === null) continue
    runningByCwd.set(node.cwd, (runningByCwd.get(node.cwd) ?? 0) + 1)
  }
  const flagged = new Set<SessionId>()
  for (const node of canvas.graph.nodes.values()) {
    if (node.cwd === null) continue
    const others = (runningByCwd.get(node.cwd) ?? 0) - (node.running ? 1 : 0)
    if (others > 0) flagged.add(node.id)
  }
  return flagged
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

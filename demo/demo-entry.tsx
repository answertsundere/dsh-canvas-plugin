// Static demo entry: renders the real CanvasTab / AgentSwarmView with rich
// synthetic fixtures in a plain browser page. No DSH host, no network — used
// for README screenshots. ?screen=canvas (default) or ?screen=swarm picks the
// view. All content is authored demo text about a fictional product launch.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CanvasTab } from '../src/client/ui/CanvasTab.tsx'
import { AgentSwarmView } from '../src/client/ui/AgentSwarmView.tsx'
import type { CanvasModel, CanvasDetail } from '../src/client/ui/canvas-model.ts'
import type { CanvasGraph, CanvasNode, BranchTurn } from '../src/shared/contracts.ts'
import type { LiveTail } from '../src/client/live/live-tail.ts'
import type { AgentSwarmState } from '../src/client/controllers/agent-swarm-controller.ts'
import { badge } from '../src/shared/status.ts'
import { layoutSwarm, layoutActivity } from '../src/client/swarm/swarm-model.ts'

const NOW = Date.now()
const min = 60_000

const n = (id: string, extra: Partial<CanvasNode> = {}): CanvasNode => ({
  id,
  parentId: null,
  externalParent: false,
  title: id,
  createdAt: NOW - 40 * min,
  running: false,
  available: true,
  seeded: false,
  cwd: 'D:/demo/新品上线',
  childCount: 0,
  depth: 0,
  ...extra,
})

const nodes: CanvasNode[] = [
  n('root', {
    title: '新品上线作战室',
    running: true,
    childCount: 2,
    teamRole: 'lead',
    teamTasks: ['敲定首周上线时间线'],
  }),
  n('a', {
    parentId: 'root', depth: 1, title: '方案 A · 社媒裂变', running: true,
    createdAt: NOW - 32 * min, childCount: 2, teamRole: 'teammate', teamTasks: ['产出三版裂变短文案'],
  }),
  n('a1', { parentId: 'a', depth: 2, title: 'A-1 卖点文案生成', createdAt: NOW - 26 * min }),
  n('a2', { parentId: 'a', depth: 2, title: 'A-2 素材整理与去重', createdAt: NOW - 22 * min }),
  n('b', {
    parentId: 'root', depth: 1, title: '方案 B · 付费投放', createdAt: NOW - 30 * min,
    childCount: 2, teamRole: 'teammate', teamTasks: ['测算首周投放预算'],
  }),
  n('b1', { parentId: 'b', depth: 2, title: 'B-1 预算测算', createdAt: NOW - 24 * min }),
  n('b2', { parentId: 'b', depth: 2, title: 'B-2 渠道比稿', createdAt: NOW - 18 * min }),
]

const graph: CanvasGraph = {
  nodes: new Map(nodes.map(x => [x.id, x])),
  roots: ['root'],
  maxDepth: 2,
}

const STATUS: Record<string, ReturnType<typeof badge>> = {
  root: badge('tool'),
  a: badge('thinking'),
  a1: badge('done'),
  a2: badge('done'),
  b: badge('idle'),
  b1: badge('failed'),
  b2: badge('done'),
}

const turnsOf = (id: string): BranchTurn[] => ({
  a1: [
    {
      index: 1, firstSeq: 2, lastSeq: 9,
      userMessage: '把产品卖点提炼成三条 20 字以内的短文案',
      assistantSummary: '已产出三版初稿，倾向场景化表达，第二条最贴近目标人群',
      tools: [
        { name: 'read', status: 'ok', preview: 'product-brief.md' },
        { name: 'grep', status: 'ok', preview: '卖点 · 目标人群 · 场景' },
      ],
      synthetic: false,
    },
    {
      index: 2, firstSeq: 10, lastSeq: 18,
      userMessage: '第二条再口语化一点，加一个生活场景',
      assistantSummary: '重写第二条：早八通勤场景 + 一句话行动号召，其余两版微调标点',
      tools: [
        { name: 'write', status: 'ok', preview: 'copy-v2.md' },
        { name: 'todo', status: 'ok' },
      ],
      synthetic: false,
    },
  ],
  root: [
    {
      index: 1, firstSeq: 2, lastSeq: 14,
      userMessage: '新品下周上线，并行跑两个推广方案，最后给我对比结论',
      assistantSummary: '已拆出方案 A（社媒裂变）与方案 B（付费投放）两个子分支并行推进',
      tools: [
        { name: 'read', status: 'ok', preview: 'launch-plan.md' },
        { name: 'agent', status: 'ok', preview: 'spawn 方案A' },
        { name: 'agent', status: 'ok', preview: 'spawn 方案B' },
      ],
      synthetic: false,
    },
  ],
}[id] ?? [])

const detailOf = (id: string): CanvasDetail | null => ({
  sessionId: id,
  turns: turnsOf(id),
  inheritedCount: id === 'root' ? 0 : 16,
  cwdWarning: true,
  conclusion: id === 'a1'
    ? '三条文案已定稿：①早八通勤，一杯搞定；②宿舍熬夜党的救星；③周末出行，说走就走。建议主推第二条。'
    : id === 'root'
      ? '两方案并行中：A 侧文案已定稿待投放，B 侧预算测算失败需人工复核渠道报价。'
      : null,
})

const tailOf = (id: string): LiveTail | null => {
  if (id === 'root') return {
    attemptId: 't-root', turn: 3, step: 2,
    reasoning: 'A 侧素材已齐，等裂变文案终稿；B 侧预算测算失败，先汇总两侧进度再决定是否补一次渠道比稿。',
    text: '',
    tool: { name: 'pwsh', arguments: 'node scripts/collect-progress.mjs' },
    lastKind: 'tool',
  }
  if (id === 'a') return {
    attemptId: 't-a', turn: 4, step: 1,
    reasoning: '第二条场景化文案反响最好，把这套「时间锚点 + 行动号召」句式迁移到第一条，同时保留 20 字上限。',
    text: '①早八通勤，一杯咖啡的时间搞定今日穿搭。',
    lastKind: 'thinking',
  }
  return null
}

const noop = () => {}
const canvasModel: CanvasModel = {
  graph,
  statusOf: id => STATUS[id] ?? badge('idle'),
  selectedId: 'a1',
  compareIds: ['b2'],
  view: { x: 330, y: 290, scale: 1 },
  onSelect: noop,
  onToggleCompare: noop,
  onViewChange: noop,
  search: noop,
  detail: id => Promise.resolve(detailOf(id)),
  tailOf,
  openInChat: noop,
  clearSelection: noop,
}

const swarmRows = [
  { id: 'root', parentId: null as string | null, depth: 0, mode: 'continuable' },
  { id: 'retriever', parentId: 'root', depth: 1, mode: 'continuable' },
  { id: 'writer', parentId: 'root', depth: 1, mode: 'continuable' },
  { id: 'crawler', parentId: 'root', depth: 1, mode: 'continuable' },
  { id: 'budget', parentId: 'root', depth: 1, mode: 'continuable' },
  { id: 'reviewer', parentId: 'root', depth: 1, mode: 'continuable' },
]

const swarm: AgentSwarmState = {
  rootId: 'root',
  rootLabel: '新品上线作战室',
  rootSnippet: { label: '工具', text: 'node scripts/collect-progress.mjs' },
  activity: {
    turnCount: 15, openTurn: true, currentTurn: 15,
    tools: [
      { id: 'c1', name: 'read', status: 'ok', turn: 12 },
      { id: 'c2', name: 'pwsh', status: 'ok', turn: 13 },
      { id: 'c3', name: 'grep', status: 'ok', turn: 14 },
      { id: 'c4', name: 'pwsh', status: 'pending', turn: 15 },
    ],
    pendingToolId: 'c4',
  },
  toolLayout: layoutActivity([
    { id: 'c1', name: 'read', status: 'ok', turn: 12 },
    { id: 'c2', name: 'pwsh', status: 'ok', turn: 13 },
    { id: 'c3', name: 'grep', status: 'ok', turn: 14 },
    { id: 'c4', name: 'pwsh', status: 'pending', turn: 15 },
  ]),
  todos: new Map([
    ['writer', [
      { content: '第一条：场景化开头', status: 'completed' },
      { content: '第二条：口语化重写', status: 'in_progress' },
      { content: '第三条：行动号召收尾', status: 'pending' },
    ]],
    ['retriever', [
      { content: '竞品近 30 天素材清单', status: 'completed' },
      { content: '去重与标签归类', status: 'completed' },
    ]],
  ]),
  team: null,
  rootConclusion: '首周转化预估 3.2%：建议主推方案 A 的第二条文案，B 侧预算测算失败待人工复核。',
  agents: [
    { id: 'retriever', label: '检索器', depth: 1, status: 'idle', role: 'teammate',
      snippet: null, tail: null, toolCount: 6, conclusion: '竞品素材 42 条已归档，重复率 18%。', description: '收集竞品近 30 天投放素材并去重' },
    { id: 'writer', label: '文案写手', depth: 1, status: 'streaming', role: 'teammate',
      snippet: { label: '推理', text: '把「时间锚点 + 行动号召」句式迁移到第一条…' },
      tail: null, toolCount: 4, conclusion: null, description: '产出三版 20 字以内社媒短文案' },
    { id: 'crawler', label: '数据爬虫', depth: 1, status: 'running', role: 'teammate',
      snippet: { label: '工具', text: 'pwsh · fetch竞品价格页' },
      tail: null, toolCount: 9, conclusion: null, description: '盯竞品价格与库存变化，小时级回报' },
    { id: 'budget', label: '预算测算员', depth: 1, status: 'failed', role: 'teammate',
      snippet: { label: '错误', text: '渠道报价接口超时，重试 3 次失败' },
      tail: null, toolCount: 3, conclusion: null, description: '测算首周投放预算与保本 ROI' },
    { id: 'reviewer', label: '审校员', depth: 1, status: 'idle', role: 'teammate',
      snippet: null, tail: null, toolCount: 2, conclusion: '前两稿合规无风险词。', description: '文案合规与风险词审查' },
  ],
  edges: [
    { from: 'root', to: 'retriever' },
    { from: 'root', to: 'writer' },
    { from: 'root', to: 'crawler' },
    { from: 'root', to: 'budget' },
    { from: 'root', to: 'reviewer' },
  ],
  layout: layoutSwarm(swarmRows, 'root', { radius: 350 }),
  heat: new Map([
    ['writer', NOW - 800],
    ['crawler', NOW - 4000],
    ['budget', NOW - 60_000],
  ]),
}

const screen = new URLSearchParams(location.search).get('screen') ?? 'canvas'
const root = createRoot(document.getElementById('root')!)
root.render(
  <StrictMode>
    {screen === 'swarm'
      ? <AgentSwarmView swarm={swarm} onClose={noop} nowMs={NOW} />
      : <CanvasTab canvas={canvasModel} />}
  </StrictMode>,
)

import type {} from '@deepseek-ai/dsh-client-ui-slots'

export const NS = 'dsh-canvas'

/**
 * DSH types the slot `locale:` field as `keyof LocaleNamespaceMap`, an interface
 * each dictionary owner extends by declaration merging. Merging here is what
 * makes `locale.register(NS, ...)` type-check against this namespace's own key
 * union, so every future zh/en key is checked for exact parity at compile time.
 */
declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    'dsh-canvas': keyof typeof zh
  }
}

export const zh = {
  'view.canvas': '画布',
  'toolbar.search': '搜索',
  'toolbar.layout': '布局',
  'toolbar.refresh': '刷新',
  'panel.detail': '详情',
  'panel.compare': '对比',
  'fork.here': '从此分叉',
  'fork.inherit': '继承',
  'fork.launch.now': '立即开跑',
  'fork.launch.later': '只建分支',
  'fork.cwdWarning': '并行分支共享同一工作目录，同时写文件可能互相覆盖',
  'compare.continue': '切换至此分支继续',
  'compare.carry': '带回结论',
  'compare.empty': '选择两个分支进行对比',
  'state.unknown': '状态未知',
} as const
export const en: Record<keyof typeof zh, string> = {
  'view.canvas': 'Canvas',
  'toolbar.search': 'Search',
  'toolbar.layout': 'Layout',
  'toolbar.refresh': 'Refresh',
  'panel.detail': 'Detail',
  'panel.compare': 'Compare',
  'fork.here': 'Fork here',
  'fork.inherit': 'inherits',
  'fork.launch.now': 'Run now',
  'fork.launch.later': 'Create empty branch',
  'fork.cwdWarning': 'Parallel branches share one working directory; concurrent writes may overwrite each other',
  'compare.continue': 'Continue in this branch',
  'compare.carry': 'Carry conclusion here',
  'compare.empty': 'Select two branches to compare',
  'state.unknown': 'Status unknown',
}
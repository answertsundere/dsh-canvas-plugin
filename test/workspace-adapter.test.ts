import { describe, expect, it } from 'vitest'
import { selectWorkspaceSummaries } from '../src/client/adapters/workspace-adapter.ts'
import type { SessionSummaryLike } from '../src/client/graph/graph-model.ts'

const s = (id: string, extra: Partial<SessionSummaryLike> = {}): SessionSummaryLike =>
  ({ id, createdAt: 0, running: false, available: true, ...extra })

/**
 * `WorkspaceView` rows as the client workspace snapshot actually carries them
 * (workspace-controller client/model.ts): `workspaceId`, `path`, `title`,
 * `sessionIds`. There is no `recentWorkspaceId` on the snapshot — the caller
 * resolves which workspace is current.
 */
const ws = (workspaceId: string, path: string, sessionIds?: readonly string[]) =>
  ({ workspaceId, path, title: workspaceId, sessionIds })

describe('selectWorkspaceSummaries', () => {
  it('selects the current workspace members in accounted order', () => {
    const out = selectWorkspaceSummaries(
      [ws('w1', 'C:/w', ['b', 'a'])],
      'w1',
      [s('a'), s('b'), s('other', { cwd: 'C:/elsewhere' })],
      null,
    )
    expect(out.workspaceId).toBe('w1')
    expect(out.members.map(m => m.id)).toEqual(['b', 'a'])
  })

  it('unions in a cwd match, because sessionIds accounting can lag a new session', () => {
    // `sessionIds` is the Workspace's manual-order accounting list; a session
    // just created in this directory may not be accounted to it yet, and the
    // canvas must not hide the session the user is actually sitting in.
    const out = selectWorkspaceSummaries(
      [ws('w1', 'C:/w', ['a'])],
      'w1',
      [s('a'), s('fresh', { cwd: 'C:/w' }), s('elsewhere', { cwd: 'C:/other' })],
      null,
    )
    expect(out.members.map(m => m.id)).toEqual(['a', 'fresh'])
  })

  it('falls back to the workspace path when the row carries no sessionIds', () => {
    const out = selectWorkspaceSummaries(
      [ws('w1', 'C:/w')],
      'w1',
      [s('a', { cwd: 'C:/w' }), s('b', { cwd: 'C:/other' })],
      null,
    )
    expect(out.workspaceId).toBe('w1')
    expect(out.members.map(m => m.id)).toEqual(['a'])
  })

  it('falls back to the supplied cwd when the current workspace is unknown', () => {
    const out = selectWorkspaceSummaries(
      [ws('w1', 'C:/w', ['a'])],
      'missing',
      [s('a', { cwd: 'C:/w' }), s('b', { cwd: 'C:/w' }), s('c', { cwd: 'C:/other' })],
      'C:/w',
    )
    expect(out.workspaceId).toBe('w1')
    expect(out.members.map(m => m.id)).toEqual(['a', 'b'])
  })

  it('reports no workspace id when the cwd matches no workspace row', () => {
    const out = selectWorkspaceSummaries([ws('w1', 'C:/w', ['a'])], null, [s('a', { cwd: 'C:/x' })], 'C:/x')
    expect(out.workspaceId).toBeNull()
    expect(out.members.map(m => m.id)).toEqual(['a'])
  })

  it('returns nothing rather than everything when membership is undecidable', () => {
    // Cross-workspace canvases are explicitly out of scope, so an unknown
    // workspace with no cwd hint must render an empty canvas, never a global one.
    expect(selectWorkspaceSummaries(undefined, undefined, [s('a', { cwd: 'C:/w' })], null))
      .toEqual({ workspaceId: null, members: [] })
    expect(selectWorkspaceSummaries([], null, [s('a', { cwd: 'C:/w' })], null))
      .toEqual({ workspaceId: null, members: [] })
  })

  it('ignores accounted ids that are not present in the summaries', () => {
    const out = selectWorkspaceSummaries([ws('w1', 'C:/w', ['ghost', 'a'])], 'w1', [s('a')], null)
    expect(out.members.map(m => m.id)).toEqual(['a'])
  })

  it('never reports the same session twice when it is both accounted and cwd-matched', () => {
    const out = selectWorkspaceSummaries([ws('w1', 'C:/w', ['a'])], 'w1', [s('a', { cwd: 'C:/w' })], null)
    expect(out.members.map(m => m.id)).toEqual(['a'])
  })
})

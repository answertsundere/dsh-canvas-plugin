import type { BranchSegment, BranchTurn, ComparisonResult, TurnDiff } from '../../shared/contracts.ts'

/**
 * Deterministic branch comparison.
 *
 * Alignment is **positional over each branch's own work**: turn 1 against turn 1,
 * and so on. There is deliberately no semantic pairing — positional alignment is
 * the only rule that produces the same answer twice, and the design spec rejects
 * semantic matching for v1. Each side's inherited prefix length is reported by
 * its segment rather than normalized away, because two branches may inherit
 * different amounts.
 *
 * Synthetic fork-closer turns are dropped before alignment. They exist only to
 * balance a cut made inside an open turn, are identical in every branch by
 * construction, and would otherwise add the same noise row to every comparison.
 * They remain visible in the segment itself, so the timeline can still show them.
 */
export function compareBranches(a: BranchSegment, b: BranchSegment): ComparisonResult {
  const left = ownWork(a)
  const right = ownWork(b)

  const rows = Math.max(left.length, right.length)
  const turnDiffs: TurnDiff[] = []
  for (let index = 0; index < rows; index += 1) {
    const leftTurn = left[index]
    const rightTurn = right[index]
    turnDiffs.push({
      ...(leftTurn === undefined ? {} : { left: leftTurn }),
      ...(rightTurn === undefined ? {} : { right: rightTurn }),
      equal: leftTurn !== undefined && rightTurn !== undefined && sameTurn(leftTurn, rightTurn),
    })
  }

  return {
    a,
    b,
    turnDiffs,
    toolCountDiff: countTools(right) - countTools(left),
    bothFailed: endedInError(left) && endedInError(right),
    lastConclusion: conclude(left, right),
  }
}

function ownWork(segment: BranchSegment): readonly BranchTurn[] {
  return segment.turns.filter(turn => !turn.synthetic)
}

/** Equal means the same prompt and the same tool-call sequence; outcomes may differ. */
function sameTurn(left: BranchTurn, right: BranchTurn): boolean {
  return left.userMessage === right.userMessage && toolNames(left) === toolNames(right)
}

function toolNames(turn: BranchTurn): string {
  return turn.tools.map(tool => tool.name).join('\u0000')
}

function countTools(turns: readonly BranchTurn[]): number {
  return turns.reduce((total, turn) => total + turn.tools.length, 0)
}

/** Only an explicit `error` reason counts as failed; `aborted` is not a failure. */
function endedInError(turns: readonly BranchTurn[]): boolean {
  return turns.at(-1)?.endedAs === 'error'
}

function conclude(
  left: readonly BranchTurn[],
  right: readonly BranchTurn[],
): ComparisonResult['lastConclusion'] {
  const leftText = lastSummary(left)
  const rightText = lastSummary(right)

  if (leftText === undefined && rightText === undefined) return { side: 'none', text: '' }
  if (leftText === undefined) return { side: 'b', text: rightText ?? '' }
  if (rightText === undefined) return { side: 'a', text: leftText }
  if (leftText === rightText) return { side: 'both', text: leftText }
  // Deterministic tie-break: the longer account, then the left branch.
  return leftText.length >= rightText.length
    ? { side: 'a', text: leftText }
    : { side: 'b', text: rightText }
}

function lastSummary(turns: readonly BranchTurn[]): string | undefined {
  return turns.at(-1)?.assistantSummary
}

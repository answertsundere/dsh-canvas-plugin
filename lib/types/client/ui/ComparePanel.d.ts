import { type FC } from 'react';
import type { ComparisonResult } from '../../shared/contracts.ts';
export interface ComparePanelProps {
    readonly result: ComparisonResult | null;
    onContinue(side: 'a' | 'b'): void;
    onCarry(side: 'a' | 'b', draft: string): void;
}
/**
 * Deterministic A|B comparison.
 *
 * 「带回结论」 deliberately stops at an **editable draft**. The other branch's
 * conclusion is reference material, not an instruction: it carries no execution
 * authority, so it is never submitted on the user's behalf. A second, explicit
 * action is what hands the text over, and by then the user has seen and edited it.
 *
 * Only each branch's own work is shown — the diff rows come from
 * `ComparisonResult.turnDiffs`, which already excludes the inherited prefix and
 * the synthetic fork closers. Each side's inherited count is displayed rather
 * than normalized away, because two branches may inherit different amounts.
 */
export declare const ComparePanel: FC<ComparePanelProps>;

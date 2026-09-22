import type { ScoreDraft } from './tournament';

export interface ScoringRules {
  allowDraws: boolean;
  maxScore: number | null;
}

export const DEFAULT_MAX_SCORE = 121;

/** Existing tournaments keep the scoring rules used before configuration existed. */
export const LEGACY_SCORING_RULES: Readonly<ScoringRules> = Object.freeze({
  allowDraws: true,
  maxScore: null,
});

const validScoreInteger = (value: string) =>
  /^(0|[1-9]\d*)$/.test(value) && Number.isSafeInteger(Number(value));

export function parseMaxScore(value: string): number | null {
  const trimmed = value.trim();
  if (!/^[1-9]\d*$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

/** Leave incomplete or invalid input available for validation; cap only valid scores. */
export function capScoreDraft(draft: ScoreDraft, rules: ScoringRules): ScoreDraft {
  const cap = (value: string) => rules.maxScore !== null &&
    validScoreInteger(value) && Number(value) > rules.maxScore
      ? String(rules.maxScore)
      : value;
  return { home: cap(draft.home), away: cap(draft.away) };
}

export function scoringIssue(
  draft: ScoreDraft,
  rules: ScoringRules = LEGACY_SCORING_RULES,
): string | null {
  if (!draft.home || !draft.away) return 'Introdueix els dos punts per confirmar el resultat.';
  if (!validScoreInteger(draft.home) || !validScoreInteger(draft.away)) {
    return 'Els punts han de ser nombres enters no negatius i segurs.';
  }
  const capped = capScoreDraft(draft, rules);
  if (!rules.allowDraws && capped.home === capped.away) {
    return 'Aquest campionat no permet empats. Introdueix puntuacions diferents.';
  }
  return null;
}

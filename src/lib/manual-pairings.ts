import type { Pair, Round } from './tournament';

export interface ManualPairingRow {
  home: string;
  away: string;
}

export interface ManualPairingDraft {
  roundNumber: number;
  source: string;
  rows: ManualPairingRow[];
}

export function canManuallyPairRound(round: Round | undefined): round is Round {
  return Boolean(round && round.matches.every((match) =>
    match.result === null && match.draft.home === '' && match.draft.away === '',
  ));
}

// A draft belongs to these exact participants and table assignments.
export function manualPairingSource(pairs: Pair[], round: Round): string {
  return JSON.stringify([
    pairs.map((pair) => [pair.id, pair.number]),
    round.matches.map((match) => [match.homeId, match.awayId]),
  ]);
}

/** Ignore an obsolete or malformed editor draft without losing the saved tournament. */
export function recoverManualPairingDraft(value: unknown, pairs: Pair[], round: Round | undefined): ManualPairingDraft | undefined {
  if (!canManuallyPairRound(round) || !value || typeof value !== 'object') return undefined;
  const draft = value as ManualPairingDraft;
  if (draft.roundNumber !== round.number || draft.source !== manualPairingSource(pairs, round) ||
    !Array.isArray(draft.rows) || draft.rows.length !== pairs.length / 2 ||
    !draft.rows.every((row) => row && typeof row.home === 'string' && typeof row.away === 'string')) return undefined;
  return draft;
}

export function validateManualPairings(pairs: Pair[], rows: ManualPairingRow[]) {
  const byNumber = new Map(pairs.map((pair) => [pair.number, pair]));
  const entries = rows.flatMap((row) => [row.home, row.away]).map((raw, index) => {
    const value = raw.trim();
    const number = /^\d+$/.test(value) ? Number(value) : NaN;
    const pair = Number.isSafeInteger(number) && number > 0 ? byNumber.get(number) : undefined;
    return { value, pair, table: Math.floor(index / 2) + 1 };
  });
  const occurrences = new Map<number, number[]>();
  for (const entry of entries) {
    if (!entry.pair) continue;
    const tables = occurrences.get(entry.pair.number) ?? [];
    tables.push(entry.table);
    occurrences.set(entry.pair.number, tables);
  }
  const issues = entries.map((entry) => {
    if (!entry.value) return '';
    if (!entry.pair) return 'Escriu el número d’una parella inscrita.';
    const tables = occurrences.get(entry.pair.number)!;
    if (tables.length <= 1) return '';
    const otherTable = tables.find((table) => table !== entry.table);
    return otherTable
      ? `Parella ${entry.pair.number} repetida a la taula ${otherTable}.`
      : `Parella ${entry.pair.number} repetida en aquesta taula.`;
  });
  const pending = pairs.filter((pair) => !occurrences.has(pair.number)).sort((a, b) => a.number - b.number);
  const valid = pairs.length >= 2 && pairs.length % 2 === 0 && rows.length === pairs.length / 2 &&
    pending.length === 0 && entries.every((entry, index) => entry.pair && !issues[index]);
  return {
    assigned: occurrences.size,
    pending,
    issues,
    entries,
    orderedPairs: valid ? entries.map((entry) => entry.pair!) : null,
  };
}

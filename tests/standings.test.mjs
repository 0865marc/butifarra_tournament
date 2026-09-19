import assert from 'node:assert/strict';
import test from 'node:test';
import { manualPairingSource, recoverManualPairingDraft } from '../src/lib/manual-pairings.ts';
import { savedTournamentEntry, TOURNAMENT_STORAGE_KEY } from '../src/lib/tournament-storage.ts';
import { createPairs, getStandings, makeRound } from '../src/lib/tournament.ts';

const pairDrafts = [17, 4, 29, 8].map((number) => ({
  number, playerOne: `Jugador ${number} A`, playerTwo: `Jugador ${number} B`,
}));
const pairs = createPairs(pairDrafts);
const summary = (rounds, roster = pairs) => getStandings(roster, rounds)
  .map(({ pair, wins, pointDifference }) => [pair.id, wins, pointDifference]);
const scoredRound = (number, scores, ordered = pairs) => {
  const round = makeRound(number, ordered);
  round.matches.forEach((match, index) => {
    const [home, away] = scores[index];
    match.draft = { home: String(home), away: String(away) };
    match.result = { home, away };
  });
  return round;
};

test('equal wins rank by point difference even when total points give the opposite order', () => {
  const round = scoredRound(1, [[101, 100], [80, 0]]);
  assert.deepEqual(summary([round]), [
    ['pair-3', 1, 80], ['pair-1', 1, 1], ['pair-2', 0, -1], ['pair-4', 0, -80],
  ]);
});

test('wins remain the first criterion even for a pair with a worse negative difference', () => {
  const first = scoredRound(1, [[10, 0], [40, 0]]);
  const second = scoredRound(2, [[0, 100], [1, 0]], [pairs[0], pairs[2], pairs[1], pairs[3]]);
  assert.deepEqual(summary([first, second]), [
    ['pair-3', 2, 140], ['pair-2', 1, -9], ['pair-1', 1, -90], ['pair-4', 0, -41],
  ]);
});

test('point differences accumulate across home and away matches, including zero and negative totals', () => {
  const first = scoredRound(1, [[50, 20], [20, 10]]);
  const second = scoredRound(2, [[10, 40], [50, 10]], [pairs[0], pairs[2], pairs[1], pairs[3]]);
  assert.deepEqual(summary([first, second]), [
    ['pair-3', 2, 40], ['pair-2', 1, 10], ['pair-1', 1, 0], ['pair-4', 0, -50],
  ]);
});

test('equal wins and differences use registration order despite different points scored or roster order', () => {
  const round = scoredRound(1, [[21, 11], [110, 100]]);
  assert.deepEqual(summary([round], [...pairs].reverse()), [
    ['pair-1', 1, 10], ['pair-3', 1, 10], ['pair-2', 0, -10], ['pair-4', 0, -10],
  ]);
});

test('unconfirmed drafts do not count and confirmed score corrections recompute the ranking', () => {
  const round = scoredRound(1, [[101, 100], [80, 0]]);
  round.matches[1].result = null;
  assert.deepEqual(summary([round]), [
    ['pair-1', 1, 1], ['pair-3', 0, 0], ['pair-4', 0, 0], ['pair-2', 0, -1],
  ]);
  round.matches[1].result = { home: 80, away: 0 };
  round.matches[0].draft = { home: '0', away: '101' };
  assert.deepEqual(summary([round]), [
    ['pair-3', 1, 80], ['pair-1', 1, 1], ['pair-2', 0, -1], ['pair-4', 0, -80],
  ]);
  round.matches[0].result = { home: 0, away: 101 };
  assert.deepEqual(summary([round]), [
    ['pair-2', 1, 101], ['pair-3', 1, 80], ['pair-4', 0, -80], ['pair-1', 0, -101],
  ]);
});

test('a schema 1 save recalculates standings without altering its saved rounds or manual pairing draft', () => {
  const first = scoredRound(1, [[101, 100], [80, 0]]);
  const manual = makeRound(2, [pairs[3], pairs[0], pairs[1], pairs[2]]);
  manual.manuallyAdjusted = true;
  const raw = JSON.stringify({
    schema: 1,
    setup: { name: 'Torneig en curs', roundsDraft: '3', rounds: 3 },
    pairDrafts,
    pairs,
    rounds: [first, manual],
    selectedRound: 2,
    started: true,
    manualPairingDraft: {
      roundNumber: 2,
      source: manualPairingSource(pairs, manual),
      rows: [{ home: '29', away: '' }, { home: '', away: '' }],
    },
  });
  const loaded = JSON.parse(raw);
  assert.equal(TOURNAMENT_STORAGE_KEY, 'taula-de-butifarra-v1');
  assert.equal(savedTournamentEntry(raw), 'tournament');
  assert.deepEqual(summary(loaded.rounds, loaded.pairs), [
    ['pair-3', 1, 80], ['pair-1', 1, 1], ['pair-2', 0, -1], ['pair-4', 0, -80],
  ]);
  assert.deepEqual(
    recoverManualPairingDraft(loaded.manualPairingDraft, loaded.pairs, loaded.rounds.at(-1)),
    loaded.manualPairingDraft,
  );
  assert.equal(JSON.stringify(loaded), raw);
});

test('the next round pairs by the new ranking while previously generated tables remain unchanged', () => {
  const first = scoredRound(1, [[101, 100], [80, 0]]);
  const previous = JSON.stringify(first);
  const second = makeRound(2, getStandings(pairs, [first]).map(({ pair }) => pair));
  assert.deepEqual(second.matches.map(({ homeId, awayId }) => [homeId, awayId]), [
    ['pair-3', 'pair-1'], ['pair-2', 'pair-4'],
  ]);
  assert.equal(JSON.stringify(first), previous);
  assert.deepEqual(summary([first, second]), summary([first]));
});

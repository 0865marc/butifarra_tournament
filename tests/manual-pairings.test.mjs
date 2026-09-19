import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canManuallyPairRound,
  manualPairingSource,
  recoverManualPairingDraft,
  validateManualPairings,
} from '../src/lib/manual-pairings.ts';
import { createPairs, getStandings, makeRound } from '../src/lib/tournament.ts';

const pairs = createPairs(Array.from({ length: 80 }, (_, index) => ({
  // Registration numbers need not be contiguous or equal to the internal IDs.
  number: index * 3 + 7,
  playerOne: `Jugador ${index} A`,
  playerTwo: `Jugador ${index} B`,
})));
const rowsFor = (ordered) => Array.from({ length: ordered.length / 2 }, (_, index) => ({
  home: String(ordered[index * 2].number),
  away: String(ordered[index * 2 + 1].number),
}));
const draftFor = (round) => ({
  roundNumber: round.number,
  source: manualPairingSource(pairs, round),
  rows: rowsFor(pairs),
});

test('80 registered pairs keep their IDs, numbers, names and exact entered table order', () => {
  const ordered = [...pairs.slice(39), ...pairs.slice(0, 39)];
  const result = validateManualPairings(pairs, rowsFor(ordered));
  assert.equal(result.assigned, 80);
  assert.deepEqual(result.pending, []);
  assert.deepEqual(result.orderedPairs, ordered);
  const round = makeRound(1, result.orderedPairs);
  assert.equal(round.matches.length, 40);
  assert.equal(round.matches[0].homeId, pairs[39].id);
  assert.equal(round.matches[39].awayId, pairs[38].id);
  assert.equal(result.orderedPairs[0], pairs[39]);
});

test('blank and incomplete rows cannot be applied and list missing participants', () => {
  const rows = pairs.slice(0, 40).map(() => ({ home: '', away: '' }));
  rows[0].home = String(pairs[12].number);
  const result = validateManualPairings(pairs, rows);
  assert.equal(result.assigned, 1);
  assert.equal(result.pending.length, 79);
  assert.ok(!result.pending.includes(pairs[12]));
  assert.equal(result.orderedPairs, null);
  assert.ok(result.issues.every((issue) => issue === ''));
});

test('duplicates flag both tables and count the pair only once', () => {
  const rows = rowsFor(pairs);
  rows[1].away = rows[0].home;
  const result = validateManualPairings(pairs, rows);
  assert.equal(result.assigned, 79);
  assert.match(result.issues[0], /taula 2/);
  assert.match(result.issues[3], /taula 1/);
  assert.deepEqual(result.pending, [pairs[3]]);
  assert.equal(result.orderedPairs, null);
});

test('a pair cannot play itself, including with whitespace or leading zeros', () => {
  const rows = rowsFor(pairs);
  rows[0].away = ` 0${rows[0].home} `;
  const result = validateManualPairings(pairs, rows);
  assert.match(result.issues[0], /aquesta taula/);
  assert.match(result.issues[1], /aquesta taula/);
  assert.equal(result.orderedPairs, null);
});

test('unknown, negative, fractional, exponential and unsafe numbers are rejected', () => {
  for (const value of ['999', '-7', '7.0', '7e0', 'abc', '0', '9007199254740993']) {
    const rows = rowsFor(pairs);
    rows[0].home = value;
    const result = validateManualPairings(pairs, rows);
    assert.match(result.issues[0], /inscrita/, value);
    assert.equal(result.orderedPairs, null, value);
  }
});

test('missing or extra tables cannot be applied', () => {
  assert.equal(validateManualPairings(pairs, rowsFor(pairs).slice(1)).orderedPairs, null);
  assert.equal(validateManualPairings(pairs, [...rowsFor(pairs), { home: '', away: '' }]).orderedPairs, null);
});

test('partially entered drafts survive storage serialization without altering live tables', () => {
  const round = makeRound(1, pairs);
  const before = structuredClone(round);
  const draft = draftFor(round);
  draft.rows[0] = { home: '7', away: '' };
  draft.rows[2].home = 'mistake';
  const loaded = JSON.parse(JSON.stringify(draft));
  assert.deepEqual(recoverManualPairingDraft(loaded, pairs, round), draft);
  assert.deepEqual(round, before);
});

test('stale drafts are not reused after a new round, a manual swap or a roster change', () => {
  const round = makeRound(1, pairs);
  const draft = draftFor(round);
  assert.equal(recoverManualPairingDraft(draft, pairs, makeRound(2, pairs)), undefined);
  const swapped = makeRound(1, [...pairs].reverse());
  assert.equal(recoverManualPairingDraft(draft, pairs, swapped), undefined);
  const renamedNumber = pairs.map((pair, index) => index ? pair : { ...pair, number: 500 });
  assert.equal(recoverManualPairingDraft(draft, renamedNumber, round), undefined);
});

test('any score draft or confirmed result locks bulk editing, including a zero score', () => {
  assert.equal(canManuallyPairRound(undefined), false);
  const round = makeRound(1, pairs);
  const draft = draftFor(round);
  assert.equal(canManuallyPairRound(round), true);
  for (const score of ['0', '12', 'invalid']) {
    round.matches[39].draft.away = score;
    assert.equal(canManuallyPairRound(round), false);
    assert.equal(recoverManualPairingDraft(draft, pairs, round), undefined);
  }
  round.matches[39].draft.away = '';
  round.matches[39].result = { home: 10, away: 0 };
  assert.equal(canManuallyPairRound(round), false);
});

test('malformed editor data can be discarded independently of tournament recovery', () => {
  const round = makeRound(1, pairs);
  const draft = draftFor(round);
  for (const invalid of [null, [], 'bad', {}, { ...draft, rows: [] },
    { ...draft, rows: [null, ...draft.rows.slice(1)] },
    { ...draft, rows: [{ home: 7, away: '10' }, ...draft.rows.slice(1)] }]) {
    assert.equal(recoverManualPairingDraft(invalid, pairs, round), undefined);
  }
});

test('manually arranged later rounds preserve earlier results and ranking identities', () => {
  const first = makeRound(1, pairs);
  first.matches.forEach((match) => {
    match.draft = { home: '101', away: '50' };
    match.result = { home: 101, away: 50 };
  });
  const before = structuredClone(first);
  const standings = getStandings(pairs, [first]);
  const manual = validateManualPairings(pairs, rowsFor([...pairs].reverse()));
  const second = makeRound(2, manual.orderedPairs);
  assert.deepEqual(first, before);
  assert.deepEqual(getStandings(pairs, [first, second]), standings);
});

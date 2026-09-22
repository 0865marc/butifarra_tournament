import assert from 'node:assert/strict';
import test from 'node:test';
import { savedTournamentEntry } from '../src/lib/tournament-storage.ts';

const preparation = (settings = {}) => JSON.stringify({
  schema: 1,
  setup: { name: 'Campionat de Butifarra', roundsDraft: '3', ...settings },
  started: false,
  pairDrafts: [{ number: 1, playerOne: '', playerTwo: '' }],
  rounds: [],
});

test('untouched legacy and new preparations do not offer a continue link', () => {
  assert.equal(savedTournamentEntry(preparation()), null);
  assert.equal(savedTournamentEntry(preparation({ allowDraws: true, limitScore: true, maxScoreDraft: '121' })), null);
});

test('changing only a scoring rule makes the saved preparation discoverable', () => {
  for (const settings of [{ allowDraws: false }, { limitScore: false }, { maxScoreDraft: '80' }, { maxScoreDraft: '' }]) {
    assert.equal(savedTournamentEntry(preparation(settings)), 'draft');
  }
});

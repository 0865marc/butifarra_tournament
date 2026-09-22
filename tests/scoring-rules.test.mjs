import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEFAULT_MAX_SCORE,
  LEGACY_SCORING_RULES,
  capScoreDraft,
  parseMaxScore,
  scoringIssue,
} from '../src/lib/scoring-rules.ts';

const missingIssue = 'Introdueix els dos punts per confirmar el resultat.';
const integerIssue = 'Els punts han de ser nombres enters no negatius i segurs.';
const drawsAllowed = { allowDraws: true, maxScore: DEFAULT_MAX_SCORE };
const drawsForbidden = { allowDraws: false, maxScore: DEFAULT_MAX_SCORE };

test('legacy scoring remains unlimited and allows draws, while the new default limit is 121', () => {
  assert.equal(DEFAULT_MAX_SCORE, 121);
  assert.deepEqual(LEGACY_SCORING_RULES, { allowDraws: true, maxScore: null });
  assert.equal(Object.isFrozen(LEGACY_SCORING_RULES), true);
  for (const draft of [{ home: '300', away: '300' }, { home: '0', away: '0' }]) {
    assert.equal(scoringIssue(draft), null);
    assert.deepEqual(capScoreDraft(draft, LEGACY_SCORING_RULES), draft);
  }
});

test('the maximum score accepts positive safe decimal integers and surrounding whitespace', () => {
  for (const [input, expected] of [
    ['1', 1], ['121', 121], [' 200 ', 200], ['\n40\t', 40],
    ['9007199254740991', Number.MAX_SAFE_INTEGER],
  ]) {
    assert.equal(parseMaxScore(input), expected, input);
  }
});

test('the maximum score rejects missing, nonpositive, nondecimal and unsafe input', () => {
  for (const input of [
    '', ' ', '0', '00', '01', '-1', '+121', '121.0', '1.5', '1,5', '1e2',
    '0x79', 'NaN', 'Infinity', '1 21', '9007199254740992', '999999999999999999999999',
  ]) {
    assert.equal(parseMaxScore(input), null, input);
  }
});

test('scores above the configured cap are lowered independently without changing the input', () => {
  const draft = Object.freeze({ home: '150', away: '100' });
  assert.deepEqual(capScoreDraft(draft, drawsAllowed), { home: '121', away: '100' });
  assert.deepEqual(draft, { home: '150', away: '100' });
  assert.deepEqual(capScoreDraft({ home: '121', away: '130' }, drawsAllowed), { home: '121', away: '121' });
  assert.deepEqual(capScoreDraft({ home: '0', away: '121' }, drawsAllowed), { home: '0', away: '121' });
  assert.deepEqual(capScoreDraft({ home: '130', away: '125' }, drawsAllowed), { home: '121', away: '121' });
});

test('custom limits apply to either side and disabling the limit preserves scores', () => {
  const draft = { home: '150', away: '90' };
  assert.deepEqual(capScoreDraft(draft, { allowDraws: true, maxScore: 80 }), { home: '80', away: '80' });
  assert.deepEqual(capScoreDraft(draft, { allowDraws: false, maxScore: 200 }), draft);
  assert.deepEqual(capScoreDraft(draft, { allowDraws: false, maxScore: null }), draft);
  assert.equal(scoringIssue({ home: '130', away: '125' }, { allowDraws: false, maxScore: null }), null);
});

test('capping preserves incomplete and invalid fields instead of making them confirmable', () => {
  for (const value of ['', ' ', '-1', '121.5', '1e3', '0122', '9007199254740992']) {
    const draft = Object.freeze({ home: value, away: '150' });
    assert.deepEqual(capScoreDraft(draft, drawsAllowed), { home: value, away: '121' });
    assert.deepEqual(draft, { home: value, away: '150' });
    assert.deepEqual(capScoreDraft({ home: '150', away: value }, drawsAllowed), { home: '121', away: value });
  }
});

test('draws including zero and a draw produced by the cap follow the tournament setting', () => {
  for (const draft of [
    { home: '0', away: '0' }, { home: '60', away: '60' },
    { home: '121', away: '121' }, { home: '130', away: '125' },
  ]) {
    assert.equal(scoringIssue(draft, drawsAllowed), null);
    assert.match(scoringIssue(draft, drawsForbidden), /Aquest campionat no permet empats/);
  }
  assert.match(scoringIssue({ home: '60', away: '60' }, { allowDraws: false, maxScore: null }), /no permet empats/);
  assert.equal(scoringIssue({ home: '130', away: '120' }, drawsForbidden), null);
  assert.equal(scoringIssue({ home: '120', away: '130' }, drawsForbidden), null);
});

test('missing and invalid scores retain their validation errors before checking for a draw', () => {
  for (const draft of [{ home: '', away: '' }, { home: '121', away: '' }, { home: '', away: '121' }]) {
    assert.equal(scoringIssue(draft, drawsForbidden), missingIssue);
  }
  for (const value of [' ', '-1', '1.5', '01', '+1', '1e2', '0x79', 'Infinity', '9007199254740992']) {
    assert.equal(scoringIssue({ home: value, away: value }, drawsForbidden), integerIssue, value);
    assert.equal(scoringIssue({ home: value, away: '150' }, drawsForbidden), integerIssue, value);
    assert.equal(scoringIssue({ home: '150', away: value }, drawsForbidden), integerIssue, value);
  }
  assert.equal(scoringIssue({ home: String(Number.MAX_SAFE_INTEGER), away: '0' }, drawsForbidden), null);
});

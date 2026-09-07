import type { Match, PairPosition, Round } from './tournament';

export interface RepeatedMatch {
  matchId: string;
  tableNumber: number;
  homeId: string;
  awayId: string;
  priorRoundNumbers: number[];
}

export interface ProposalTable {
  matchId: string;
  tableNumber: number;
  homeId: string;
  awayId: string;
}

export interface RepeatProposal {
  roundNumber: number;
  targetMatchId: string;
  firstPosition: PairPosition;
  secondPosition: PairPosition;
  before: [ProposalTable, ProposalTable];
  after: [ProposalTable, ProposalTable];
}

export interface RepeatAnalysis {
  repeats: RepeatedMatch[];
  proposals: RepeatProposal[];
}

/** JSON keeps arbitrary pair IDs unambiguous while treating sides as equivalent. */
export function matchupKey(firstId: string, secondId: string): string {
  return JSON.stringify([firstId, secondId].sort());
}

function historyBefore(rounds: Round[], viewedRound: number): Map<string, number[]> {
  const history = new Map<string, number[]>();
  for (const round of rounds) {
    if (round.number >= viewedRound) continue;
    for (const match of round.matches) {
      const key = matchupKey(match.homeId, match.awayId);
      const previous = history.get(key) ?? [];
      previous.push(round.number);
      history.set(key, previous);
    }
  }
  return history;
}

function isUnscored(match: Match): boolean {
  return match.result === null && match.draft.home === '' && match.draft.away === '';
}

function table(match: Match, tableNumber: number): ProposalTable {
  return { matchId: match.id, tableNumber, homeId: match.homeId, awayId: match.awayId };
}

function sameTable(first: ProposalTable, second: ProposalTable): boolean {
  return first.matchId === second.matchId && first.tableNumber === second.tableNumber &&
    first.homeId === second.homeId && first.awayId === second.awayId;
}

function samePosition(first: PairPosition, second: PairPosition): boolean {
  return first.matchId === second.matchId && first.side === second.side;
}

function swappedTables(first: ProposalTable, second: ProposalTable, firstPosition: PairPosition, secondPosition: PairPosition): [ProposalTable, ProposalTable] {
  const nextFirst = { ...first };
  const nextSecond = { ...second };
  const movedId = nextFirst[firstPosition.side];
  nextFirst[firstPosition.side] = nextSecond[secondPosition.side];
  nextSecond[secondPosition.side] = movedId;
  return [nextFirst, nextSecond];
}

function isNewMatchup(match: ProposalTable, history: Map<string, number[]>): boolean {
  return match.homeId !== match.awayId && !history.has(matchupKey(match.homeId, match.awayId));
}

export function analyzePairingRepeats(rounds: Round[], viewedRound: number): RepeatAnalysis {
  const viewed = rounds.find((round) => round.number === viewedRound);
  if (!viewed) return { repeats: [], proposals: [] };
  const history = historyBefore(rounds, viewedRound);
  const repeats = viewed.matches.flatMap((match, index) => {
    const priorRoundNumbers = history.get(matchupKey(match.homeId, match.awayId));
    return priorRoundNumbers ? [{ matchId: match.id, tableNumber: index + 1, homeId: match.homeId, awayId: match.awayId, priorRoundNumbers }] : [];
  });
  const repeatedIds = new Set(repeats.map((repeat) => repeat.matchId));
  const proposals: RepeatProposal[] = [];

  for (const target of repeats) {
    const targetMatch = viewed.matches.find((match) => match.id === target.matchId);
    if (!targetMatch || !isUnscored(targetMatch)) continue;
    const candidates: Array<{ proposal: RepeatProposal; correctedRepeats: number; distance: number; sideOrder: number }> = [];
    for (const [otherIndex, otherMatch] of viewed.matches.entries()) {
      if (otherMatch.id === target.matchId || !isUnscored(otherMatch)) continue;
      for (const [firstSideIndex, firstSide] of (['homeId', 'awayId'] as const).entries()) {
        for (const [secondSideIndex, secondSide] of (['homeId', 'awayId'] as const).entries()) {
          const before: [ProposalTable, ProposalTable] = [table(targetMatch, target.tableNumber), table(otherMatch, otherIndex + 1)];
          const firstPosition: PairPosition = { matchId: targetMatch.id, side: firstSide };
          const secondPosition: PairPosition = { matchId: otherMatch.id, side: secondSide };
          const after = swappedTables(before[0], before[1], firstPosition, secondPosition);
          const participantIds = new Set([after[0].homeId, after[0].awayId, after[1].homeId, after[1].awayId]);
          if (participantIds.size !== 4 || !isNewMatchup(after[0], history) || !isNewMatchup(after[1], history)) continue;
          candidates.push({
            proposal: { roundNumber: viewedRound, targetMatchId: targetMatch.id, firstPosition, secondPosition, before, after },
            correctedRepeats: 1 + Number(repeatedIds.has(otherMatch.id)),
            distance: Math.abs(target.tableNumber - (otherIndex + 1)),
            sideOrder: firstSideIndex * 2 + secondSideIndex,
          });
        }
      }
    }
    candidates.sort((left, right) => left.distance - right.distance || right.correctedRepeats - left.correctedRepeats ||
      left.proposal.before[1].tableNumber - right.proposal.before[1].tableNumber || left.sideOrder - right.sideOrder);
    if (candidates[0]) proposals.push(candidates[0].proposal);
  }
  return { repeats, proposals };
}

/** Checks a displayed proposal against the complete current round without mutating it. */
export function isRepeatProposalApplicable(rounds: Round[], proposal: RepeatProposal): boolean {
  const round = rounds.find((item) => item.number === proposal.roundNumber);
  if (!round || proposal.before[0].matchId === proposal.before[1].matchId || samePosition(proposal.firstPosition, proposal.secondPosition)) return false;
  const firstMatch = round.matches.find((match) => match.id === proposal.before[0].matchId);
  const secondMatch = round.matches.find((match) => match.id === proposal.before[1].matchId);
  if (!firstMatch || !secondMatch || !isUnscored(firstMatch) || !isUnscored(secondMatch) ||
    !sameTable(table(firstMatch, proposal.before[0].tableNumber), proposal.before[0]) ||
    !sameTable(table(secondMatch, proposal.before[1].tableNumber), proposal.before[1]) ||
    proposal.firstPosition.matchId !== firstMatch.id || proposal.secondPosition.matchId !== secondMatch.id) return false;
  const after = swappedTables(proposal.before[0], proposal.before[1], proposal.firstPosition, proposal.secondPosition);
  return sameTable(after[0], proposal.after[0]) && sameTable(after[1], proposal.after[1]) &&
    new Set([after[0].homeId, after[0].awayId, after[1].homeId, after[1].awayId]).size === 4 &&
    isNewMatchup(after[0], historyBefore(rounds, proposal.roundNumber)) && isNewMatchup(after[1], historyBefore(rounds, proposal.roundNumber));
}

export function sameRepeatProposal(first: RepeatProposal, second: RepeatProposal): boolean {
  return first.roundNumber === second.roundNumber && first.targetMatchId === second.targetMatchId &&
    samePosition(first.firstPosition, second.firstPosition) && samePosition(first.secondPosition, second.secondPosition) &&
    sameTable(first.before[0], second.before[0]) && sameTable(first.before[1], second.before[1]) &&
    sameTable(first.after[0], second.after[0]) && sameTable(first.after[1], second.after[1]);
}

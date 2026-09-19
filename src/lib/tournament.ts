export interface PairDraft {
  number: number;
  playerOne: string;
  playerTwo: string;
}

export interface Pair {
  id: string;
  number: number;
  players: [string, string];
  registrationOrder: number;
}

export interface ScoreDraft {
  home: string;
  away: string;
}

export interface ConfirmedResult {
  home: number;
  away: number;
}

export interface Match {
  id: string;
  homeId: string;
  awayId: string;
  draft: ScoreDraft;
  result: ConfirmedResult | null;
}

export interface Round {
  number: number;
  matches: Match[];
  manuallyAdjusted?: boolean;
}

export interface PairPosition {
  matchId: string;
  side: 'homeId' | 'awayId';
}

export interface PreviousOpponent {
  roundNumber: number;
  opponentId: string;
  outcome: 'win' | 'draw' | 'loss';
}

export interface Standing {
  pair: Pair;
  wins: number;
  pointDifference: number;
  points: number;
}

export const cleanText = (value: string) => value.trim().replace(/\s+/g, ' ');

export function validatePairDrafts(drafts: PairDraft[]): string | null {
  if (drafts.length < 2) return 'Calen com a mínim dues parelles.';
  if (drafts.length % 2 !== 0) return 'El nombre de parelles ha de ser parell; no hi ha descansos.';

  for (const draft of drafts) {
    if (!cleanText(draft.playerOne) || !cleanText(draft.playerTwo)) {
      return `Escriu els dos jugadors de la Parella ${draft.number}.`;
    }
  }
  return null;
}

export function createPairs(drafts: PairDraft[]): Pair[] {
  return drafts.map((draft, registrationOrder) => ({
    id: `pair-${registrationOrder + 1}`,
    number: draft.number,
    players: [cleanText(draft.playerOne), cleanText(draft.playerTwo)],
    registrationOrder,
  }));
}

/** A non-mutating Fisher-Yates shuffle used only for the opening round. */
export function shufflePairs(pairs: Pair[]): Pair[] {
  const shuffled = [...pairs];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export function makeRound(number: number, orderedPairs: Pair[]): Round {
  return {
    number,
    matches: Array.from({ length: orderedPairs.length / 2 }, (_, index) => ({
      id: `round-${number}-match-${index + 1}`,
      homeId: orderedPairs[index * 2].id,
      awayId: orderedPairs[index * 2 + 1].id,
      draft: { home: '', away: '' },
      result: null,
    })),
  };
}

export function scoreIssue(draft: ScoreDraft): string | null {
  const validInteger = (value: string) => /^(0|[1-9]\d*)$/.test(value) && Number.isSafeInteger(Number(value));
  if (!draft.home || !draft.away) return 'Introdueix els dos punts per confirmar el resultat.';
  if (!validInteger(draft.home) || !validInteger(draft.away)) {
    return 'Els punts han de ser nombres enters no negatius i segurs.';
  }
  return null;
}

export function getStandings(pairs: Pair[], rounds: Round[]): Standing[] {
  const standings = pairs.map((pair) => ({ pair, wins: 0, pointDifference: 0, points: 0 }));
  const byId = new Map(standings.map((standing) => [standing.pair.id, standing]));

  for (const round of rounds) {
    for (const match of round.matches) {
      if (!match.result) continue;
      const home = byId.get(match.homeId);
      const away = byId.get(match.awayId);
      if (!home || !away) continue;
      home.pointDifference += match.result.home - match.result.away;
      away.pointDifference += match.result.away - match.result.home;
      home.points += match.result.home;
      away.points += match.result.away;
      if (match.result.home > match.result.away) home.wins += 1;
      else if (match.result.away > match.result.home) away.wins += 1;
      else {
        home.wins += 0.5;
        away.wins += 0.5;
      }
    }
  }

  return standings.sort((left, right) =>
    right.wins - left.wins ||
    right.pointDifference - left.pointDifference ||
    right.points - left.points ||
    left.pair.registrationOrder - right.pair.registrationOrder,
  );
}

export function allResultsConfirmed(round: Round): boolean {
  return round.matches.every((match) => match.result !== null);
}

/** Returns only confirmed meetings from rounds preceding the viewed round. */
export function previousOpponentsForPair(rounds: Round[], viewedRound: number, pairId: string): PreviousOpponent[] {
  const opponents: PreviousOpponent[] = [];
  for (const round of rounds) {
    if (round.number >= viewedRound) continue;
    for (const match of round.matches) {
      if (!match.result) continue;
      if (match.homeId === pairId) {
        opponents.push({
          roundNumber: round.number,
          opponentId: match.awayId,
          outcome: match.result.home > match.result.away ? 'win' : match.result.home === match.result.away ? 'draw' : 'loss',
        });
      } else if (match.awayId === pairId) {
        opponents.push({
          roundNumber: round.number,
          opponentId: match.homeId,
          outcome: match.result.away > match.result.home ? 'win' : match.result.away === match.result.home ? 'draw' : 'loss',
        });
      }
    }
  }
  return opponents;
}

/** Swaps two pair positions only while both involved matches remain entirely unscored. */
export function swapPairPositions(round: Round, first: PairPosition, second: PairPosition): boolean {
  if (first.matchId === second.matchId && first.side === second.side) return false;
  const firstMatch = round.matches.find((match) => match.id === first.matchId);
  const secondMatch = round.matches.find((match) => match.id === second.matchId);
  if (!firstMatch || !secondMatch ||
    firstMatch.result !== null || secondMatch.result !== null ||
    firstMatch.draft.home !== '' || firstMatch.draft.away !== '' ||
    secondMatch.draft.home !== '' || secondMatch.draft.away !== '') return false;

  const firstPairId = firstMatch[first.side];
  firstMatch[first.side] = secondMatch[second.side];
  secondMatch[second.side] = firstPairId;
  return true;
}

// Preserve the original key when introducing the public entry page.
export const TOURNAMENT_STORAGE_KEY = 'taula-de-butifarra-v1';

export function savedTournamentEntry(raw: string | null): 'tournament' | 'draft' | null {
  if (!raw) return null;
  try {
    const state = JSON.parse(raw);
    if (!state || state.schema !== 1 || !state.setup || !Array.isArray(state.pairDrafts)) return null;
    if (state.started === true && Array.isArray(state.rounds) && state.rounds.length > 0) return 'tournament';
    if (state.started !== false) return null;
    const hasPlayers = state.pairDrafts.some((pair: unknown) => {
      if (!pair || typeof pair !== 'object') return false;
      const { playerOne, playerTwo } = pair as Record<string, unknown>;
      return (typeof playerOne === 'string' && playerOne.trim()) || (typeof playerTwo === 'string' && playerTwo.trim());
    });
    return hasPlayers || (typeof state.setup.name === 'string' && state.setup.name !== 'Campionat de Butifarra')
      || (typeof state.setup.roundsDraft === 'string' && state.setup.roundsDraft !== '3') ? 'draft' : null;
  } catch { return null; }
}

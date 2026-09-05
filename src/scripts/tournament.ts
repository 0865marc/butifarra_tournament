import {
  createPairingPoster,
  pairAssignmentsForMatches,
  pairingPosterDimensions,
  pairingPosterLayoutForViewport,
} from '../lib/pairing-poster';
import {
  allResultsConfirmed,
  createPairs,
  getStandings,
  makeRound,
  previousOpponentsForPair,
  scoreIssue,
  shufflePairs,
  swapPairPositions,
  validatePairDrafts,
  type Match,
  type Pair,
  type PairDraft,
  type PairPosition,
  type Round,
} from '../lib/tournament';

const STORAGE_KEY = 'taula-de-butifarra-v1';
const MAX_ROUNDS = 99;

type SaveState = 'saved' | 'error' | 'protected' | 'recovered';

interface SetupState {
  name: string;
  roundsDraft: string;
  rounds?: number;
}

interface AppState {
  schema: 1;
  setup: SetupState;
  pairDrafts: PairDraft[];
  pairs: Pair[];
  rounds: Round[];
  selectedRound: number;
  started: boolean;
}

function emptyState(): AppState {
  return {
    schema: 1,
    setup: { name: 'Campionat de Butifarra', roundsDraft: '3' },
    pairDrafts: [
      { number: 1, playerOne: '', playerTwo: '' },
      { number: 2, playerOne: '', playerTwo: '' },
    ],
    pairs: [],
    rounds: [],
    selectedRound: 0,
    started: false,
  };
}

const exampleDrafts: PairDraft[] = Array.from({ length: 80 }, (_, index) => {
  const number = index + 1;
  return {
    number,
    playerOne: `Jugador ${number * 2 - 1}`,
    playerTwo: `Jugador ${number * 2}`,
  };
});

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function roundCount(value: string): number | null {
  const count = Number(value);
  return Number.isSafeInteger(count) && count >= 1 && count <= MAX_ROUNDS ? count : null;
}

function isRoundCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 1 && value <= MAX_ROUNDS;
}

function isPairDraft(value: unknown): value is PairDraft {
  if (!value || typeof value !== 'object') return false;
  const draft = value as PairDraft & { name?: unknown; number?: unknown };
  return isString(draft.playerOne) && isString(draft.playerTwo) &&
    (draft.number === undefined || isPositiveSafeInteger(draft.number)) &&
    (draft.name === undefined || isString(draft.name));
}

function isPositiveSafeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}

function isPair(value: unknown): value is Pair {
  if (!value || typeof value !== 'object') return false;
  const pair = value as Pair & { name?: unknown; number?: unknown };
  return isString(pair.id) && Array.isArray(pair.players) && pair.players.length === 2 &&
    pair.players.every(isString) && Number.isSafeInteger(pair.registrationOrder) &&
    (pair.number === undefined ? isString(pair.name) : isPositiveSafeInteger(pair.number)) &&
    (pair.name === undefined || isString(pair.name));
}

function isSavedState(value: unknown): value is AppState {
  if (!value || typeof value !== 'object') return false;
  const saved = value as AppState;
  const savedSetup = saved.setup as SetupState & { roundsDraft?: unknown; rounds?: unknown };
  const hasRoundDraft = isString(savedSetup.roundsDraft);
  const hasRoundCount = isRoundCount(savedSetup.rounds);
  if (saved.schema !== 1 || !saved.setup || !isString(saved.setup.name) ||
    (!hasRoundDraft && !hasRoundCount) || !Array.isArray(saved.pairDrafts) || !saved.pairDrafts.every(isPairDraft) ||
    !Array.isArray(saved.pairs) || !Array.isArray(saved.rounds) ||
    !Number.isSafeInteger(saved.selectedRound) || typeof saved.started !== 'boolean') return false;
  const legacyDrafts = saved.pairDrafts.every((draft) => draft.number === undefined);
  const numberedDrafts = saved.pairDrafts.every((draft) => isPositiveSafeInteger(draft.number));
  const draftNumbers = new Set(saved.pairDrafts.map((draft) => draft.number));
  const validPairs = saved.pairs.every(isPair);
  const legacyPairs = saved.pairs.every((pair) => pair.number === undefined && isString((pair as Pair & { name?: unknown }).name));
  const numberedPairs = saved.pairs.every((pair) => isPositiveSafeInteger(pair.number));
  if ((!legacyDrafts && !numberedDrafts) || (numberedDrafts && draftNumbers.size !== saved.pairDrafts.length) ||
    !validPairs || (!legacyPairs && !numberedPairs)) return false;
  if (!saved.started) return saved.pairs.length === 0 && saved.rounds.length === 0 && saved.selectedRound === 0;
  if (!hasRoundCount || (hasRoundDraft && roundCount(savedSetup.roundsDraft) !== savedSetup.rounds) ||
    saved.pairs.length < 2 || saved.pairs.length % 2 !== 0 || saved.rounds.length < 1 ||
    saved.rounds.length > savedSetup.rounds || saved.selectedRound < 1 || saved.selectedRound > saved.rounds.length) return false;
  const pairIds = new Set(saved.pairs.map((pair) => pair.id));
  const registrationOrders = new Set(saved.pairs.map((pair) => pair.registrationOrder));
  const pairNumbers = new Set(saved.pairs.map((pair) => pair.number));
  if (pairIds.size !== saved.pairs.length || registrationOrders.size !== saved.pairs.length ||
    !saved.pairs.every((pair) => pair.registrationOrder >= 0 && pair.registrationOrder < saved.pairs.length) ||
    (numberedPairs && pairNumbers.size !== saved.pairs.length)) return false;
  return saved.rounds.every((round, roundIndex) => {
    if (!round || round.number !== roundIndex + 1 ||
      (round.manuallyAdjusted !== undefined && typeof round.manuallyAdjusted !== 'boolean') ||
      !Array.isArray(round.matches) || round.matches.length !== saved.pairs.length / 2 ||
      !round.matches.every(isMatch)) return false;
    const participants = new Set<string>();
    return round.matches.every((match, matchIndex) => {
      if (match.id !== `round-${round.number}-match-${matchIndex + 1}` || !pairIds.has(match.homeId) ||
        !pairIds.has(match.awayId) || match.homeId === match.awayId ||
        participants.has(match.homeId) || participants.has(match.awayId)) return false;
      participants.add(match.homeId);
      participants.add(match.awayId);
      return true;
    }) && participants.size === pairIds.size;
  });
}

function isMatch(value: unknown): value is Match {
  if (!value || typeof value !== 'object') return false;
  const match = value as Match;
  const validDraft = !!match.draft && isString(match.draft.home) && isString(match.draft.away);
  const validResult = match.result === null || (validDraft && !!match.result &&
    Number.isSafeInteger(match.result.home) && Number.isSafeInteger(match.result.away) &&
    scoreIssue(match.draft) === null &&
    match.result.home === Number(match.draft.home) && match.result.away === Number(match.draft.away));
  return isString(match.id) && isString(match.homeId) && isString(match.awayId) && validDraft && validResult;
}

function normalizeRecoveredState(saved: AppState): void {
  if (!isString(saved.setup.roundsDraft)) saved.setup.roundsDraft = String(saved.setup.rounds);
  saved.pairDrafts = saved.pairDrafts.map((draft, index) => ({
    number: draft.number ?? index + 1,
    playerOne: draft.playerOne,
    playerTwo: draft.playerTwo,
  }));
  saved.pairs.forEach((pair) => {
    pair.number ??= pair.registrationOrder + 1;
    delete (pair as Pair & { name?: string }).name;
  });
  saved.rounds.forEach((round) => { round.manuallyAdjusted ??= false; });
  if (!saved.started) delete saved.setup.rounds;
}

function escapeHtml(value: string | number): string {
  const entities: Record<string, string> = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  };
  return String(value).replace(/[&<>'"]/g, (character) => entities[character] ?? character);
}

function timeLabel(): string {
  return new Intl.DateTimeFormat('ca-ES', { hour: '2-digit', minute: '2-digit' }).format(new Date());
}

export function mountTournament(root: HTMLElement): void {
  let state = emptyState();
  let saveState: SaveState = 'saved';
  let saveMessage = 'Preparat per desar al navegador.';
  let notice = '';
  let storageLocked = false;
  let pairingDialog: HTMLDialogElement | null = null;
  let pairingLaunchButton: HTMLButtonElement | null = null;
  let pairingViewer: HTMLElement | null = null;
  let pairingPosterUrl: string | null = null;
  let pairingPosterSvg = '';
  let pairingPosterRevision = 0;
  let pairingResizeObserver: ResizeObserver | null = null;
  let pairingUpdateFit: (() => void) | null = null;
  let pairingFitFrame: number | null = null;
  let selectedSwap: PairPosition | null = null;
  let openHistory: string | null = null;
  let dismissedHistory: string | null = null;

  let storageRead = false;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    storageRead = true;
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (!isSavedState(parsed)) throw new Error('Unsupported saved format');
      normalizeRecoveredState(parsed);
      state = parsed;
      saveState = 'recovered';
      saveMessage = 'Partida recuperada del navegador.';
    }
  } catch {
    storageLocked = true;
    saveState = 'protected';
    saveMessage = storageRead
      ? 'Hi ha dades desades que no es poden llegir. No s’han esborrat.'
      : 'El navegador no permet accedir a l’emmagatzematge local.';
  }

  function persist(manual = false): void {
    if (storageLocked) {
      saveState = 'protected';
      saveMessage = 'No s’ha desat per protegir les dades antigues que no es poden llegir.';
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      saveState = 'saved';
      saveMessage = `${manual ? 'Desat manualment' : 'Desat automàticament'} a les ${timeLabel()}.`;
    } catch {
      saveState = 'error';
      saveMessage = 'No s’ha pogut desar al navegador. Revisa l’espai o la privadesa.';
    }
  }

  function paintSaveStatus(): void {
    const message = root.querySelector<HTMLElement>('[data-save-message]');
    const dot = root.querySelector<HTMLElement>('[data-save-dot]');
    if (message) message.textContent = saveMessage;
    if (dot) dot.className = `save-dot save-dot--${saveState}`;
  }

  function saveDraft(): void {
    persist();
    paintSaveStatus();
  }

  function update(): void {
    persist();
    render();
  }

  function pairFor(id: string): Pair {
    const pair = state.pairs.find((item) => item.id === id);
    if (!pair) throw new Error('Saved pairing refers to an unknown pair');
    return pair;
  }

  function pairLabel(pair: Pair): string {
    return `Parella ${pair.number}`;
  }

  function nextPairNumber(): number {
    return Math.max(0, ...state.pairDrafts.map((pair) => pair.number)) + 1;
  }

  function currentRound(): Round | undefined {
    return state.rounds.at(-1);
  }

  function samePosition(left: PairPosition, right: PairPosition): boolean {
    return left.matchId === right.matchId && left.side === right.side;
  }

  function swapPositionIssue(position: PairPosition): string | null {
    const latest = currentRound();
    if (!latest || state.selectedRound !== latest.number) {
      return 'Els canvis manuals només es poden fer a la ronda actual.';
    }
    const match = latest.matches.find((item) => item.id === position.matchId);
    if (!match) return 'Aquesta parella ja no és en una taula disponible.';
    if (match.result !== null) return 'No es pot canviar una taula amb un resultat confirmat.';
    if (match.draft.home !== '' || match.draft.away !== '') {
      return 'No es pot canviar una taula amb marcadors escrits.';
    }
    return null;
  }

  function clearSwapSelection(): void {
    selectedSwap = null;
  }

  function paintNotice(): void {
    const noticeElement = root.querySelector<HTMLElement>('[data-notice]');
    if (!noticeElement) return;
    noticeElement.textContent = notice;
    noticeElement.hidden = !notice;
  }

  function syncHistoryPopover(): void {
    root.querySelectorAll<HTMLElement>('[data-history-region]').forEach((region) => {
      const isOpen = region.dataset.historyRegion === openHistory;
      const isDismissed = region.dataset.historyRegion === dismissedHistory;
      region.classList.toggle('team--history-open', isOpen);
      region.classList.toggle('team--history-dismissed', isDismissed);
      region.querySelector<HTMLButtonElement>('[data-action="toggle-history"]')?.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function syncSwapSelection(): void {
    root.querySelectorAll<HTMLButtonElement>('[data-action="swap-pair"]').forEach((button) => {
      const side = button.dataset.pairSide;
      if (side !== 'homeId' && side !== 'awayId') return;
      const position = { matchId: button.dataset.matchId ?? '', side };
      const issue = swapPositionIssue(position);
      const isSelected = selectedSwap !== null && samePosition(selectedSwap, position);
      const pairLabel = button.dataset.pairLabel ?? 'Parella';
      button.classList.toggle('swap-button--selected', isSelected);
      button.setAttribute('aria-pressed', String(isSelected));
      button.setAttribute('aria-label', `${isSelected ? 'Cancel·la la selecció de' : 'Selecciona per intercanviar'} ${pairLabel}`);
      button.title = issue ?? 'Intercanvia la posició d’aquesta parella';
      button.disabled = Boolean(issue);
      const reason = button.closest<HTMLElement>('.team')?.querySelector<HTMLElement>('[data-swap-reason]');
      if (reason) {
        reason.textContent = issue ?? '';
        reason.hidden = !issue;
      }
      if (issue) button.setAttribute('aria-describedby', reason?.id ?? '');
      else button.removeAttribute('aria-describedby');
    });
    const status = root.querySelector<HTMLElement>('[data-swap-status]');
    if (status) status.hidden = selectedSwap === null;
  }

  function dismissHistoryPopover(): void {
    if (!openHistory) return;
    dismissedHistory = openHistory;
    openHistory = null;
    syncHistoryPopover();
  }

  function selectPairForSwap(position: PairPosition): void {
    const positionIssue = swapPositionIssue(position);
    if (positionIssue) {
      clearSwapSelection();
      notice = positionIssue;
      render();
      return;
    }
    if (!selectedSwap) {
      const match = currentRound()?.matches.find((item) => item.id === position.matchId);
      const pair = match ? pairFor(match[position.side]) : null;
      selectedSwap = position;
      notice = `${pair ? pairLabel(pair) : 'Parella'} seleccionada. Tria una altra parella per intercanviar-la.`;
      render();
      return;
    }
    if (samePosition(selectedSwap, position)) {
      clearSwapSelection();
      notice = 'Selecció d’intercanvi cancel·lada.';
      render();
      return;
    }
    const selectedIssue = swapPositionIssue(selectedSwap);
    const latest = currentRound();
    if (selectedIssue || !latest || !swapPairPositions(latest, selectedSwap, position)) {
      clearSwapSelection();
      notice = selectedIssue ?? 'No es poden intercanviar aquestes parelles ara.';
      render();
      return;
    }
    latest.manuallyAdjusted = true;
    clearSwapSelection();
    notice = 'Parelles intercanviades manualment. Els emparellaments s’han desat.';
    update();
  }

  function configuredRounds(): number {
    if (state.setup.rounds === undefined) throw new Error('Started tournament is missing its round count');
    return state.setup.rounds;
  }

  function startTournament(): void {
    const rounds = roundCount(state.setup.roundsDraft);
    if (rounds === null) {
      notice = `Indica un nombre de rondes enter entre 1 i ${MAX_ROUNDS}.`;
      render();
      return;
    }
    const issue = validatePairDrafts(state.pairDrafts);
    if (issue) {
      notice = issue;
      render();
      return;
    }
    clearSwapSelection();
    openHistory = null;
    state.setup.rounds = rounds;
    state.pairs = createPairs(state.pairDrafts);
    state.rounds = [makeRound(1, shufflePairs(state.pairs))];
    state.selectedRound = 1;
    state.started = true;
    notice = 'Primera ronda sortejada. Bona partida!';
    update();
  }

  function nextRound(): void {
    const round = currentRound();
    if (!round || !allResultsConfirmed(round)) {
      notice = 'Confirma tots els resultats vàlids abans de crear la ronda següent.';
      render();
      return;
    }
    if (state.rounds.length >= configuredRounds()) {
      notice = 'El campionat ja ha arribat al nombre de rondes previst.';
      render();
      return;
    }
    clearSwapSelection();
    openHistory = null;
    const orderedPairs = getStandings(state.pairs, state.rounds).map((standing) => standing.pair);
    const next = makeRound(state.rounds.length + 1, orderedPairs);
    state.rounds.push(next);
    state.selectedRound = next.number;
    notice = 'Nova ronda creada segons la classificació actual. Les parelles es poden repetir.';
    update();
  }

  function updateMatch(matchId: string, field: 'home' | 'away', value: string): void {
    const round = currentRound();
    const match = round?.matches.find((item) => item.id === matchId);
    if (!match) return;
    const wasConfirmed = match.result !== null;
    const activeInput = document.activeElement instanceof HTMLInputElement ? document.activeElement : null;
    const selectionStart = activeInput?.selectionStart;
    const selectionEnd = activeInput?.selectionEnd;
    clearSwapSelection();
    match.draft[field] = value;
    match.result = null;
    notice = '';
    syncSwapSelection();
    paintNotice();

    if (wasConfirmed) {
      update();
      const input = root.querySelector<HTMLInputElement>(`[data-match-id="${matchId}"][data-score="${field}"]`);
      if (input) {
        input.focus();
        input.setSelectionRange(selectionStart ?? input.value.length, selectionEnd ?? input.value.length);
      }
      return;
    }

    saveDraft();
    const card = root.querySelector<HTMLElement>(`.match:has([data-match-id="${matchId}"])`);
    const message = card?.querySelector<HTMLElement>('[data-match-message]');
    const button = card?.querySelector<HTMLButtonElement>('[data-action="confirm-match"]');
    const issue = scoreIssue(match.draft);
    card?.classList.remove('match--confirmed');
    if (message) {
      message.textContent = issue ?? 'Escriu dos marcadors diferents per confirmar.';
      message.className = `field-message ${issue ? 'field-message--error' : ''}`;
    }
    if (button) {
      button.disabled = Boolean(issue);
      button.textContent = 'Confirma el resultat';
    }
  }

  function confirmMatch(matchId: string): void {
    const round = currentRound();
    const match = round?.matches.find((item) => item.id === matchId);
    if (!match) return;
    const issue = scoreIssue(match.draft);
    if (issue) {
      notice = issue;
      render();
      return;
    }
    clearSwapSelection();
    match.result = { home: Number(match.draft.home), away: Number(match.draft.away) };
    notice = 'Resultat confirmat i classificació actualitzada.';
    update();
  }

  function resetTournament(): void {
    if (!window.confirm('Vols començar un campionat nou? S’esborraran els progressos desats en aquest navegador.')) return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      storageLocked = false;
    } catch {
      saveState = 'error';
      saveMessage = 'No s’han pogut esborrar les dades del navegador.';
      render();
      return;
    }
    state = emptyState();
    clearSwapSelection();
    openHistory = null;
    notice = 'Ja pots preparar un campionat nou.';
    update();
  }

  function renderPairFields(): string {
    return state.pairDrafts.map((pair, index) => `
      <fieldset class="pair-editor">
        <legend>
          Parella ${pair.number}
          <button class="icon-button" style="width: 1.5rem; height: 1.5rem; margin-left: .25rem; vertical-align: middle; font-size: 1rem; border: 0; background: transparent;" type="button" data-action="remove-pair" data-pair-index="${index}" ${state.pairDrafts.length <= 2 ? 'disabled' : ''} aria-label="Elimina la Parella ${pair.number}">×</button>
        </legend>
        <div class="player-fields">
          <label>Jugador/a 1
            <input data-pair-index="${index}" data-pair-field="playerOne" value="${escapeHtml(pair.playerOne)}" autocomplete="name" placeholder="Nom i cognom">
          </label>
          <label>Jugador/a 2
            <input data-pair-index="${index}" data-pair-field="playerTwo" value="${escapeHtml(pair.playerTwo)}" autocomplete="name" placeholder="Nom i cognom">
          </label>
        </div>
      </fieldset>`).join('');
  }

  function renderSetup(): string {
    if (state.started) {
      return `<aside class="setup-summary card">
        <p class="eyebrow">Fitxa del campionat</p>
        <h2>${escapeHtml(state.setup.name)}</h2>
        <dl><div><dt>Rondes</dt><dd>${configuredRounds()}</dd></div><div><dt>Parelles</dt><dd>${state.pairs.length}</dd></div></dl>
        <p class="quiet">La primera ronda és un sorteig. Després, 1–2, 3–4… segons victòries i punts; si empaten, preval l’ordre d’inscripció.</p>
        <button class="button button--quiet" type="button" data-action="reset">Comença un campionat nou</button>
      </aside>`;
    }
    return `<section class="setup card" aria-labelledby="setup-title">
      <div class="section-heading"><div><p class="eyebrow">Preparació</p><h2 id="setup-title">Obre la taula</h2></div><button class="text-button" type="button" data-action="example">Carrega un exemple</button></div>
      <p class="quiet">Inscriu un nombre parell de parelles. No hi ha descansos ni partides contra el rellotge.</p>
      <form class="setup-form" novalidate>
        <div class="setup-grid">
          <label>Nom del campionat
            <input data-setup-field="name" value="${escapeHtml(state.setup.name)}" autocomplete="off" placeholder="Campionat de Butifarra">
          </label>
          <label>Nombre de rondes
            <input data-setup-field="rounds" type="number" min="1" max="${MAX_ROUNDS}" step="1" value="${escapeHtml(state.setup.roundsDraft)}" inputmode="numeric" required>
          </label>
        </div>
        <div class="pair-list">${renderPairFields()}</div>
        <div class="setup-actions"><button class="button button--quiet" type="button" data-action="add-pair">+ Afegeix una parella</button><button class="button" type="submit">Sorteja la primera ronda</button></div>
        <button class="text-button" type="button" data-action="reset">Reinicia les dades locals</button>
      </form>
    </section>`;
  }

  function pairingAssignmentsForRound(round: Round) {
    return pairAssignmentsForMatches(round.matches.map((match, index) => ({
      tableNumber: index + 1,
      homeNumber: pairFor(match.homeId).number,
      awayNumber: pairFor(match.awayId).number,
    })));
  }

  function renderPairingTextAlternative(selected: Round): string {
    return `<ol>${pairingAssignmentsForRound(selected).map((assignment) =>
      `<li>Parella ${escapeHtml(assignment.pairNumber)}: Taula ${escapeHtml(assignment.tableNumber)}.</li>`
    ).join('')}</ol>`;
  }

  function isCurrentPairingDialog(dialog: HTMLDialogElement | null, viewer: HTMLElement | null): boolean {
    return Boolean(dialog && viewer && pairingDialog === dialog && pairingViewer === viewer);
  }

  function setFullscreenFeedback(message: string, dialog = pairingDialog): void {
    const feedback = dialog?.querySelector<HTMLElement>('[data-fullscreen-feedback]');
    if (feedback) feedback.textContent = message;
  }

  function showPosterFallback(dialog: HTMLDialogElement, viewer: HTMLElement, message: string): void {
    if (!isCurrentPairingDialog(dialog, viewer)) return;
    dialog.querySelector<HTMLButtonElement>('[data-action="open-poster"]')?.removeAttribute('hidden');
    setFullscreenFeedback(message, dialog);
  }

  function syncFullscreenControls(): void {
    const isFullscreen = document.fullscreenElement === pairingViewer;
    pairingViewer?.classList.toggle('pairing-viewer--fullscreen', isFullscreen);
    const button = pairingDialog?.querySelector<HTMLButtonElement>('[data-action="toggle-fullscreen"]');
    if (button) button.textContent = isFullscreen ? 'Surt de pantalla completa' : 'Pantalla completa';
    pairingUpdateFit?.();
  }

  function disposePairingDialog(restoreFocus = true): void {
    const dialog = pairingDialog;
    const launcher = pairingLaunchButton;
    const viewer = pairingViewer;
    const posterUrl = pairingPosterUrl;
    if (document.fullscreenElement === viewer && document.exitFullscreen) {
      void document.exitFullscreen()
        .then(() => {
          if (isCurrentPairingDialog(dialog, viewer)) disposePairingDialog(restoreFocus);
        })
        .catch(() => {
          if (isCurrentPairingDialog(dialog, viewer)) setFullscreenFeedback('No s’ha pogut sortir de la pantalla completa.', dialog);
        });
      return;
    }
    document.removeEventListener('fullscreenchange', syncFullscreenControls);
    pairingResizeObserver?.disconnect();
    pairingResizeObserver = null;
    if (pairingFitFrame !== null) window.cancelAnimationFrame(pairingFitFrame);
    pairingFitFrame = null;
    pairingUpdateFit = null;
    pairingDialog = null;
    pairingLaunchButton = null;
    pairingViewer = null;
    pairingPosterUrl = null;
    pairingPosterSvg = '';
    pairingPosterRevision += 1;
    dialog?.remove();
    if (posterUrl) URL.revokeObjectURL(posterUrl);
    if (restoreFocus && launcher?.isConnected) window.requestAnimationFrame(() => launcher.focus());
  }

  function closePairingDialog(): void {
    const dialog = pairingDialog;
    if (!dialog) return;
    const viewer = pairingViewer;
    if (document.fullscreenElement === viewer && document.exitFullscreen) {
      void document.exitFullscreen()
        .then(() => {
          if (isCurrentPairingDialog(dialog, viewer) && dialog.open) dialog.close();
        })
        .catch(() => {
          if (isCurrentPairingDialog(dialog, viewer)) setFullscreenFeedback('No s’ha pogut sortir de la pantalla completa.', dialog);
        });
      return;
    }
    if (dialog.open) dialog.close();
    else disposePairingDialog();
  }

  function openPosterInNewTab(dialog: HTMLDialogElement | null, viewer: HTMLElement | null, posterSvg: string, revision: number): void {
    if (!dialog || !viewer || !posterSvg || !isCurrentPairingDialog(dialog, viewer) || pairingPosterRevision !== revision) return;
    const popup = window.open('', '_blank');
    if (!popup || popup.closed) {
      showPosterFallback(dialog, viewer, 'El navegador ha blocat la pestanya nova. Torna-ho a provar amb «Obre la imatge».');
      return;
    }
    try {
      popup.opener = null;
      const popupDocument = popup.document;
      const image = popupDocument.createElement('img');
      image.alt = 'Pòster dels emparellaments';
      image.addEventListener('load', () => {
        if (isCurrentPairingDialog(dialog, viewer) && pairingPosterRevision === revision) setFullscreenFeedback('El pòster ja es mostra a la pestanya nova.', dialog);
      });
      image.addEventListener('error', () => {
        if (isCurrentPairingDialog(dialog, viewer) && pairingPosterRevision === revision) {
          showPosterFallback(dialog, viewer, 'No s’ha pogut carregar el pòster a la pestanya nova. Pots tornar-ho a provar.');
        }
      });
      popupDocument.title = 'Pòster dels emparellaments';
      const style = popupDocument.createElement('style');
      style.textContent = 'html,body{width:100%;height:100%;margin:0;background:#f6f0e3}img{display:block;width:100vw;height:100vh;object-fit:contain}';
      popupDocument.head.append(style);
      popupDocument.body.replaceChildren(image);
      image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(posterSvg)}`;
      setFullscreenFeedback('S’està carregant el pòster a la pestanya nova.', dialog);
    } catch {
      showPosterFallback(dialog, viewer, 'No s’ha pogut preparar la imatge a la pestanya nova. Pots tornar-ho a provar.');
    }
  }

  function togglePosterFullscreen(dialog = pairingDialog, viewer = pairingViewer): void {
    if (!dialog || !viewer || !pairingPosterSvg || !isCurrentPairingDialog(dialog, viewer)) return;
    if (document.fullscreenElement === viewer) {
      if (document.exitFullscreen) {
        void document.exitFullscreen().catch(() => {
          if (isCurrentPairingDialog(dialog, viewer)) setFullscreenFeedback('No s’ha pogut sortir de la pantalla completa.', dialog);
        });
      }
      return;
    }
    if (!viewer.requestFullscreen) {
      showPosterFallback(dialog, viewer, 'La pantalla completa no està disponible.');
      openPosterInNewTab(dialog, viewer, pairingPosterSvg, pairingPosterRevision);
      return;
    }
    void viewer.requestFullscreen().catch(() => {
      showPosterFallback(dialog, viewer, 'La pantalla completa no està disponible. Pots obrir el pòster en una pestanya nova.');
    });
  }

  function openPairingDialog(selected: Round, launcher: HTMLButtonElement): void {
    disposePairingDialog(false);
    const posterAssignments = pairingAssignmentsForRound(selected);
    let layout = pairingPosterLayoutForViewport(posterAssignments.length, { width: 0, height: 0 });
    let dimensions = pairingPosterDimensions(posterAssignments.length, layout);
    let posterImage: HTMLImageElement | null = null;
    pairingLaunchButton = launcher;
    const dialog = document.createElement('dialog');
    dialog.className = 'pairing-dialog';
    dialog.setAttribute('aria-labelledby', 'pairing-dialog-title');
    dialog.setAttribute('aria-describedby', 'pairing-dialog-description');
    const drawLabel = selected.manuallyAdjusted
      ? 'Emparellaments ajustats manualment'
      : selected.number === 1 ? 'Sorteig aleatori' : 'Segons classificació prèvia';
    dialog.innerHTML = `<div class="pairing-viewer" data-pairing-viewer aria-describedby="pairing-dialog-description"><div class="pairing-viewer__header"><div><p class="eyebrow">${drawLabel}</p><h2 id="pairing-dialog-title">Parelles i taules · Ronda ${selected.number}</h2></div><div class="pairing-viewer__actions pairing-viewer__actions--header"><button class="button button--small" type="button" data-action="toggle-fullscreen">Pantalla completa</button><button class="button button--small" type="button" data-action="open-poster" hidden>Obre la imatge</button><button class="icon-button" type="button" data-action="close-pairings" aria-label="Tanca els emparellaments" autofocus>×</button></div></div>
      <p id="pairing-dialog-description" class="quiet">Pòster de les parelles ordenades per número i la seva taula desada de ${escapeHtml(state.setup.name)}.</p>
      <div class="pairing-viewer__content">
        <p class="field-message" data-fullscreen-feedback role="status" aria-live="polite"></p>
        <div class="pairing-poster-scroll" data-poster-scroll></div>
      </div>
      <div class="sr-only"><h3>Versió de text de les parelles i taules</h3>${renderPairingTextAlternative(selected)}</div>`;
    document.body.append(dialog);
    pairingDialog = dialog;
    pairingViewer = dialog.querySelector<HTMLElement>('[data-pairing-viewer]');
    const viewer = pairingViewer;
    const scroll = dialog.querySelector<HTMLElement>('[data-poster-scroll]');

    function schedulePosterFit(): void {
      if (pairingFitFrame !== null) return;
      pairingFitFrame = window.requestAnimationFrame(() => {
        pairingFitFrame = null;
        updatePosterFit();
      });
    }

    function updatePosterFit(): void {
      if (!scroll || !isCurrentPairingDialog(dialog, viewer)) return;
      const width = scroll.clientWidth;
      const height = scroll.clientHeight;
      if (width < 1 || height < 1) return;
      const nextLayout = pairingPosterLayoutForViewport(posterAssignments.length, { width, height });
      if (nextLayout.columns !== layout.columns || nextLayout.rows !== layout.rows) {
        layout = nextLayout;
        dimensions = pairingPosterDimensions(posterAssignments.length, layout);
        refreshPoster();
        return;
      }
      if (!posterImage) {
        refreshPoster();
        return;
      }
      const fitScale = Math.min(width / dimensions.width, height / dimensions.height);
      if (!Number.isFinite(fitScale) || fitScale <= 0) return;
      posterImage.style.width = `${dimensions.width * fitScale}px`;
      posterImage.style.height = `${dimensions.height * fitScale}px`;
    }

    function refreshPoster(): void {
      if (!scroll || !isCurrentPairingDialog(dialog, viewer)) return;
      dimensions = pairingPosterDimensions(posterAssignments.length, layout);
      pairingPosterSvg = createPairingPoster({
        tournamentName: state.setup.name,
        roundNumber: selected.number,
        assignments: posterAssignments,
        layout,
      });
      const previousUrl = pairingPosterUrl;
      const nextUrl = URL.createObjectURL(new Blob([pairingPosterSvg], { type: 'image/svg+xml' }));
      pairingPosterUrl = nextUrl;
      const revision = ++pairingPosterRevision;
      const image = document.createElement('img');
      image.alt = `Pòster de les parelles i taules de la ronda ${selected.number} de ${state.setup.name}.`;
      image.addEventListener('error', () => {
        if (posterImage === image && pairingPosterRevision === revision && isCurrentPairingDialog(dialog, viewer)) {
          showPosterFallback(dialog, viewer, 'No s’ha pogut carregar el pòster. Pots obrir la imatge en una pestanya nova.');
        }
      });
      posterImage = image;
      scroll.replaceChildren(image);
      image.src = nextUrl;
      dialog.querySelector<HTMLButtonElement>('[data-action="open-poster"]')?.setAttribute('hidden', '');
      if (previousUrl) URL.revokeObjectURL(previousUrl);
      updatePosterFit();
    }

    dialog.querySelector<HTMLButtonElement>('[data-action="close-pairings"]')?.addEventListener('click', closePairingDialog);
    dialog.querySelector<HTMLButtonElement>('[data-action="toggle-fullscreen"]')?.addEventListener('click', () => togglePosterFullscreen(dialog, viewer));
    dialog.querySelector<HTMLButtonElement>('[data-action="open-poster"]')?.addEventListener('click', () => openPosterInNewTab(dialog, viewer, pairingPosterSvg, pairingPosterRevision));
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) closePairingDialog();
    });
    dialog.addEventListener('close', () => disposePairingDialog());
    document.addEventListener('fullscreenchange', syncFullscreenControls);
    pairingUpdateFit = schedulePosterFit;
    if (scroll && 'ResizeObserver' in window) {
      pairingResizeObserver = new ResizeObserver(() => schedulePosterFit());
      pairingResizeObserver.observe(scroll);
    }
    try {
      dialog.showModal();
      schedulePosterFit();
    } catch {
      disposePairingDialog();
    }
  }

  function renderPairCard(pair: Pair, round: Round, match: Match, side: PairPosition['side'], away = false): string {
    const historyId = `history-${match.id}-${side}`;
    const swapReason = swapPositionIssue({ matchId: match.id, side });
    const isSelected = selectedSwap !== null && samePosition(selectedSwap, { matchId: match.id, side });
    const history = previousOpponentsForPair(state.rounds, round.number, pair.id);
    const historyItems = history.length
      ? `<ul>${history.map((entry) => `<li>R${entry.roundNumber} · P${pairFor(entry.opponentId).number} · <b class="pair-history__result pair-history__result--${entry.won ? 'win' : 'loss'}">${entry.won ? 'Victòria ✓' : 'Derrota ✕'}</b></li>`).join('')}</ul>`
      : '<p>Encara no hi ha rivals anteriors confirmats.</p>';
    const swapDescriptionId = `swap-${match.id}-${side}`;
    return `<div class="team ${away ? 'team--away' : ''} ${openHistory === historyId ? 'team--history-open' : ''}" data-history-region="${historyId}">
      <button class="team__history-trigger" type="button" data-action="toggle-history" data-history-id="${historyId}" aria-label="Consulta els rivals anteriors de ${escapeHtml(pairLabel(pair))}" aria-describedby="${historyId}" aria-expanded="${openHistory === historyId}">${escapeHtml(pairLabel(pair))}</button><span>${escapeHtml(pair.players[0])} · ${escapeHtml(pair.players[1])}</span>
      <div class="team__actions">
        <button class="swap-button ${isSelected ? 'swap-button--selected' : ''}" type="button" data-action="swap-pair" data-match-id="${match.id}" data-pair-side="${side}" data-pair-label="${escapeHtml(pairLabel(pair))}" aria-pressed="${isSelected}" aria-label="${isSelected ? 'Cancel·la la selecció de' : 'Selecciona per intercanviar'} ${escapeHtml(pairLabel(pair))}" ${swapReason ? `aria-describedby="${swapDescriptionId}"` : ''} title="${escapeHtml(swapReason ?? 'Intercanvia la posició d’aquesta parella')}" ${swapReason ? 'disabled' : ''}>⇄</button>
        <p id="${swapDescriptionId}" class="swap-reason" data-swap-reason ${swapReason ? '' : 'hidden'}>${escapeHtml(swapReason ?? '')}</p>
      </div>
      <div id="${historyId}" class="pair-history" role="tooltip"><p class="pair-history__title">Rivals anteriors de ${escapeHtml(pairLabel(pair))}</p>${historyItems}</div>
    </div>`;
  }

  function renderMatch(match: Match, round: Round, editable: boolean, tableNumber: number): string {
    const home = pairFor(match.homeId);
    const away = pairFor(match.awayId);
    const homeLabel = pairLabel(home);
    const awayLabel = pairLabel(away);
    const issue = scoreIssue(match.draft);
    const message = match.result
      ? 'Resultat confirmat. Pots editar-lo fins que generis la ronda següent.'
      : issue;
    return `<article class="match ${match.result ? 'match--confirmed' : ''}">
      <p class="table-label">Taula ${tableNumber}</p>
      ${renderPairCard(home, round, match, 'homeId')}
      <div class="score-entry">
        <label><span class="sr-only">Punts de ${escapeHtml(homeLabel)}</span><input data-match-id="${match.id}" data-score="home" value="${escapeHtml(match.draft.home)}" ${editable ? '' : 'disabled'} inputmode="numeric" aria-label="Punts de ${escapeHtml(homeLabel)}"></label>
        <span class="versus">—</span>
        <label><span class="sr-only">Punts de ${escapeHtml(awayLabel)}</span><input data-match-id="${match.id}" data-score="away" value="${escapeHtml(match.draft.away)}" ${editable ? '' : 'disabled'} inputmode="numeric" aria-label="Punts de ${escapeHtml(awayLabel)}"></label>
      </div>
      ${renderPairCard(away, round, match, 'awayId', true)}
      <div class="match-footer"><p data-match-message class="field-message ${issue && editable ? 'field-message--error' : ''}">${editable ? (message ?? 'Escriu dos marcadors diferents per confirmar.') : 'Ronda tancada: resultat només de consulta.'}</p>
      <button class="button button--small" type="button" data-action="confirm-match" data-match-id="${match.id}" ${!editable || issue ? 'disabled' : ''}>${match.result ? 'Resultat confirmat' : 'Confirma el resultat'}</button></div>
    </article>`;
  }

  function renderPlay(): string {
    const selected = state.rounds.find((round) => round.number === state.selectedRound) ?? currentRound();
    if (!selected) return '';
    const latest = currentRound();
    const editable = selected.number === latest?.number;
    const complete = latest && allResultsConfirmed(latest);
    const tournamentComplete = state.rounds.length === configuredRounds() && complete;
    const standings = getStandings(state.pairs, state.rounds);
    return `<main class="dashboard">
      <section class="play-area">
        <div class="round-nav" aria-label="Historial de rondes">
          ${state.rounds.map((round) => `<button type="button" data-action="select-round" data-round="${round.number}" class="round-tab ${round.number === selected.number ? 'round-tab--active' : ''}">Ronda ${round.number}</button>`).join('')}
        </div>
        <div class="round-heading"><div><p class="eyebrow">${selected.number === latest?.number ? 'Ronda actual' : 'Historial'}</p><h1>Ronda ${selected.number}</h1></div><div class="round-heading__actions"><button class="button button--small" type="button" data-action="view-pairings" aria-label="Veure els emparellaments de la ronda ${selected.number}">Veure emparellaments</button><p class="round-note">${editable ? 'Pots editar els resultats confirmats abans de generar la ronda següent.' : 'Aquesta ronda és de consulta per preservar els emparellaments posteriors.'}</p>${selected.manuallyAdjusted ? '<p class="manual-adjustment">Emparellaments ajustats manualment.</p>' : ''}</div></div>
        ${selectedSwap ? '<div class="swap-status" data-swap-status role="status">Parella seleccionada: tria una altra parella per intercanviar-la.<button class="text-button" type="button" data-action="cancel-swap">Cancel·la</button></div>' : ''}
        <div class="matches">${selected.matches.map((match, index) => renderMatch(match, selected, editable, index + 1)).join('')}</div>
        ${selected.number === latest?.number ? `<div class="round-action card ${complete ? 'round-action--ready' : ''}">${complete
          ? tournamentComplete
            ? '<div><strong>Campionat complet</strong><p>Classificació final calculada amb victòries, punts i ordre d’inscripció com a últim criteri estable.</p></div>'
            : '<div><strong>Ronda completa</strong><p>Ja pots crear els emparellaments següents. Les parelles es poden tornar a trobar.</p></div><button class="button" type="button" data-action="next-round">Genera la ronda ${latest.number + 1}</button>'
          : '<div><strong>Resultats pendents</strong><p>Confirma cada partida amb dos punts enters, no negatius i diferents.</p></div>'}</div>` : ''}
      </section>
      <div class="secondary-column">
        <aside class="standings card" aria-labelledby="standings-title">
          <div class="section-heading"><div><p class="eyebrow">${tournamentComplete ? 'Resultat final' : 'En directe'}</p><h2 id="standings-title">Classificació</h2></div><span class="suit-mark" aria-hidden="true">♠</span></div>
          <table><thead><tr><th>Pos.</th><th>Parella</th><th>V</th><th>Punts</th></tr></thead><tbody>${standings.map((standing, index) => `<tr><td>${index + 1}</td><th scope="row">${escapeHtml(pairLabel(standing.pair))}<span class="standing-players">${escapeHtml(standing.pair.players[0])} · ${escapeHtml(standing.pair.players[1])}</span></th><td>${standing.wins}</td><td>${standing.points}</td></tr>`).join('')}</tbody></table>
          <p class="quiet">Ordre: victòries, punts anotats i, només si coincideixen, ordre d’inscripció. No és cap desempat esportiu addicional.</p>
        </aside>
        ${renderSetup()}
      </div>
    </main>`;
  }

  function render(): void {
    disposePairingDialog(false);
    root.innerHTML = `<div class="app-shell">
      <header class="masthead"><div><p class="brand"><span aria-hidden="true">♣</span> Taula de Butifarra</p><p class="masthead__sub">Campionat de cartes, ordenat i a punt.</p></div><div class="save-box"><span data-save-dot class="save-dot save-dot--${saveState}" aria-hidden="true"></span><span data-save-message aria-live="polite">${escapeHtml(saveMessage)}</span><button class="text-button" type="button" data-action="save" ${storageLocked ? 'disabled' : ''}>Desa ara</button></div></header>
      <p data-notice class="notice" role="status" ${notice ? '' : 'hidden'}>${escapeHtml(notice)}</p>
      ${state.started ? renderPlay() : `<div class="start-layout"><div class="intro"><p class="eyebrow">Club de cartes</p><h1>Un campionat ben portat comença amb una bona taula.</h1><p>Prepara les parelles, sorteja l’obertura i anota cada mà sense perdre el fil.</p><div class="intro__motif" aria-hidden="true">♠ &nbsp; ♥ &nbsp; ♦ &nbsp; ♣</div></div>${renderSetup()}</div>`}
      <footer>Les dades es desen només en aquest navegador. Cap compte, cap servidor.</footer>
    </div>`;
    bindEvents();
  }

  function bindEvents(): void {
    root.querySelector('.setup-form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      startTournament();
    });
    root.querySelectorAll<HTMLInputElement>('[data-setup-field]').forEach((input) => input.addEventListener('input', () => {
      const field = input.dataset.setupField;
      if (field === 'name') state.setup.name = input.value;
      if (field === 'rounds') {
        state.setup.roundsDraft = input.value;
      }
      notice = '';
      saveDraft();
    }));
    root.querySelectorAll<HTMLInputElement>('[data-pair-field]').forEach((input) => input.addEventListener('input', () => {
      const index = Number(input.dataset.pairIndex);
      const field = input.dataset.pairField as 'playerOne' | 'playerTwo';
      if (state.pairDrafts[index] && field) state.pairDrafts[index][field] = input.value;
      notice = '';
      saveDraft();
    }));
    root.querySelectorAll<HTMLInputElement>('[data-score]').forEach((input) => input.addEventListener('input', () => {
      updateMatch(input.dataset.matchId ?? '', input.dataset.score as 'home' | 'away', input.value);
    }));
    root.querySelectorAll<HTMLElement>('[data-history-region]').forEach((region) => {
      const restoreHistoryHover = (nextFocus: EventTarget | null = null) => {
        if (region.dataset.historyRegion !== dismissedHistory) return;
        if (nextFocus instanceof Node) {
          if (region.contains(nextFocus)) return;
        } else if (region.contains(document.activeElement)) return;
        dismissedHistory = null;
        syncHistoryPopover();
      };
      region.addEventListener('pointerleave', () => restoreHistoryHover());
      region.addEventListener('focusout', (event) => restoreHistoryHover(event.relatedTarget));
    });
    root.querySelectorAll<HTMLButtonElement>('[data-action]').forEach((button) => button.addEventListener('click', () => {
      const action = button.dataset.action;
      if (action === 'save') { persist(true); render(); }
      if (action === 'example') { state.setup = { name: 'Copa del Casino', roundsDraft: '3' }; state.pairDrafts = exampleDrafts.map((pair) => ({ ...pair })); notice = 'Exemple carregat. El pots adaptar abans de sortejar.'; update(); }
      if (action === 'add-pair') { state.pairDrafts.push({ number: nextPairNumber(), playerOne: '', playerTwo: '' }); notice = ''; update(); }
      if (action === 'remove-pair') { const index = Number(button.dataset.pairIndex); if (state.pairDrafts.length > 2) { state.pairDrafts.splice(index, 1); notice = ''; update(); } }
      if (action === 'confirm-match') confirmMatch(button.dataset.matchId ?? '');
      if (action === 'toggle-history') {
        const historyId = button.dataset.historyId;
        if (historyId) {
          if (openHistory === historyId) dismissHistoryPopover();
          else {
            dismissedHistory = null;
            openHistory = historyId;
            syncHistoryPopover();
          }
        }
      }
      if (action === 'swap-pair') {
        const side = button.dataset.pairSide;
        if (side === 'homeId' || side === 'awayId') {
          selectPairForSwap({ matchId: button.dataset.matchId ?? '', side });
        }
      }
      if (action === 'cancel-swap') {
        clearSwapSelection();
        notice = 'Selecció d’intercanvi cancel·lada.';
        syncSwapSelection();
        paintNotice();
      }
      if (action === 'next-round') nextRound();
      if (action === 'view-pairings') {
        const selected = state.rounds.find((round) => round.number === state.selectedRound) ?? currentRound();
        if (selected) openPairingDialog(selected, button);
      }
      if (action === 'select-round') {
        clearSwapSelection();
        openHistory = null;
        state.selectedRound = Number(button.dataset.round);
        notice = '';
        update();
      }
      if (action === 'reset') resetTournament();
    }));
  }

  document.addEventListener('pointerdown', (event) => {
    if (!openHistory || !(event.target instanceof Element)) return;
    const region = event.target.closest<HTMLElement>('[data-history-region]');
    if (region?.dataset.historyRegion === openHistory) return;
    dismissHistoryPopover();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !openHistory) return;
    dismissHistoryPopover();
  });

  render();
}

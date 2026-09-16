import { savedTournamentEntry, TOURNAMENT_STORAGE_KEY } from '../lib/tournament-storage';

// This page reads existing data without writing or resetting the tournament.
try {
  const entry = savedTournamentEntry(window.localStorage.getItem(TOURNAMENT_STORAGE_KEY));
  if (entry) {
    document.querySelectorAll<HTMLAnchorElement>('[data-tournament-link]').forEach(link => {
      link.replaceChildren(document.createTextNode(entry === 'tournament' ? 'Continua el torneig ' : 'Continua la preparació '));
      const arrow = document.createElement('span');
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '↗';
      link.append(arrow);
    });
    const note = document.querySelector<HTMLElement>('[data-saved-note]');
    if (note) {
      note.textContent = entry === 'tournament' ? 'Ja tens un torneig desat en aquest navegador.' : 'La preparació que havies començat continua desada.';
      note.hidden = false;
    }
  }
} catch { /* Creation links also work with browser storage disabled. */ }

const tabs = [...document.querySelectorAll<HTMLButtonElement>('[data-preview-tab]')];
function selectTab(tab: HTMLButtonElement, focus = false) {
  tabs.forEach(candidate => {
    const selected = candidate === tab;
    candidate.setAttribute('aria-selected', String(selected));
    candidate.tabIndex = selected ? 0 : -1;
    const panel = document.getElementById(candidate.getAttribute('aria-controls') ?? '');
    if (panel) panel.hidden = !selected;
  });
  if (focus) tab.focus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', event => {
    let next: number;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    selectTab(tabs[next], true);
  });
});

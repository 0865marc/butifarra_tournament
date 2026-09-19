# ButiPunt

A small, browser-only Astro MVP for running a Catalan Butifarra card-game championship from one shared desk.

The product landing lives at `/`, tournament preparation and play at `/torneig/`, and secondary brand resources at `/marca/`, linked from the landing footer. The landing uses the approved ButiPunt identity, with clearly labelled example data. It is part of this Astro application; no ChatGPT Sites integration is required.

## Quick start

```bash
npm install
npm run dev
```

Open the local address Astro prints. Create an even number of fixed pairs, enter both players for each pair, and draw the first round. For a production bundle, run:

```bash
npm run build
```

## Tournament rules in this MVP

- There are at least two fixed pairs and always an even number of them, so there are no byes.
- By default, round one uses a Fisher–Yates shuffle. Later rounds order pairs by wins, then accumulated point difference (points scored minus points conceded), then total points scored, then original registration order as a stable fallback, and pair positions 1–2, 3–4, and so on. The current round's assignments can be entered manually before any scores are recorded.
- Opponents may repeat. The registration-order fallback is deterministic only; it is not an additional sporting tiebreaker.
- A match needs two non-negative safe integer scores. The higher score gets one win; an equal score gives both pairs half a win. Each pair adds its score minus its opponent's score to its point difference, which can be positive, zero or negative. Its own score also contributes to total points scored (PF), used only when wins and point difference are tied.
- Only confirmed, valid results appear in the standings. Current-round results can be edited until the next round is generated; older rounds are read-only.

## Manual table assignments

On the current round, choose **Defineix els emparellaments** to transcribe all the table assignments by registered pair number. The editor uses the existing tournament's roster and automatically provides the right number of tables; there is no pair-count prompt or need to enter names again. Use Tab or Enter to move between fields. Names, missing pairs and duplicate/unknown-number errors appear as you type.

The editor starts with blank fields, or resumes its saved draft. **Carrega els emparellaments actuals** copies the current tables into the editor for smaller corrections. **Aplica els emparellaments** replaces the current round's assignments only when every registered pair appears exactly once. Existing pair IDs, numbers, names, registration order and earlier rounds are preserved. Bulk editing is blocked as soon as any score is entered in the current round.

The unfinished editor draft is saved separately from the live assignments in the same local tournament record and resumes after reloading. Returning to the round does not apply it. A draft is discarded if its source assignments, participants or round change, or if scores are entered; malformed editor data does not prevent recovering the tournament itself.

## Local persistence

The original `taula-de-butifarra-v1` storage key and data format are retained. Moving the interface to `/torneig/` preserves existing data on the same origin. The landing only reads saved state to offer a continue link; it never modifies tournament data. Different origins have separate browser storage.

Standings are recalculated from confirmed match scores, not stored separately. Using point difference and then total points scored as tiebreakers requires no saved-data migration: existing pairs, scores, rounds and table assignments are preserved. Already generated rounds keep their assignments; only newly generated rounds use the updated ranking.

The app stores setup edits, score drafts, confirmed results, round history, and the selected round in this browser's `localStorage`. It has no account, server, sync, import, or export feature. Private-browsing policies, cleared browser data, storage quotas, and another device can therefore prevent recovery. Corrupted or unsupported saved data is left untouched rather than erased automatically; use the confirmed new-tournament action only when you choose to clear it.

## Verification

Run `npm test` (Node with TypeScript stripping support) for standings, manual-pairing validation and recovery tests, and `npm run build` to check the Astro production bundle after installing dependencies.

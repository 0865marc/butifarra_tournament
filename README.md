# Taula de Butifarra

A small, browser-only Astro MVP for running a Catalan Butifarra card-game championship from one shared desk.

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
- Round one uses a Fisher–Yates shuffle. Later rounds order pairs by wins, then total points scored, then original registration order as a stable fallback, and pair positions 1–2, 3–4, and so on.
- Opponents may repeat. The registration-order fallback is deterministic only; it is not an additional sporting tiebreaker.
- A match needs two non-negative safe integer scores that differ. The higher score gets one win and both scores contribute to points.
- Only confirmed, valid results appear in the standings. Current-round results can be edited until the next round is generated; older rounds are read-only.

## Local persistence

The app stores setup edits, score drafts, confirmed results, round history, and the selected round in this browser's `localStorage`. It has no account, server, sync, import, or export feature. Private-browsing policies, cleared browser data, storage quotas, and another device can therefore prevent recovery. Corrupted or unsupported saved data is left untouched rather than erased automatically; use the confirmed new-tournament action only when you choose to clear it.

## Verification

There are intentionally no automated tests for this small UX MVP. Use `npm run build` to check the Astro production bundle after installing dependencies.

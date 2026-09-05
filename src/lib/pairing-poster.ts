export interface PosterMatch {
  tableNumber: number;
  homeNumber: number;
  awayNumber: number;
}

export type PosterFillOrder = 'rows' | 'columns';

export interface PairingPosterLayout {
  rows: number;
  columns: number;
  fillOrder: PosterFillOrder;
}

export interface PairingPosterInput {
  tournamentName: string;
  roundNumber: number;
  matches: PosterMatch[];
  layout?: PairingPosterLayout;
}

export interface PairingPosterDimensions {
  width: number;
  height: number;
}

function tableCountLimit(tableCount: number): number {
  return Math.max(1, Number.isSafeInteger(tableCount) ? tableCount : 1);
}

function validDimension(value: number, fallback: number, tableCount: number): number {
  return Number.isSafeInteger(value) && value > 0
    ? Math.min(value, tableCountLimit(tableCount))
    : fallback;
}

/** Returns the adaptive grid used before a viewer preference is chosen. */
export function defaultPairingPosterLayout(tableCount: number): PairingPosterLayout {
  const count = tableCountLimit(tableCount);
  const columns = count >= 32 ? 5 : count >= 12 ? 4 : count >= 5 ? 3 : Math.min(2, count);
  return { rows: Math.ceil(count / columns), columns, fillOrder: 'rows' };
}

/** Reconciles a saved transient preference to a new round without dropping a table. */
export function reconcilePairingPosterLayout(tableCount: number, layout?: PairingPosterLayout): PairingPosterLayout {
  const count = tableCountLimit(tableCount);
  const fallback = defaultPairingPosterLayout(count);
  if (!layout) return fallback;
  const rows = validDimension(layout.rows, fallback.rows, count);
  const columns = validDimension(layout.columns, fallback.columns, count);
  const fillOrder = layout.fillOrder === 'columns' ? 'columns' : 'rows';
  if (rows * columns >= count) return { rows, columns, fillOrder };
  return { rows, columns: Math.ceil(count / rows), fillOrder };
}

export function pairingPosterLayoutForRows(tableCount: number, rows: number, fillOrder: PosterFillOrder): PairingPosterLayout {
  const safeRows = validDimension(rows, defaultPairingPosterLayout(tableCount).rows, tableCount);
  return { rows: safeRows, columns: Math.ceil(tableCountLimit(tableCount) / safeRows), fillOrder };
}

export function pairingPosterLayoutForColumns(tableCount: number, columns: number, fillOrder: PosterFillOrder): PairingPosterLayout {
  const safeColumns = validDimension(columns, defaultPairingPosterLayout(tableCount).columns, tableCount);
  return { rows: Math.ceil(tableCountLimit(tableCount) / safeColumns), columns: safeColumns, fillOrder };
}

export function pairingPosterDimensions(tableCount: number, layout: PairingPosterLayout): PairingPosterDimensions {
  const safeLayout = reconcilePairingPosterLayout(tableCount, layout);
  const cardWidth = 276;
  const cardHeight = 88;
  const gutter = 16;
  const margin = 32;
  const headerHeight = 94;
  return {
    width: margin * 2 + cardWidth * safeLayout.columns + gutter * (safeLayout.columns - 1),
    height: headerHeight + safeLayout.rows * cardHeight + Math.max(0, safeLayout.rows - 1) * gutter + margin,
  };
}

function escapeXml(value: string | number): string {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
  })[character] ?? character);
}

function shorten(value: string, limit = 56): string {
  const characters = Array.from(value);
  return characters.length > limit ? `${characters.slice(0, limit - 1).join('')}…` : value;
}

/** Creates a standalone, data-only SVG with no external resources or executable content. */
export function createPairingPoster(input: PairingPosterInput): string {
  const matchCount = input.matches.length;
  const layout = reconcilePairingPosterLayout(matchCount, input.layout);
  const { rows, columns } = layout;
  const cardWidth = 276;
  const cardHeight = 88;
  const gutter = 16;
  const margin = 32;
  const headerHeight = 94;
  const { width, height } = pairingPosterDimensions(matchCount, layout);
  const cards = input.matches.map((match, index) => {
    const column = layout.fillOrder === 'columns' ? Math.floor(index / rows) : index % columns;
    const row = layout.fillOrder === 'columns' ? index % rows : Math.floor(index / columns);
    const x = margin + column * (cardWidth + gutter);
    const y = headerHeight + row * (cardHeight + gutter);
    return `<g>
      <rect x="${x}" y="${y}" width="${cardWidth}" height="${cardHeight}" rx="10" class="match-card"/>
      <text x="${x + 18}" y="${y + 26}" class="table">TAULA ${match.tableNumber}</text>
      <line x1="${x + 18}" y1="${y + 38}" x2="${x + cardWidth - 18}" y2="${y + 38}" class="rule"/>
      <text x="${x + cardWidth / 2}" y="${y + 70}" text-anchor="middle" class="pairing">${match.homeNumber} <tspan class="versus">VS</tspan> ${match.awayNumber}</text>
    </g>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="poster-title poster-description">
  <title id="poster-title">${escapeXml(input.tournamentName)} — Ronda ${input.roundNumber}</title>
  <desc id="poster-description">Emparellaments de les parelles de la ronda ${input.roundNumber} del campionat ${escapeXml(input.tournamentName)}.</desc>
  <style>
    .title { fill: #183d35; font: 700 28px Georgia, serif; }
    .subtitle, .table { font-family: Arial, sans-serif; font-weight: 700; letter-spacing: 1.5px; }
    .subtitle { fill: #ba8a3a; font-size: 12px; }
    .table { fill: #2c5b4f; font-size: 12px; }
    .pairing { fill: #183d35; font: 700 28px Arial, sans-serif; }
    .versus { fill: #ba8a3a; font-size: 13px; letter-spacing: 1px; }
    .match-card { fill: #fffaf0; stroke: #d9cfbc; stroke-width: 1.5; }
    .rule { stroke: #d9cfbc; stroke-width: 1; }
  </style>
  <rect width="100%" height="100%" fill="#f6f0e3"/>
  <rect x="0" y="0" width="100%" height="8" fill="#183d35"/>
  <text x="${margin}" y="35" class="subtitle">EMPARELLAMENTS DE PARELLES · RONDA ${input.roundNumber}</text>
  <text x="${margin}" y="70" class="title">${escapeXml(shorten(input.tournamentName))}</text>
  ${cards}
</svg>`;
}

export interface PosterMatch {
  tableNumber: number;
  homeNumber: number;
  awayNumber: number;
}

export interface PosterPairAssignment {
  tableNumber: number;
  pairNumber: number;
}

export interface PairingPosterLayout {
  rows: number;
  columns: number;
}

export interface PairingPosterInput {
  tournamentName: string;
  roundNumber: number;
  assignments: PosterPairAssignment[];
  layout: PairingPosterLayout;
}

export interface PairingPosterDimensions {
  width: number;
  height: number;
}

export interface PairingPosterViewport {
  width: number;
  height: number;
}

const cardWidth = 184;
const cardHeight = 64;
const gutter = 12;
const margin = 32;
const headerHeight = 84;

function entryCountLimit(entryCount: number): number {
  return Math.max(1, Number.isSafeInteger(entryCount) ? entryCount : 1);
}

function safeViewportDimension(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

/** Projects saved match positions into ascending pair-to-table assignments. */
export function pairAssignmentsForMatches(matches: PosterMatch[]): PosterPairAssignment[] {
  return matches.flatMap((match) => [
    { pairNumber: match.homeNumber, tableNumber: match.tableNumber },
    { pairNumber: match.awayNumber, tableNumber: match.tableNumber },
  ]).sort((left, right) => left.pairNumber - right.pairNumber);
}

/** Calculates the intrinsic SVG dimensions for a row-major pair grid. */
export function pairingPosterDimensions(entryCount: number, layout: PairingPosterLayout): PairingPosterDimensions {
  const count = entryCountLimit(entryCount);
  const columns = Math.min(count, Math.max(1, Number.isSafeInteger(layout.columns) ? layout.columns : 1));
  const rows = Math.ceil(count / columns);
  return {
    width: margin * 2 + cardWidth * columns + gutter * (columns - 1),
    height: headerHeight + rows * cardHeight + Math.max(0, rows - 1) * gutter + margin,
  };
}

/** Selects the largest fitting row-major grid for the available poster viewport. */
export function pairingPosterLayoutForViewport(entryCount: number, viewport: PairingPosterViewport): PairingPosterLayout {
  const count = entryCountLimit(entryCount);
  const availableWidth = safeViewportDimension(viewport.width);
  const availableHeight = safeViewportDimension(viewport.height);
  let bestLayout: PairingPosterLayout = { rows: count, columns: 1 };
  let bestScale = -1;

  for (let columns = 1; columns <= count; columns += 1) {
    const rows = Math.ceil(count / columns);
    const dimensions = pairingPosterDimensions(count, { rows, columns });
    const scale = availableWidth && availableHeight
      ? Math.min(availableWidth / dimensions.width, availableHeight / dimensions.height)
      : 0;
    if (scale > bestScale || (scale === bestScale && columns < bestLayout.columns)) {
      bestScale = scale;
      bestLayout = { rows, columns };
    }
  }

  return bestLayout;
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
  const entryCount = input.assignments.length;
  const { columns } = input.layout;
  const { width, height } = pairingPosterDimensions(entryCount, input.layout);
  const cards = input.assignments.map((assignment, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = margin + column * (cardWidth + gutter);
    const y = headerHeight + row * (cardHeight + gutter);
    return `<g>
      <rect x="${x}" y="${y}" width="${cardWidth}" height="${cardHeight}" rx="9" class="pair-card"/>
      <text x="${x + 14}" y="${y + 29}" class="pair">PARELLA ${escapeXml(assignment.pairNumber)}</text>
      <text x="${x + 14}" y="${y + 48}" class="table">TAULA ${escapeXml(assignment.tableNumber)}</text>
    </g>`;
  }).join('');
  const assignmentDescription = input.assignments
    .map((assignment) => `Parella ${assignment.pairNumber}: Taula ${assignment.tableNumber}.`)
    .join(' ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="poster-title poster-description">
  <title id="poster-title">${escapeXml(input.tournamentName)} — Ronda ${input.roundNumber}</title>
  <desc id="poster-description">Parelles i taules de la ronda ${input.roundNumber} del campionat ${escapeXml(input.tournamentName)}. ${escapeXml(assignmentDescription)}</desc>
  <style>
    .title { fill: #183d35; font: 700 26px Georgia, serif; }
    .subtitle, .table { font-family: Arial, sans-serif; font-weight: 700; letter-spacing: 1.4px; }
    .subtitle { fill: #ba8a3a; font-size: 11px; }
    .pair { fill: #183d35; font: 700 19px Arial, sans-serif; }
    .table { fill: #2c5b4f; font-size: 11px; }
    .pair-card { fill: #fffaf0; stroke: #d9cfbc; stroke-width: 1.5; }
  </style>
  <rect width="100%" height="100%" fill="#f6f0e3"/>
  <rect x="0" y="0" width="100%" height="8" fill="#183d35"/>
  <text x="${margin}" y="31" class="subtitle">PARELLES I TAULES · RONDA ${input.roundNumber}</text>
  <text x="${margin}" y="64" class="title">${escapeXml(shorten(input.tournamentName))}</text>
  ${cards}
</svg>`;
}

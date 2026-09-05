export interface PosterMatch {
  tableNumber: number;
  homeNumber: number;
  awayNumber: number;
}

export interface PairingPosterInput {
  tournamentName: string;
  roundNumber: number;
  matches: PosterMatch[];
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
  const columns = matchCount >= 32 ? 5 : matchCount >= 12 ? 4 : matchCount >= 5 ? 3 : Math.min(2, Math.max(1, matchCount));
  const cardWidth = 276;
  const cardHeight = 88;
  const gutter = 16;
  const margin = 32;
  const headerHeight = 94;
  const rows = Math.max(1, Math.ceil(matchCount / columns));
  const width = margin * 2 + cardWidth * columns + gutter * (columns - 1);
  const height = headerHeight + rows * cardHeight + Math.max(0, rows - 1) * gutter + margin;
  const cards = input.matches.map((match, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
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

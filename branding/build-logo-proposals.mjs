import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const sharp = require(process.env.SHARP_MODULE || '/home/victus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(root, 'butironda-logos');
const c = { green: '#183D35', ivory: '#F6F0E3', paper: '#FFFAF0', coral: '#C96959', gold: '#BA8A3A', line: '#D9CFBC', muted: '#69716A' };
const esc = s => String(s).replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[x]));

// All three symbols are original vector geometry. No raster reference or model output.
const proposals = [
  {
    id: '01-parelles', name: 'Parelles', idea: 'Cuatro cartas. Dos parejas.',
    lines: ['El encuentro de parejas, visto desde arriba.', 'El símbolo más cercano al juego de cartas.'],
    rationale: 'Cuatro reversos de carta giran alrededor de un centro abierto. Las cartas opuestas comparten color y forman dos parejas.',
    mark: `<g fill="${c.green}"><rect x="58" y="24" width="108" height="56" rx="11"/><rect x="90" y="176" width="108" height="56" rx="11"/></g><g fill="${c.coral}"><rect x="176" y="58" width="56" height="108" rx="11"/><rect x="24" y="90" width="56" height="108" rx="11"/></g>`,
  },
  {
    id: '02-ronda', name: 'Ronda', idea: 'Una ronda da paso a otra.',
    lines: ['Dos trazos complementarios, un centro común.', 'El símbolo más abstracto y compacto.'],
    rationale: 'Dos bandas de igual peso forman un contorno casi cuadrado. Sus encuentros escalonados sugieren continuidad sin recurrir a flechas.',
    mark: `<path fill="${c.green}" d="M176 24H76C47.281 24 24 47.281 24 76V168H44V180H68V80C68 73.373 73.373 68 80 68H180V44H176Z"/><path fill="${c.coral}" transform="rotate(180 128 128)" d="M176 24H76C47.281 24 24 47.281 24 76V168H44V180H68V80C68 73.373 73.373 68 80 68H180V44H176Z"/>`,
  },
  {
    id: '03-la-b', name: 'La B', idea: 'Una inicial. Dos mitades.',
    lines: ['Una B propia, con dos partes equilibradas.', 'La opción más ligada al nombre ButiRonda.'],
    rationale: 'Una B dibujada a medida, con dos lóbulos equivalentes, espacios interiores amplios y una separación central. La letra se sostiene sin una tipografía externa.',
    mark: `<path fill="${c.green}" fill-rule="evenodd" d="M52 24H143C184 24 210 42 210 72C210 102 184 120 143 120H52ZM94 60V84H141C158 84 167 81 167 72C167 63 158 60 141 60Z"/><path fill="${c.coral}" fill-rule="evenodd" d="M52 136H143C184 136 210 154 210 184C210 214 184 232 143 232H52ZM94 172V196H141C158 196 167 193 167 184C167 175 158 172 141 172Z"/>`,
  },
];

function svg(w, h, title, content, description = title) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title description"><title id="title">${esc(title)}</title><desc id="description">${esc(description)}</desc>${content}</svg>\n`;
}
function text(x, y, value, size = 20, opts = {}) {
  const { color = c.green, family = 'Noto Sans', weight = 400, anchor = 'start', spacing = 0 } = opts;
  return `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}" letter-spacing="${spacing}">${esc(value)}</text>`;
}
function wordmark(x, baseline, size, anchor = 'start') {
  return text(x, baseline, 'ButiRonda', size, { family: 'Noto Serif', weight: 700, anchor, spacing: -size * .035 });
}
function place(p, x, y, size) { return `<g transform="translate(${x} ${y}) scale(${size / 256})">${p.mark}</g>`; }
function rule(x1, y, x2) { return `<path d="M${x1} ${y}H${x2}" stroke="${c.line}"/>`; }

await mkdir(out, { recursive: true });
async function saveSvgPng(file, source, rasterWidth) {
  await writeFile(path.join(out, file + '.svg'), source);
  await sharp(Buffer.from(source)).resize({ width: rasterWidth }).png().toFile(path.join(out, file + '.png'));
}

for (const p of proposals) {
  await mkdir(path.join(out, p.id), { recursive: true });
  await saveSvgPng(`${p.id}/simbolo`, svg(256, 256, `ButiRonda · ${p.name}`, p.mark, p.rationale), 2048);
  const lockup = place(p, 0, 1, 144) + wordmark(161, 98, 79);
  await saveSvgPng(`${p.id}/logo-horizontal`, svg(640, 146, `ButiRonda · ${p.name} · composición de prueba`, lockup, `${p.rationale} Nombre compuesto provisionalmente en Noto Serif Bold.`), 1920);
  const individual = `<rect width="1200" height="880" fill="${c.ivory}"/>`
    + text(64, 67, `BUTIRONDA / ${p.id.slice(0,2)}`, 14, {weight:700,spacing:2})
    + text(1136, 67, 'PROPUESTA DE LOGO', 13, {anchor:'end',spacing:1.6,color:c.muted})
    + rule(64, 93, 1136)
    + place(p, 444, 125, 312)
    + wordmark(600, 538, 85, 'middle')
    + text(600, 583, 'GESTOR DE CAMPIONATS DE BUTIFARRA', 14, {anchor:'middle',spacing:2.2})
    + rule(64, 646, 1136)
    + text(64, 705, `${p.id.slice(0,2)} — ${p.name}`, 29, {family:'Noto Serif',weight:700})
    + text(64, 746, p.lines[0], 20)
    + text(64, 779, p.lines[1], 20, {color:c.muted})
    + text(1136, 829, 'Símbolo original en SVG · Tipografía provisional', 12, {anchor:'end',color:c.muted});
  await saveSvgPng(`${p.id}/propuesta`, svg(1200, 880, `Propuesta ${p.id.slice(0,2)} · ${p.name}`, individual), 1600);
}

let board = `<rect width="1800" height="1150" fill="${c.ivory}"/>`
  + text(64, 58, 'BUTIRONDA', 15, {weight:700,spacing:3})
  + text(1736, 58, 'ESTUDIO DE IDENTIDAD / 01', 13, {anchor:'end',spacing:1.5,color:c.muted})
  + rule(64, 83, 1736)
  + text(64, 162, 'Tres formas de empezar la ronda.', 52, {family:'Noto Serif',weight:700,spacing:-1.4})
  + text(65, 204, 'Tres símbolos originales. Una misma paleta y una composición común para comparar.', 19, {color:c.muted});

for (const [i,p] of proposals.entries()) {
  const x=64+i*568, width=536, center=x+width/2;
  board += `<rect x="${x}" y="250" width="${width}" height="723" rx="18" fill="${c.paper}" stroke="${c.line}"/>`
    + text(x+30, 296, p.id.slice(0,2), 17, {weight:700,color:c.gold})
    + text(x+width-30, 296, p.name.toUpperCase(), 13, {anchor:'end',weight:700,spacing:2})
    + place(p, center-124, 330, 248)
    + wordmark(center, 640, 56, 'middle')
    + text(center, 678, 'GESTOR DE CAMPIONATS', 12, {anchor:'middle',spacing:2})
    + rule(x+30, 713, x+width-30)
    + text(x+30, 757, p.idea, 23, {family:'Noto Serif',weight:700,spacing:-.35})
    + text(x+30, 795, p.lines[0], 16)
    + text(x+30, 823, p.lines[1], 16, {color:c.muted})
    + rule(x+30, 852, x+width-30)
    + text(x+30, 899, 'A TAMAÑO PEQUEÑO', 10, {weight:700,spacing:1.3,color:c.muted});
  for (const [j,size] of [32,24,16].entries()) {
    const cx=x+300+j*78;
    board += place(p,cx-size/2,883+(32-size)/2,size)
      + text(cx, 941, `${size} px`, 11, {anchor:'middle',color:c.muted});
  }
}
board += text(64, 1032, 'PALETA DE LA APP', 11, {weight:700,spacing:1.6,color:c.muted});
for (const [i,hex] of [c.green,c.ivory,c.gold,c.coral].entries()) {
  const x=260+i*210;
  board += `<rect x="${x}" y="1012" width="34" height="28" rx="5" fill="${hex}" stroke="${c.line}"/>`
    + text(x+47,1032,hex,13,{weight:700});
}
board += text(1736,1032,'SVG editable + PNG',13,{anchor:'end',color:c.muted})
  + rule(64,1064,1736)
  + text(64,1105,'Elige el símbolo; la tipografía y las aplicaciones se desarrollan después.',15,{color:c.muted})
  + text(1736,1105,'Noto Serif · composición provisional',12,{anchor:'end',color:c.muted});
await saveSvgPng('comparativa', svg(1800,1150,'ButiRonda — tres propuestas de logo',board),1800);

const manifest={name:'ButiRonda',status:'logo candidates for user selection',method:'original SVG geometry authored locally; no generative service',palette:c,wordmark:{family:'Noto Serif',weight:700,status:'provisional comparison only'},proposals:proposals.map(({mark,...p})=>p)};
await writeFile(path.join(out,'propuestas.json'),JSON.stringify(manifest,null,2)+'\n');
await writeFile(path.join(out,'LEEME.md'),`# ButiRonda — propuestas de logo\n\nTres símbolos originales dibujados directamente en SVG. Ninguno está seleccionado todavía.\n\n- 01 Parelles: cuatro cartas en dos parejas enfrentadas.\n- 02 Ronda: dos bandas complementarias y un centro común.\n- 03 La B: inicial diseñada a medida.\n\n## Archivos\n\nCada carpeta incluye el símbolo SVG sin dependencias tipográficas y su PNG transparente de 2048 × 2048 px, una composición horizontal SVG con PNG transparente de 1920 × 438 px, y una lámina de presentación SVG con PNG. La comparativa general se entrega en SVG y PNG.\n\nLa tipografía del nombre es provisional: Noto Serif Bold, elegida para conservar el carácter serif de la interfaz. El nombre permanece como texto editable en los SVG de composición y requiere esa fuente instalada para mantener el aspecto. Las láminas usan también Noto Sans. Los PNG conservan el aspecto sin instalar fuentes. No se incluyen ni redistribuyen archivos de fuentes.\n\nLos SVG de símbolo contienen únicamente geometría y colores, sin imágenes incrustadas, scripts ni recursos externos. Los huecos del símbolo son transparentes. El fondo marfil pertenece a las láminas de presentación.\n\nPaleta: verde #183D35, marfil #F6F0E3, ocre #BA8A3A y coral #C96959. El ocre se reserva como acento en aplicaciones.\n\n## Revisión\n\nElegir el símbolo y comentar proporciones, equilibrio o detalles. Después se desarrollarán la tipografía definitiva, los logos de uso final y las piezas de campaña. Las composiciones actuales son propuestas, no artes finales aprobados.\n`);

await writeFile(path.join(out,'index.html'),`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ButiRonda · propuestas de logo</title><style>body{margin:0;background:${c.ivory};color:${c.green};font:16px system-ui,sans-serif}main{max-width:1400px;margin:auto;padding:24px}img{display:block;width:100%;height:auto}nav{display:flex;gap:16px;flex-wrap:wrap;padding:20px 0}a{color:inherit;text-underline-offset:4px}p{line-height:1.6}section{margin:30px 0}small{color:${c.muted}}</style></head><body><main><img src="comparativa.png" alt="Tres propuestas de logo ButiRonda: Parelles, Ronda y La B. Cada una utiliza verde y coral y se compara con el mismo nombre en tipografía serif."><nav>${proposals.map(p=>`<a href="#${p.id}">${p.id.slice(0,2)} · ${p.name}</a>`).join('')}<a href="comparativa.svg" download>Comparativa SVG</a><a href="LEEME.md">Formatos y fuentes</a></nav>${proposals.map(p=>`<section id="${p.id}"><h2>${p.id.slice(0,2)} · ${p.name}</h2><p>${p.rationale}</p><img src="${p.id}/propuesta.png" alt="${esc(p.rationale)}" loading="lazy"><nav><a href="${p.id}/simbolo.svg" download>Símbolo SVG</a><a href="${p.id}/simbolo.png" download>Símbolo PNG transparente</a><a href="${p.id}/logo-horizontal.svg" download>Composición SVG editable</a><a href="${p.id}/logo-horizontal.png" download>Composición PNG</a></nav></section>`).join('')}<p><small>Propuestas para elegir. La composición del nombre en Noto Serif es provisional; los símbolos son geometría original independiente de las fuentes.</small></p></main></body></html>`);
console.log(`Rendered ${proposals.length} proposals and comparison in ${out}`);

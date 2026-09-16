import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require=createRequire(import.meta.url);
const sharp=require(process.env.SHARP_MODULE||'/home/victus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const dir=path.dirname(fileURLToPath(import.meta.url)), out=path.join(dir,'butironda-pack');
const C={green:'#183D35',ivory:'#F6F0E3',paper:'#FFFAF0',coral:'#C96959',gold:'#BA8A3A',line:'#D9CFBC',muted:'#69716A'};
const master=await readFile(path.join(dir,'butironda-logos/01-parelles/simbolo.svg'),'utf8');
const MARK=master.slice(master.indexOf('<g fill='),master.lastIndexOf('</svg>'));
const esc=v=>String(v).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[x]));
const manifest=[];
function t(x,y,s,z=24,{color=C.green,serif=false,weight=400,anchor='start',spacing=0}={}){return `<text x="${x}" y="${y}" font-family="${serif?'Noto Serif':'Noto Sans'}" font-size="${z}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}" letter-spacing="${spacing}">${esc(s)}</text>`;}
function lines(x,y,arr,z=80,gap=z*1.12,o={}){return arr.map((s,i)=>t(x,y+i*gap,s,z,o)).join('');}
function rect(x,y,w,h,fill=C.paper,r=18,stroke='none'){return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`;}
function rule(x,y,w,color=C.line){return `<path d="M${x} ${y}h${w}" stroke="${color}"/>`;}
function mark(x,y,size){return `<g data-brand-symbol="parelles" transform="translate(${x} ${y}) scale(${size/256})">${MARK}</g>`;}
function word(x,y,z=60,anchor='start'){return t(x,y,'ButiRonda',z,{serif:true,weight:700,spacing:-z*.035,anchor});}
function logo(x,y,h=84){const k=h/146;return `<g transform="translate(${x} ${y}) scale(${k})">${mark(0,1,144)}${word(161,98,79)}</g>`;}
function svg(w,h,title,body,physical){return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${physical?.[0]||w}" height="${physical?.[1]||h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title"><title id="title">${esc(title)}</title>${body}</svg>\n`;}
async function asset(file,w,h,title,body,{pngWidth=w,physical,category='graphic',lang=null}={}){const s=svg(w,h,title,body,physical);await mkdir(path.dirname(path.join(out,file)),{recursive:true});await writeFile(path.join(out,file+'.svg'),s);const rendered=await sharp(Buffer.from(s)).resize({width:pngWidth}).png().toFile(path.join(out,file+'.png'));manifest.push({file:file+'.png',source:file+'.svg',category,lang,width:rendered.width,height:rendered.height,title});return s;}
const L={
ca:{descriptor:'Gestor de campionats de Butifarra',short:'GESTOR DE CAMPIONATS',tag:['La pròxima ronda','comença aquí.'],cta:'Organitza el teu campionat',intro:'Parelles, rondes, resultats i classificació.',local:'Les dades es desen en aquest navegador.',capture:'Captures de la versió actual · dades de demostració',
posts:[
{id:'01-llancament',k:'CAMPIONATS DE BUTIFARRA',head:['La pròxima','ronda comença','aquí.'],body:['Prepara les parelles. Porta el campionat.'],idea:'hero'},
{id:'02-parelles',k:'01 / PREPARA',head:['Les parelles,','a punt.'],body:['Inscriu els dos jugadors de cada parella.','Tria el nombre de rondes.'],idea:'pairs'},
{id:'03-sorteig',k:'02 / SORTEJA',head:['Comença amb','un sorteig.'],body:['La primera ronda és aleatòria.','Després, continua segons la classificació.'],idea:'draw'},
{id:'04-resultats',k:'03 / CONFIRMA',head:['Cada resultat','compta.'],body:['Anota els punts de les dues parelles','i confirma el resultat de cada taula.'],idea:'score'},
{id:'05-classificacio',k:'04 / SEGUEIX',head:['La classificació,','al dia.'],body:['Consulta victòries i punts','a mesura que confirmes els resultats.'],idea:'ranking'},
{id:'06-taules',k:'05 / MOSTRA',head:['Cada parella,','a la seva taula.'],body:['Obre el panell de parelles i taules.','Mostra els emparellaments de la ronda.'],idea:'tables'}],
pair:'PARELLA',table:'TAULA',win:'VICTÒRIES',points:'PUNTS',example:'EXEMPLE IL·LUSTRATIU',steps:['Prepara les parelles','Sorteja la primera ronda','Confirma els resultats','Segueix la classificació'],
story2:['El campionat,','en quatre passos.'],videoHeads:[['El campionat,','ben portat.'],['Prepara','les parelles.'],['Sorteja','la primera ronda.'],['Confirma','els resultats.'],['Mostra','parelles i taules.'],['La pròxima ronda','comença aquí.']],
videoBodies:[['De les inscripcions a la classificació.'],['Escriu els dos jugadors de cada parella.','Tria quantes rondes vols jugar.'],['La primera és aleatòria.','Les següents segueixen la classificació.'],['Anota els punts de cada taula.','Les victòries i els punts s’actualitzen.'],['Consulta el panell d’emparellaments.','Cada parella pot veure on li toca jugar.'],['Organitza el teu campionat amb ButiRonda.','Les dades es desen en aquest navegador.']]},
es:{descriptor:'Gestor de torneos de Butifarra',short:'GESTOR DE TORNEOS',tag:['La próxima ronda','empieza aquí.'],cta:'Organiza tu torneo',intro:'Parejas, rondas, resultados y clasificación.',local:'Los datos se guardan en este navegador.',capture:'Capturas de la versión actual · datos de demostración',
posts:[
{id:'01-lanzamiento',k:'TORNEOS DE BUTIFARRA',head:['La próxima','ronda empieza','aquí.'],body:['Prepara las parejas. Lleva el torneo.'],idea:'hero'},
{id:'02-parejas',k:'01 / PREPARA',head:['Las parejas,','a punto.'],body:['Inscribe a los dos jugadores de cada pareja.','Elige el número de rondas.'],idea:'pairs'},
{id:'03-sorteo',k:'02 / SORTEA',head:['Empieza con','un sorteo.'],body:['La primera ronda es aleatoria.','Después, continúa según la clasificación.'],idea:'draw'},
{id:'04-resultados',k:'03 / CONFIRMA',head:['Cada resultado','cuenta.'],body:['Anota los puntos de las dos parejas','y confirma el resultado de cada mesa.'],idea:'score'},
{id:'05-clasificacion',k:'04 / SIGUE',head:['La clasificación,','al día.'],body:['Consulta victorias y puntos','a medida que confirmas los resultados.'],idea:'ranking'},
{id:'06-mesas',k:'05 / MUESTRA',head:['Cada pareja,','en su mesa.'],body:['Abre el panel de parejas y mesas.','Muestra los emparejamientos de la ronda.'],idea:'tables'}],
pair:'PAREJA',table:'MESA',win:'VICTORIAS',points:'PUNTOS',example:'EJEMPLO ILUSTRATIVO',steps:['Prepara las parejas','Sortea la primera ronda','Confirma los resultados','Sigue la clasificación'],
story2:['El torneo,','en cuatro pasos.'],videoHeads:[['El torneo,','bien organizado.'],['Prepara','las parejas.'],['Sortea','la primera ronda.'],['Confirma','los resultados.'],['Muestra','parejas y mesas.'],['La próxima ronda','empieza aquí.']],
videoBodies:[['De las inscripciones a la clasificación.'],['Escribe los dos jugadores de cada pareja.','Elige cuántas rondas quieres jugar.'],['La primera es aleatoria.','Las siguientes siguen la clasificación.'],['Anota los puntos de cada mesa.','Las victorias y los puntos se actualizan.'],['Consulta el panel de emparejamientos.','Cada pareja puede ver dónde le toca jugar.'],['Organiza tu torneo con ButiRonda.','Los datos se guardan en este navegador.']]}
};
await mkdir(out,{recursive:true});
await copyFile(path.join(dir,'butironda-logos/01-parelles/simbolo.svg'),path.join(out,'logos/simbolo-parelles.svg'));
await copyFile(path.join(dir,'butironda-logos/01-parelles/simbolo.png'),path.join(out,'logos/simbolo-parelles.png'));
manifest.push({file:'logos/simbolo-parelles.png',source:'logos/simbolo-parelles.svg',category:'logo',title:'Símbolo elegido · Parelles',width:2048,height:2048});
await asset('logos/logo-horizontal',640,146,'ButiRonda · logo horizontal',mark(0,1,144)+word(161,98,79),{pngWidth:1920,category:'logo'});
await asset('logos/logo-apilado',880,580,'ButiRonda · logo apilado',mark(288,28,304)+word(440,475,108,'middle'),{pngWidth:1760,category:'logo'});
await asset('logos/icono-app',512,512,'ButiRonda · icono de aplicación',rect(0,0,512,512,C.ivory,102)+mark(46,46,420),{pngWidth:1024,category:'logo'});
await asset('logos/avatar',512,512,'ButiRonda · avatar',`<circle cx="256" cy="256" r="256" fill="${C.ivory}"/>`+mark(54,54,404),{pngWidth:1024,category:'logo'});
for(const size of [16,32,48,180])await sharp(Buffer.from(svg(256,256,'ButiRonda',rect(0,0,256,256,C.ivory,50)+mark(24,24,208)))).resize(size,size).png().toFile(path.join(out,`logos/icono-${size}.png`));

function diagram(idea,lang,x=64,y=720,w=952){const a=L[lang];let s='';
if(idea==='hero'){s=mark(x+w-420,y-25,420)+lines(x,y+120,['01 / PARELLES','02 / RONDES','03 / RESULTATS'].map(q=>lang==='ca'?q:q.replace('PARELLES','PAREJAS').replace('RONDES','RONDAS').replace('RESULTATS','RESULTADOS')),19,53,{weight:700,spacing:1});}
if(idea==='pairs'){for(let i=0;i<2;i++){const px=x+i*(w/2+12);s+=rect(px,y,w/2-12,285,C.paper,22,C.line)+rect(px,y,12,285,i?C.coral:C.green,6)+t(px+36,y+57,`${a.pair} ${i+1}`,18,{weight:700,spacing:1.8})+t(px+36,y+148,i?'Laia':'Anna',47,{serif:true,weight:700})+t(px+36,y+218,i?'Pau':'Jordi',47,{serif:true,weight:700});}}
if(idea==='draw'){s=rect(x,y,w,330,C.green,24)+t(x+36,y+65,lang==='ca'?'RONDA 1 · SORTEIG':'RONDA 1 · SORTEO',20,{color:C.ivory,weight:700,spacing:2});for(let i=0;i<2;i++)s+=t(x+36,y+158+i*105,`P${i?2:1}   /   P${i?4:3}`,65,{color:C.ivory,serif:true,weight:700})+t(x+w-36,y+148+i*105,`${a.table} ${i+1}`,19,{color:C.ivory,anchor:'end'});}
if(idea==='score'){s=rect(x,y,w,305,C.paper,24,C.line)+t(x+42,y+65,`${a.table} 1`,20,{weight:700,spacing:1.8})+t(x+42,y+207,'101',138,{serif:true,weight:700})+t(x+w/2,y+197,'/',80,{color:C.coral,serif:true,anchor:'middle'})+t(x+w-42,y+207,'76',138,{serif:true,weight:700,anchor:'end'})+t(x+48,y+270,`${a.pair} 1`,18)+t(x+w-48,y+270,`${a.pair} 3`,18,{anchor:'end'});}
if(idea==='ranking'){s=rect(x,y,w,350,C.paper,24,C.line)+t(x+36,y+48,a.pair,17,{weight:700})+t(x+w-230,y+48,a.win,15,{anchor:'end',weight:700})+t(x+w-36,y+48,a.points,15,{anchor:'end',weight:700});for(const [i,p] of [1,4,2].entries()){s+=rule(x+30,y+73+i*86,w-60)+t(x+36,y+128+i*86,`${i+1}. ${a.pair.toLowerCase()} ${p}`,35,{serif:true,weight:700})+t(x+w-230,y+128+i*86,i<2?'1':'0',35,{anchor:'end',weight:700})+t(x+w-36,y+128+i*86,i<2?'101':'84',35,{anchor:'end',weight:700});}}
if(idea==='tables'){for(let i=0;i<2;i++){s+=rect(x,y+i*168,w,144,C.paper,20,C.line)+t(x+34,y+58+i*168,`${a.pair} ${i?3:1}`,24,{weight:700})+t(x+w-34,y+99+i*168,`${a.table} 1`,52,{anchor:'end',serif:true,weight:700})+`<path d="M${x+370} ${y+72+i*168}h90m-12-10 12 10-12 10" fill="none" stroke="${C.coral}" stroke-width="4"/>`;}}
return s+(idea==='hero'?'':t(x,y+395,a.example,14,{spacing:1.2,color:C.muted}));}

for(const [lang,a] of Object.entries(L)){
  for(const p of a.posts){const n=p.head.length,z=n===3?94:96;let s=rect(0,0,1080,1350,C.ivory,0)+logo(58,40,80)+rule(64,153,952)+t(64,226,p.k,18,{weight:700,spacing:2.2})+lines(64,345,p.head,z,111,{serif:true,weight:700,spacing:-2})+lines(64,n===3?641:555,p.body,27,43)+diagram(p.idea,lang,64,p.idea==='hero'?765:730)+rule(64,1220,952)+t(64,1278,a.cta,22,{weight:700})+t(1016,1278,`${Number(p.id.slice(0,2))}/6`,16,{anchor:'end',color:C.muted});await asset(`redes/${lang}/${p.id}`,1080,1350,`ButiRonda · ${p.head.join(' ')}`,s,{category:'social',lang});}
  const story=rect(0,0,1080,1920,C.ivory,0)+logo(72,154,92)+t(76,360,lang==='ca'?'CAMPIONATS DE BUTIFARRA':'TORNEOS DE BUTIFARRA',18,{weight:700,spacing:2.5})+lines(72,505,a.posts[0].head,102,128,{serif:true,weight:700,spacing:-2})+mark(260,858,560)+lines(76,1556,[a.cta,a.intro],27,50,{weight:700})+rule(76,1660,928);
  await asset(`redes/${lang}/07-story-lanzamiento`,1080,1920,'ButiRonda · story de lanzamiento',story,{category:'story',lang});
  let st=rect(0,0,1080,1920,C.ivory,0)+logo(72,154,92)+lines(72,457,a.story2,84,111,{serif:true,weight:700,spacing:-1.8});
  a.steps.forEach((v,i)=>{st+=rect(76,716+i*176,928,146,C.paper,20,C.line)+t(108,811+i*176,String(i+1).padStart(2,'0'),48,{serif:true,weight:700})+t(220,800+i*176,v,30,{weight:700});});st+=t(76,1595,a.cta,30,{serif:true,weight:700})+t(76,1650,a.local,20,{color:C.muted});
  await asset(`redes/${lang}/08-story-pasos`,1080,1920,'ButiRonda · cuatro pasos',st,{category:'story',lang});
  let banner=rect(0,0,1920,640,C.ivory,0)+logo(72,44,91)+lines(80,293,a.tag,82,105,{serif:true,weight:700,spacing:-2})+t(80,496,a.descriptor,27)+mark(1370,80,485)+rule(80,574,1760);
  await asset(`banners/${lang}/cabecera`,1920,640,'ButiRonda · cabecera',banner,{category:'banner',lang});
  let og=rect(0,0,1200,630,C.ivory,0)+logo(62,42,77)+lines(64,280,a.tag,57,78,{serif:true,weight:700,spacing:-1.3})+t(64,497,a.descriptor,21)+mark(810,174,334)+rule(64,548,1072);
  await asset(`banners/${lang}/enlace-social`,1200,630,'ButiRonda · imagen de enlace',og,{category:'banner',lang});
  let poster=rect(0,0,1188,1680,C.ivory,0)+logo(80,62,109)+rule(80,224,1028)+t(80,310,lang==='ca'?'CAMPIONATS DE BUTIFARRA':'TORNEOS DE BUTIFARRA',20,{weight:700,spacing:3})+lines(80,464,a.posts[0].head,106,129,{serif:true,weight:700,spacing:-2.6})+mark(364,821,460)+t(594,1420,a.cta,42,{serif:true,weight:700,anchor:'middle'})+t(594,1492,a.intro,26,{anchor:'middle'})+rule(80,1560,1028)+t(594,1617,a.descriptor,20,{anchor:'middle'});
  await asset(`cartel/${lang}/cartel-a3`,1188,1680,'ButiRonda · cartel A3',poster,{pngWidth:3508,physical:['297mm','420mm'],category:'poster',lang});
}

// Crops of real captures: focus on the feature without repainting any UI.
const cropSpecs=[['01-preparacion',582,208,628,458],['02-ronda',545,165,1250,650],['03-resultados',545,165,1780,685],['04-mesas',603,160,1647,1285]];
const crops={};for(const [n,left,top,width,height] of cropSpecs){const b=await sharp(path.join(out,`capturas/${n}.png`)).extract({left,top,width,height}).png().toBuffer();await writeFile(path.join(out,`capturas/${n}-detalle.png`),b);crops[n]={uri:`data:image/png;base64,${b.toString('base64')}`,width,height};}
function screenshot(n,x,y,w,h){const a=crops[n],k=Math.min(w/a.width,h/a.height),rw=a.width*k,rh=a.height*k;return rect(x-8,y-8,w+16,h+16,C.paper,20,C.line)+`<image href="${a.uri}" x="${x+(w-rw)/2}" y="${y+(h-rh)/2}" width="${rw}" height="${rh}"/>`;}
const videoScenes={};
for(const [lang,a] of Object.entries(L)){
  const vertical=[];
  const shortHeads=[a.posts[0].head,a.posts[1].head,a.posts[2].head,a.posts[3].head,['ButiRonda']];
  const shortBodies=[a.descriptor,a.steps[0],a.steps[1],a.steps[3],a.cta];
  for(let i=0;i<5;i++){let body=rect(0,0,1080,1920,C.ivory,0)+logo(74,154,84)+t(76,363,i===0?'BUTIRONDA':`${String(i).padStart(2,'0')} / ${lang==='ca'?'EL CAMPIONAT':'EL TORNEO'}`,18,{weight:700,spacing:2.4});
    if(i===4)body+=mark(242,472,596)+word(540,1232,121,'middle')+t(540,1340,shortBodies[i],31,{anchor:'middle',weight:700})+t(540,1410,a.descriptor,22,{anchor:'middle'});
    else body+=lines(76,535,shortHeads[i],i===0?99:94,125,{serif:true,weight:700,spacing:-2})+diagram(['hero','pairs','draw','score'][i],lang,76,i===0?1010:965,928)+t(76,1645,shortBodies[i],25,{weight:700});
    body+=rule(76,1730,928)+rect(76,1776,928*(i+1)/5,5,C.coral,2);
    const f=`videos/fuentes/${lang}/vertical-${i+1}`;await asset(f,1080,1920,`ButiRonda · vertical · escena ${i+1}`,body,{category:'video-frame',lang});vertical.push(f+'.png');}
  const horizontal=[];for(let i=0;i<6;i++){let b=rect(0,0,1920,1080,C.ivory,0)+logo(76,52,86)+rule(80,181,1760);
    if(i===0||i===5){b+=lines(80,382,a.videoHeads[i],84,111,{serif:true,weight:700,spacing:-2.2})+lines(84,678,a.videoBodies[i],28,50)+mark(1320,325,480)+t(84,882,a.descriptor,23);}
    else {b+=t(80,280,String(i).padStart(2,'0'),22,{weight:700,spacing:2})+lines(80,394,a.videoHeads[i],61,88,{serif:true,weight:700,spacing:-1.4})+lines(82,637,a.videoBodies[i],24,44)+screenshot(['','01-preparacion','02-ronda','03-resultados','04-mesas'][i],822,248,1008,630)+t(830,940,a.capture,17,{color:C.muted});}
    b+=rule(80,993,1760)+rect(80,1032,1760*(i+1)/6,5,C.coral,2);
    const f=`videos/fuentes/${lang}/horizontal-${i+1}`;await asset(f,1920,1080,`ButiRonda · explicación · escena ${i+1}`,b,{category:'video-frame',lang});horizontal.push(f+'.png');}
  videoScenes[lang]={vertical,horizontal};
}
await writeFile(path.join(out,'videos/escenas.json'),JSON.stringify(videoScenes,null,2));

let guide=rect(0,0,1600,1220,C.ivory,0)+t(64,65,'BUTIRONDA / IDENTIDAD',15,{weight:700,spacing:2})+rule(64,92,1472)+logo(88,171,177)+t(82,454,'Parelles',39,{serif:true,weight:700})+lines(82,506,['Cuatro cartas, dos parejas y un centro abierto.','El símbolo elegido conserva su geometría y sus colores.'],22,36)+rule(64,588,1472)+t(80,650,'COLOR',14,{weight:700,spacing:2});
for(const [i,[name,hex]] of Object.entries(C).slice(0,5).entries()){const x=80+i*287;guide+=rect(x,680,250,70,hex,9,C.line)+t(x,790,name.toUpperCase(),15,{weight:700})+t(x,820,hex,16);}
guide+=t(80,909,'TIPOGRAFÍA',14,{weight:700,spacing:2})+t(80,976,'Noto Serif Bold',48,{serif:true,weight:700})+t(838,964,'Noto Sans Regular / Bold',31,{weight:700})+t(80,1025,'Títulos y nombre de marca.',20)+t(838,1017,'Textos, datos y llamadas a la acción.',20)+rule(64,1080,1472)+t(80,1135,'Usa el símbolo completo, sin estirarlo, recolorearlo ni alterar las cuatro cartas.',20)+t(80,1175,'Reserva al menos 1/4 del ancho del símbolo como espacio libre alrededor.',18,{color:C.muted});
await asset('guia/identidad',1600,1220,'ButiRonda · identidad',guide,{category:'guide'});

// Overview of final artwork, using the actual exported PNGs.
let overview=rect(0,0,1800,1350,C.ivory,0)+logo(58,28,88)+t(1736,91,'PACK DE MARCA / PARELLES',15,{weight:700,anchor:'end',spacing:1.5})+rule(64,147,1672);
const selected=['redes/ca/01-llancament.png','redes/ca/02-parelles.png','redes/ca/03-sorteig.png','redes/ca/04-resultats.png','redes/ca/05-classificacio.png','redes/ca/06-taules.png'];
for(const [i,f] of selected.entries()){const b=await readFile(path.join(out,f));const x=64+(i%3)*568,y=190+Math.floor(i/3)*538;overview+=`<image href="data:image/png;base64,${b.toString('base64')}" x="${x}" y="${y}" width="400" height="500"/>`+t(x+422,y+28,String(i+1).padStart(2,'0'),18,{weight:700})+`<path d="M${x+440} ${y+54}v430" stroke="${C.line}"/>`;}
overview+=t(64,1304,'Logos · redes · cartel · cabeceras · vídeos · textos CA / ES',22,{weight:700});
await asset('vista-del-pack',1800,1350,'ButiRonda · vista del pack',overview,{category:'overview'});
await writeFile(path.join(out,'manifest.json'),JSON.stringify({name:'ButiRonda',symbol:'Parelles',symbolSource:'logos/simbolo-parelles.svg',fonts:['Noto Serif Bold','Noto Sans Regular','Noto Sans Bold'],palette:C,assets:manifest},null,2));
await writeFile(path.join(out,'index.html'),`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ButiRonda · pack de marca</title><style>body{margin:0;background:${C.ivory};color:${C.green};font:17px/1.6 system-ui,sans-serif}main{max-width:1400px;margin:auto;padding:30px}h1,h2{font-family:Georgia,serif}nav{display:flex;gap:24px;flex-wrap:wrap;border-bottom:1px solid ${C.line};padding:20px 0}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px}figure{margin:0;background:${C.paper};padding:18px;border:1px solid ${C.line};border-radius:14px}img,video{display:block;width:100%;height:auto}a{color:inherit;text-underline-offset:4px}section{margin:50px 0}.links{display:flex;gap:18px;margin-top:12px;flex-wrap:wrap}small{color:${C.muted}}.logo{max-width:600px}video{max-height:650px}summary{cursor:pointer;padding:16px 0;font-weight:bold}</style></head><body><main><img class="logo" src="logos/logo-horizontal.png" alt="ButiRonda — símbolo Parelles y nombre"><p>Identidad elegida: Parelles. Material de presentación y campaña en catalán y castellano.</p><nav><a href="#identidad">Identidad</a><a href="#redes">Redes</a><a href="#formatos">Cartel y cabeceras</a><a href="#videos">Vídeos</a><a href="#textos">Textos</a><a href="LEEME.md">Cómo usar el pack</a></nav><section id="identidad"><h1>ButiRonda, ronda a ronda.</h1><img src="guia/identidad.png" alt="Guía visual de ButiRonda: símbolo Parelles, paleta verde, marfil, ocre y coral; Noto Serif y Noto Sans."><div class="links">${manifest.filter(a=>a.category==='logo').map(a=>`<a href="${a.source}" download>${a.title} · SVG</a>`).join('')}</div></section><section id="redes"><h2>Redes sociales</h2>${['ca','es'].map(lang=>`<details ${lang==='ca'?'open':''}><summary>${lang==='ca'?'Catalán':'Castellano'}</summary><div class="grid">${manifest.filter(a=>['social','story'].includes(a.category)&&a.lang===lang).map(a=>`<figure><img src="${a.file}" alt="${esc(a.title)}" loading="lazy"><figcaption>${esc(a.title)}</figcaption><div class="links"><a href="${a.file}" download>PNG</a><a href="${a.source}" download>SVG</a></div></figure>`).join('')}</div></details>`).join('')}</section><section id="formatos"><h2>Cartel y cabeceras</h2><div class="grid">${manifest.filter(a=>['banner','poster'].includes(a.category)).map(a=>`<figure><img src="${a.file}" alt="${esc(a.title)}" loading="lazy"><figcaption>${esc(a.title)} · ${a.lang.toUpperCase()}</figcaption><div class="links"><a href="${a.file}" download>PNG</a><a href="${a.source}" download>SVG</a></div></figure>`).join('')}</div></section><section id="videos"><h2>Vídeos</h2><p>Textos en pantalla y música original por síntesis. Sin locución. Las capturas muestran la app actual con datos de demostración.</p><div class="grid">${['ca','es'].flatMap(lang=>['vertical-15s','explicacion-30s'].map(n=>`<figure><video controls preload="metadata" poster="videos/fuentes/${lang}/${n.startsWith('vertical')?'vertical':'horizontal'}-1.png" src="videos/${n}-${lang}.mp4"></video><figcaption>${n} · ${lang.toUpperCase()}</figcaption><a href="videos/${n}-${lang}.mp4" download>Descargar MP4</a></figure>`)).join('')}</div></section><section id="textos"><h2>Textos para explicar y presentar la app</h2><div class="links"><a href="textos/copy-ca.md">Textos en catalán</a><a href="textos/copy-es.md">Textos en castellano</a><a href="textos/plan-publicacion.md">Plan de publicación</a><a href="videos/guiones.md">Guiones de vídeo</a></div><p><small>Las piezas se entregan para revisión y uso. Las fuentes de los SVG con texto deben estar instaladas para editar sin sustituciones. Los PNG y MP4 conservan el aspecto.</small></p></section></main></body></html>`);
console.log(`Created ${manifest.length} rendered assets at ${out}`);

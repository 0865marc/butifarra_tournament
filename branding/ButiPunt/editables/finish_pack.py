from pathlib import Path
import json,html,shutil,hashlib,subprocess,zipfile
from PIL import Image,ImageDraw
P=Path('/home/user/butipunt-final')

copy={
'es': '''# ButiPunt · Biblioteca de textos

## Mensaje principal
Cada punto, en su sitio.

Gestor de torneos de butifarra.

Prepara las parejas, organiza las rondas y confirma los resultados de cada mesa. ButiPunt reúne el seguimiento del torneo en un mismo lugar.

## Presentación breve
ButiPunt es una aplicación web para organizar torneos presenciales de butifarra. Configura el torneo, inscribe las parejas y sigue las rondas, los resultados y la clasificación desde el navegador.

## Presentación ampliada
Organizar un torneo también forma parte de la partida. ButiPunt ayuda a preparar las parejas y las rondas, consultar qué se juega en cada mesa y registrar los puntos. La primera ronda se sortea; las siguientes siguen el orden de la clasificación. Cada resultado confirmado actualiza las victorias y los puntos. Puedes consultar las rondas anteriores y mostrar el panel de parejas y mesas a pantalla completa.

## Bio para redes
Gestor de torneos de butifarra. Parejas, rondas, resultados y clasificación. Cada punto, en su sitio.

## Web
Título SEO: ButiPunt | Gestor de torneos de butifarra
Descripción: Organiza las parejas y rondas de tu torneo de butifarra. Anota los resultados de cada mesa y consulta la clasificación con ButiPunt.
Titular alternativo: El torneo, a punto.
Botón principal: Preparar el torneo
Botón explicativo: Ver cómo funciona
Bloque 1: Prepara las parejas. Pon nombre al torneo, elige las rondas e inscribe a los dos jugadores de cada pareja.
Bloque 2: Sigue cada mesa. Consulta los emparejamientos de la ronda y anota sus resultados.
Bloque 3: Confirma y consulta. La clasificación recoge los resultados confirmados para seguir el avance del torneo.

## Seis publicaciones listas para acompañar las piezas
1. Presentación: Un torneo empieza mucho antes del primer resultado. ButiPunt te ayuda a preparar las parejas, seguir las rondas y consultar la clasificación. Butifarra, ronda a ronda. #ButiPunt #Butifarra
2. Preparación: Nombre del torneo, número de rondas y parejas inscritas. Tres cosas que puedes dejar preparadas para empezar con todo a punto. #ButiPunt #TorneosDeButifarra
3. Resultados: Cada mesa tiene su resultado. Anota los puntos, confírmalos y consulta cómo queda la clasificación. Cada punto, en su sitio. #ButiPunt #Butifarra
4. Rondas: La primera ronda se sortea. Después, los emparejamientos siguen la clasificación. Consulta quién juega en cada mesa desde el panel del torneo. #ButiPunt
5. Panel: Parejas y mesas, a la vista. El panel a pantalla completa ayuda a comunicar los emparejamientos durante el torneo. #ButiPunt #Butifarra
6. Cierre: De la primera pareja inscrita al último resultado confirmado. ButiPunt reúne el seguimiento de tu torneo para que puedas consultar cada ronda y su clasificación. #ButiPunt

## Tres anuncios breves
El torneo, a punto. Parejas, rondas y clasificación con ButiPunt.
Cada mesa. Cada ronda. Cada punto. Organiza tu torneo con ButiPunt.
Butifarra, ronda a ronda. Un mismo lugar para seguir el torneo.

## Correo de presentación
Asunto: ButiPunt: el torneo, a punto
Hola:
Estamos preparando ButiPunt, una aplicación web para organizar torneos de butifarra. Permite inscribir parejas, seguir las rondas, anotar resultados y consultar la clasificación.
La idea es reunir el seguimiento del torneo en un mismo lugar y facilitar la consulta de parejas y mesas durante la jornada.
Si organizáis torneos, nos gustaría enseñaros cómo funciona y conocer vuestra experiencia.
Gracias.

## Preguntas frecuentes
¿Se juega dentro de la aplicación? Actualmente ButiPunt gestiona el torneo. Las partidas se juegan fuera de la aplicación.
¿Dónde se guarda el torneo? En el navegador utilizado. No hay cuenta de usuario ni sincronización entre dispositivos.
¿Cómo se forman las rondas? La primera se sortea. Las siguientes emparejan posiciones consecutivas de la clasificación, ordenada por victorias, puntos y orden de inscripción para los empates restantes.
¿Se pueden repetir rivales? Sí. La aplicación detecta repeticiones y propone intercambios cuando encuentra una alternativa válida antes de introducir los resultados.
¿Puedo corregir un resultado? Puedes corregir los resultados de la ronda actual antes de crear la siguiente.
¿Cuántas parejas hacen falta? Un número par de parejas, con un mínimo de dos.

## Uso editorial
Los textos de presentación son propuestas de comunicación. El correo es un borrador, no se ha enviado. Añadir una URL y un contacto reales cuando estén disponibles. No anunciar precios, usuarios, premios, sincronización, exportación del torneo o juego en línea sin que esas funciones o datos existan.
''',
'ca': '''# ButiPunt · Biblioteca de textos

## Missatge principal
Cada punt, al seu lloc.

Gestor de tornejos de butifarra.

Prepara les parelles, organitza les rondes i confirma els resultats de cada taula. ButiPunt reuneix el seguiment del torneig en un mateix lloc.

## Presentació breu
ButiPunt és una aplicació web per organitzar tornejos presencials de butifarra. Configura el torneig, inscriu les parelles i segueix les rondes, els resultats i la classificació des del navegador.

## Presentació ampliada
Organitzar un torneig també forma part de la partida. ButiPunt ajuda a preparar les parelles i les rondes, consultar què es juga a cada taula i registrar els punts. La primera ronda se sorteja; les següents segueixen l’ordre de la classificació. Cada resultat confirmat actualitza les victòries i els punts. Pots consultar les rondes anteriors i mostrar el panell de parelles i taules a pantalla completa.

## Bio per a xarxes
Gestor de tornejos de butifarra. Parelles, rondes, resultats i classificació. Cada punt, al seu lloc.

## Web
Títol SEO: ButiPunt | Gestor de tornejos de butifarra
Descripció: Organitza les parelles i les rondes del teu torneig de butifarra. Anota els resultats de cada taula i consulta la classificació amb ButiPunt.
Titular alternatiu: El torneig, a punt.
Botó principal: Preparar el torneig
Botó explicatiu: Veure com funciona
Bloc 1: Prepara les parelles. Posa nom al torneig, tria les rondes i inscriu els dos jugadors de cada parella.
Bloc 2: Segueix cada taula. Consulta els aparellaments de la ronda i anota’n els resultats.
Bloc 3: Confirma i consulta. La classificació recull els resultats confirmats per seguir l’evolució del torneig.

## Sis publicacions per acompanyar les peces
1. Presentació: Un torneig comença molt abans del primer resultat. ButiPunt t’ajuda a preparar les parelles, seguir les rondes i consultar la classificació. Butifarra, ronda a ronda. #ButiPunt #Butifarra
2. Preparació: Nom del torneig, nombre de rondes i parelles inscrites. Tres coses que pots deixar preparades per començar amb tot a punt. #ButiPunt #TornejosDeButifarra
3. Resultats: Cada taula té el seu resultat. Anota els punts, confirma’ls i consulta com queda la classificació. Cada punt, al seu lloc. #ButiPunt #Butifarra
4. Rondes: La primera ronda se sorteja. Després, els aparellaments segueixen la classificació. Consulta qui juga a cada taula des del panell del torneig. #ButiPunt
5. Panell: Parelles i taules, a la vista. El panell a pantalla completa ajuda a comunicar els aparellaments durant el torneig. #ButiPunt #Butifarra
6. Tancament: De la primera parella inscrita a l’últim resultat confirmat. ButiPunt reuneix el seguiment del teu torneig perquè puguis consultar cada ronda i la seva classificació. #ButiPunt

## Tres anuncis breus
El torneig, a punt. Parelles, rondes i classificació amb ButiPunt.
Cada taula. Cada ronda. Cada punt. Organitza el teu torneig amb ButiPunt.
Butifarra, ronda a ronda. Un mateix lloc per seguir el torneig.

## Correu de presentació
Assumpte: ButiPunt: el torneig, a punt
Hola:
Estem preparant ButiPunt, una aplicació web per organitzar tornejos de butifarra. Permet inscriure parelles, seguir les rondes, anotar resultats i consultar la classificació.
La idea és reunir el seguiment del torneig en un mateix lloc i facilitar la consulta de parelles i taules durant la jornada.
Si organitzeu tornejos, ens agradaria ensenyar-vos com funciona i conèixer la vostra experiència.
Gràcies.

## Preguntes freqüents
Es juga dins de l’aplicació? Actualment ButiPunt gestiona el torneig. Les partides es juguen fora de l’aplicació.
On es desa el torneig? Al navegador utilitzat. No hi ha compte d’usuari ni sincronització entre dispositius.
Com es formen les rondes? La primera se sorteja. Les següents aparellen posicions consecutives de la classificació, ordenada per victòries, punts i ordre d’inscripció per als empats restants.
Es poden repetir rivals? Sí. L’aplicació detecta repeticions i proposa intercanvis quan troba una alternativa vàlida abans d’introduir els resultats.
Puc corregir un resultat? Pots corregir els resultats de la ronda actual abans de crear la següent.
Quantes parelles calen? Un nombre parell de parelles, amb un mínim de dues.

## Ús editorial
Els textos de presentació són propostes de comunicació. El correu és un esborrany, no s’ha enviat. Afegir un URL i un contacte reals quan estiguin disponibles. No anunciar preus, usuaris, premis, sincronització, exportació del torneig o joc en línia sense que aquestes funcions o dades existeixin.
'''}
for lang,s in copy.items():(P/f'textos/marketing-{lang}.md').write_text(s)
guide='''# ButiPunt · Guía de marca y entrega

Identidad aprobada: nombre ButiPunt, símbolo Punt propi (opción 1), paleta verde/papel/coral y tipografía Fraunces 700 + Source Sans 3 400 (opción 2).

## Idea de marca
Cada punto, en su sitio. / Cada punt, al seu lloc.
ButiPunt pone el foco en la organización del torneo. La P identifica la marca y el punto coral señala avances, resultados y finales de secuencia. Un tono cercano, claro y tranquilo para quien organiza.

## Logos
Usar el horizontal a partir de 160 px de ancho y el símbolo a partir de 32 px. Son tamaños de partida; comprobar cada soporte. Para 16 px se incluye favicon específico.
Mantener un área libre de al menos un cuarto de la altura visible del símbolo. No estirar, rotar o recolocar el punto. Usar color sobre papel o blanco; la versión blanca sobre verde o tinta. La variante tinta sirve para un solo color.
Los SVG de producción contienen letras trazadas y curvas escalables. Los PNG son transparentes, incluido el hueco interior de la P. El SVG original de Recraft se conserva intacto en originales/.

## Colores
Papel #F8F3E8: fondo.
Tinta #182D29: lectura.
Tapete #245748: marca y paneles.
Coral #D7684F: acentos y punto.
Arena #DDCBA8: superficies de apoyo.
Reservar el coral para acentos. En textos pequeños usar tinta o verde sobre papel. Evitar brillos y degradados.

## Tipografía
Fraunces 700 para marca, titulares y numeración. Source Sans 3 400 para descripciones y lectura. El ajuste óptico de los SVG finales usa Fraunces opsz 72, SOFT 0, WONK 1; familia y peso permanecen como se aprobaron.
Las fuentes y sus licencias OFL están incluidas. El wordmark trazado fija las proporciones; no sustituirlo por una fuente parecida.

## Material entregado
Identidad: horizontal, vertical, símbolo en color/tinta/blanco; avatar; favicon SVG/ICO/PNG; lámina de marca.
Campaña CA y ES: post 1080×1080, story 1080×1920, carrusel de tres páginas 1080×1350, cartel en proporción A3 2382×3368, cabecera 1600×600 y OG 1200×630. Todos con SVG editable por objetos y PNG.
Vídeos CA y ES: anuncio vertical de 15 s a 1080×1920 y explicación horizontal de 30 s a 1920×1080; H.264, 30 fps, AAC. Música tonal original, sin voz. Los textos forman parte del vídeo y se entienden sin sonido.
Textos: presentación, web, SEO, bios, seis publicaciones, tres anuncios, correo y FAQ por idioma; guiones y secuencia de publicación.
Fuentes de vídeo: proyectos Higgsedit, escenas SVG/PNG, script de montaje y partitura sonora generada por código.

## Uso por canal
Redes: subir los PNG finales de campana/. Las stories dejan espacio para los controles superior e inferior. Comprobar la vista previa de cada red antes de publicar.
Carrusel: publicar 01, 02 y 03 en ese orden. Los paneles son esquemas explicativos con datos de ejemplo, no capturas de la interfaz.
Cartel: el SVG es escalable; para A3 ajustar a 297×420 mm y conservar los márgenes. El PNG sirve como exportación de apoyo. No se ha preparado sangrado ni conversión CMYK.
Vídeos: usar reel para formatos verticales y explicativo para web o presentaciones. Se pueden añadir enlaces reales en el texto que acompaña la publicación.
La galería index.html funciona con sus carpetas al lado y no necesita conexión para los recursos incluidos.

## Procedencia, costes y alcance
Recraft V4.1 generó el símbolo original en Higgsfield el 8 de septiembre. GPT Image 2 generó los cuatro originales de redes ese mismo día. Las propuestas de nombre, estrategia, textos y composición son trabajo de Codex.
El 16 de septiembre se adaptaron los recursos mediante composición vectorial y render determinista en el sandbox de Higgsfield. Los vídeos se montaron con Higgsedit. No contienen nuevas escenas generadas por modelos de vídeo. Esta finalización consumió 0 créditos de generación y no activó suscripciones.
Los cuatro originales de redes se conservan para comparar el resultado del modelo con la producción ajustada. Las adaptaciones fijan tipografía, encuadre, transparencia y márgenes. No se usó el pack anterior de ButiRonda como entrada creativa.
No hay URL pública, precio o contacto comercial aportado. La campaña promociona la gestión de torneos presenciales. Los textos no prometen juego dentro de la app, cuentas o sincronización.
'''
(P/'GUIA-DE-MARCA.md').write_text(guide)
(P/'README.md').write_text('''# ButiPunt · Pack de marca

Abre index.html para recorrer todos los recursos.

- logos/: SVG y PNG de producción, avatar y favicon.
- campana/: posts, stories, carruseles, carteles y cabeceras en catalán y castellano.
- videos/: cuatro MP4 terminados y sus portadas.
- textos/: biblioteca de marketing, guiones y propuesta de publicaciones.
- editables/: escenas vectoriales, proyectos Higgsedit y scripts para reproducir la producción.
- originales/: resultados de los modelos y estado aprobado, preservados.
- fuentes/: tipografías y licencias.
- revision/: comprobaciones y vistas de revisión.

Consulta GUIA-DE-MARCA.md para formatos, uso y procedencia. Esta entrega no publica campañas ni modifica la aplicación.
''')
script='''# Guiones de vídeo

Son vídeos de animación gráfica con música tonal original y texto en pantalla. No incluyen locución ni metraje generado por IA.

## Vertical · 15 segundos

| Tiempo | Catalán | Castellano |
|---|---|---|
| 00–03 | El torneig, a punt. | El torneo, a punto. |
| 03–06 | Inscriu les parelles | Inscribe las parejas |
| 06–09 | Anota els resultats | Anota los resultados |
| 09–12 | Consulta la classificació | Consulta la clasificación |
| 12–15 | Butifarra, ronda a ronda. | Butifarra, ronda a ronda. |

## Horizontal · 30 segundos

| Tiempo | Escena | Contenido |
|---|---|---|
| 00–05 | Organiza tu torneo / Organitza el teu torneig | Parejas, mesas y resultados en un mismo lugar. |
| 05–10 | Prepara las parejas / Prepara les parelles | Nombre, rondas e inscripción de parejas. |
| 10–15 | Sigue cada ronda / Segueix cada ronda | Primera ronda por sorteo; siguientes según clasificación. |
| 15–20 | Confirma los puntos / Confirma els punts | Anotar y confirmar para actualizar la clasificación. |
| 20–25 | Consulta la clasificación / Consulta la classificació | Victorias, puntos y consulta de rondas anteriores. |
| 25–30 | El torneo, a punto. / El torneig, a punt. | Firma ButiPunt y cierre. |

Los textos completos en pantalla están en editables/copy.json y en los SVG de editables/escenas/.
'''
(P/'textos/guiones.md').write_text(script)
(P/'textos/secuencia-publicacion.md').write_text('''# Secuencia sugerida de publicaciones

Propuesta relativa al día en que se decida lanzar; no hay publicaciones programadas.

| Momento | Pieza | Texto asociado | Objetivo |
|---|---|---|---|
| Día 1 | Post principal | Publicación 1 | Presentar ButiPunt. |
| Día 3 | Reel de 15 s | Anuncio 1 | Resumir la propuesta. |
| Día 5 | Carrusel 01–03 | Publicación 3 | Explicar el flujo. |
| Día 8 | Story | Publicación 2 abreviada | Recordar los pasos. |
| Día 11 | Vídeo de 30 s | Presentación breve | Mostrar cómo se organiza. |
| Día 14 | Post o cabecera | Publicación 5 | Destacar parejas y mesas. |

Elegir el idioma del público. Añadir enlaces o datos de contacto verificados al publicar. El cartel sirve para presentar la aplicación; no incluye datos de un torneo concreto.
''')

def md_to_html(s):
    out=[]
    for line in s.splitlines():
        if line.startswith('### '):out.append('<h4>'+html.escape(line[4:])+'</h4>')
        elif line.startswith('## '):out.append('<h3>'+html.escape(line[3:])+'</h3>')
        elif line.startswith('# '):continue
        elif line:out.append('<p>'+html.escape(line)+'</p>')
    return ''.join(out)

def asset(name,label,cls=''):
    return f'<article class="asset {cls}"><a href="{name}.png"><img loading="lazy" src="{name}.png" alt="{label}"></a><div><strong>{label}</strong><span><a href="{name}.png" download>PNG ↓</a> <a href="{name}.svg" download>SVG ↓</a></span></div></article>'

sections=''
for lang in ['ca','es']:
    t='Català' if lang=='ca' else 'Castellano'
    sections+=f'<section id="{lang}"><div class="section-head"><span>02 / CAMPAÑA</span><h2>{t}</h2></div><div class="grid two">'+asset(f'campana/post-{lang}','Post · 1080 × 1080')+asset(f'campana/story-{lang}','Story · 1080 × 1920','story')+'</div><h3>Un recorrido en tres páginas</h3><div class="grid three">'
    for i in range(1,4):sections+=asset(f'campana/carrusel-{lang}-{i:02}',f'Carrusel · {i}/3')
    sections+='</div><div class="grid two">'+asset(f'campana/cartel-A3-{lang}','Cartel · Proporción A3','poster')+'<div>'+asset(f'campana/cabecera-{lang}','Cabecera · 1600 × 600')+asset(f'campana/og-{lang}','Vista de enlace · 1200 × 630')+'</div></div></section>'
vid=''
for form in ['reel','explicativo']:
    for lang in ['ca','es']:
        label=('Vertical · 15 s' if form=='reel' else 'Horizontal · 30 s')+' · '+lang.upper()
        vid+=f'<article class="video"><video controls playsinline preload="metadata" poster="videos/{form}-{lang}-poster.png"><source src="videos/{form}-{lang}.mp4" type="video/mp4"></video><div><strong>{label}</strong><a href="videos/{form}-{lang}.mp4" download>Descargar MP4 ↓</a></div></article>'
original=''.join(f'<a href="originales/{n}-{l}.png"><img loading="lazy" src="originales/{n}-{l}.png" alt="Original de Higgsfield: {n} {l}"><span>{n} · {l.upper()}</span></a>' for n in ['post','story'] for l in ['ca','es'])
css='''@font-face{font-family:Fraunces;src:url(fuentes/Fraunces-700.ttf);font-weight:700;font-display:swap}@font-face{font-family:Source;src:url(fuentes/SourceSans3-400.ttf);font-weight:400;font-display:swap}*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:100px}body{margin:0;background:#F8F3E8;color:#182D29;font-family:Source,Arial,sans-serif;font-size:18px;line-height:1.6}a{color:inherit;text-underline-offset:5px}header{position:sticky;top:0;background:#F8F3E8f2;border-bottom:1px solid #DDCBA8;z-index:5}nav{max-width:1280px;margin:auto;padding:12px 30px;display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap}nav img{width:185px;display:block}nav div{display:flex;gap:20px;flex-wrap:wrap;font-size:16px}main{max-width:1280px;padding:0 40px;margin:auto}h1,h2,h3{font-family:Fraunces,Georgia,serif;font-weight:700;line-height:1.1}h1{font-size:clamp(52px,7vw,96px);letter-spacing:-2px;margin:24px 0}h2{font-size:48px;margin:8px 0 30px}h3{font-size:29px;margin:42px 0 22px}.hero{padding:70px 0 80px;border-bottom:1px solid #DDCBA8}.hero>p{max-width:680px;font-size:22px}.dot{color:#D7684F}.label,.section-head>span{font-size:13px;letter-spacing:2px;text-transform:uppercase}.pill{display:inline-block;padding:12px 22px;border:1px solid #245748;border-radius:30px;text-decoration:none;margin:12px 10px 0 0}.pill.primary{background:#245748;color:#F8F3E8}section{padding:64px 0;border-bottom:1px solid #DDCBA8}.grid{display:grid;gap:24px}.two{grid-template-columns:repeat(2,minmax(0,1fr))}.three{grid-template-columns:repeat(3,minmax(0,1fr))}.asset{border:1px solid #DDCBA8;border-radius:14px;overflow:hidden;background:#fdfbf6;min-width:0;margin-bottom:24px}.asset>a{display:block;background:#eee7db}.asset img{display:block;width:100%;height:auto}.asset.story img,.asset.poster img{height:600px;object-fit:contain}.asset>div,.video>div{padding:16px 20px;display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;font-size:16px}.asset span{display:flex;gap:14px}.swatches{display:flex;gap:12px;margin:30px 0;flex-wrap:wrap}.swatches div{flex:1;min-width:140px}.swatches i{display:block;height:88px;border:1px solid #DDCBA8;border-radius:12px;margin-bottom:8px}.type{background:#245748;color:#F8F3E8;padding:34px;border-radius:14px}.type p{margin:10px 0}.type strong{font-family:Fraunces,serif;font-size:42px}.video{border:1px solid #DDCBA8;border-radius:14px;overflow:hidden;margin-bottom:28px;background:#eee7db}.video video{display:block;width:100%;max-height:620px;background:#182D29}.video>div{background:#fdfbf6}.originals{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px}.originals img{width:100%;height:300px;object-fit:contain}.originals a{font-size:15px;text-decoration:none}details{border:1px solid #DDCBA8;margin:20px 0;border-radius:12px;padding:22px;background:#fdfbf6}summary{cursor:pointer;font-size:22px}details p{max-width:850px}footer{padding:40px 0 60px;font-size:16px}a:focus-visible,summary:focus-visible{outline:3px solid #D7684F;outline-offset:5px}.reverse{background:#245748;padding:24px;border-radius:12px}.reverse img{width:100%}@media(max-width:700px){main{padding:0 20px}nav{padding:8px 20px}nav img{width:148px}nav div{gap:13px;font-size:14px}.hero{padding:40px 0}h2{font-size:39px}.two,.three{grid-template-columns:1fr}.originals{grid-template-columns:1fr 1fr}.asset.story img,.asset.poster img{height:480px}.video video{max-height:540px}.type strong{font-size:32px}.hero>p{font-size:20px}section{padding:44px 0}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}'''
page='<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ButiPunt · Pack de marca</title><link rel="icon" href="logos/butipunt-favicon.svg"><style>'+css+'</style><header><nav><a href="#inicio"><img src="logos/butipunt-horizontal-color.svg" alt="ButiPunt"></a><div><a href="#identidad">Identidad</a><a href="#ca">Català</a><a href="#es">Castellano</a><a href="#videos">Vídeos</a><a href="#textos">Textos</a></div></nav></header><main id="inicio"><div class="hero"><span class="label">PACK DE MARCA · SEPTIEMBRE 2026</span><h1>Cada punto,<br>en su sitio<span class="dot">.</span></h1><p>La identidad de ButiPunt y sus recursos para explicar y presentar el gestor de torneos de butifarra.</p><a class="pill primary" href="#videos">Ver los vídeos</a><a class="pill" href="GUIA-DE-MARCA.md">Abrir la guía</a></div><section id="identidad"><div class="section-head"><span>01 / IDENTIDAD APROBADA</span><h2>Un punto propio.</h2></div><div class="grid two">'+asset('logos/butipunt-horizontal-color','Logo principal · Transparente')+asset('logos/butipunt-simbolo-color','Símbolo · Punt propi')+'</div><div class="grid three">'+asset('logos/butipunt-vertical-color','Composición vertical')+asset('logos/butipunt-horizontal-tinta','Un solo color')+'<div class="reverse"><img src="logos/butipunt-horizontal-blanco.svg" alt="Logo blanco sobre verde"><a style="color:white" href="logos/butipunt-horizontal-blanco.svg" download>Logo blanco SVG ↓</a></div></div><div class="swatches">'+''.join(f'<div><i style="background:{c}"></i>{n}<br>{c}</div>' for n,c in [('Papel','#F8F3E8'),('Tinta','#182D29'),('Tapete','#245748'),('Coral','#D7684F'),('Arena','#DDCBA8')])+'</div><div class="type"><strong>Fraunces 700</strong><p style="font-size:26px">Source Sans 3 · 400</p><p>El carácter de los titulares. La claridad de los datos.</p></div><p><a href="identidad.png">Lámina de identidad ↓</a> · <a href="logos/butipunt-avatar.png">Avatar ↓</a> · <a href="logos/favicon.ico">Favicon ↓</a></p></section>'+sections+'<section id="videos"><div class="section-head"><span>03 / EN MOVIMIENTO</span><h2>Ronda a ronda.</h2></div><p>Cuatro vídeos con animación gráfica y música tonal original. Montados en Higgsedit con los recursos de la marca.</p><div class="grid two">'+vid+'</div><a href="textos/guiones.md">Guiones y tiempos ↓</a></section><section id="textos"><div class="section-head"><span>04 / VOZ DE MARCA</span><h2>Para contarlo.</h2></div>'+''.join('<details><summary>Textos · '+('Català' if l=='ca' else 'Castellano')+'</summary><a href="textos/marketing-'+l+'.md" download>Descargar biblioteca ↓</a>'+md_to_html(copy[l])+'</details>' for l in ['ca','es'])+'<p><a href="textos/secuencia-publicacion.md">Secuencia sugerida de publicaciones ↓</a></p></section><section><div class="section-head"><span>05 / PROCEDENCIA</span><h2>Del original a la producción.</h2></div><p>Estos son los cuatro originales generados con GPT Image 2 en Higgsfield. Las piezas finales de arriba fijan la tipografía, los márgenes y la reproducción del logo.</p><div class="originals">'+original+'</div><details><summary>Guía, procedencia y uso</summary>'+md_to_html(guide)+'</details><p><a href="manifest.json">Inventario y procedencia ↓</a> · <a href="revision/verificacion.json">Verificación técnica ↓</a></p></section><footer>ButiPunt · Nombre, símbolo, paleta y tipografía elegidos por el usuario.<br>La aplicación gestiona torneos presenciales. Las campañas y los correos no se han publicado ni enviado.</footer></main></html>'
# Preserve intrinsic image dimensions so navigation does not shift during lazy loading.
import re, struct, xml.etree.ElementTree as ET
def image_dimensions(match):
    tag=match.group(0);src=re.search(r'src="([^"]+)"',tag).group(1);asset=P/src
    if asset.suffix=='.svg':
        root=ET.parse(asset).getroot();width,height=map(float,(root.get('width'),root.get('height')))
    else:width,height=struct.unpack('>II',asset.read_bytes()[16:24])
    return tag[:-1]+f' width="{int(width)}" height="{int(height)}">'
page=re.sub(r'<img\b[^>]*>',image_dimensions,page)
page=page.replace('*{box-sizing:border-box}','*{box-sizing:border-box}img{max-width:100%;height:auto}')
(P/'index.html').write_text(page)
shutil.copy(__file__,P/'editables/finish_pack.py')

# Inspect final files and write a compact release manifest.
checks={'date':'2026-09-16','static_dimensions':[],'video':[],'broken_links':[]}
for f in (P/'campana').glob('*.png'):
    im=Image.open(f);checks['static_dimensions'].append({'file':str(f.relative_to(P)),'width':im.width,'height':im.height})
for f in (P/'videos').glob('*.mp4'):
    probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','stream=codec_name,codec_type,width,height,r_frame_rate,duration:format=duration','-of','json',str(f)]))
    checks['video'].append({'file':str(f.relative_to(P)),'probe':probe})
import re
for href in re.findall(r'(?:href|src)="([^"]+)"',page):
    if not href.startswith(('#','http')) and not (P/href).exists() and href!='revision/verificacion.json':checks['broken_links'].append(href)
assert not checks['broken_links'],checks['broken_links']
checks['original_symbol_sha256']=hashlib.sha256((P/'originales/simbolo-recraft.svg').read_bytes()).hexdigest()
checks['production_symbol_has_evenodd_counter']='fill-rule="evenodd"' in (P/'logos/butipunt-simbolo-color.svg').read_text()
checks['video_render_reports']=[json.loads(f.read_text()) for f in (P/'editables/higgsedit').glob('*/render-report.json')]
assert len(checks['video'])==4
for v in checks['video']:
    assert {s['codec_type'] for s in v['probe']['streams']}=={'video','audio'}
    expect=15 if 'reel-' in v['file'] else 30
    assert abs(float(v['probe']['format']['duration'])-expect)<.15
(P/'revision/verificacion.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2))
m=json.loads((P/'manifest.json').read_text());m['video_count']=4;m['campaign_png_count']=len(checks['static_dimensions']);m['status']='production_complete'
(P/'manifest.json').write_text(json.dumps(m,ensure_ascii=False,indent=2))

sheet=Image.new('RGB',(1600,1700),'#eee9df');draw=ImageDraw.Draw(sheet)
for row,form in enumerate(['reel-es','reel-ca','explicativo-es','explicativo-ca']):
    for i,f in enumerate(sorted((P/'editables/higgsedit'/form/'renders').glob('check-*.png'))):
        im=Image.open(f).convert('RGB');im.thumbnail((250,385));sheet.paste(im,(i*266+(266-im.width)//2,row*420))
        draw.text((i*266+8,row*420+394),form+' / '+str(i+1),fill='#182D29')
sheet.save(P/'revision/videos.jpg',quality=92)
with zipfile.ZipFile('/home/user/ButiPunt-branding-pack.zip','w',zipfile.ZIP_DEFLATED) as z:
    for f in sorted(P.rglob('*')):
        if f.is_file() and not (f.name=='picture.mp4') and '.cache' not in f.parts:z.write(f,Path('ButiPunt')/f.relative_to(P))
print(json.dumps({'campaign_png':len(checks['static_dimensions']),'videos':len(checks['video']),'broken_links':checks['broken_links'],'zip_bytes':Path('/home/user/ButiPunt-branding-pack.zip').stat().st_size}))

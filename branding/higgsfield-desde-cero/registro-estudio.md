# Registro del segundo estudio

## Autorización y separación

El usuario solicita repetir el trabajo con Higgsfield, desde cero y sin influencia de la identidad producida anteriormente. Ha confirmado que también quiere explorar nombres nuevos.

Se inicia un estudio nuevo. No se reutilizan aprobaciones de nombre, logo, paleta o tipografía de las propuestas anteriores. No se adjuntarán sus imágenes, vídeos, textos comerciales ni documentos como referencias positivas o negativas.

Los únicos insumos creativos previstos son el encargo actual, el código del producto y capturas nuevas de su interfaz original. El archivo `brief-neutral.md` contiene los hechos y condiciones preparados para esta ejecución; no contiene nombres candidatos, lemas ni propuestas de símbolo.

La comparación evaluará claridad del nombre, relación con el juego, legibilidad, diferenciación, coherencia entre formatos, precisión de la explicación, calidad del movimiento, editabilidad y coste. No se modificará la nueva propuesta para acercarla al resultado anterior o alejarla de él.

## Fuentes revisadas

- `src/pages/index.astro`
- `src/styles/global.css`
- `src/scripts/tournament.ts`
- `src/lib/tournament.ts`
- `src/lib/pairing-repeats.ts`
- Interfaz local de preparación y de resultados, con datos de demostración.

## Comprobaciones previas a la activación

- Higgsfield: plan Free, 10 créditos.
- Prueba MCP: elegible, pendiente; oferta de 100 créditos.
- Página de oferta con sesión iniciada: 3 días (72 horas), 0 € hoy, tarjeta y verificación requeridas; renovación automática a Plus por 49 €/mes si no se cancela. La página general advierte de impuestos calculados en el pago.
- El texto de la oferta indica que cancelar la renovación conserva el acceso hasta el final de la prueba.
- No se ha activado ninguna oferta, contratado un plan ni enviado ninguna generación de este segundo estudio.
- Previsión de coste consultada, sin generar: un símbolo Recraft V4.1 en modo vector, resolución 2k, formato 1:1 cuesta 10 créditos; tres candidatos costarían 30 créditos sin reintentos. No es un presupuesto del pack entero.

Estas comprobaciones son anteriores a la autorización posterior del usuario, recogida a continuación.

## Activación y cancelación de renovación — 8 de septiembre de 2026

El usuario respondió «si, adelante» a la propuesta concreta de activar la prueba de 100 créditos y cancelar inmediatamente su renovación. Se pulsó una sola vez «Get FREE trial for €0» en la oferta MCP con sesión iniciada.

- Activación confirmada por el conector: plan Plus, saldo total 110, de los que 100 corresponden a la prueba y 10 eran previos.
- Fin de la prueba: 2026-09-11T13:09:21Z, equivalente al 11 de septiembre de 2026 a las 15:09:21 en Europe/Madrid.
- La pantalla de cuenta mostraba una renovación de 59,29 €/mes, frente a los 49 €/mes de la oferta inicial. No se autorizó ni se realizó esa renovación.
- Se pulsó «Cancel auto-renewal» y después «Cancel now».
- Confirmación visible: «Auto-renewal cancelled. Your access lasts until September 11.»
- Confirmación del conector: `free_trial.status = cancelled_by_user`, `trial_credits = 100`, `subscription_plan_type = plus`, saldo total 110, misma fecha de fin.
- Límite de producción autorizado: los 100 créditos gratuitos. No hay autorización para renovar, comprar créditos ni contratar otro plan.

## Primera revisión: nombres y paletas

Se han preparado tres propuestas nuevas: ButiPunt, ButiNexe y ButiLliga. Son propuestas del asistente a partir del encargo y del producto; no son respuestas de un modelo generativo de Higgsfield. Las láminas se renderizaron con el script oficial Brandkit en el sandbox remoto de Higgsfield y se publicaron como HTML y PNG. Ningún modelo de imagen o vídeo ha recibido todavía un trabajo en este segundo estudio.

- Saldo después de esta revisión: 110 créditos totales; 100 de prueba. Consumo observado: 0.
- No hay nombre, paleta, logo ni tipografía aprobados en el estudio nuevo.
- Estado inicial independiente, versión 1: solo contiene los tres ejes visuales con valor neutro 50. URL del estado confirmado: https://d2ol7oe51mr4n9.cloudfront.net/user_3J0WYuccflO7jGTnI72Q4ZUXo6i/b4dbec04-6089-4bbe-9d22-47d0ac5cc9af.json
- Se revisaron visualmente los tres PNG completos de 1200 × 900: textos legibles, colores y márgenes completos. El HTML puede adoptar una disposición muy estrecha en el panel lateral del navegador; el PNG es la referencia de revisión.
- Búsqueda web preliminar por los tres nombres exactos: resultados no concluyentes. No se declara disponibilidad de marca, dominio ni usuario social.
- Próximo paso pendiente de elección: guardar el nombre y la paleta seleccionados y generar tres símbolos Recraft V4.1 en modo vector. Después, selección de símbolo y tipografía, y producción del material solicitado.

## Selección de ButiPunt y primera generación de logos

El usuario seleccionó «ButiPunt claramente» tras la revisión de nombre y paleta. Se conserva esa propuesta con sus cinco colores exactos. La paleta está aprobada y persistida en el estado versión 2, confirmado en https://d2ol7oe51mr4n9.cloudfront.net/user_3J0WYuccflO7jGTnI72Q4ZUXo6i/5696a209-b6c8-4b97-ae83-99fa9d18090e.json. El estado anterior versión 1 ya no es el punto de restauración activo.

Se generaron tres símbolos originales con Recraft V4.1 a través del conector Higgsfield: «Punt propi», «Tanteig» y «Punt amunt». Cada trabajo usa modo vector, resolución solicitada 2k, formato 1:1, verde #245748 y coral #D7684F sobre papel #F8F3E8. Tres solicitudes independientes, un resultado por solicitud, sin imágenes de referencia. Los prompts y especificaciones completos están en `logos-propuestas-prompts.json`; los resultados, IDs, URLs y comprobaciones están en `logos-resultados.json`.

Los tres trabajos finalizaron correctamente, sin reintentos. Coste previsto y observado: 30 créditos. El saldo total pasó de 110 a 80. Restan 70 del presupuesto gratuito autorizado. El campo `trial_credits` del proveedor sigue marcando 100 después del gasto y no debe usarse como saldo restante; se controla la diferencia del saldo total y el presupuesto autorizado.

Se inspeccionaron las vistas renderizadas de los tres símbolos y sus fuentes SVG. Los tres SVG tienen lienzo 2048 × 2048, colores exactos de la paleta, formas vectoriales, sin texto adicional, ráster incrustado ni filtros. Se conservan las geometrías originales sin modificaciones. El modelo interpretó el primer símbolo como una P con remates serif y el tercero como una cinta más curva; esas interpretaciones se documentan para comparar los resultados reales, sin presentar una fidelidad al prompt que no existe.

Se ha mostrado una galería con exactamente los tres trabajos. Ningún logo está aprobado todavía; la siguiente decisión corresponde al usuario. El material de campaña y los vídeos siguen pendientes dentro del alcance original.

## Límites de la comparación (vigentes)

## Selección de símbolo y revisión tipográfica

El usuario eligió «1.», correspondiente a «Punt propi». Se aprobó el SVG original de Recraft mediante `approve_logo`; el estado actual es la versión 3, confirmado en https://d2ol7oe51mr4n9.cloudfront.net/user_3J0WYuccflO7jGTnI72Q4ZUXo6i/9df53617-d187-474d-bb86-c25965fe1649.json. El fingerprint geométrico del script oficial es `d22c8a621d75ea8a058fef049c0cfc546850de4e0634f981781f6036cc0ce477`.

Se exportó con el script oficial una referencia PNG transparente de 2048 × 2048 para las generaciones posteriores. No se cambió ningún color ni geometría. Referencia interna confirmada: media ID `84aa591b-b170-4051-84e4-edc0b30bdf77`, URL https://d2ol7oe51mr4n9.cloudfront.net/user_3J0WYuccflO7jGTnI72Q4ZUXo6i/84aa591b-b170-4051-84e4-edc0b30bdf77.png.

Se proponen tres combinaciones: DM Serif Display 400 + DM Sans 400; Fraunces 700 + Source Sans 3 400; Bodoni Moda 700 + Inter 400. Las seis familias se comprobaron en Google Fonts y se verificó la carga efectiva de sus FontFace antes de capturar las láminas. No hay tipografía aprobada todavía.

Las láminas se produjeron con el script Brandkit en el sandbox de Higgsfield. El asistente ajustó después la disposición HTML/CSS para colocar el símbolo junto al nombre y mejorar la comparación. El bloque SVG permaneció intacto. Se corrigió una superposición en una revisión preliminar y se publicaron nuevas URLs; solo los archivos de `tipografia-propuestas.json` son las láminas finales vigentes. Las tres capturas de 1200 × 700 se inspeccionaron visualmente: textos y etiquetas completos, misma escala de comparación y ninguna superposición.

El alcance pendiente sigue siendo finalizar la identidad y producir el pack de textos, gráficos y vídeos dentro del presupuesto autorizado. Esta revisión no utiliza modelos generativos de imagen.

## Límites de la comparación (vigentes)

Los modelos de generación reciben un prompt nuevo con referencias del producto, sin el material anterior. El asistente de esta conversación sí conserva el historial; por tanto no se afirmará una independencia cognitiva absoluta. Se documentará qué decisiones propone el asistente y qué contenido devuelve cada modelo de Higgsfield.

El conjunto completo de materiales continúa siendo el objetivo. La prueba no garantiza por sí sola saldo suficiente para todos los formatos y revisiones: se consultarán los costes antes de producir cada lote.

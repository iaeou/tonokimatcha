# Pase 2026-09-09c — Osaka sale de la home y se convierte en el muro de The Dignified Tree

Petición de Jaume, en sus palabras: "en section lineage, que la img de Osaka
aparezca de fondo en fundido (ocupando todo el ancho) con el scroll detrás de
la sección The Dignified Tree"; y después "en la home no tiene que aparecer" +
"en lineage un poco más difuminado para que se pueda leer el texto o sino que
otra solución?".

Esto cierra la decisión que el pase `b` dejó abierta en su apartado *Pendiente*:
sí, el heritage sale **del todo** de la home.

## Qué cambia en la home

El relevo de fondos del hero pasa de **tres manos a dos**: foto → figura de pie
(`wa`). La ciudad, que era la etapa del medio, ya no está.

- `hero-backdrop.ts`: `BackdropOpacities` ya no tiene `drawing`, y
  `BackdropGeometry` ya no acepta `closingHallTop` — nadie lo necesitaba una vez
  que la figura dejó de heredar la curva de retirada de la ciudad. La figura
  sube ahora en la curva en la que subía Osaka (`figureEntryViewports` 0.2 +
  `figureRiseViewports` 0.35, los antiguos `drawingEntry/drawingRise`) y se
  retira igual que antes con `finalHallTop` (el primer `.section__inner`).
  El ritmo del scroll no se movió: solo desapareció la etapa intermedia.
- `Hero.svelte`: fuera el `<img class="hero__drawing">` y la consulta a
  `#collection`. `--backdrop-presence` pasa a ser `figure` a secas en vez de
  `max(drawing, figure)`.
- CSS: fuera la regla `.hero__drawing` y su variante oscura. Variables
  renombradas porque ya no hay "drawing" que nombrar:
  `--hero-drawing-ink` → `--hero-ink`, `--hero-drawing-interlude` →
  `--hero-interlude`. `--hero-drawing-opacity` se elimina.
- `createInterludeInk` **se queda**: la figura de pie también lo multiplica.

## Qué cambia en /lineage

Osaka deja de ser un `<figure>` enmarcado dentro de `#threshold` y pasa a ser
el **muro a sangre completa de `#lineage`** (The Dignified Tree), a 100vw y
derivando contra el scroll.

- `Section.svelte`: prop nueva `backdrop` (snippet). Se renderiza **antes** del
  `section__figure-holder` y fuera de `section__inner`, envuelta en
  `.section__backdrop`, que rompe el padding inline de la sala con
  `left: 50%; width: 100vw; margin-left: -50vw` y recorta con `overflow: hidden`.
- `backdrop-parallax.ts` (nuevo): acción `use:backdropParallax`. Mismo patrón
  que `figure-drift` — ScrollTrigger con `scrub: true`, trigger el `.section`
  más cercano, GSAP importado en dinámico, `prefers-reduced-motion` deja un
  lavado estático. La acción es **dueña de `opacity` y del `yPercent`**; el CSS
  no toca ninguno de los dos.
- `#lineage` **pierde su `figure="samurai"`**. Regla del sitio: un dibujo por
  sala. Dos marcas de agua sobre el mismo párrafo se leen como mancha, no como
  profundidad.

## Legibilidad: la primera pasada no valía

Centrado y a 0.14, el skyline ponía su banda más densa —castillo, torres,
tejados— justo detrás de los párrafos. Bajar la opacidad a secas habría dejado
un dibujo invisible **y** un texto todavía sucio, así que el arreglo es de sitio
antes que de intensidad:

1. `object-position: center bottom`. La ciudad se apoya en el pie de la sala:
   la copy lee contra cielo abierto y el skyline es un horizonte **debajo**, no
   una textura **a través**.
2. Máscara doble intersectada, la misma pareja que usa el hero. La vertical la
   disuelve hacia arriba antes de los primeros párrafos (no hay borde donde se
   encuentra con la sala de arriba); la horizontal la adelgaza al 30% sobre la
   columna de copia y la deja entera en la derecha abierta.
3. Pico de opacidad **0.14 → 0.09** y deriva **16 → 9** yPercent (a 16 el
   skyline trepaba hasta el texto).

Alternativa descartada: portar `createInterludeInk` a la sala, que atenúa la
tinta mientras hay copia cruzando la banda de lectura. Funciona, pero es
maquinaria de scroll para una sola sala y con la máscara no hace falta. Si aún
molesta, la siguiente palanca es bajar el pico a 0.06 — no volver a subir la
opacidad y compensar con más máscara.

## Verificación

`TONOKI_MIRROR_ROOT` propio (el mirror por defecto vuelve a quedar huérfano de
otro uid): check **0 errores** + los 2 warnings de siempre de `CursorPointer`,
**138 tests** (137 pasan, 1 skip), build limpio.

`hero-backdrop.test.ts` reescrito para el relevo de dos etapas: 13 tests en vez
de 14, con uno nuevo — *"carries no Osaka stage"* — que falla si alguien vuelve
a añadir una tercera clave al objeto de opacidades. Es el guardarraíl de esta
decisión.

## Pendiente

- Que Jaume mire `/lineage` en vivo con el dev server. Los tres cambios de
  legibilidad se decidieron leyendo el CSS, no mirando la página.
- La home se queda sin la ciudad pero conserva la figura `wa`. Si algún día
  quiere el hero **solo** con la fotografía, el relevo ya está en dos manos y
  quitar la última es trivial.

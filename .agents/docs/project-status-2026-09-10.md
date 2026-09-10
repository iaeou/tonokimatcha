# Pase 2026-09-10 — el menú móvil: un shoji que barre bajo 760px

Petición de Jaume: "hay que preparar el menu móvil, cómo lo hacemos?". Dos
decisiones suyas al arrancar: **apertura shoji (barrido lateral desde la
derecha)** y **enlaces agrupados en dos bloques, The Tea / The House**.

## Qué había mal

No había menú. `.navigation__links` era `display: none` hasta el breakpoint de
760px y se volvía `flex` por encima: en un teléfono el header solo mostraba la
marca y el círculo de tema, y las seis salas del sitio no tenían ninguna puerta.

## Lo que hay ahora

`Navigation.svelte` monta, además del header, un `.nav-shoji`: una pantalla que
cubre el hall y entra desde la derecha. Dentro, dos grupos que repiten la
arquitectura de páginas del pase anterior:

- **The Tea** — `/#collection`, `/#ceremony`, `/#vessels`: lo que se mueve
  dentro de la home.
- **The House** — `/grower`, `/lineage`, `/request`: las salas propias.

Esa agrupación es el punto: en la fila del header los seis enlaces se leen
iguales, y no lo son. El rótulo de cada bloque dice si el enlace te mueve o te
lleva.

El tirador (`.nav-handle`) es la misma piedra redonda que `.theme-toggle` para
que los dos lean como par, con **dos trazos en vez de tres** — la mano dibujada
del lockup, no el hamburguesa de librería — y se pliegan en cruz mientras la
puerta está abierta.

## Las tres trampas

- **`lenis.stop()` no basta en móvil.** `createSmoothScrollOptions` lleva
  `syncTouch: false` (scroll táctil nativo, por los 60 FPS), así que pausar
  Lenis no detiene el dedo justo en los dispositivos para los que existe el
  menú. Hay que bloquear además el documento: `:root.is-menu-open` pone
  `overflow: hidden` en `html` **y** en `body`. Y para poder pausar Lenis hacía
  falta alcanzar la instancia viva, que era local a `initSmoothScroll()`: ahora
  `smooth-scroll.ts` la registra (`setActiveScroll`) y expone
  `pauseSmoothScroll` / `resumeSmoothScroll`, que son no-ops si el scroll suave
  nunca arrancó (reduced-motion, SSR). Con test.
- **El panel va DEBAJO del header, y como hermano suyo.** `.navigation` es
  `z-index: 10`, `.nav-shoji` es 9, y el `<div>` del panel se declara *antes*
  del `<header>` en el componente. Así la marca, el círculo de tema y el tirador
  siguen encendidos mientras la pantalla cruza — que es lo que hace que se lea
  como una puerta delante de la sala y no como un cambio de pantalla. Si el
  panel fuese hijo del header pintaría por encima de la marca.
- **Cerrar desde el `<nav>` es un warning de a11y.** Un `onclick` en el
  contenedor dispara `a11y_no_noninteractive_element_interactions` +
  `a11y_no_static_element_interactions`. El cierre va en cada `<a>`; el resto de
  salidas son Escape (que devuelve el foco al tirador), `afterNavigate` para
  atrás/adelante, y un `matchMedia('(min-width: 760px)')` que cierra al
  ensanchar, porque por encima del breakpoint el header ya muestra todo lo que
  el panel guarda. `inert={!open}` mientras está cerrado.

## Detalles de la puerta

- Fondo: `--color-void` + un lavado de `--color-moss` al 34% + celosía de
  hairlines verticales cada 33.3% en `--color-line`. Borde izquierdo de 1px y
  una sombra hacia fuera: el canto que lidera el barrido.
- La copy se apoya **abajo** (`justify-content: flex-end`), donde llega el
  pulgar, no centrada donde no llega. El `padding-top` reserva la altura del
  header (`2.25rem` + dos `--space-3`).
- Rótulos y nombres entran escalonados: cada `<li>` y cada `<p>` de rótulo lleva
  un `--i` inline y el delay se calcula `calc(var(--i) * 55ms + 180ms)`. Salen
  todos juntos al cerrar, para que nada quede flotando sobre una puerta que ya
  se va.
- `prefers-reduced-motion`: duraciones a 1ms y delays a 0. La puerta sigue
  existiendo, deja de viajar.
- Nombres en serif a `--step-1` con hairline inferior: el mismo rayado con el que
  están regladas las salas, para que la lista lea como un registro de salas.

## Verificación

`TONOKI_MIRROR_ROOT=$HOME/tonoki-mirror` (el mirror por defecto de `/tmp` volvió
a quedar de otro uid): **140 tests** (139 pasados, 1 saltado), `check` con 0 errores y solo los 2 warnings
de siempre de `CursorPointer`, build limpio.

**No se ha visto en un dispositivo.** El navegador de Claude alcanza el
`localhost` del Mac, no el de la VM donde corre el dev server, y la IP de la VM
no es enrutable desde el Mac: la revisión visual la hace Jaume con `npm run dev`.

## Pendiente

- Que Jaume mire el barrido en un teléfono real: la duración (640ms) y el
  escalonado (55ms por línea) están elegidos a ojo contra el pulso del resto del
  sitio, no medidos.
- Sin decidir: si el panel abierto debe apagar el Magatama del `webgl-stage`.
  Ahora sigue girando detrás de una pantalla opaca, gastando GPU en un móvil sin
  que nadie lo vea.

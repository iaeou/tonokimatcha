# Pase 2026-09-09b — la home se queda con el producto; heritage y pedido salen a páginas

Petición de Jaume, en sus palabras: "The guardian la pones dentro de CLUB y la
sección CLUB pasa a llamarse REQUEST"; "The threshold se fusiona con LINEAGE y
pasan a ser una página aparte (con el nombre LINEAGE)".

## Qué había mal

Dos duplicados, no dos secciones de más:

- `#guardian` en la home era un párrafo cuyo único contenido útil era el enlace
  a `/club`, y `/club` abría con eyebrow **The Guardian**. La misma petición
  contada dos veces, y "Club" prometía una membresía que no vendemos.
- **The Threshold** no era una sección: era el eyebrow + h1 del hero. Con
  **The Lineage** a mitad de scroll, el heritage estaba partido en dos mitades
  con tres salas de producto en medio.

## Estructura nueva

Home: **Hero → The Leaf → How To Use → The Vessels → banda de cierre**.
Páginas: `/grower`, `/lineage`, `/request`, `/legacy`.

- **`/request`** (antes `/club`): eyebrow The Guardian, título By Request, la
  copy de la vieja sección `#guardian` fusionada con la del club, más
  `MembershipForm`. `/club` sigue existiendo con un `+page.ts` que hace
  **redirect 308** — el `.svelte` se queda como stub porque **los mounts de
  Cowork no dejan borrar ficheros**.
- **`/lineage`**: `#threshold` (heritage-section, figura `wa`) + `#lineage`
  (figura `samurai`). El skyline de Osaka va aquí como figura mirable
  (`.lineage-skyline`): sin multiply, sin máscara, sin copy encima, invertido
  en oscuro. En la home **sigue** de fondo del hero — nunca dijo que la hoja
  creciera en Osaka y es la única profundidad que tiene ese encuadre.
- **Banda de cierre** `#request` en la home: `aside.closing-cue`, una línea y
  un enlace. **A propósito NO es un `.section`** — una sala aquí sería el
  Guardian otra vez: 90svh de repetición delante de un enlace.

## Hero

Eyebrow **The Tea**, h1 **"One field, one harvest, one tea."**, subtítulo
reescrito (empieza por "Organic first-flush leaf…"), cue a `#collection`.
`threshold-title` → `hero-title` (id y `aria-labelledby`). El relevo de fondos
(foto → dibujo → figura) queda **intacto**: es atmósfera, no copy, y tocarlo
arrastraba `hero-backdrop.ts` y sus tests sin que nadie lo pidiera.

## Arrastres que había que tocar

- **Anclas**: `/#lineage` y `/#guardian` no se pueden redirigir desde el
  servidor. La home los captura en `onMount` (`MOVED_ANCHORS`) y hace `goto`
  con `replaceState`.
- **Farewell del magatama**: `trigger` pasa de `#guardian` a `#request` (la
  banda es ahora lo último de la página). Test actualizado.
- `.heritage-section` (constelación Kofun) ya no existe en la home; vive en
  `/lineage`, `/grower` y `/legacy`. Ya era así en `/club`, no es un caso nuevo.
- Nav: `Lineage` → `/lineage`, `Club` → `Request` → `/request`. Sigue habiendo
  seis entradas.
- `/legacy` enlazaba a `/club` en su panel de guardián: apuntado a `/request`.
- Comentario de `hero-backdrop.ts` que decía que la etapa de la figura acaba en
  `#lineage`: el código siempre usó la copy de la primera sala. Corregido.

## Verificación

`NODE_ENV=development` + `TONOKI_MIRROR_ROOT=/tmp/tonoki-mirror-$(id -u)`
(el mirror por defecto quedó huérfano de otro uid otra vez):
check 0 errores + los 2 warnings de siempre de `CursorPointer`, **138 tests**,
build limpio. Commit `f84f315`, pusheado a `origin/main`.

## Pendiente

- Que Jaume mire `/lineage` en vivo: el skyline a 52rem sin máscara no se había
  visto nunca así, y las dos salas seguidas pueden pedir un puente de copy.
- Decisión abierta: si quiere el heritage **fuera del todo** de la home, el
  siguiente paso es quitar el dibujo de Osaka y la figura `wa` del relevo del
  hero — eso sí toca `hero-backdrop.ts` y sus tests.

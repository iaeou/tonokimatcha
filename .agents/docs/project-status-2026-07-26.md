# Tonoki Matcha Project Status

Date: 2026-07-26

## Summary

The View Transitions API became the sanctuary's movement system rather than a single effect on the theme toggle. Every transition is now *typed*, three new rooms were opened (`/legacy`, the vessel halls, The Ceremony), and the vessel cards were given a spoken invitation plus a symmetrical open/close gesture.

Commits: `88e38b0`, `936b767`, `664547b`, `08a0053`, `68f9e67`, `1c7d247`, `d6f7965`.

## The Transition System

All of it lives in `src/lib/animations/view-transitions.ts`.

### Types, mirrored onto an attribute

`startTypedViewTransition({ update, types })` tags each transition as `theme`, `forward`, `backward`, `vessel`, or `ceremony`, and writes that type to `document.documentElement.dataset.viewTransition` for the duration. **The attribute exists because `:active-view-transition-type()` is newer than the API itself** — keying the CSS off the pseudo-class would silently drop the choreography in browsers that can still run the transition. Every rule reads `:root[data-view-transition='…']`. The attribute is deleted when `transition.finished` settles.

Everything degrades to an instant update when the API is missing or `prefers-reduced-motion: reduce` is set.

### `theme` — the blurred circle

An SVG radial-gradient mask animated by `circle-blur-reveal`, grown from the toggle. Mask size and position animate together so the circle stays centred on the press instead of drifting as the image grows. Origin comes from `--reveal-x` / `--reveal-y`, set by `setRevealOrigin()`.

### `forward` / `backward` — room to room

Direction is derived from path depth by `getNavigationDirection()`; a browser back gesture always reads as backward, whatever the paths. The old room recedes and lifts, the new one rises; going back reverses it.

Header, brand, toggle, footer and the certification seal take a `view-transition-name` **only while navigating**. Naming them permanently would carve them out of the root snapshot and punch a hole in the theme circle. The WebGL stage is excluded from the snapshot entirely (`view-transition-name: none`) so the Magatama keeps rendering instead of freezing as a flat image mid-fade.

### `vessel` — the card opens

Shallow routing: `pushState('/vessels/<slug>', { vessel })` with `page.state.vessel`, so the URL stays linkable and the back gesture closes it. `/vessels/[slug]` also exists as a real hall for direct visits and for no-JS. The card's photograph and the panel's share a per-slug name and morph between them; `.vessel-detail__body` has its own name so the record rises on open and settles on close.

### `ceremony` — the four movements

The step panel swaps behind the same circle-blur mask, grown from the numeral pressed. **The state change must be flushed with `await tick()` inside the callback** — Svelte updates the DOM after a microtask, so the snapshot would otherwise capture the outgoing step.

### The one-name-per-snapshot rule

Two elements sharing a `view-transition-name` in a single snapshot abort the whole transition. Two places depend on this:

- The footer seal only claims `legacy-seal` when the hall's own seal is absent — `:not(:has(.legacy-seal))`.
- A vessel card yields its per-slug name whenever a `.vessel-detail` is on screen.

## New Rooms

### `/legacy` — Eternal Legacy

`#scarcity`, `#certification`, `#privacy`. This closes a real gap: the three footer links all pointed at `/club`, which discusses none of them. "Legacy" also joined the primary navigation.

**The privacy copy is provisional and says so on the page.** Before publishing it must name the data controller, the retention period, and the supervisory authority. The scarcity figures are Jaume's to confirm.

### `/vessels/[slug]` — the vessel halls

Vessel data moved out of `+page.svelte` into `src/lib/data/vessels.ts` (`Vessel`, `vessels`, `findVessel`) so the card and its detail cannot drift apart. Each vessel gained Contents / Material / Keeping / Intent marks. An unknown slug 404s.

### `#ceremony` — The Ceremony / Four Movements

碗を温める / 篩う / 点てる / 供する. **Timings and temperatures are placeholders** pending confirmation against how the tea is actually served.

## The Vessel Card Affordance

Jaume's call, 2026-07-26: a permanent action line, not a hover-only hint — hover does not exist on touch.

Each card carries `OPEN THE VESSEL →` in gold, reusing the existing `.text-link`. The card is a flex column so the three action lines sit at the same height and read as one row rather than three afterthoughts trailing paragraphs of different lengths.

The whole card is the target, but only the action line is focusable: its `::after` is stretched across the card, giving one link, one focus ring, and a real URL in the context menu. **That `::after` needs `z-index: 1`** — the hover `scale(1.02)` on the photograph gives the image its own stacking context and would otherwise swallow clicks meant for the link. This was a live bug: clicking the photo did nothing while clicking the text worked.

Opened, the photograph becomes a real `<button>` labelled "Close the vessel", so it answers the keyboard. The ground around the panel closes too, and Escape closes from anywhere.

## Scroll Restoration on Close

Smooth scrolling runs the page from its own loop, so the browser's restoration on the way back landed at the top instead of the grid.

The fix has a subtlety worth keeping: the position must be restored **inside** the transition callback, after awaiting the `popstate`, not after the transition. Restoring it afterwards means the incoming snapshot is captured with the page at the top, the destination card is nowhere on screen, and the closing morph has nothing to travel to — which is exactly what made closing feel like a cut. The browser's own back gesture never passes through `close()`, so an effect covers that path separately.

## Files Touched

- `src/lib/animations/view-transitions.ts`, `view-transitions.test.ts` — new.
- `src/lib/data/vessels.ts`, `vessels.test.ts` — new.
- `src/lib/components/Ceremony.svelte`, `VesselDetail.svelte` — new.
- `src/routes/legacy/+page.svelte`, `src/routes/vessels/[slug]/{+page.svelte,+page.ts}` — new.
- `src/routes/+page.svelte` — vessel opening/closing, scroll restoration, Ceremony section.
- `src/routes/+layout.svelte` — typed, directional navigation.
- `src/lib/stores/theme.ts` — delegates to the shared helper.
- `src/lib/components/{Footer,Navigation}.svelte` — legacy links, the seal.
- `src/lib/styles/main.css` — transition choreography, vessel detail, ceremony, `.visually-hidden`. The orphaned untyped `tonoki-hall-exit/enter` rules were removed.
- `src/app.d.ts` — `App.PageState.vessel`.

## Verification

`npm test` — 92 passing, 1 skipped (13 files). New coverage: navigation direction, type mirroring, vessel data integrity.

`npm run build` — clean. `npm run check` — only the 3 standing errors (`Scene.svelte` RoomEnvironment type resolution, two `esbuild --outdir` style quirks).

Server-rendered routes checked against a preview build: `/`, `/legacy`, `/vessels/sachet` → 200, `/vessels/teapot` → 404. Open, close, Escape, photo-click and scroll restoration verified in the browser.

## A Local Note

Two dev servers on port 5173 at once will serve HTML from one and modules from the other; the client bundle then fails to load and **every** effect dies at once — cursor, GSAP, Lenis, transitions. If the site suddenly looks inert, check `lsof -ti:5173` before suspecting the code. Starting with `--strictPort` makes the collision loud instead of silent.

## Still Open

- Real product photography; legal review of the privacy text; confirmation of the ceremony timings and the scarcity figures.
- `CursorPointer.svelte` mutates `dot` and `ring` without `$state(...)` — Svelte 5 warns on every build. Pre-existing, not yet triaged.
- Carried over: Jaume's eye on the six third-pass effects (delete `rise`/`breath` once approved); `JADE_BELL_TUNING` timbre + mute toggle; `/club` backend with Supabase + invitation codes.

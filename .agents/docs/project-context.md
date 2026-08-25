# Tonoki Matcha Digital Sanctuary

Tonoki Matcha is planned as a high-end SvelteKit digital museum for a luxury matcha brand rooted in Japan's Kofun era. The experience should prioritize restraint, negative space, ceremonial language, and invitation-only access rather than commerce.

## Technical Direction

- Framework: SvelteKit.
- Graphics: Three.js/WebGL, progressively enhanced.
- Animation: GSAP and ScrollTrigger for high-end transitions.
- Styling: Vanilla CSS with custom properties. No Tailwind or Bootstrap.
- Performance: mobile-first, 60 FPS target, optimized static media.

## Content Architecture

- The Threshold: landing hero with cinematic Kofun atmosphere and Magatama focus.
- The Lineage: heritage narrative around Tonoki-no-muraji, the Dignified Tree, Haniwa, Sueki, and Daisenryo Kofun.
- The Leaf: a single degree, Tonoki Ceremonial. There is no product ladder — one tea, highest grade only.
- The Vessels: three presentations of that same tea — 2 g individual sachet (A, sold loose from a 100-sachet minimum or inside the tube), refined paper tube of 25 sachets (B), 30 g hermetic pouch (C).
- The Ceremony: three ways to prepare the same 2 g — Cold (sachet into a 33 cl bottle, shake hard, keeps a day in the fridge), Hot (same gesture in an insulated bottle at ~80 °C), and Ceremony (the long way: warm the bowl, sift, whisk, serve). The two everyday ways are written plainly on purpose; ease of preparation is a selling point of the sachet, not a compromise. Timings and temperatures are provisional pending Jaume's confirmation.
- The Guardian: custom request, Tonoki Club, and B2B ambassador flow.
- Eternal Legacy: legal, certifications, scarcity policy, and closing sign-off. Lives at `/legacy` with `#scarcity`, `#certification`, and `#privacy`; the privacy copy is explicitly provisional pending legal review.

## Current Implementation Snapshot

Last reviewed: 2026-08-25.

The project is now a working SvelteKit baseline with:

- Global layout rendering a fixed Three.js scene behind the page content.
- Navigation lockup (2026-08-25): the header is Jaume's drawn logo, not set type. Master artwork is `static/matchaTonoki-logo.svg` (934×705, 36 outlined paths; wordmark + kanji share fill `#241813`, the stone uses its own greens plus outline `#070605`). Four derived files: `matchaTonoki-logo-nav.svg` / `…-nav-dark.svg` (kanji dropped, stone scaled to the two-line height and moved to the **left** of the words) and `matchaTonoki-kanji.svg` / `…-kanji-dark.svg` (the character on its own, standing to the right of the lockup). Ink is `#241813` on light, `#f4efe4` on dark; everything else is identical between a pair. Both variants of both marks are in the DOM and CSS hides one set per `data-theme` via `.navigation__brand--light/--dark` — `<img src>` cannot be switched from CSS, and fetching on first toggle would blink the brand out mid theme-reveal. Everything sits at `2.25rem`, what the old two-line wordmark occupied; at that height the kanji's crown meets Matcha's cap and its foot meets Tonoki's baseline. Regenerate all four from the master; never hand-edit a variant.
- **The packaging no longer matches the header** (2026-08-25). `packaging-branding-2026-08-24.py` composited the *previous* lockup — faceted low-poly `magatama-mark.svg` plus Cormorant Garamond type — onto the tube and both pouches. The header now carries the illustrated rounded stone and outlined geometric lettering. `magatama-mark.svg` is still live for that script. Closing the gap is a separate pass; see `project-status-2026-08-25.md`. Related and open: the WebGL hero bead is still the faceted stone, so two drawings of the same object appear on one page.
- Brand order is still split: the header and packaging say **Matcha Tonoki**, while the footer, hero copy and page titles say *Tonoki Matcha*. Unresolved — do not "fix" either side without Jaume.
- Navigation, footer, landing content, club request route at `/club`, the Eternal Legacy hall at `/legacy`, and a hall per presentation at `/vessels/[slug]`.
- Vessel data lives in `src/lib/data/vessels.ts` (`Vessel`, `vessels`, `findVessel`) so the landing card and its detail panel cannot drift apart. Slugs are both the URL and the `view-transition-name`, so a collision would break deep links *and* abort the morph — there is a test guarding uniqueness.
- Vessel cards carry a permanent action line, `OPEN THE VESSEL →` (Jaume's call, 2026-07-26: hover does not exist on touch, so the invitation must be visible at rest). The whole card is the target via an `::after` stretched from that link, which needs `z-index: 1` to sit above the photograph's hover `scale()`. Opened, the photograph is a `<button>` that closes the vessel.
- Single-product model (2026-07-25): the landing page carries `#collection` ("The Leaf / A Single Degree", one `.leaf-panel` for Tonoki Ceremonial, cert `TKC-0001`) and `#vessels` ("The Vessels / Three Presentations", `.vessel-card` grid for the 2 g sachet, 25-sachet tube, and 30 g pouch, kanji 器). Quality and packaging are deliberately separate sections — collapsing them back into one grid reintroduces the "three degrees" misreading. The `#collection` anchor is retained for inbound links. Packaging photos in `static/images/packaging/` are unbranded supplier samples pending real photography.
- Vanilla CSS theme system with **light as the default** (Jaume's call on 2026-07-25: the sanctuary opens in daylight paper). Only an explicit toggle press is persisted, under `localStorage['tonoki-theme-choice']`, and an inline `app.html` script applies it before first paint (no FOUC). Store in `src/lib/stores/theme.ts` (`DEFAULT_THEME`, `STORAGE_KEY`). The legacy `tonoki-theme` key auto-persisted resolved defaults, pinning returning visitors to a stale theme, so `initialize()` deletes it on load. Never persist a theme the visitor did not choose — otherwise future default changes can never reach anyone who already visited.
- Fluid typography tokens and Google webfont stacks with system fallbacks in `src/lib/styles/typography.css`.
- Procedural Magatama geometry with a stout-comma bezier silhouette, circular suspension hole, and centralized tuning in `src/lib/three/magatama-tuning.ts`. The current material uses translucent mid-hisui jade (`color: 0x2e6b3e`, `opacity: 0.3`, `roughness: 0.2`, `transmission: 0.5`, `thickness: 0.3`, `ior: 1.61`, `clearcoat: 0.9`) and renders at restrained museum proportions via reduced scene scales (~45% viewport height on desktop).
- Procedural HDRI environment (`RoomEnvironment` baked through `PMREMGenerator` into `scene.environment`, no external `.hdr` asset) so the Magatama's `transmission`/`clearcoat` refract real lighting. Intensity and Y-rotation tunable under `MAGATAMA_TUNING.environment`.
- Postprocessing chain via pmndrs `postprocessing`: `EffectComposer` (`frameBufferType: HalfFloatType`, canvas transparency preserved) with a `RenderPass` and one `EffectPass` combining `BloomEffect` (luminance threshold above the cream stage so only jade highlights glow) and a premultiplied `NoiseEffect` film grain that leaves transparent pixels untouched. All knobs under `MAGATAMA_TUNING.postprocessing`; pure creators (`createEnvironmentSettings`, `createBloomOptions`, `createGrainOptions`) in `scene-config.ts` are unit-tested.
- GPU particle system using custom vortex shaders for earth-to-jade lineage transition.
- GSAP hero reveal, Magatama floating animation, ambient pointer rotation, drag-only multi-axis Magatama rotation, and ScrollTrigger links.
- Lenis smooth scrolling via `src/lib/animations/smooth-scroll.ts`: lazily imported, GSAP ticker drives `lenis.raf`, `ScrollTrigger.update` on scroll, `anchors: true` for in-page cues, native touch scrolling preserved (`syncTouch: false`), fully disabled under `prefers-reduced-motion`. Tuning lives in `createSmoothScrollOptions()`.
- View Transitions are centralised in `src/lib/animations/view-transitions.ts`. Every transition is *typed* (`theme`, `forward`, `backward`, `vessel`, `ceremony`) and the type is mirrored onto `documentElement.dataset.viewTransition`, because `:active-view-transition-type()` is newer than the API itself and would silently drop the styling in browsers that can still run the transition. All CSS keys off `:root[data-view-transition='…']`.
  - Theme swap (`theme`): a blurred circle grows from the toggle, an SVG radial-gradient mask animated by `circle-blur-reveal`. Size and position animate together so the circle stays centred on the press; origin comes from `--reveal-x` / `--reveal-y` via `setRevealOrigin()`.
  - Navigation (`forward` / `backward`): direction is derived from path depth, with a browser back gesture always reading as backward. Header, brand, toggle, footer and the certification seal take `view-transition-name` **only during navigation** — naming them permanently carves them out of the root snapshot and punches a hole in the theme circle. The WebGL stage is excluded from the snapshot (`view-transition-name: none`) so the Magatama keeps rendering instead of freezing as a flat image.
  - Vessels (`vessel`): opening a vessel is shallow routing (`pushState` + `page.state.vessel`) so the URL stays linkable and the back gesture closes it; the card's photograph and the panel's share a per-slug name and morph. `/vessels/[slug]` also exists as a real hall for direct visits and no-JS. A card yields its name whenever a detail is on screen — one name may only be claimed once per snapshot, or the whole transition aborts.
  - Ceremony (`ceremony`): the movements swap with the same circle-blur mask, grown from the numeral (or the way) pressed. Switching way resets `index` to 0 — step four exists only in the long way. The state change is flushed with `await tick()` inside the transition callback, otherwise Svelte's async DOM update lands after the snapshot.
  - Closing a vessel restores the reading position **inside** the transition callback, after awaiting the `popstate` — smooth scrolling means the browser's own restoration lands at the top. Restoring afterwards leaves the incoming snapshot captured at the top of the page, the destination card off screen, and the closing morph with nowhere to travel; that is what makes closing feel like a cut. The browser's back gesture never passes through `close()`, so an effect covers that path.
  - Everything degrades to an instant update where the API is missing or `prefers-reduced-motion: reduce` is set.
- Focused Vitest coverage for theme logic, hero animation options, Three.js config, Magatama geometry, particle attributes, navigation direction, transition-type mirroring, and vessel data integrity.
- Branded webfont pairing — Cormorant Garamond for English ceremonial display, Noto Serif JP as the mincho heritage fallback, and Zen Kaku Gothic New + Inter for body/UI text — loaded via Google Fonts with `preconnect` and `display=swap`.
- Vite manualChunks splits `three` and `gsap` into their own async chunks so the initial page shell loads independently of WebGL.
- Typography reveal via `src/lib/animations/typography-reveal.ts` (`typographyReveal` Svelte action). The live mode is `sumi`: per-letter blur/opacity/scale reveal (ink crystallising on washi), used on the hero h1/eyebrow and all Section h2s/eyebrows; h2s also draw a `kintsugi` gold seam (deterministic SVG `pathLength` dashoffset). Legacy `rise`/`breath` modes remain in the module but are unused, pending deletion after Jaume's sign-off. IntersectionObserver-triggered once, reduced-motion-safe, synchronous pre-hide.
- Ghost kanji watermarks (樹/玉/陵) behind each Section headline via `kanji-drift.ts` — huge Noto Serif JP characters scrubbed 0 → 7% opacity → 0 with a downward drift across the section.
- Reading-band focus via `focus-scrub.ts` on section bodies: paragraph-like elements scrub opacity 0.24 → 1 between `top 92%` and `top 58%`, 1:1 with scroll.
- Scroll-reactive scene: the camera dollies along `createCameraPath()` (damped offsets, `animation.cameraDolly`), and scroll velocity briefly boosts bloom/grain/particle size (`MAGATAMA_TUNING.velocity`).
- Kofun constellation: while scrolling The Lineage, the lineage particles migrate into the Daisenryō keyhole silhouette (`createKofunConstellationPositions`, `aKofun` attribute, counter-rotated via `uKofunCancelY` to face the visitor), peaking mid-section and dissolving on exit. Tuning under `particles.kofun`.
- Pointer wind: the particle cloud parts around the cursor (gaussian falloff in `vortex.vert`, `particles.wind` tuning), gentler while the constellation holds.
- Sonic Magatama: dragging the bead strikes quiet jade-bell tones — `src/lib/audio/jade-bell.ts`, Tone.js FMSynth → -16 dB → 5.5 s reverb, D-minor pentatonic picked by pointer height, strikes gated by drag distance + time. Tone.js loads lazily on the first grab (gesture unlocks the AudioContext). Timbre knobs in `JADE_BELL_TUNING`.
- Ceremonial cursor trail: `CursorTrail.svelte` fixed-canvas overlay + pure logic in `cursor-trail.ts` — gold ink motes dissolve behind fine pointers; disabled for touch and reduced motion.
- The latest visual reference is `.agents/docs/magatama-reference-geometry-2026-05-26.jpg`; older transient WebGL screenshots were removed to keep the agent docs focused.

## Known Local Development Note

Only ever run **one** dev server on port 5173. Two at once serve the HTML from one instance and the client modules from the other; the bundle then fails to load and every effect dies together — cursor, GSAP, Lenis, transitions — with nothing wrong in the source. If the site suddenly looks inert, check `lsof -ti:5173` before suspecting the code, and start with `--strictPort` so a collision is loud rather than silent.

The workspace path contains `##`:

`/Users/jasubal/WORKS/##ILLA/tonokimatcha/*tonokimatcha.com`

`npm run check` works from the real project path. Vitest, Vite build, preview, and local dev server runs must execute from a clean mirror path because Vite can mis-resolve `#` in URLs.

The npm scripts now automate that mirror through `scripts/run-clean-path.mjs`, so these commands are safe from the real project path:

```sh
npm test
npm run build
npm run dev
```

The runner syncs the source tree to `/tmp/tonoki-matcha-dev-src`, installs dependencies there with `npm ci` when `package.json` or `package-lock.json` changes, and then runs the requested local binary from the mirror. Extra arguments still work, for example `npm test -- src/lib/stores/theme.test.ts` or `npm run dev -- --port 5174`.

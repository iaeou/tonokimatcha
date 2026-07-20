# Tonoki Matcha Project Status (third pass)

Date: 2026-07-20 (late session)

## Summary

Visual-language overhaul (`89dc00e`): Jaume didn't like the rise/breath typography, so headlines now surface as sumi ink; plus scroll-reactive reading, a scrolling camera dolly, velocity-reactive postprocessing, pointer wind through the particles, and a ceremonial cursor trail.

## Completed

- **Sumi reveal** — new `'sumi'` mode in `typography-reveal.ts` (`createSumiRevealOptions`, `splitElementIntoLetterSpans`): per-letter blur 9px → 0 / opacity 0 → 1 / scale 1.045 → 1 with 0.045 s stagger; letters crystallise like ink drying on washi. Hero h1/eyebrow and Section h2/eyebrow now use sumi (kintsugi seam preserved on h2s). `rise`/`breath` modes remain in the module but are unused — delete once Jaume signs off.
- **Focus scrub** — `focus-scrub.ts` action on `.section__body`: every `p/li/dt/dd` scrubs opacity 0.24 → 1 across a reading band (`top 92%` → `top 58%`), 1:1 with Lenis. Reduced motion: full ink, static.
- **Camera dolly** — the previously unused `createCameraPath()` now drives the camera: path offsets (relative to the path origin) scaled by `animation.cameraDolly.strength`, added to the responsive base position, damped lerp 0.055. Scrubbed by global scroll progress.
- **Velocity reactivity** — `MAGATAMA_TUNING.velocity`: ScrollTrigger `getVelocity()` normalised by 2600 px/s into a decaying impulse (0.93/frame) that boosts bloom intensity (+0.55), grain opacity (+0.1) and particle size (+0.4) while scrolling fast.
- **Pointer wind** — `particles.wind` tuning + `uWindCenter/uWindRadius/uWindStrength` in `vortex.vert`: cursor is raycast onto the z=0 plane, converted to particle-local space, damped; particles are pushed along a gaussian falloff (radius 1.35, strength 0.6), at 40% strength while the Kofun constellation is formed. Confirmed visually — the cloud parts around the cursor.
- **Cursor trail** — `cursor-trail.ts` (pure: `createTrailPoint`, `stepTrailPoints`, `shouldEnableCursorTrail`) + `CursorTrail.svelte` fixed-canvas overlay in the layout: gold ink motes (uses `--color-gold`, theme-observed) spawn per ~9 px of travel, drift and dissolve in 0.9 s, capped at 160. Fine pointers only; off under reduced motion.

## Verification

Mirror: vitest 64 passed + 1 skipped (DOM-gated letter-split test — vitest env is node, no jsdom), svelte-check 0/0, build ✓. In-browser: sumi headlines sharp after reveal, kintsugi intact, focus dim visible below the reading band, wind clearing visible around the cursor, no console errors. Trail motes too short-lived to screenshot (0.9 s) — code path verified by the wind overlay running and zero errors.

## Notes

- Mirror node_modules drifted after the `tone` install → `ERR_MODULE_NOT_FOUND` in vitest. Fix: full `rsync -a --delete` of node_modules into `/tmp/tonoki-matcha-dev-src`.
- If Jaume dislikes any effect, each has a single tuning point: sumi (`createSumiRevealOptions`), focus band (`createFocusScrubOptions`), dolly (`animation.cameraDolly`), velocity (`MAGATAMA_TUNING.velocity`), wind (`particles.wind`), trail (`CURSOR_TRAIL_TUNING`).

## Still Open

- Jaume's eyeball pass on all six effects (esp. sumi timing and dolly amplitude) + ear-check of the jade bell.
- Remove dead `rise`/`breath` modes after sign-off.
- Real Kofun media, Haniwa/Sueki `.glb`, provenance visuals, SEO, accessibility QA, deployment.
- Pinned horizontal Collection gallery; Supabase `/club` backend (next roadmap item); i18n; certificate/QR; ambient audio toggle.

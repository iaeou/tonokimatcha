# Tonoki Matcha Project Status

Date: 2026-05-25

## Summary

Tonoki Matcha is now a working SvelteKit digital sanctuary baseline with a luxury museum tone, real Google webfonts, procedural WebGL atmosphere, a reference-shaped Magatama bead, typography reveals, theme-aware particles, and a guarded club request route at `/club`.

This pass also resolved the local tooling issue caused by the workspace path containing `##` and `*`: Vite/Vitest commands now run through a clean-path mirror wrapper from normal npm scripts.

## Completed Since 2026-05-24

- Added clean-path npm tooling through `scripts/run-clean-path.mjs`.
- Routed `dev`, `build`, `preview`, and `test` through the mirror runner.
- Added Google Fonts loading in `src/app.html`.
- Replaced local-only font aliases with real webfont stacks:
  - Display/heritage: Cormorant Garamond, with Noto Serif JP as the mincho fallback.
  - Body/UI: Zen Kaku Gothic New, with Inter as the Latin UI fallback.
- Added Vite manual chunk splitting for `three` and `gsap`.
- Added `typographyReveal` action:
  - `rise` word-mask reveal for h1/h2 headings.
  - `breath` letter-spacing reveal for eyebrow labels.
  - IntersectionObserver trigger instead of ScrollTrigger for typography reveal timing.
  - Reduced-motion fallback.
- Fixed the disappearing heading bug by removing ScrollTrigger from typography reveal and resetting parsed GSAP `y` transforms.
- Updated light-mode particles to a softer but visible matcha/jade field.
- Added drag-only multi-axis Magatama rotation with raycast start detection.
- Reworked the procedural Magatama geometry to match the attached reference bead:
  - Taller comma silhouette.
  - Broad rounded head.
  - Narrow inward waist.
  - Rounded lower tail.
  - High, near-center oval aperture.
  - Thicker extrusion and smoother bevels.
- Renamed the private request path from `/private-club` to `/club`.
- Updated navigation and landing CTA links to `/club`.
- Added verification screenshot:
  - `.agents/docs/magatama-reference-geometry-2026-05-25.png`

## Current Verification

Latest verification from the real project path:

```sh
npm test
npm run check
npm run build
```

Results:

- `npm test`: 5 files passed, 32 tests passed.
- `npm run check`: 0 errors, 0 warnings.
- `npm run build`: passed.
- Browser checks:
  - WebGL canvas renders.
  - Typography reveal no longer leaves headings hidden.
  - Dragging the Magatama hit area enters and exits drag mode cleanly.
  - Google Fonts stylesheet and active font files load with HTTP 200.

Known browser note:

- `/favicon.ico` returns 404. This is harmless for the current baseline but should be handled before production.

## Subsequent Updates (post 32-test verification)

After the verification above, two further changes landed:

### Typography reveal — refactored API for IntersectionObserver

`src/lib/animations/typography-reveal.ts` now exports three additional helpers used by the test suite to lock in the IntersectionObserver-based trigger:

- `createRevealObserverOptions()` — returns `{ root: null, rootMargin: '0px 0px -18% 0px', threshold: 0 }`. This is the IO equivalent of GSAP ScrollTrigger's `start: 'top 82%'`.
- `createRiseHiddenState()` — returns `{ y: 0, yPercent: 110 }`. The explicit `y: 0` reset prevents the synchronous inline `transform: translateY(110%)` from surviving in GSAP's tracker as a stale pixel offset, which would have left words mis-positioned after the reveal.
- `observeReveal(node, callback)` — sets up the IO in the browser, fires the callback synchronously in environments without `IntersectionObserver` (Vitest node env), returns a cleanup function.

The action body now uses `observeReveal(node, () => tl.play())` against a `paused: true` timeline. No more `gsap/ScrollTrigger` import inside the typography module. `Scene.svelte` still imports ScrollTrigger for its own scroll-rotation and vortex scrub — unrelated.

### Magatama — second adaptation round (deep stone bezier)

Replaced the Magatama silhouette and material with a user-supplied snippet that pushes the design from "bright Hisui glow" to "dense dark jade stone".

Silhouette: `createMagatamaShape()` rewritten as six cubic beziers walking from `(0, 1.8)` clockwise around a stouter, more rounded comma. Suspension hole is now a true circle (`new Path().absarc(-0.16, 0.9, 0.24, 0, Math.PI * 2, true)`) instead of an ellipse. Width-to-height ratio sits near 0.85 (was ~0.68); bounding box grew from ~2.4×2.8 to ~3.5×3.9.

Extrude: `depth: 0.6`, `bevelThickness: 0.16`, `bevelSize: 0.16`, `bevelOffset: 0`, `bevelSegments: 8`, `curveSegments: 96`, `steps: 2`. Thicker front-to-back than before, coarser bevel (8 vs 48 segments — fewer polygons, slightly sharper bevel crease).

Material: `color: 0x072411` (near-black moss green), `roughness: 0.12`, `metalness: 0`, `clearcoat: 0.9`, `clearcoatRoughness: 0.08`, `transmission: 0.5`, `thickness: 1.5`, `ior: 1.61`. Dropped from the previous material: `attenuationColor`, `attenuationDistance`, `opacity`, `transparent`, `emissive`, `emissiveIntensity`. The directional key light in `Scene.svelte` is still `TONOKI_COLORS.hisuiJade` at intensity 2.2, so jade-tinted highlights still play across the new dark surface.

Tests updated accordingly: `geometry.test.ts` now asserts the rounder proportions (width/height between 0.7 and 1.05), the crown at y ≈ 1.8 with the tail past y = -1.95, and the circular hole at (-0.16, 0.9) with diameter ≈ 0.48. The flat-ridge regression guard was retired — it was specific to the previous slim-comma version. `scene-config.test.ts` now asserts the new material values and explicitly checks that the dropped properties (`attenuationColor`, `attenuationDistance`, `opacity`, `transparent`, `emissive`, `emissiveIntensity`) are `undefined`.

What was NOT touched, on purpose:

- `Scene.svelte` magatama scale (`0.92 / 0.58 / 0.44`), position, and rotation. The new geometry's bounding box is ~1.36× larger; at the current scale the bead will occupy roughly that much more screen space. If it overwhelms the composition, drop to ~`0.68 / 0.43 / 0.32` and the on-screen size matches the previous bead.
- Lighting, ambient color, magatama drag/float/scroll tweens, particle system.

Files changed in this round:

- Modified: `src/lib/animations/typography-reveal.ts`
- Modified: `src/lib/three/geometry.ts`
- Modified: `src/lib/three/geometry.test.ts`
- Modified: `src/lib/three/scene-config.ts`
- Modified: `src/lib/three/scene-config.test.ts`

Re-run `npm test`, `npm run check`, and reload the dev preview to validate. The test-file count stays at 5; total test count will shift slightly because two scene-config tests were merged into one with a `toMatchObject` and one explicit "dropped properties" sibling, and two new geometry tests replaced the previous proportion + rounded-top tests.

### Magatama tuning pass — lighter + smaller

Dev preview showed the near-black bead reading as a solid silhouette and the larger bounding box overwhelming the headline column. Two follow-up changes:

- **Material**: color moved from `0x072411` (near-black) to `0x2e6b3e` (mid-hisui green). Thickness eased from `1.5` → `0.9` so light isn't over-absorbed inside the bead. All other physical params unchanged. Test assertions updated accordingly.
- **Scale**: `magatama.scale.setScalar(...)` in `Scene.svelte` reduced from `0.92 / 0.58 / 0.44` (desktop / tablet / mobile) to `0.55 / 0.35 / 0.27`. Lands the bead at roughly 45% viewport height and clears the hero text. Position offsets unchanged.

## Updated Pending Tasks

### Still Open

- Add real Kofun cinematic media in `static/videos`.
- Add production Haniwa and Sueki `.glb` assets.
- Decide whether the current procedural Magatama remains final or gets replaced by a production `.glb`; the procedural version now matches the supplied bead reference closely enough for the current phase.
- Configure Draco or meshopt compression once production models exist.
- Implement SvelteKit form action for `/club` sponsorship requests:
  - validation
  - non-commerce success state
  - delivery path by email, CRM, or persistence
- Decide the private-access model:
  - invite code
  - sponsor token
  - manual approval
  - authenticated member route
- Build real certificate/QR or signed provenance visuals.
- Add favicon and app icons.
- Add SEO metadata, social cards, structured data, and production copy review.
- Run accessibility and responsive QA across navigation, theme toggle, form fields, WebGL fallback, and drag interaction.
- Run a performance pass after assets are real:
  - WebGL frame budget
  - bundle analysis
  - font payload review
  - mobile GPU behavior
- Choose deployment target and configure SvelteKit adapter, CI, and preview pipeline.

### Completed From The Initial Seven-Step Plan

- Font slice of brand assets: completed with Google Fonts.
- Magatama shape pass: completed procedurally against the supplied reference image.
- Bundle-size tuning: partially completed through manual chunks and warning threshold.
- Local development reliability: completed through mirror runner scripts.

### Deferred From The Initial Seven-Step Plan

- Real Kofun video/media assets.
- Production `.glb` model pipeline for Haniwa/Sueki and optional Magatama.
- Club form backend and private access workflow.
- Accessibility and responsive QA.
- Deployment adapter and CI.

## Workflow Note

The current workspace path is:

```txt
/Users/jasubal/WORKS/##ILLA/tonokimatcha/*tonokimatcha.com
```

Because this path contains `##` and `*`, Vite-related tooling can fail when run directly. Use normal npm scripts from the real project path; they automatically mirror into `/tmp/tonoki-matcha-dev-src`:

```sh
npm test
npm run build
npm run dev -- --port 5174
```

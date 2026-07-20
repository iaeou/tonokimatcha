# Tonoki Matcha Project Status

Date: 2026-07-20

## Summary

Added an HDRI-style environment and a postprocessing chain (bloom + film grain) so the translucent Magatama finally reads as refractive jade instead of tinted plastic.

## Completed Since 2026-07-19

- Added `postprocessing@6.39.3` (pmndrs) as a dependency (peer range covers three 0.170).
- `src/lib/three/magatama-tuning.ts` — two new sections:
  - `environment`: `intensity: 0.85`, `rotationY: 2.1` (env-map rotation around the bead).
  - `postprocessing.bloom`: `intensity 0.75`, `luminanceThreshold 0.62` (above the cream stage so only jade highlights glow), `luminanceSmoothing 0.25`, `mipmapBlur: true`, `radius 0.72`.
  - `postprocessing.grain`: `premultiply: true` (noise scaled by scene color — transparent pixels stay clean), `opacity 0.14`.
- `src/lib/three/scene-config.ts` — pure creators `createEnvironmentSettings()`, `createBloomOptions()`, `createGrainOptions()` (defensive copies of the tuning).
- `src/lib/three/Scene.svelte`:
  - Procedural HDRI: `RoomEnvironment` → `PMREMGenerator.fromScene(..., 0.04)` → `scene.environment`, with `environmentIntensity`/`environmentRotation.y` from tuning. Generator and room scene disposed after baking. No external .hdr asset needed.
  - Postprocessing: pmndrs `EffectComposer` (`frameBufferType: HalfFloatType` to avoid bloom banding) with `RenderPass` + single `EffectPass(BloomEffect, NoiseEffect)`. `composer.render()` replaces `renderer.render()`; `composer.setSize` added to `resize()`; `composer.dispose()` + env texture dispose in cleanup.
  - All new imports stay inside the existing lazy `Promise.all` dynamic import (nothing added to the initial shell chunk).
- `src/lib/three/scene-config.test.ts` — 3 new tests (43 total).

## Current Verification

From the clean-path mirror (`/tmp/tonoki-matcha-dev-src`, Linux sandbox):

- `vitest run`: 6 files, 43 tests passed.
- `svelte-check`: 0 errors, 0 warnings.
- `vite build`: passed.
- Runtime API smoke check (node): `Scene.environmentRotation`/`environmentIntensity` exist in three 0.170; `BloomEffect`/`NoiseEffect` construct with the tuned options.

Note: transparency over the page background is preserved (alpha renderer + HalfFloat RGBA buffers; grain premultiplied). Visual tuning pass in a real browser still pending — knobs are all in `magatama-tuning.ts`.

## Sandbox note (this session)

The Cowork outputs mount does not allow file deletion (EPERM on unlink), which breaks `svelte-kit sync`. Run build phases from a `/tmp` mirror (persists across bash calls; background processes do NOT survive a call — run rsync/install in foreground).

## Visual Tuning Pass (same day, browser via Chrome MCP + dev server on host Mac)

- `environment.intensity` 0.85 → 0.42 and `lighting.ambientIntensity` 0.52 → 0.34: at 0.85 the env over-lit the bead. In light theme the bead reads intentionally pale (opacity 0.3 over cream — established design); dark theme is where the change shines: deep polished jade, transmission glow on the lower belly, restrained bloom glints, subtle premultiplied grain. No console errors; bloom 0.75/0.62 and grain 0.14 kept as shipped.
- Screenshot workflow note: the hero photo lazy-loads OVER the canvas — screenshot the Magatama from lower sections (e.g. The Lineage) after ~10 scroll ticks; keyboard scrolling (Home/cmd+Up) does not move Lenis, use mouse-wheel scroll or reload.

## Still Open

- Real Kofun media, Haniwa/Sueki `.glb`, provenance visuals, SEO, accessibility QA, deployment.
- Pinned horizontal Collection gallery with per-product Magatama tinting.
- Supabase backend for `/club` with invitation-code access (next roadmap item).
- i18n (ES/EN/JA) via Paraglide, certificate/QR route, optional ambient audio toggle.

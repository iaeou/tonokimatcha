# Tonoki Matcha Project Status

Date: 2026-05-26

## Summary

The Magatama scene now has a single tuning surface in `src/lib/three/magatama-tuning.ts`. Geometry, material, particles, lighting, responsive placement, float motion, pointer parallax, drag sensitivity, and particle rotation read from that module instead of being split across `Scene.svelte`, `geometry.ts`, and `scene-config.ts`.

## Completed Since 2026-05-25

- Added `MAGATAMA_TUNING` as the central scene tuning object.
- Routed Magatama extrusion parameters through the tuning module.
- Routed Magatama material parameters through the tuning module and enabled `transparent` automatically when opacity is below 1.
- Set the current bead material to translucent mid-hisui jade:
  - `color: 0x2e6b3e`
  - `opacity: 0.3`
  - `roughness: 0.2`
  - `transmission: 0.5`
  - `thickness: 0.3`
  - `ior: 1.61`
  - `clearcoat: 0.9`
- Moved particle count, spread, seed, size range, opacity, position, rotation, and theme colors into the tuning module.
- Moved lighting, base rotation, float timing, pointer parallax, drag sensitivity, and responsive layout scales/offsets into the tuning module.
- Updated the focused Three.js tests to reflect the transparent tuned material.
- Added the latest Magatama reference image:
  - `.agents/docs/magatama-reference-geometry-2026-05-26.jpg`
- Removed older transient screenshot artifacts from `.agents/docs/` so the docs folder keeps source context and current references only.

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

The npm scripts still use the clean-path mirror for Vite and Vitest because the workspace path contains `##` and `*`.

## Still Open

- Add real Kofun cinematic media in `static/videos`.
- Add production Haniwa and Sueki `.glb` assets.
- Decide whether the tuned procedural Magatama remains final or gets replaced by a production `.glb`.
- Configure Draco or meshopt compression once production models exist.
- Implement the `/club` sponsorship request form backend and private-access model.
- Build real certificate/QR or signed provenance visuals.
- Add favicon and app icons.
- Add SEO metadata, social cards, structured data, and production copy review.
- Run accessibility and responsive QA across navigation, theme toggle, form fields, WebGL fallback, and drag interaction.
- Run a performance pass after assets are real.
- Choose deployment target and configure the SvelteKit adapter, CI, and preview pipeline.

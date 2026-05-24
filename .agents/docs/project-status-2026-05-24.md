# Tonoki Matcha Project Status

Date: 2026-05-24

## Summary

Tonoki Matcha has a working SvelteKit foundation for the digital sanctuary concept. The current site is not a store. It presents the first museum-like landing experience, a private-club route, theme controls, procedural WebGL atmosphere, and test coverage for the most important reusable logic.

## Completed

- Project scaffolded with SvelteKit, TypeScript, Vite, Vitest, Three.js, and GSAP.
- Directory structure follows the requested shape: `static/models`, `static/fonts`, `static/videos`, reusable Svelte components, dedicated `src/lib/three`, stores, styles, and routes.
- Global layout renders `Scene.svelte` behind content with `Navigation` and `Footer`.
- Landing page includes:
  - The Threshold hero.
  - The Lineage section.
  - The Collection cards for Kofun Imperial, Hisui Ceremonial, and Sakai Premium.
  - The Guardian entry point into private admission.
- Private club route exists at `/private-club` with a sponsorship request form.
- No cart or commerce language has been introduced.
- Vanilla CSS theme system is implemented:
  - Light theme is default.
  - Dark theme preserves the earlier moss, ink, jade, haniwa, and gold mood.
  - Toggle button is in the navigation and stores preference in `localStorage`.
- Typography system is implemented with fluid `clamp()` tokens, serif/sans role separation, and local system fallbacks.
- Three.js scene is implemented with:
  - Lazy browser-only imports for SvelteKit SSR safety.
  - Transparent high-performance renderer.
  - Procedural rounded Magatama geometry.
  - MeshPhysicalMaterial settings for jade-like transmission, attenuation, thickness, clearcoat, and roughness.
  - Ambient and directional lighting.
  - Floating GSAP loop.
  - Pointer-linked rotation.
  - ScrollTrigger-linked rotation.
- Vortex particle system is implemented:
  - Custom vertex and fragment shaders in `src/lib/three/shaders`.
  - Earth-to-jade color transition controlled by `uProgress`.
  - Theme-aware particle color, alpha, size, and blending.
  - Light mode particles were adjusted to be more visible with matcha-green tones.
- Magatama shape was restyled after visual review:
  - Bezier outline replaces the earlier flatter silhouette.
  - Higher bevel and curve segments reduce faceting.
  - Regression test guards against a long flat upper ridge.
- Verification screenshots are stored in `.agents/docs/`.

## Tests And Verification

Fresh verification from the latest implementation:

- `npm run check` from the real project path: 0 errors, 0 warnings.
- Focused Vitest suite from `/tmp/tonoki-matcha-dev-src`: 15 tests passed.
- `npm run build` from `/tmp/tonoki-matcha-dev-src`: passed.
- Browser check on `http://localhost:5174/?verify=magatama-rounded-final`: WebGL canvas present and no current console errors.

Known warning:

- Production build reports one large async Three.js chunk around 688 kB minified. This is expected for the current WebGL baseline and should be tuned later with manual chunking or additional asset/code splitting.

## Incomplete

- Real cinematic Kofun media is not present yet. `static/videos` contains placeholders only.
- Real `.glb` models are not present. Magatama, Haniwa, and Sueki are procedural or placeholder concepts for now.
- Draco or meshopt compression pipeline is not configured because there are no production models yet.
- The private-club form is visual only. There is no SvelteKit form action, validation, email delivery, persistence, or CRM workflow.
- `/private-club` is not protected. There is no authentication, invite token, sponsor code, or session gate yet.
- Certificate visuals are styled as QR-like panels but do not generate real QR codes or signed certificates.
- No SEO metadata, social cards, structured data, or production copy review has been completed.
- No accessibility audit has been completed beyond semantic structure and labels already present.
- No performance pass has been completed beyond lazy importing WebGL dependencies and using GPU shaders.
- No deployment adapter, hosting target, CI, or preview pipeline has been selected.
- Fonts are system/local fallbacks only. Branded font files are not installed in `static/fonts`.

## Recommended Next Steps

1. Add real brand assets: fonts, Kofun background media, optimized Magatama/Haniwa/Sueki models.
2. Replace the procedural Magatama with a production `.glb` only if the model preserves the current rounded silhouette and jade material quality.
3. Implement a SvelteKit form action for sponsorship requests with validation and a non-commerce success state.
4. Decide how private access should work: invite code, sponsor token, manual approval, or authenticated members route.
5. Add accessibility and responsive QA passes for navigation, theme toggle, form labels, and WebGL fallback behavior.
6. Tune WebGL performance and bundle size after assets are in place.
7. Add deployment configuration once the target host is chosen.

## Important Workflow Note For Agents

Because the project path includes `##`, Vite and Vitest can fail when run directly from the real directory. Use this mirror workflow for tests/build/browser verification:

```sh
rsync -a --delete --exclude node_modules --exclude .svelte-kit --exclude .DS_Store '/Users/jasubal/WORKS/##ILLA/tonokimatcha/' /tmp/tonoki-matcha-dev-src/
cd /tmp/tonoki-matcha-dev-src
npm test -- src/lib/animations/hero-reveal.test.ts src/lib/stores/theme.test.ts src/lib/three/geometry.test.ts src/lib/three/scene-config.test.ts
npm run build
```

`npm run check` is safe from the real project path.

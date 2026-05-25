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

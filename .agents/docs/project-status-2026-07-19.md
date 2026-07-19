# Tonoki Matcha Project Status

Date: 2026-07-19

## Summary

Added ceremonial smooth scrolling (Lenis) synced with GSAP ScrollTrigger, and route-level View Transitions for museum-hall navigation between `/` and `/club`.

## Completed Since 2026-05-26

- Added `lenis@1.3.25` as a dependency.
- New `src/lib/animations/smooth-scroll.ts`:
  - `createSmoothScrollOptions()` — pure, testable tuning object (`autoRaf: false`, `anchors: true`, `duration: 1.35`, expo-out easing, `syncTouch: false` to keep native touch scrolling).
  - `shouldEnableSmoothScroll()` — respects `prefers-reduced-motion` (injectable matchMedia for tests).
  - `initSmoothScroll()` — lazy dynamic import of Lenis/GSAP/ScrollTrigger (stays out of the initial shell chunk), GSAP ticker owns the RAF loop (`lenis.raf`), `ScrollTrigger.update` on Lenis scroll, `lagSmoothing(0)`, returns a full cleanup function.
- `src/routes/+layout.svelte`:
  - Imports `lenis/dist/lenis.css`, initializes smooth scroll in `onMount` with disposal guard.
  - `onNavigate` + `document.startViewTransition` for cross-route transitions, with graceful fallback where unsupported.
- `src/lib/styles/main.css`:
  - `::view-transition-old/new(root)` keyframes — slow cross-fade with a slight rise on the incoming view.
  - `prefers-reduced-motion`: disables the transition animation and forces `scroll-behavior: auto`.
- New test file `src/lib/animations/smooth-scroll.test.ts` (8 tests).

## Current Verification

From the clean-path mirror (Linux sandbox):

- `vitest run`: 6 files, 40 tests passed.
- `svelte-check`: 0 errors, 0 warnings.
- `vite build`: passed.

## Still Open

Unchanged from 2026-05-26 (real Kofun media, Haniwa/Sueki `.glb`, `/club` backend, provenance visuals, SEO, accessibility QA, deployment) plus new candidates discussed:

- HDRI environment + postprocessing (bloom, grain) for the translucent Magatama.
- Pinned horizontal Collection gallery with per-product Magatama tinting.
- Supabase backend for `/club` with invitation-code private access.
- i18n (ES/EN/JA) via Paraglide, certificate/QR route, optional ambient audio toggle.

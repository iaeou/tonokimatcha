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
- The Collection: Kofun Imperial, Hisui Ceremonial, and Sakai Premium.
- The Guardian: private club and B2B ambassador request flow.
- Eternal Legacy: legal, certifications, scarcity policy, and closing sign-off.

## Current Implementation Snapshot

Last reviewed: 2026-07-20.

The project is now a working SvelteKit baseline with:

- Global layout rendering a fixed Three.js scene behind the page content.
- Navigation, footer, landing content, collection cards, and club request route at `/club`.
- Vanilla CSS theme system with light as default and dark as the previous moss/ink palette.
- Theme toggle persisted with `localStorage` via `src/lib/stores/theme.ts`.
- Fluid typography tokens and Google webfont stacks with system fallbacks in `src/lib/styles/typography.css`.
- Procedural Magatama geometry with a stout-comma bezier silhouette, circular suspension hole, and centralized tuning in `src/lib/three/magatama-tuning.ts`. The current material uses translucent mid-hisui jade (`color: 0x2e6b3e`, `opacity: 0.3`, `roughness: 0.2`, `transmission: 0.5`, `thickness: 0.3`, `ior: 1.61`, `clearcoat: 0.9`) and renders at restrained museum proportions via reduced scene scales (~45% viewport height on desktop).
- Procedural HDRI environment (`RoomEnvironment` baked through `PMREMGenerator` into `scene.environment`, no external `.hdr` asset) so the Magatama's `transmission`/`clearcoat` refract real lighting. Intensity and Y-rotation tunable under `MAGATAMA_TUNING.environment`.
- Postprocessing chain via pmndrs `postprocessing`: `EffectComposer` (`frameBufferType: HalfFloatType`, canvas transparency preserved) with a `RenderPass` and one `EffectPass` combining `BloomEffect` (luminance threshold above the cream stage so only jade highlights glow) and a premultiplied `NoiseEffect` film grain that leaves transparent pixels untouched. All knobs under `MAGATAMA_TUNING.postprocessing`; pure creators (`createEnvironmentSettings`, `createBloomOptions`, `createGrainOptions`) in `scene-config.ts` are unit-tested.
- GPU particle system using custom vortex shaders for earth-to-jade lineage transition.
- GSAP hero reveal, Magatama floating animation, ambient pointer rotation, drag-only multi-axis Magatama rotation, and ScrollTrigger links.
- Lenis smooth scrolling via `src/lib/animations/smooth-scroll.ts`: lazily imported, GSAP ticker drives `lenis.raf`, `ScrollTrigger.update` on scroll, `anchors: true` for in-page cues, native touch scrolling preserved (`syncTouch: false`), fully disabled under `prefers-reduced-motion`. Tuning lives in `createSmoothScrollOptions()`.
- Route-level View Transitions in `src/routes/+layout.svelte` (`onNavigate` + `document.startViewTransition`) with ceremonial cross-fade keyframes in `main.css`, reduced-motion guard, and instant fallback where the API is unsupported.
- Focused Vitest coverage for theme logic, hero animation options, Three.js config, Magatama geometry, and particle attributes.
- Branded webfont pairing — Cormorant Garamond for English ceremonial display, Noto Serif JP as the mincho heritage fallback, and Zen Kaku Gothic New + Inter for body/UI text — loaded via Google Fonts with `preconnect` and `display=swap`.
- Vite manualChunks splits `three` and `gsap` into their own async chunks so the initial page shell loads independently of WebGL.
- Typography reveal effects on headings and eyebrows via `src/lib/animations/typography-reveal.ts` (`typographyReveal` Svelte action). `rise` mode splits headings into per-word mask spans and animates them up while the heading's `letter-spacing` tightens from `-0.02em` to rest. `breath` mode (used on `.eyebrow`) eases `letter-spacing` from `0em` to its resting value (e.g. `0.18em`) with a subtle opacity fade. Both are IntersectionObserver-triggered once, respect `prefers-reduced-motion`, and pre-hide synchronously so there's no flash before GSAP loads.
- The latest visual reference is `.agents/docs/magatama-reference-geometry-2026-05-26.jpg`; older transient WebGL screenshots were removed to keep the agent docs focused.

## Known Local Development Note

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

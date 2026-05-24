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

Last reviewed: 2026-05-24.

The project is now a working SvelteKit baseline with:

- Global layout rendering a fixed Three.js scene behind the page content.
- Navigation, footer, landing content, collection cards, and private-club request route.
- Vanilla CSS theme system with light as default and dark as the previous moss/ink palette.
- Theme toggle persisted with `localStorage` via `src/lib/stores/theme.ts`.
- Fluid typography tokens and local-font fallbacks in `src/lib/styles/typography.css`.
- Procedural Magatama geometry with rounded Bezier silhouette and transmissive jade material.
- GPU particle system using custom vortex shaders for earth-to-jade lineage transition.
- GSAP hero reveal, Magatama floating animation, pointer rotation, and ScrollTrigger links.
- Focused Vitest coverage for theme logic, hero animation options, Three.js config, Magatama geometry, and particle attributes.

## Known Local Development Note

The workspace path contains `##`:

`/Users/jasubal/WORKS/##ILLA/tonokimatcha`

`npm run check` works from the real project path. Vitest, Vite build, and local browser verification should be run from a clean mirror path because Vite can mis-resolve `#` in URLs:

```sh
rsync -a --delete --exclude node_modules --exclude .svelte-kit --exclude .DS_Store '/Users/jasubal/WORKS/##ILLA/tonokimatcha/' /tmp/tonoki-matcha-dev-src/
cd /tmp/tonoki-matcha-dev-src
npm test -- src/lib/animations/hero-reveal.test.ts src/lib/stores/theme.test.ts src/lib/three/geometry.test.ts src/lib/three/scene-config.test.ts
npm run build
```

The dev server used during development has been run from `/tmp/tonoki-matcha-dev-src` on port `5174`.

# Tonoki Matcha

Tonoki Matcha is a SvelteKit digital sanctuary for a luxury matcha brand rooted in Japan's Kofun era. The experience is intentionally not a storefront: it presents a museum-like landing page, procedural jade atmosphere, collection narrative, and a private club request route.

## Stack

- SvelteKit 2
- TypeScript
- Vite
- Vitest
- Three.js
- GSAP
- Vanilla CSS custom properties

## Local Commands

The local workspace path currently contains `##` and `*`, which can break Vite/Vitest config loading. Use the npm scripts; they automatically mirror the project into `/tmp/tonoki-matcha-dev-src` before running Vite tooling.

```sh
npm install
npm run check
npm test
npm run build
npm run dev -- --port 5174
```

## Project Notes

Project context, implementation status, and agent handoff notes live in:

```txt
.agents/docs/
```

Current open work includes real Kofun media, production Haniwa/Sueki assets, `/club` form backend, private access model, certificate/provenance visuals, accessibility QA, SEO metadata, favicon/app icons, and deployment configuration.

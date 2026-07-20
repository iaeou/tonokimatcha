# Tonoki Matcha Project Status (second pass)

Date: 2026-07-20 (evening session)

## Summary

Same-day follow-up to the HDRI/postprocessing work: dark theme is now the default with pre-paint persistence, and four new ceremonial interactions shipped — kintsugi headline seams, ghost kanji watermarks, the Kofun particle constellation, and the sonic Magatama.

## Completed

- **Dark default + persistence** (`9d9345f`): `DEFAULT_THEME = 'dark'` in `theme.ts`, `data-theme="dark"` in `app.html`, plus an inline head script that applies the saved `localStorage['tonoki-theme']` before first paint (no FOUC; saved preference wins). Verified in Chrome: fresh visitor → dark; chosen light survives reloads.
- **Kintsugi seams** (`dbf9f6d`): `typography-reveal.ts` gained `createKintsugiOptions/PathD/Element` — a deterministic wavering gold stroke (SVG `pathLength="1"` dashoffset draw) appended to `rise` headings via `kintsugi: true` (Section.svelte passes it). Draw overlaps the tail of the word rise. Styling in `.kintsugi-line` (uses `--color-gold`).
- **Ghost kanji** (`dbf9f6d`): `kanji-drift.ts` action + `kanji` prop on Section — 樹 (Lineage), 玉 (Collection), 陵 (Guardian) rendered at `clamp(14rem, 32vw, 30rem)` behind `.section__inner`, scrubbed opacity 0 → 0.07 → 0 with a slow downward drift across the section. Static watermark under reduced motion.
- **Kofun constellation** (`dbf9f6d`): `createKofunConstellationPositions()` in geometry.ts traces the Daisenryō keyhole perimeter (58% circle / 42% trapezoid, LCG-jittered) into an `aKofun` attribute. The vortex shader blends particles toward the targets with per-particle offsets; `uKofunCancelY` counter-rotates targets so the silhouette faces the visitor despite the cloud's ambient spin. Formation is driven by `sin(progress·π)` on the heritage-section ScrollTrigger. Tuning under `MAGATAMA_TUNING.particles.kofun` (scale 1.9, offsetY 1.35 to counter the cloud's positionY, jitter 0.07, peak 1). Verified visually: ring + flared base read clearly mid-section.
- **Sonic Magatama** (`dbf9f6d`): `src/lib/audio/jade-bell.ts` — Tone.js FMSynth (bell envelope, sustain 0) → Volume (-16 dB) → Reverb (5.5 s). D-minor pentatonic `D3…F4`; vertical pointer position picks the degree; strikes gated by ≥46 px drag AND ≥130 ms. Lazy: nothing loads until the first grab of the bead (gesture also unlocks the AudioContext). Disposed with the scene. Not audible-verified in this session (sandbox) — Jaume should ear-check and reshape the timbre.
- New dependency: `tone@15.1.22`. Tests now 57 (jade-bell, kanji-drift, kofun, kintsugi suites added).

## Verification

Clean-path mirror: vitest 57/57, svelte-check 0/0, vite build ✓. No console errors in-browser, including during Magatama drags.

## Notes for next session

- Chrome MCP `zoom` tool can return stale/pre-script captures — trust full `screenshot`, not `zoom`, for WebGL state.
- To reach a specific scroll spot with Lenis: `location.hash = '#lineage'` (anchors: true) + wheel-scroll ticks; `window.scrollTo` and keyboard keys do NOT move Lenis.
- Dev server on the host Mac dies when the Desktop Commander MCP reconnects — restart `npm run dev` and re-check before screenshotting.

## Still Open

- Ear-check + timbre pass of the jade bell (Jaume, musician) and decide whether it needs a mute toggle in the nav.
- Real Kofun media, Haniwa/Sueki `.glb`, provenance visuals, SEO, accessibility QA, deployment.
- Pinned horizontal Collection gallery with per-product Magatama tinting.
- Supabase backend for `/club` with invitation-code access (next roadmap item).
- i18n (ES/EN/JA) via Paraglide, certificate/QR route, ambient audio toggle (could share the jade-bell chain).

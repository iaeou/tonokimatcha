# Matcha Tonoki Project Status

Date: 2026-08-27

## Summary

The threshold now changes hands as the visitor descends: the cup photograph withdraws and Osaka is drawn in its place, as ink rather than as a second photograph. The drawing then withdraws before The Leaf.

Jaume's brief: keep the opening photograph, and let the scroll hand it over to his Osaka illustration. Chosen in conversation: withdraw before The Leaf (not a full-page backdrop), and read as ink on paper (not as a full-strength second cover).

## The Relay

`src/lib/animations/hero-backdrop.ts` — pure, unit-tested, one tuning object (`HERO_BACKDROP_TUNING`):

- The photograph fades across the first viewport height (`photoFadeViewports: 1`).
- The drawing starts arriving at `0.55` viewport heights and is complete `0.95` later, so the two barely overlap and the handoff never reads as a muddle.
- The withdrawal follows the **live position of `#collection`** (The Leaf), not a scroll distance: section heights move with the copy, and a hardcoded number would drift. The drawing is gone once that hall has claimed `0.6` of the viewport.

`Hero.svelte` writes two custom properties (`--hero-image-opacity`, `--hero-drawing-opacity`) from one scroll listener, as before.

## Ink, Not Photograph

- Light: `mix-blend-mode: multiply` dissolves the drawing's white paper into the cream, leaving only the lines.
- Dark: `filter: invert(1)` + `mix-blend-mode: screen` — the city is drawn out of the void instead of blotting it.
- Single knob: `--hero-drawing-ink` on `.hero` (currently `0.38`).
- The drawing sits **above** the hero veil (`.hero__figure::after`, now `z-index: 1`). Under it, the veil's left-side gradient washed out half the city. The veil exists for the hero copy over the photograph, and the copy has scrolled away by the time the drawing arrives.
- `object-fit: contain` + `object-position: bottom center`: the skyline sits along the bottom edge like a horizon at every aspect ratio, instead of being cropped to a detail on tall screens.

## Images

From Jaume's 1600×854 export, grayscale WebP (q58, method 6, sharp-yuv) at three widths in `static/images/`:

| file | size |
| --- | --- |
| `osaka-skyline-768.webp` | 82 KB |
| `osaka-skyline-1200.webp` | 165 KB |
| `osaka-skyline-1600.webp` | 254 KB |

Served with `srcset`/`sizes="100vw"`. The illustration is dense stipple, so it does not compress like a photograph; grayscale plus q58 halved it without visible damage to the lines at 38% ink.

`loading="lazy"` is not enough on its own here — the figure covers the viewport, so the browser considers the drawing visible from the start. `fetchpriority="low"` is what keeps it from competing with the photograph, which is the LCP.

## Current Verification

- `npm test`: 14 files, 109 passed, 1 skipped (6 new tests for the relay).
- `svelte-check`: 0 errors, 2 pre-existing cosmetic warnings in `CursorPointer.svelte`.
- `npm run build`: passed.
- Not reviewed in a browser: the Chrome extension was unreachable again this session. Dev server left running on `:5199`.

## Infra Note

Desktop Commander's shell has `NODE_ENV=production`, so `npm ci` in the mirror silently skipped every devDependency and Vitest failed with `Cannot find package '@sveltejs/kit'`. Run mirror commands as `NODE_ENV= TONOKI_MIRROR_ROOT=/tmp/tonoki-mirror-$(id -u) npm test`.

## Still Open

- Jaume's eye on the relay; the ink level is one number (`--hero-drawing-ink`).
- The pink `#e672a5` accent token from the logo.
- Packaging still carries the old brand.
- Next roadmap item: `/club` backend with Supabase + invitation codes.

# Tonoki Matcha Project Status

Date: 2026-08-24

## Summary

The packaging photographs carry the brand now. `tube-25`, `pouch-30g` and `pouch-30g-flat` were unbranded supplier samples; the low-poly Magatama and the two-line wordmark are composited onto each of them, warped to the surface and blended in multiply so the material shows through the ink. `sachet-2g` is Jaume's own edit — a different, better shot — and it set the house style the other three were then rebuilt to match.

## What Changed

### The lockup on the packaging is the header lockup

The first pass used a centred stack: mark on top, `MATCHA` / `TONOKI` in tracked caps beneath. Jaume replaced `sachet-2g.webp` with a photograph he had branded himself, and it settled the question — his tube reads **Matcha / Tonoki** in title case, left-aligned, two lines set solid, with the Magatama standing to the right at the full two-line height.

That is `Navigation.svelte` exactly (see `project-status-2026-08-24b.md`). The three composites were redone to it. There is now one lockup in this project, and it appears in the header, on the tube and on both pouches.

`label_lockup()` reproduces it: Cormorant Garamond 400, the two words as separate lines with leading at `0.30em`, the mark rendered from `static/images/magatama-mark.svg` to the height of the whole two-line block, a gap of `0.16 × block height` between them. Ink is a warm near-black `rgb(30, 29, 24)`, sampled off Jaume's print rather than guessed.

### How the mark is put on the surface

Not a PNG pasted over the photo. Two mappings, both in `.agents/docs/packaging-branding-2026-08-24.py`:

- **Cylinder** (`cylinder_apply`, used on the tube). For each destination column the arc coordinate is recovered with `s = 0.5 + asin(2p - 1) / π`, so the type compresses toward the silhouette the way print on a real tube does. Alpha is additionally attenuated by `(1 - (2p-1)²)^0.30` at grazing angles.
- **Perspective quad** (`quad_apply`, used on both pouches). A homography onto four measured corners. The standing pouch's panel is near-flat and only needs the taper; the flat pouch needed the real thing, its face corners measured off the photo at `(630,1041) (1832,853) (2793,2472) (1378,2965)`.

Both composite in **multiply**, which is what makes it read: the speckles in the kraft board and the light falling across the bag pass through the ink instead of disappearing under a sticker. A 2.2–2.6px blur matches the photographs' own softness.

### The sachet is Jaume's

`sachet-2g.webp` is no longer the three bare sticks on the floor. It is an open tube with the sticks spilling out, the tube branded and each stick carrying a small Magatama. `1792 × 2400` where the others are `3072 × 4096` — same 3:4, so the cards are unaffected.

It is deliberately **not** produced by the script. Three glossy sticks at three angles betray a montage; that one wanted a real edit, and got one.

## Reproducing or Adjusting

`.agents/docs/packaging-branding-2026-08-24.py` holds the functions and the exact placements. Four numbers per photograph — where the label starts, how wide it sits, how much arc it wraps — so moving or resizing the mark is an edit, not a redo.

```
deps : pillow numpy cairosvg fonttools brotli
font : npm pack @fontsource/cormorant-garamond   # woff2 -> ttf via fontTools
```

Google Fonts is not reachable from the sandbox; the `@fontsource` npm package is the way in.

Inputs are the three photographs decoded to PNG plus `magatama-mark.svg`. Outputs are webp at quality 80, which lands within a few KB of the original file sizes.

## Verification

Every composite was inspected at 1:1 on the label and at card size. The type follows the curvature, the paper texture survives the ink, and the four photographs now agree with each other and with the header.

**Not verified by the toolchain.** `node_modules/` is still absent from the working tree — the same gap recorded in the two previous entries — so `svelte-check`, `npm test` and `npm run build` did not run. This pass touches image files only and no module boundary, but it went in unchecked. Run `npm install` then `npm run check && npm test && npm run build`.

The unbranded supplier samples remain recoverable at `0fe68f1`.

## Open Question — the Photographs Themselves

The mark is on them; the parquet and the skirting board are still on them too. These now read as a real product photographed on somebody's floor rather than as a supplier's blank sample, which is a step, not the destination.

Two paths, in order of cost:

- **Cheap.** Tighter crops and a neutralised background, so the room stops competing with the object.
- **Right.** Actual product photography. Nothing in this pass is wasted when that arrives — the branding lives in a script, not in the pixels.

Jaume's `sachet-2g` shot is the closest of the four to the tone the site wants, and is a reasonable reference for the others.

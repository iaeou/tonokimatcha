# Tonoki Matcha Project Status

Date: 2026-08-25

## Summary

A correction pass on the illustrated hero Magatama from `project-status-2026-08-25b.md`. Jaume's note, on a screenshot of the live bead: the outline is too thick, it should be greener, and there is an extra edge line showing that does not belong.

All three turned out to be one geometric problem plus a colour choice.

## The Extra Line Was Real, and It Was Two Lines

Zoomed in, the ink band was not one band. It was:

```
   colour ┃ flat ink margin ┃ crease ┃ bevel ┃ background
```

The artwork insets its colour fills ~0.078 from the silhouette. The bevel started at 0.05. So between the paint's edge and the bevel's edge sat a strip of flat ink, and the hard normal change where the flat top meets the rounded edge drew a shading crease down the middle of it. Two concentric lines where the drawing has one.

**The fix is to make those two edges the same edge.** The colour now grows 0.033 before being clipped, which lands its boundary at 0.045 — exactly where the bevel begins. Paint edge and bevel crease coincide, and the outline reads as a single line, 42% thinner than before (0.045 against 0.078).

That is also the whole of "thinner": the line weight is not a knob, it is the distance between the colour and the silhouette.

## The Growth Has a Ceiling, and Crossing It Breaks the Tail

The first attempt at this grew the colour by 0.14 — enough to flood past the band entirely and reach the bevel everywhere at once, regardless of local margin. It looked correct on the body and wrecked the tail.

The reason is that the artwork's largest black path is doing two jobs. It is the thin band around the silhouette, *and* it is solid ink where the drawing is all line: the tail curl and the stem. A flood does not distinguish them. Green poured into the tail and came out as bright hairlines wherever the slab was wide enough to have a flat top.

An erosion trick was tried next — keep `outline.buffer(-ERODE)` as protected ink — and it produced a *third* line: a green sliver stranded between the bevel and the protected core.

The measured growth is what works. 0.033 is under the artwork's own inset everywhere, so the paint advances to the bevel and stops, and every solid ink feature keeps its footprint.

## Hairlines Along the Ink Needed a Separate Fix

Even with the flood gone, thin bright lines survived along the tail's inner hook. Cause: paint and ink are simplified independently at 0.6 artwork units, so their shared edges diverge by up to that tolerance, and the paint pokes out from under the ink it is supposed to sit beneath.

Front paint now has the ink subtracted from it. The same mismatch then exposes the slab, which is already ink-coloured — the seam becomes invisible instead of bright.

**Back paint is deliberately not punched.** Doing it there too put holes in the reverse where the eyes, blush and mouth are, and the dark slab showing through gave the back of the pin a face. The reverse carries no ink and needs no subtraction.

## Greener Ink

`#070605` → `#2e7043`.

The previous pass had just moved the ink *to* true black, to stop it rendering mid-grey. That was the right fix for the wrong target: the problem then was desaturation, and the answer here is saturation, not lightness. A deep forest green at the same low value reads as green on the rim and the reverse while staying far darker than either the leaf `#3eaf49` or the body `#b5d238`, so the drawing keeps its value structure.

`icon.envMapIntensity` stays at 0.25 — the reason it was lowered has not changed.

## Numbers

| | before | after |
|---|---|---|
| `MAGATAMA_ICON_BEVEL_SIZE` | 0.05 | 0.045 |
| colour growth before clip | — | 0.033 |
| resulting outline width | ~0.078 + crease | 0.045, single line |
| ink colour | `#070605` | `#2e7043` |
| contour points | 708 | 865 |
| merged vertices | 13,542 | 14,061 |

Bounding box is unchanged at 2.90 × 3.99 × 0.83, so nothing in `layout` moves.

Only `magatama-icon-data.ts` changed. `geometry.ts`, `scene-config.ts`, `magatama-tuning.ts` and `Scene.svelte` are untouched — the builder already read the bevel from the data.

## Verification

Same method as the previous pass: the repo's own modules bundled with esbuild and run in headless Chromium under the scene's real lighting, rendered at four rotations on both stages. Additionally a 20°-FOV close-up of the tail junction — the crop Jaume marked — before and after, which is the only way the doubled line and the hairlines are visible at all.

**Still not verified by the toolchain**, `node_modules/` remains absent. This pass changes a generated data file only, so the type surface is the interface that already shipped.

## Still Open

Unchanged from `2026-08-25b`: the packaging still carries the faceted mark and Cormorant type; the mouth's pink is small and reads as a dark slot at oblique angles; the brand-order split; the favicon placeholder.

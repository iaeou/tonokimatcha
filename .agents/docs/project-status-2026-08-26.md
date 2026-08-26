# Tonoki Matcha Project Status

Date: 2026-08-26

## Summary

Jaume drew a clean standalone stone — `static/ico-magatama.svg` — and asked for the hero bead to be rebuilt from it, without the doubled border. It is. `magatama-icon-data.ts` is re-baked from that file instead of from the stone inside `matchaTonoki-logo.svg`, the bake now runs from a script that lives in the repo, and the geometry finally has tests.

The envelope is unchanged at 2.91 × 3.99 × 0.83, so nothing in `layout` moves. `geometry.ts`, `scene-config.ts`, `magatama-tuning.ts` and `Scene.svelte` are untouched.

## What the New Artwork Fixes

Flat, the two drawings are near-identical. The difference is in one path.

In the logo's stone the largest black path did two jobs: the thin band around the silhouette, *and* solid ink filling the tail curl and the stem. That is the whole reason the previous bake had a ceiling on how far the colour could grow — flood past the band and green leaked into the tail, which is ink by design.

In `ico-magatama.svg` the tail is filled green and the black is a clean ring. Measured: no part of the outline path sits more than 6 artwork units from the silhouette, and the paint is inset a uniform ~3. There is no solid-ink core to protect any more.

Rendered side by side against the shipped bake, the old bead carries a dark claw at the tail's inner hook where that solid ink was. The new one carries an unbroken line.

## What Changed in the Bake

### The growth is no longer rationed — it is fenced

Previously: grow every fill 0.033 and hope it lands near the bevel, because more would break the tail. Now: grow 0.060 — comfortably past the artwork's own inset — and confine the growth to the outer 0.132 band.

The fence does what the ration used to. Paint reaches the clip boundary everywhere (0.00% of the clip left unpainted, against 1.35% at the old 0.033), so the paint edge and the bevel crease are one line rather than two with a shading fold between them. And because the growth cannot act away from the silhouette, the mouth does not swell past its own ink and the face strokes keep their weight — which an unfenced flood would not have respected.

### The reverse is punched by structure, not by the face

Front paint has all the ink subtracted, as before. Back paint is punched only by the ink that lies inside the band — the stem and the leaf edges. That keeps the stem black on the reverse without redrawing anything, and still avoids the failure from `2026-08-25b`, where punching with the whole ink set put eyes, blush and a mouth on the back of the pin.

### Numbers

| | before | after |
|---|---|---|
| source | stone inside `matchaTonoki-logo.svg` | `static/ico-magatama.svg` |
| growth before clip | 0.033, everywhere | 0.060, inside the 0.132 band |
| unpainted clip area | 1.35% | 0.00% |
| `MAGATAMA_ICON_BEVEL_SIZE` | 0.045 | 0.045 |
| simplify tolerance | 0.6 artwork units | 0.15 |
| contour points | 865 | 805 |
| merged vertices | 14,061 | 14,097 |
| bounding box | 2.90 × 3.99 × 0.83 | 2.91 × 3.99 × 0.83 |

The line weight is deliberately unchanged. It is `MAGATAMA_ICON_BEVEL_SIZE` and nothing else, and 0.045 is what Jaume settled on in `2026-08-25c`. It is about half the weight of the line in the drawing; raising it to `0.09` would match the artwork and thicken the pin's rim to suit. One number, one re-bake.

## The Bake Is a File Now

`.agents/docs/bake-magatama-icon.py`. Previous passes described the bake in prose and left the script in a sandbox.

```
pip install shapely svgelements
python3 .agents/docs/bake-magatama-icon.py \
    static/ico-magatama.svg src/lib/three/magatama-icon-data.ts
```

Every knob is a module constant at the top, and the docstring says what each one is for. Note `static/ico-magatama.svg` is a bake source, not something the site links — it sits in `static/` because that is where Jaume put it, and it is also the obvious favicon source.

### One thing the script deliberately does not do

Re-clipping the paint after simplification. It was tried: `simplify` moves every boundary by up to its tolerance, the slab's extreme points included, so paint and slab edges agree only to within it. Re-clipping re-imports the clip's full vertex set to chase a mismatch of 0.0008 on a 3.9-unit object — the point count doubled to 1,539 and the mismatch stayed. The tolerance is the honest bound, so the test carries it as slack rather than the data carrying the vertices.

## Tests, at Last

`node_modules/` came back in `f0f5cde`, so the coverage the last two passes wanted is written. Five cases in `geometry.test.ts`:

- one base slab, and paint on both faces
- no `#e672a5` on the back — the reverse of a pin has no mouth
- paint occupies exactly tiers 1 and 2
- every paint layer inside the slab by `MAGATAMA_ICON_BEVEL_SIZE`, within the simplify tolerance
- the merged geometry is vertex-coloured and 2.9 × 4.0 × 0.83

That last pair is what actually guards the bake: the bevel constant and the data are one system, and the envelope is what the `layout` knobs assume.

## Verification

**Toolchain, for the first time on this object.** `npm run check` — 0 errors, the 2 standing `CursorPointer` warnings. `npm test` — 97 passed, 1 skipped, 13 files. `npm run build` — clean.

**Visual.** The repo's own `geometry.ts`, `scene-config.ts` and `magatama-tuning.ts` bundled with esbuild and run in headless Chromium under the scene's real lighting — jade key `#00a86b` at 2.2 from (5,5,5), cream ambient 0.34, `RoomEnvironment` through PMREM, `SRGBColorSpace`, no tone mapping. Front, 45°, reverse, on both stages, old data and new rendered from the same harness so the difference is the data alone. Plus a 20°-FOV close-up of the tail junction, which is the only framing in which the old bead's doubled edge is visible at all.

## Still Open

- **Packaging is the last thing wearing the old mark.** `packaging-branding-2026-08-24.py` still composites the faceted `magatama-mark.svg` and Cormorant Garamond. Now that a clean stone exists as its own file, that script's `label_lockup()` has an obvious new source.
- The mouth's pink still reads as a dark slot at oblique angles.
- The brand-order split; `static/favicon.svg` still the concentric-circles placeholder — `ico-magatama.svg` is a one-line answer to it.
- Cold/Hot recipe figures; `JADE_BELL_TUNING`; the `/club` backend.

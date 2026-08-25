# Tonoki Matcha Project Status

Date: 2026-08-25

## Summary

The giant Magatama in the hero is now the same character as the header icon. It was the faceted low-poly stone baked from `texture.svg`; it is now the drawn logo's illustrated stone, rebuilt in three dimensions the way an enamel pin is made — one bevelled ink slab with the artwork painted on its two faces.

This closes half of the split flagged in `project-status-2026-08-25.md`. The packaging photographs still carry the old faceted stone; see **Still Open**.

## Why an Enamel Pin and Not a Sculpt

The artwork is a flat cartoon with a bold ink outline, two leaves, a face and a pink mouth. There is no volume in it to extract — a "3D magatama" read from this drawing is an invention, not a translation. What the drawing *does* describe exactly is a flat object with a printed face, so that is what gets built: a slab of the silhouette with a rounded edge, and the colours laid on it.

It is also what the previous bake already was. The low-poly stone is a front shell, a back shell and a rim; this is the same topology with a rounded rim and a printed face instead of facets.

## Three Things the Bake Depends On

### The outline is not a layer

The base slab is ink-coloured and every colour fill is inset from the silhouette. The unpainted margin left showing around the colour **is** the outline. That is one less layer to keep registered, and — the part that matters — the line wraps over the bevel and continues around the object instead of stopping dead at the front edge. Turn the bead and the ink stays an ink edge.

Consequence: the bevel size sets the apparent line weight. A wider bevel draws a bolder outline.

### Paint is clipped to the bevel, and the two are one number

Every paint layer is clipped to `silhouette.buffer(-BEVEL_SIZE)`. Paint that crossed the bevel would hang off the rounded edge in mid-air. So `MAGATAMA_ICON_BEVEL_SIZE` is baked into the data file *and* read by the geometry builder — changing the tuning knob alone would float the paint. The constant is exported next to the layers for that reason, and is the one value in this system that cannot be tuned live.

At `0.05` the clip removes 1.5% of one leaf and nothing else. `0.09` was tried first and ate the leaves.

### Paint sits in tiers, not in draw order

The first pass stepped every layer one `paintGap` above the last. With 21 front layers that lifted the final ink 0.084 above a 4-unit object — a visible float on the blush strokes. Nothing within a tier overlaps, so two are enough: colour fills at tier 1, the ink that sits on them at tier 2. Max lift is now 0.008.

## The Back Is Deliberately Unrotated

The back paint keeps the front's winding and footprint, translated to the far face. It therefore faces *away* from the camera that sees it, and is lit correctly only because the material is `DoubleSide` and three flips the normal per fragment.

Rotating it π about Y to "face outward" was the first attempt. The silhouette is not symmetric about x, so that mirrored the paint off the shape — a green blob floating beside the stone. `DoubleSide` is load-bearing here, not defensive.

The back takes only the colour fills. No face, no blush, no mouth: the reverse of a pin.

## Ink Had to Lose Its Sheen

At the tuning's default `envMapIntensity` the outline rendered mid-grey, not black, and the drawing lost its line. The cause is not the environment alone: the ink is ~2.5% albedo, and the jade key light runs at `2.2`, so even that little albedo lifts to grey.

Two changes: the base takes the artwork's true `#070605` rather than a lifted near-black, and `icon.envMapIntensity` drops to `0.25`. The greens are bright enough that they lose nothing. The bead never disappears against the dark stage — the key light guarantees separation without the lift.

## Where It Lives

- `src/lib/three/magatama-icon-data.ts` — generated. 25 layers, 708 points, 13.7 KB. Normalised to a 3.9-unit height, centred, the same space as the low-poly bake, so every `layout` knob carries over untouched.
- `geometry.ts` → `createMagatamaIconGeometry()` — builds the slab, lays the paint, merges to one vertex-coloured geometry. 13,542 vertices, 2.91 × 4.00 × 0.83.
- `scene-config.ts` → `createIconMaterialOptions()` — smooth-shaded, not flat: the bevel is the one curved surface in the object and faceting it turns it into a row of chips.
- `magatama-tuning.ts` → `icon` block, `enabled: true`. The faceted stone and the smooth jade bead are both still selectable; `Scene.svelte` picks the most specific flag first.

## Reproducing the Bake

```
deps : shapely svgelements
```

Parse the stone paths out of `static/matchaTonoki-logo.svg` (everything whose fill is not the wordmark's `#241813`), flatten each `d` to rings at 64 samples a segment, XOR the rings of a path for even-odd fill, union for the silhouette. Normalise to height 3.9 centred, y-up. Drop the largest black path — that is the outline, and the slab replaces it. Clip every remaining shape to `silhouette.buffer(-0.05)`, simplify at 0.6 artwork units, emit.

## Verification

The repo's own `geometry.ts`, `scene-config.ts` and `magatama-tuning.ts` were bundled with esbuild and run in headless Chromium against the scene's real lighting — the jade key at 2.2 from (5,5,5), cream ambient at 0.34, `RoomEnvironment` through PMREM at the theme's intensity, `SRGBColorSpace`, no tone mapping. Rendered at four rotations on both stages, and side by side against the flat artwork at matched height. This is the shipped code path, not a reimplementation of it.

**Still not verified by the toolchain.** `node_modules/` remains absent, so `svelte-check`, `npm test` and `npm run build` did not run — the fourth entry in a row with that note. The type surface here is larger than the previous passes: a new exported interface, a new geometry function, a new material factory and a three-way branch in `Scene.svelte`. Run `npm install` then `npm run check && npm test && npm run build` before trusting it.

No tests were added for the same reason — an unrunnable new test is worse than none. `createMagatamaIconGeometry()` wants coverage on: layer count, the bounding box (2.91 × 4.00 × 0.83), a `color` attribute present, and `MAGATAMA_ICON_BEVEL_SIZE` matching what the data was clipped against.

## Still Open

- **The packaging is now the odd one out.** `packaging-branding-2026-08-24.py` composites the faceted `magatama-mark.svg` and Cormorant Garamond onto the tube and both pouches. Header and hero now agree with each other and disagree with the vessels. That file is still live and `magatama-mark.svg` must not be deleted.
- The mouth's pink is the only warm note in the object and it is small; at oblique angles it reads as a dark slot. Worth Jaume's eye on whether it should be larger or lighter at this scale.
- Carried over: the brand-order split (header and packaging say *Matcha Tonoki*, footer and page titles say *Tonoki Matcha*); the favicon placeholder — the stone alone, cropped from the master, is the obvious source; real product photography; the Cold/Hot recipe figures; `JADE_BELL_TUNING`; `/club` backend.

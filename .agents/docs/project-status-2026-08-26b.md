# Tonoki Matcha Project Status

Date: 2026-08-26

## Summary

The favicon is the stone. It had been a placeholder since May — a cream disc with two concentric circles, standing in for a brand that did not exist yet. Now that `static/ico-magatama.svg` does, the tab carries it.

Two files, cut by `.agents/docs/bake-favicon.py`: `static/favicon.svg` for the tab, `static/apple-touch-icon.png` for the iOS home screen. `src/app.html` gained one `<link>`.

## Two Slots, Two Different Icons

### `favicon.svg` — transparent, tight, and missing its blush

Rendered at 16–32px, the six little cheek strokes stop being a face and become dirt on the tab. They are dropped. The eyes and the mouth stay: they are what makes the shape a character rather than a leaf.

That is the only edit to the drawing, and it is made by rule, not by hand — the script drops the six smallest ink paths, so it survives Jaume redrawing the stone.

**No tile.** The first try put the stone on a cream disc like the placeholder had, and it cost too much: the stone is tall and narrow, so fitting it inside a circle shrank it to about half the square. Transparent and bled to the edges reads far better at every size.

The worry with a transparent icon is the dark tab bar, where the `#070605` outline disappears. Checked at 16/20/32/48/64 on both chromes: it does disappear, and it does not matter — the shape is carried by the bright `#b5d238` body and the two leaves, not by the line. On a light bar the outline separates it; on a dark bar the body does.

### `apple-touch-icon.png` — opaque, padded, whole

iOS composites a transparent icon onto black and rounds the corners itself, so this one is the opposite of the tab's: 180px, opaque, the cream `#f4efe4` tile, generous padding, and the full drawing including the blush — at that size the face reads.

## Reproducing

```
pip install svgelements cairosvg
python3 .agents/docs/bake-favicon.py static/ico-magatama.svg static
```

Both outputs, no hand-editing. `flat_paths()` resolves the artwork's nested transforms, so the emitted SVG is a flat list of paths in one coordinate space — which is also why `favicon.svg` is 14 KB rather than the source's 12: the transforms are baked into the path data.

## Verification

`npm run check` 0 errors, `npm test` 103 passed / 1 skipped, `npm run build` clean, and both assets present in the built client output. Rendered at 16, 20, 32, 48 and 64 against light and dark tab chrome.

## Still Open

Unchanged, minus the favicon:

- The packaging still carries the faceted mark and Cormorant type — the last thing wearing the old brand.
- The mouth's pink reads as a dark slot at oblique angles on the hero bead.
- The brand-order split: header and packaging say *Matcha Tonoki*, footer and page titles say *Tonoki Matcha*.
- Cold/Hot recipe figures; `JADE_BELL_TUNING`; the `/club` backend.

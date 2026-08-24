# Tonoki Matcha Project Status

Date: 2026-08-24

## Summary

The navigation wordmark is rebuilt. It reads **Matcha Tonoki** — words swapped from the previous "Tonoki Matcha" — set on two lines at `line-height: 1`, with a miniature of the brand's low-poly Magatama standing to its right. Jaume's call. The header had been a single line of running text; it is now a mark.

## What Changed

### The wordmark

`Navigation.svelte` no longer carries the brand as a bare text node. The two words are separate spans inside `.navigation__brand-name`, a column flex container set solid:

```css
.navigation__brand-name {
  display: flex;
  flex-direction: column;
  line-height: 1;
}
```

Stacking with `<br>` was rejected: at `line-height: 1` the two words need to behave as one typographic block that the mark can be measured against, and a flex column gives that block a real box. The `aria-label` moved to `Matcha Tonoki home` to match what is now on screen.

### The Magatama mark

`static/images/magatama-mark.svg` is new — the same 27-facet artwork that the WebGL bead is baked from (`.agents/docs/magatama-lowpoly-source-2026-07-24.svg`), so the header mark and the hero stone are literally the same object seen two ways.

The source file was not copied verbatim. Two changes:

- **Tight viewBox.** The original is `0 0 478 576` with the artwork floating inside it; the drawn paths only span roughly x 43–434, y 44–538. Left as-is, the header would have reserved a column of empty pixels beside the wordmark and the mark would have read as too small for its footprint. The exported viewBox is `40 41 398 501` — the true bounding box plus a hair for the 3.17px facet strokes.
- **`width`/`height` dropped.** The source declares `100%`/`100%`, which fights any CSS sizing. Intrinsic dimensions now come from the viewBox and the `width`/`height` attributes on the `<img>`, so the browser reserves the right box before the SVG loads and the header does not shift.

Sized off the wordmark rather than in absolute units:

```css
.navigation__brand-mark {
  flex-shrink: 0;
  width: auto;
  height: 2em;
}
```

Two words at `line-height: 1` are exactly `2em` tall, so mark and name share a cap-to-baseline height at any font size the header is ever set to. `flex-shrink: 0` keeps the mark from being squeezed when the nav row tightens on narrow screens.

The mark is `alt=""` + `aria-hidden="true"`: the anchor already announces itself through its `aria-label`, and a described mark would make the link read its name twice.

## Verification

Rendered at 2× in both themes against the real tokens (`--color-void` light `#f4efe4`, dark `#080b07`) with the Cormorant Garamond stack. Mark and wordmark align cap-to-baseline; the artwork's black facet strokes (`#070605`) hold their edges on the dark ground without a halo, so no theme-specific treatment is needed.

**Not verified by the toolchain.** `node_modules/` is still absent from the working tree, so `svelte-check`, `npm test` and `npm run build` cannot run — same environmental gap recorded in the 2026-08-24 entry. The change is CSS and markup only and touches no module boundary, but it went in unchecked. Run `npm install` then `npm run check && npm test && npm run build`.

## Open Question — Brand Name Order

The header now says **Matcha Tonoki**; the rest of the site still says **Tonoki Matcha**:

- `Footer.svelte` — "Tonoki Matcha - A bridge across 1,500 years."
- `Hero.svelte` — the subtitle's "Tonoki Matcha is the art of transforming…"
- `/legacy` and `/vessels/[slug]` — `<title>` and meta description
- `README.md`, these docs, `package.json` name, and the `tonokimatcha` repo

This was scoped to the logo on purpose, so the split is deliberate rather than an oversight — but it is a split, and a visitor reading the header and then the footer sees two names. Two ways to close it, and it is Jaume's call which:

1. **Matcha Tonoki is the brand.** Rename through copy, page titles, and meta. Repo and package name can lag; the domain already exists both ways (`matchatonoki.com` and `tonokimatcha.com`).
2. **The mark is a lockup, the prose name is unchanged.** Then the header is stylised on purpose and nothing else moves — but that should be written down here so a later session does not "fix" it back.

Until then, leave the body copy alone.

## Still Open

- Carried over from 2026-08-24: confirm the Cold/Hot recipe figures (33 cl, ~15 s, 80 °C, 24 h fridge window).
- Carried over: real product photography; `JADE_BELL_TUNING` timbre + mute toggle; `/club` backend with Supabase + invitation codes.
- `static/favicon.svg` is still the placeholder concentric-circle mark. Now that the Magatama exists as flat artwork, the favicon and app icons should be cut from it.

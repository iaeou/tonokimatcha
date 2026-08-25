# Tonoki Matcha Project Status

Date: 2026-08-25

## Summary

Jaume supplied a drawn logo — `static/matchaTonoki-logo.svg` — and it replaces the header lockup that was set in type. The header is now artwork: the illustrated Magatama on the **left**, `Matcha` over `Tonoki` to its right. Two files ship, one per theme, because the wordmark's ink is unreadable on the dark ground as drawn.

## The Supplied File

`matchaTonoki-logo.svg`, 934 × 705, group `LOGO HOR`, 36 paths, no live text — the lettering is outlined. It holds three elements, cleanly separable by fill:

| element | paths | fill(s) | bbox in the artwork |
|---|---|---|---|
| wordmark, two lines | 12 | `#241813` | x 64.6–434.7, y 77.9–274.3 |
| kanji | 2 | `#241813` | x 145.2–315.5, y 321.4–630.5 |
| stone | 22 | `#3eaf49` `#b5d238` `#e672a5` `#070605` | x 469.9–868.7, y 73.7–626.3 |

That the ink is exactly `#241813` on all 14 lettering paths and appears nowhere else is what makes a theme variant a one-line substitution rather than a redraw. The stone's own outline is `#070605`, a different black, so recoloring the ink never touches it.

## What Went Into the Header

Jaume's calls, taken on a render of all three options:

- **Icon left**, wordmark right. The previous lockup had it on the right.
- **No kanji.** In the artwork the kanji sits centred *below* the wordmark and the stone is drawn tall enough to span both. Beside a left-hand icon it has no natural home, and at header size it is a smudge — legible only if the header grows to about 5rem, from 2.25rem now. It stays in the master file for print and large uses.
- **2.25rem tall**, which is exactly what the old two-line wordmark occupied (1.125rem set solid), so the header keeps its proportions.
- **Two files**, not one inlined SVG with `currentColor`.

## The Two Files

`static/matchaTonoki-logo-nav.svg` and `…-nav-dark.svg`, both generated from the master:

- The kanji's two paths are dropped.
- The stone is scaled to the wordmark's two-line height (`196.4 / 552.6 = 0.3554`) and placed left, with a 44-unit gap.
- viewBox is cropped to what remains, `58.6 71.9 567.8 208.4`.
- Ink is `#241813` in the light file and `#f4efe4` — `--color-ink` on dark — in the dark one. Everything else is byte-identical.

Both are 15.9 KB and differ only in that colour. If the artwork changes, regenerate both from the master rather than editing either by hand; the generator is a dozen lines and the measured bboxes above are its only inputs.

### Why both are in the DOM

`<img>` `src` cannot be switched from CSS, and the theme is a `data-theme` attribute rather than `prefers-color-scheme`, so `<picture>` with a media query cannot see it either. Both images are therefore rendered and one is hidden:

```css
.navigation__brand-logo--dark { display: none; }
:root[data-theme='dark'] .navigation__brand-logo--light { display: none; }
:root[data-theme='dark'] .navigation__brand-logo--dark { display: block; }
```

The swap is then a `display` flip on an image the browser already decoded. Fetching the dark file on first toggle would blink the mark out in the middle of the theme circle's reveal — the one moment the eye is on that corner of the screen. The cost is one extra 15.9 KB request per load, which gzips to a fraction of that.

An inlined SVG with `fill: currentColor` would have been one file and no second request. Jaume chose two files for the simpler markup; the trade is recorded here so the choice is legible later.

## Verification

Rendered at 2× in both themes at 1000px and 390px against the real tokens. The lockup holds at both widths, the dark variant's cream ink sits clean on `#080b07`, and the stone's black outline needs no theme treatment — a bright `#b5d238` body carries it on either ground.

**Not verified by the toolchain.** `node_modules/` is still absent, the same gap recorded in the three previous entries, so `svelte-check`, `npm test` and `npm run build` did not run. Markup, CSS and two static assets; no module boundary touched. Run `npm install` then `npm run check && npm test && npm run build`.

## Consequence — the Packaging No Longer Matches

`project-status-2026-08-24c.md` composited the header lockup onto the tube and both pouches, and its closing point was that there is now **one** lockup, in the header and on the packaging. This change breaks that, in two ways at once:

- The stone differs. The packaging carries the **faceted low-poly** Magatama from `static/images/magatama-mark.svg`, baked from `magatama-lowpoly-source-2026-07-24.svg`. The header now carries the **illustrated rounded** stone, with leaves, blush and a mouth. They are different drawings of the same object.
- The lettering differs. The packaging sets the words in Cormorant Garamond; the drawn logo's lettering is a geometric sans, and it is outlined, so there is no font to match.

`magatama-mark.svg` is therefore still live — `packaging-branding-2026-08-24.py` reads it — and was left in place.

Closing the gap means re-running that script against the new artwork: `label_lockup()` would take the wordmark and stone from `matchaTonoki-logo.svg` instead of compositing type with the low-poly mark, and the mark would move to the left of the words. Not attempted here; it is a separate pass with its own dependencies (`pillow numpy cairosvg fonttools brotli`) and wants Jaume's eye on the result.

Also unresolved: whether the WebGL bead in the hero should become this rounded stone, or stay the faceted one. They are now visibly two different objects on the same page.

## Still Open

- Carried over from `2026-08-24b`: the header says **Matcha Tonoki**, while `Footer.svelte`, the hero subtitle, and the `<title>` tags on `/legacy` and `/vessels/[slug]` still say *Tonoki Matcha*. The drawn logo makes the header's order the brand's, which strengthens the case for renaming the copy — still Jaume's call, still untouched.
- `static/favicon.svg` is still the placeholder concentric circles. The stone alone, cropped out of the master, is the obvious favicon now.
- Carried over: real product photography; the Cold/Hot recipe figures; `JADE_BELL_TUNING` timbre + mute toggle; `/club` backend.

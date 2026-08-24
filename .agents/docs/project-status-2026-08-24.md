# Tonoki Matcha Project Status

Date: 2026-08-24

## Summary

The Ceremony section stops being a single liturgy and becomes **three switchable ways** to prepare the same 2 g: Cold, Hot, and Ceremony. Jaume's point: the individual sachet's real argument is that it is *easy* — you can shake it into a bottle of water and be done. The site was only showing the fifteen-minute version, which undersold the product it is actually built around.

## The Three Ways

Selector above the numerals (`.ceremony__ways`, plain toggle buttons with `aria-pressed` — not a `role="tablist"`, since there is no real tabpanel relationship). Each way carries its own `steps[]` and a one-line `kicker`.

### Cold — "One sachet, one bottle, fifteen seconds."

1. **Pour** (注ぐ) — one 2 g sachet into a 33 cl bottle of cold water. No sieve, no bowl, no tools. — *2 g into 33 cl, cold*
2. **Shake** (振る) — cap it, shake hard ~15 s, until nothing clings to the walls and the water is an even jade green. — *About 15 seconds, hard*
3. **Drink, then keep** (冷やす) — drink from the bottle; the rest holds a day in the fridge, shake again as the leaf settles. — *Up to 24 h refrigerated*

### Hot — "Same gesture, hotter water, insulated bottle."

1. **Fill** (湯を注ぐ) — ~33 cl at near 80 °C, not boiling; boiling scorches the leaf and turns it bitter. Leave headroom. — *33 cl at about 80 °C*
2. **Shake** (振る) — sachet in, hold the cap down, ~15 s. Same visual test as cold. — *Hold the cap — hot liquid*
3. **Drink** (飲む) — warm, straight from the bottle; insulated it travels for hours. — *Best within the hour*

### Ceremony — "The long way, when there is time for it."

Unchanged: the original four movements (warm the bowl / sift / whisk / serve), moved verbatim into the third way.

## Why Plain Language

The two everyday ways are deliberately written as instructions, not as liturgy — Jaume's call. The rest of the landing page keeps its ceremonial register, and the section lede does the reconciling work:

> The same two grams, whether it takes fifteen seconds or fifteen minutes. A bottle and a hard shake is a legitimate way to drink this tea.

That last sentence is load-bearing. Without it, a museum-voiced site showing "shake it in a water bottle" reads as an accident. With it, the ease is a stated position.

Section title: `Four Movements` → `Three Ways`.

## Implementation Notes

- `Ceremony.svelte`: new `Way` type wrapping the existing `Step`; `wayIndex` + `index` state. `goWay()` mirrors `go()` but **resets `index` to 0** — the short ways have no fourth movement, so carrying the index across would land out of bounds.
- Both selectors reuse the existing typed `ceremony` view transition and its circle-blur reveal, origin set from whichever control was pressed.
- `main.css`: `.ceremony__ways`, `.ceremony__way` (gold underline on `aria-pressed`), `.ceremony__kicker`; `.ceremony` gap tightened to `--space-3` now that there are two more rows.

## Verification

**Not verified.** `node_modules/` is absent from the working tree at time of writing, so `svelte-check`, `npm test` and `npm run build` all fail on missing packages (`@sveltejs/adapter-auto`, `vitest`, `gsap`, `three`). This is environmental, not a consequence of this change — but it does mean the change went in unchecked. Run `npm install` then `npm run check && npm test && npm run build` locally.

## Note on Parallel Work

This session's earlier commits (`0fe68f1`, `e2e6594`) were followed by work from another session — the `vessels/[slug]` detail route, `src/lib/data/vessels.ts`, and commits through `63ce7cf`. That refactor moved the vessel array out of `+page.svelte` and preserved the 100-sachet `note`. Nothing in this change touches it. The slug pages carry no preparation copy, so the three ways live only on the landing page; if vessel detail pages later describe preparation, they should read from a shared source rather than restate it.

## Still Open

- Confirm the two everyday recipes against how the tea actually behaves — 33 cl, ~15 s, 80 °C and the 24 h fridge window are all provisional.
- Real product photography.
- Carried over: `JADE_BELL_TUNING` timbre + mute toggle; `/club` backend with Supabase + invitation codes.

# Tonoki Matcha Project Status

Date: 2026-07-25 (second pass)

## Summary

Product model change, decided by Jaume: **there are no longer three product degrees**. There is one tea, at the highest grade, offered in three physical presentations. The landing page was restructured to separate *what the tea is* from *how it is carried*, and two copy strings were renamed.

## The Model Change

Before: `The Collection / Product Degrees` — a three-card grid of Kofun Imperial (Koicha), Hisui Ceremonial (Usucha), and Sakai Premium (Heritage Usucha). This implied a quality ladder that no longer exists commercially.

After: two sections.

### `#collection` — The Leaf / A Single Degree

One product: **Tonoki Ceremonial**, eyebrow `Single Degree`, certificate `TKC-0001`. Rendered as a single `.leaf-panel` (max 44rem) rather than a grid, reusing the existing `.certificate` ledger block for Harvest / Milling / Certificate.

The copy states the absence of a lower tier explicitly — *"There is no second tier beneath it"* — so the single-product structure reads as a deliberate standard, not a thin catalogue.

### `#vessels` — The Vessels / Three Presentations

Three formats, no hierarchy between them. Reuses `.collection-grid` (1 col → 3 cols at the existing breakpoint).

| Key | Name | Format |
| --- | --- | --- |
| A | The Single Serving | 2 g individual sachet |
| B | The Vessel | refined paper tube, 25 sachets |
| C | The Reserve | 30 g hermetic pouch |

Section lede: *"The tea does not change. Only the vessel that carries it to the bowl."* This is the load-bearing line — it prevents the three cards from being read as three qualities, which is exactly the confusion the old section created.

Kanji watermark for the new section is 器 (*ki*, vessel), consistent with 樹 / 玉 / 陵.

## Copy Renames

- Landing Guardian section title: `Private Admission` → `Custom Request`.
- `/club` section title: `Private Club` → `Tonoki Club`.

Rationale: "Private Admission" read as a gate on buying at all; "Custom Request" frames the Guardian flow as bespoke/B2B service. "Tonoki Club" names the thing instead of describing its access policy.

## Packaging Photography

Four reference photos added under `static/images/packaging/`:

- `sachet-2g.webp` — open tube with loose sticks in foreground (used for format A)
- `tube-25.webp` — closed tube (format B)
- `pouch-30g.webp` — stand-up hermetic pouch (format C)
- `pouch-30g-flat.webp` — same pouch flat, unused, held in reserve

These are **unbranded supplier samples**, not final product shots. They exist to give the section physical weight until real photography arrives. Cards render them in a `4 / 5` `.vessel-card__media` frame with `object-fit: cover` and a light `saturate(0.86)` desaturation so the raw phone photos sit inside the museum palette rather than fighting it. Swapping in final photography should need no CSS change.

## Files Touched

- `src/routes/+page.svelte` — `collection[]` → `leaf` object + `vessels[]`; one section became two.
- `src/lib/styles/main.css` — `.degree-card*` replaced by `.leaf-panel*`, `.vessels-lede`, `.vessel-card*` (incl. `__media`). `.collection-grid` and `.certificate` unchanged and now shared.
- `src/lib/components/Navigation.svelte` — `Collection` → `The Leaf` + new `Vessels` link to `/#vessels`.
- `src/routes/club/+page.svelte` — section title.
- `static/images/packaging/` — new.

The `#collection` id was deliberately kept so existing inbound anchors do not break.

## Verification

`svelte-check` reports no errors in the touched files (the 3 standing errors are the pre-existing `Scene.svelte` RoomEnvironment type resolution and the `CursorTrail.svelte` multi-input style build quirk).

`npm run build` was **not** verified for this change — the agent sandbox cannot rsync into `/tmp/tonoki-matcha-dev-src` (permission denied), so `scripts/run-clean-path.mjs` fails there. Run it locally before deploying.

## Still Open

- Real product photography to replace the supplier samples.
- Confirm whether the 2 g sachet is also sold loose or only inside the tube — the current copy implies both are orderable.
- Carried over: Jaume's eye on the six third-pass effects (delete `rise`/`breath` once approved); `JADE_BELL_TUNING` timbre + mute toggle; `/club` backend with Supabase + invitation codes.

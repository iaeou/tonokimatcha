# Matcha Tonoki Project Status

Date: 2026-08-27 (second pass)

## Summary

The Leaf section now names where the tea actually comes from. Until today the site asserted a standard without ever saying who grows the leaf — the strongest verifiable fact about the product was the one thing missing from it.

## Source Material

Jaume supplied packaging copy:

> PREMIUM ORGANIC MATCHA. This tea is made exclusively from organic first-flush leaves (ICHIBANCHA) from Horiguchi Seicha in Kagoshima, Japan.

Accurate but inert: it names *ichibancha* without saying what ichibancha buys you, and names Kagoshima without saying why Kagoshima. A visitor who does not already know Japanese tea learns two proper nouns and no reason to care.

## What Went In

`leaf.description` (rewritten):

> One tea only. Organic ichibancha — the first flush, picked once a year — shade-grown, stone-milled, and never cut with a later harvest. There is no second tier beneath it.

`leaf.origin` (new second paragraph, `.leaf-panel__origin`):

> It comes from one grower: Horiguchi Seicha, in Kagoshima at the southern end of Japan, where the season opens weeks before the rest of the country. Ichibancha is that opening. The leaf spends the winter storing sweetness and holding its bitterness back, which is why the bowl reads soft rather than grassy — and why there is no cheaper harvest of ours to compare it against.

Two things this does that the label copy does not: it explains the *mechanism* (winter dormancy concentrates amino acids, later flushes carry more catechin bitterness — the reason first flush commands its price), and it ties sourcing back to the single-degree argument rather than leaving it as a detached boast.

"Exclusively" from the label becomes "never cut with a later harvest", which is the same claim in language a buyer can picture.

## Marks

The ledger grows from three to five:

| Label | Value |
| --- | --- |
| Grower | Horiguchi Seicha, Kagoshima |
| Harvest | Ichibancha — first flush, once a year |
| Cultivation | Organic, shade-grown |
| Milling | Granite stone, 30 g per hour |
| Certificate | TKC-0001 |

`.leaf-panel .certificate` goes to two columns above 760px — five stacked rows read as a tall list on a desk. **Scoped to the leaf on purpose**: `.certificate` is shared with `VesselDetail` and `/legacy`, and the vessel panel is too narrow for two columns.

## A Claim Deliberately Not Made

The label says "ORGANIC"; the site says "Organic, shade-grown" and stops there. No certification body (JAS, EU organic) is named, because none was given. If Horiguchi's certification is JAS, saying so is worth more than the bare adjective — worth chasing.

## The Osaka / Kagoshima Question

The Lineage is Osaka: Tonoki-no-muraji, Sakai, the Daisenryō Kofun, and now Jaume's drawn skyline at the threshold. The leaf is Kagoshima, seven hundred kilometres southwest. This is not a contradiction — the heritage is the name's, the field is the grower's — but the two facts now sit two sections apart on the same page, and a careful visitor will notice.

The copy handles it by never implying the leaf grows in Osaka, and by attributing the field plainly to Horiguchi. If Jaume would rather make the seam explicit, the place to do it is one line in The Lineage, not a hedge in The Leaf.

## Verification

**Not verified.** `node_modules/` is present again but installed for macOS arm64, so the Linux sandbox cannot load `@rollup/rollup-linux-arm64-gnu` and `svelte-check` fails at config load for all 18 Svelte files. The only substantive errors reported are the two standing `three/examples/jsm/*` type resolutions, both pre-existing. Run `npm run check && npm test && npm run build` locally.

## Still Open

- Chase the certification body behind "organic" and name it if it exists.
- Decide whether The Lineage should acknowledge Kagoshima explicitly.
- Confirm the Cold/Hot recipes (33 cl, ~15 s, 80 °C, 24 h) against how the tea actually behaves.
- Real product photography to replace the supplier packaging samples.

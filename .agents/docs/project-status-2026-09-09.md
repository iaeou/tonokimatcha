# Matcha Tonoki Project Status

Date: 2026-09-09

## Summary

The home page is reordered around what a first-time visitor needs: **what the tea is → how you make it → how it is sold**, with the heritage moved after all three. The Leaf now explains *why* first flush matters instead of asserting it, Three Ways drops its selector and stands all three open, and the shelf leads with the tube. A new `/grower` hall documents Horiguchi Seicha.

Also found and fixed a long-standing environment problem that had made the last several commits unverifiable.

## New Section Order

| Was | Now |
| --- | --- |
| Lineage | **The Leaf** — A Single Degree |
| The Leaf | **How To Use** — Three Ways |
| The Vessels | **The Vessels** — Three Presentations |
| The Ceremony | Lineage |
| The Guardian | The Guardian |

The heritage did not get cut, it got demoted: it is why the house exists, not why anyone would buy the tea. Anchors are unchanged (`#collection`, `#ceremony`, `#vessels`, `#lineage`), so inbound links survive the reshuffle.

Navigation follows the page and gains a Grower link. `Legacy` was dropped from the nav to keep it to six items — the footer still links into all three legacy sections, so nothing is orphaned.

## 1. The Leaf

Product name is now **Premium Ceremonial Organic Matcha**. The single-degree argument is stated as a commercial fact rather than a boast: *"There is no second tier beneath it because we do not sell one."*

The substantive addition is a **harvest ladder** explaining first flush against what it is not:

| | |
| --- | --- |
| **Ichibancha** · late April | The winter's store, cut once. Highest theanine, lowest bitterness. **Ours.** |
| Nibancha · June | Regrowth under a stronger sun. More catechin, less theanine. |
| Sanbancha · July | Thinner again — blends, bottled tea, everyday grades. |
| Bancha · late leaf and stem | An honest daily tea, but not a ceremonial one. |

The mechanism is stated once, above the ladder: sunlight converts theanine into the catechins that taste bitter; a dormant winter bush accumulates theanine; the first cut takes that store away, and every later cut grows on a plant with less left to give. That is the whole reason first flush costs what it costs, and the site had never said it.

The three harvests we do not sell are described plainly rather than disparaged — `.harvest:not(.harvest--ours)` just recedes in colour. Calling nibancha bad tea would be both untrue and beneath the house.

## 2. How To Use — Three Ways

The selector is gone. `Ceremony.svelte` is now a presentational component reading `src/lib/data/ways.ts`, and all three ways stand open in parallel (three columns ≥760px, stacked below).

Each way leads with an **effort line** — `15 seconds · no tools`, `15 seconds · a thermos`, `Fifteen minutes · chawan and chasen` — so the cost is comparable before a single step is read. That comparison *is* the argument of the section; behind a selector it was invisible to anyone who never clicked.

Section eyebrow changed from "The Ceremony" to "How To Use", and the lede now names the objection it is answering: *"Good matcha has a reputation for being fussy. It is not."*

Cold gained a real justification rather than an apology: cold water draws less bitterness out of the leaf than hot, so the bottle is not a lesser method.

### Removed

- `Ceremony.svelte`'s state, `goWay`/`go`, and its view-transition wiring.
- The `ceremony` view-transition CSS block in `main.css` and `'ceremony'` from `ViewTransitionType` — nothing triggered them any more, and dead transition types are a trap for the next reader.

## 3. Three Presentations

Reordered to **tube → pouch → sachet**, and the house letters follow the shelf rather than the product: A is now the tube. `vessels.ts` carries a comment saying so, and a test pins `key` to `['A','B','C']` in array order, so a future reorder cannot silently leave the lettering behind.

The loose-sachet note now invites contact instead of stating a rule: *"Loose from one hundred sachets — ask us. Otherwise it travels inside the tube."*

## 4. The Grower — `/grower`

New hall, three sections: the field (Shibushi, Ōsumi peninsula; ~300 ha, 120 owned + 180 affiliated; early southern season; sprinkler frost protection), the method (IPM "Tea Rangers" — water, wind and rice bran instead of pesticides; 5G field sensors), and the mill (tencha explained; their `T-Pole` tencha factory; FSSC 22000).

Every figure is Horiguchi's own, from their corporate site, which is linked at the foot of the hall (`target="_blank"`, `rel="noopener noreferrer"`).

**One thing worth keeping straight:** both Horiguchi and Matcha Tonoki hold FSSC 22000, for different scopes. The page says so explicitly — theirs covers how the leaf is made, ours covers milling, sealing and keeping. Conflating them would be the easiest accidental lie on the site.

## The `NODE_ENV=production` Problem

Several recent commits shipped unverified because `npm run check`, `npm test` and `npm run build` all failed on missing packages. The cause was not the `##` path, the mirror, or a broken lockfile:

**`NODE_ENV=production` is set in the shell**, so npm resolves `omit=dev` and skips every devDependency — `@sveltejs/adapter-auto`, `vitest`, `svelte-check`, `three`, `gsap`. There is no `.npmrc` anywhere; it comes purely from the environment variable.

Workaround used here, and the one to use until the environment is changed:

```sh
NODE_ENV=development npm run check
NODE_ENV=development npm test
NODE_ENV=development npm run build
```

Worth fixing at the source — this will keep biting, and it silently degrades to "packages missing" rather than saying what is wrong.

## Verification

All green, on the real machine via the clean-path mirror:

- `npm run check` — **0 errors**, 2 pre-existing cosmetic warnings in `CursorPointer.svelte`.
- `npm test` — **120 passed**, 1 skipped, 15 files (new: `ways.test.ts`, plus the vessel ordering tests).
- `npm run build` — passed. `adapter-auto` prints its usual "could not detect a production environment" note locally; Vercel supplies that at build time.

## Still Open

- **Confirm the organic certification.** The packaging says ORGANIC; Horiguchi's English site foregrounds IPM (no pesticides or herbicides) and never claims a certification body. The site now says "Organic, shade-grown, IPM". If there is a JAS or EU organic certificate behind it, naming it is worth far more than the bare adjective — and if there is not, the word needs revisiting.
- Confirm the Cold/Hot recipes (33 cl, ~15 s, 80 °C, 24 h fridge).
- Real product photography to replace the supplier packaging samples.
- Consider whether `/grower` deserves a photograph of the field.

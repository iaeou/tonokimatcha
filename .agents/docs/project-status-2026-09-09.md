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

---

# Addendum — the stone gets a body

Jaume: give the magatama rounded volume, "more like a drop", keeping the shape.
Then, on seeing it: the rim's colour has to be almost the same as the faces'.

## The stone was a card

The bake makes an enamel pin: a slab extruded from the outline, flat paint laid
on its two faces. 0.83 thick across 2.9 of width, and the paint sitting on
planes — so from any angle off-axis it read as a sticker on a plate.

## Doming

`domeHeight(distance, reach, bulge)` — a circular arc, vertical at the outline
and flattening as it fills, which is a cabochon's profile. The input is the
distance to the silhouette, and that one choice does most of the work: the
bead's thickness ends up following its own width, so the body swells to the
full bulge and the tail, never more than ~0.3 across, stays slim without being
told to. That is the difference between a drop and a puffed pillow.

Three things had to be true for it to hold together:

- **The caps had to be subdivided.** Their triangulation is earcut over the
  outline, all long skinny triangles — doming that gives a crumpled tent.
  `refineTriangles` splits until no edge exceeds `maxEdge`, deciding per
  *edge* from its two endpoints, so a neighbour sharing that edge reaches the
  same verdict and the surface refines without T-junctions cracking open.
- **The paint had to move with it.** Same displacement, same function, so the
  artwork curves with the stone. The eyes and mouth bend over the swell.
- **The result had to be welded.** Every part arrives as a triangle soup, and
  on a soup `computeVertexNormals` can only give each triangle its own normal
  — the exact faceting the dome exists to remove. `mergeVertices` first.

Only `z` ever moves, so the drawing is untouched: still 2.91 x 3.99.

**Then the slab had to get thin.** Domed at the old 0.42/0.2 the stone kept a
straight extruded wall around its rim and read as a domed lid on a can. Pared
back to 0.08/0.04, the silhouette is a near-edge and the swell alone decides
thickness: the section is a lens, 1.27 on 2.91 of width.

## The dark tyre

Which produced the second note. The bake left the slab bare for 0.045 around
the silhouette and called that margin the outline — true of a flat card. Domed,
that same 0.045 of drawing *is* the whole shoulder of the lens: at the paint's
edge the surface has already climbed 0.18, so the bare margin became a dark
ring a third of the bead's thickness. A tyre.

The fix keeps the drawn line and loses the band. The shoulder samples the
nearest colour fill and wears it, so it is body-green under the body and
leaf-green under the leaves; the ink keeps `rim.inkWidth` (0.014) at the very
edge with a short blend out. Ink-coloured *front* layers are excluded from that
lookup — they are the drawn face, and letting an eye or the mouth win it would
smear a dark patch onto the rim beside it.

## Cost

Nearest-point lookups are memoised: the refined soup carries each vertex about
six times over, and each lookup walks the whole outline. `maxEdge` then went
0.12 → 0.18 after checking it in the browser — visually identical under smooth
normals, half the triangles.

| | tris | build |
| --- | --- | --- |
| 0.12, no memo | 36,937 | 162 ms |
| 0.12, memo | 36,937 | 135 ms |
| **0.18, memo** | **17,042** | **62 ms** |

One-time, inside the scene's existing lazy init.

## Verification

`npm test` — 127 passed, 1 skipped, 15 files. Seven new: the profile's shape
(monotonic, cabochon shoulder, clamped, off cleanly), that a narrow tail gets
less thickness than a wide body, the built envelope's proportions, and that the
result is indexed rather than a soup. `npm run check` — 0 errors, the 2 standing
`CursorPointer` warnings. `npm run build` — clean. In-browser: smooth at several
angles, rim green, no console errors.

## Open

The tuning is `icon.dome` and `icon.rim`; `dome.enabled: false` returns the
card. The back of the stone still carries only the colour fills, so its
shoulder is now green where the reverse itself stays bare — consistent, but
worth a look if the bead is ever seen from behind for long.

---

# Addendum — the stone steps back

Jaume: smaller, and further into the bottom right.

## Framing

The camera is 45° at z 5.8, so the plane the bead sits on shows ~4.8 units of
height and that times the aspect of width — about 9.9 x 4.8 on a wide desktop.
Positions in `layout` are in those units, which makes them readable once the
frame is written down:

| | was | now |
| --- | --- | --- |
| `scaleDesktop` | 0.45 | 0.32 |
| `positionXDesktop` | 1.65 | 2.75 |
| `positionYWide` | 0.12 | -1.05 |

That lands it about four fifths across and seven tenths down, clear of the
copy. Tablet and mobile moved with it.

## The clamp that had to come with it

x is an art direction in world units, but how much world fits across depends on
the aspect, and only the *width* does — the vertical extent is fixed by the fov
and the camera distance, so y is safe at any window shape. A tall narrow
desktop window shows barely 2.1 units either side of centre, so 2.75 would have
put the bead off the right edge entirely. The old 1.65 was already grazing it;
this would have made it a plain bug.

So `fitMagatamaX` honours the tuned x when there is room and clamps to what
exists when there is not, never past centre, leaving `layout.edgeInset` (4% of
the half-width) at the edge. The bead's own half-extent comes from its bounding
sphere — generous on purpose, since the stone rotates and its widest axis
swings into view.

Pure and tested rather than checked by eye: the browser tooling here would not
emulate a narrow viewport, and the arithmetic is the whole risk.

## Verification

`npm test` — 131 passed, 1 skipped (4 new on the clamp: honoured when wide,
pulled in when narrow, never past centre, inset preserved). `npm run check` — 0
errors, the 2 standing `CursorPointer` warnings. `npm run build` — clean.
In-browser at 1920 wide: small, bottom right, no console errors.

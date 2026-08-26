# Tonoki Matcha Project Status

Date: 2026-08-26

## Summary

The Guardian speaks like the logo now. One section of copy, rewritten as a test of tone — not a redesign.

Jaume asked whether the drawn logo, with its face and its pink mouth, obliges the site to loosen up. The answer we settled on is *half a step, and only in the copy*. This pass spends that half step in the one place where the mismatch was loudest, so the register can be judged on screen with the mark in the header before anything else moves.

## Why Half a Step

The logo is already half informal, not informal. The stone is a character; the wordmark beside it is Cormorant in lower case — the same serif the site has always used. Jaume drew a mark with one foot in each register, so the site moves the same distance and no further.

And the logo is not the first signal, it is the third. `2026-08-24` turned the Ceremony into three ways and put the plain ones in plain language, on the argument that the sachet's real virtue is that it is *easy* — *"A bottle and a hard shake is a legitimate way to drink this tea."* `2026-08-26b` kept the eyes and the mouth in the favicon on the grounds that they are what makes the shape a character. The product and the mark have been walking towards the visitor for two months. The museum copy had not moved.

So: the palette stays (the logo's `#3eaf49` / `#b5d238` are `--color-hisui`'s family), Cormorant stays, the layout's restraint stays, the ceremonial effects stay. No emoji, no heavy sans, no jokes in the microcopy. The drawing's informality is *hand-made and friendly*, not *loud*; its translation into a website is shorter sentences, second person, less abstraction — warmth through behaviour rather than decoration.

## What Changed

`src/routes/+page.svelte`, the `#guardian` hall:

- Title `Custom Request` → **`By Request`**. Still a noun phrase, so the row of headings stays level, and still the bespoke/B2B framing that `2026-07-25b` chose the old title for.
- Body: *"Admission requests are reviewed for cultural fit, storage discipline, and the seriousness of the service context."* → *"Tearooms, restaurants and shops order Tonoki in their own quantities and their own packaging. Tell us what you need and who it is for, and we will tell you honestly whether we can make it."*
- Call to action `Begin sponsorship request` → `Start a request`.

`src/routes/club/+page.svelte` — the destination of that link, so it had to travel with it. Both paragraphs rewritten: the club is *how* tearooms, restaurants, shops and private hosts buy the tea, and a guardian answers either way, "even when the answer is that we cannot do it yet".

`src/lib/components/MembershipForm.svelte` — `Institution` → `Business or institution`, `Request Sponsorship` → `Send request`, form label `Sponsorship request` → `Request form`.

`src/routes/legacy/+page.svelte` — the same call to action, for consistency of the one link.

**Kept on purpose:** the eyebrow *The Guardian* and the word *guardian* inside a friendlier sentence. The kanji 陵 and `MAGATAMA_TUNING.farewell` both hang off `#guardian`, `/legacy` already says requests are "read by a guardian", and the register can change without throwing away the mythology.

## Verification

`npm run check` 0 errors and the usual two cosmetic warnings, `npm test` 103 passed / 1 skipped, `npm run build` clean. No test asserts this copy.

## Still Open

The rest of the tone question, in order of damage — none of it touched, all of it wanting Jaume's eye:

- **`Nothing here behaves like a store`** in The Lineage. No longer true (a hundred-unit minimum, a bottle and a shake) and no longer the personality of the brand.
- **The hero.** *"Before history was written, we were here"* plus *"liquid jewel of absolute purity"* is the register at maximum, and the giant bead is now the same character as the icon at forty times the size. Render it before rewriting it.
- **The mouth's pink `#e672a5`** is the only colour of the logo outside the palette. Made into an accent token and used with an eyedropper — one hover, one focus — it is the cheap way for the site to authorise the character rather than merely tolerate it.
- The packaging still carries the faceted mark and Cormorant type. If the site softens and the packaging does not, the split widens.
- The brand-order split: header and packaging say *Matcha Tonoki*, footer and page titles say *Tonoki Matcha*.
- Cold/Hot recipe figures; `JADE_BELL_TUNING`; the `/club` backend.

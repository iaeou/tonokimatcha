# Matcha Tonoki Project Status

Date: 2026-08-27 (third pass)

## Summary

A contradiction introduced by the previous pass, caught on the live site: the hero said the tea comes from Osaka while The Leaf said Kagoshima. The hero is now corrected. Brand order is confirmed as **Matcha Tonoki** in the one living doc that still had it backwards.

## The Osaka Claim

`Hero.svelte` carried:

> Matcha Tonoki is one tea from the shaded fields of **Osaka**: first-harvest leaf, stone-milled, held to a single standard.

That line predates knowing where the leaf actually grows. Once `3cb496e` named Horiguchi Seicha in Kagoshima, the home page was set to assert two different origins about two hundred pixels apart. For a brand whose entire argument is documented provenance, that is not a wording nit — it is the failure mode.

Now:

> Matcha Tonoki is one tea from the shaded fields of **Kagoshima**: first-harvest leaf, stone-milled, held to a single standard.

**Standing rule, recorded in `project-context.md`:** Osaka is the lineage and the drawn skyline. Kagoshima is the field. No copy anywhere may put the leaf in Osaka.

This was found by fetching the deployed site, not by reading the repo — worth remembering. The contradiction was invisible in the diff because the two halves live in different files.

## Brand Order

`project-context.md` still opened with "Tonoki Matcha Digital Sanctuary" and described "Tonoki Matcha" in its first line, contradicting the order settled in `5ad86c6`. Corrected, with the rule stated explicitly so the next reader does not re-derive it.

Dated `project-status-*.md` files still contain the old order throughout. **Left alone on purpose** — they are a record of what was true when written, not live guidance. Only `project-context.md` is the living document.

`package.json` keeps `"name": "tonoki-matcha"`, which is a package identifier rather than brand copy. Renaming it churns the lockfile and the `/tmp` mirror path in `scripts/run-clean-path.mjs` for no visible gain. Left as is.

## Deployment Note

Vercel builds from `origin/main` on the free tier, auto-syncing on push. At the time of writing the live site was serving `3e49131` (Three Ways) while `5ad86c6` (brand order) and `3cb496e` (Horiguchi) had not yet appeared — so the live footer still read "Tonoki Matcha" and The Leaf still showed three marks. Either the builds were still queued or one failed. Nothing in this repo configures the deploy; it is wired from Jaume's Vercel dashboard.

If a build did fail, note that the last three commits all went in without a verified `npm run build` — the sandbox cannot run it (`/tmp` rsync permissions, then a macOS-arm64 `node_modules` the Linux sandbox cannot load).

## Verification

**Not verified locally.** Same environmental blocker. This change is a two-word copy edit inside an existing paragraph, so the risk is low, but `npm run check && npm test && npm run build` still wants running.

## Still Open

- Confirm the Vercel deploys landed; check the build log if The Leaf still shows three marks.
- Chase the certification body behind "organic" (JAS? EU?) and name it if it exists.
- Confirm the Cold/Hot recipes (33 cl, ~15 s, 80 °C, 24 h).
- Real product photography to replace the supplier packaging samples.

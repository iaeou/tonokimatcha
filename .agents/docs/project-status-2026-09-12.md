# Matcha Tonoki Project Status

Date: 2026-09-12

## Summary

Two copy passes directed by Jaume:

1. **Grower naming and geography**: Simplified to **Horiguchi Seicha** and placed squarely in **Kagoshima** across both `/grower` and the home page's Leaf section. Shibushi (and "Kagoshima Horiguchi Seicha" / "Ōsumi peninsula") was dropped from public-facing copy to keep geography immediately recognisable.
2. **Three Ways preparation calibration**:
   - **Cold Pour**: Volume updated to *"into a 15-75cl bottle"* (was 33 cl).
   - **Hot**: Shifted from a *"shake"* in an insulated bottle to a *"mix"* in a cup (Step 二: `Mix` / `混ぜる`). Effort updated to *"One minute · standard cutlery"*. Step text notes that hot leaf takes care to blend—easy with a *chasen* (bamboo whisk), but completely doable with standard cutlery.

## Files Touched

- `src/routes/grower/+page.svelte`: Grower name to `Horiguchi Seicha`, place to `Kagoshima`, title and external link label updated.
- `src/routes/+page.svelte`: Grower mark and origin copy in `#collection` updated to `Horiguchi Seicha` in `Kagoshima`.
- `src/lib/data/ways.ts`: Cold Pour bottle volume to `15-75cl`; Hot version converted to `Mix` with standard cutlery / chasen.
- `.agents/docs/project-context.md`: Synced with the new grower and preparation conventions.

## Verification

- `NODE_ENV=development npm run check`: 0 errors, 2 expected non-blocking warnings in `CursorPointer`.
- `NODE_ENV=development npm test`: 16 test files passed, 142 passed, 1 skipped.

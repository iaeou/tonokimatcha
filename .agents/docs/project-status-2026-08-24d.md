# Tonoki Matcha Project Status

Date: 2026-08-24

## Summary

The toolchain runs again, and `npm run check` works for the first time. Three commits had gone in unverified because `node_modules/` was missing from the tree; it is back, and the tree is clean — 0 errors, 92 tests passing, a successful build. The `check` script was the one gap: it invoked `svelte-check` directly from a path containing `#` and `*`, where esbuild cannot work. It now goes through the mirror like `dev`, `build` and `test` already did.

## What Changed

### `npm run check` goes through the clean-path mirror

```diff
- "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
+ "check": "node scripts/run-clean-path.mjs svelte-kit sync && node scripts/run-clean-path.mjs svelte-check --tsconfig ./tsconfig.json",
```

Run from the real project root, `svelte-check` reported four errors that were all artifacts of the path:

- Two `Build failed … Must use "outdir" when there are multiple input files (svelte(style))`, on `CursorPointer.svelte` and `CursorTrail.svelte`. esbuild, preprocessing the `<style>` blocks, cannot handle `#`/`*` in the config path; Vite says so itself before failing: *"The config path contains the `#` and `*` characters … which may not work when running Vite."*
- Two `Cannot find module 'three/examples/jsm/…'`, in `geometry.ts` and `Scene.svelte`. Same cause — the modules and their `@types/three` declarations are present and resolve correctly from the mirror.

All four vanish when the same check runs from `/tmp/tonoki-matcha-dev-src`. None of them were real.

## Verification

From the project root, with the amended script:

```
npm run check   →  0 errors, 2 warnings
npm test        →  92 passed, 1 skipped, 13 files
npm run build   →  built in 2.34s
```

The two remaining warnings are the known cosmetic pair in `CursorPointer.svelte`: `dot` and `ring` are `bind:this` targets declared as plain `let`, and Svelte 5 notes they are not `$state(...)`. They are never read reactively, so the warning is advisory. Left alone deliberately.

## Note on `npm install` — NODE_ENV

A first `npm install` produced only nine packages: the five runtime dependencies and their transitive deps, no devDependencies at all. The cause was `NODE_ENV=production` in the environment of the shell doing the installing, which makes npm imply `--omit=dev`.

It is not set in `~/.zshrc`, `~/.zshenv`, `~/.zprofile` or `launchctl`, so an ordinary terminal on this machine is unaffected — it comes from the environment of the agent shell. Recorded here because it is invisible and the failure it produces looks like a broken lockfile rather than a missing flag.

When installing through that shell:

```
NODE_ENV=development npm install --include=dev
```

The same applies to the `npm ci` that `run-clean-path.mjs` fires inside the mirror: under `NODE_ENV=production` the mirror gets a dev-less install and every script that depends on it fails.

## Still Open

Nothing in the toolchain. The open items remain the brand-name order (`project-status-2026-08-24b.md`) and real product photography (`project-status-2026-08-24c.md`).

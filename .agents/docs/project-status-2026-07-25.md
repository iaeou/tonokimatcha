# Tonoki Matcha Project Status

Date: 2026-07-25

## Summary

Fixed the sticky light theme. `DEFAULT_THEME` was already `dark`, but returning visitors still loaded light because the store persisted whatever theme it resolved at startup.

## The Bug

`theme.initialize()` called `applyTheme()`, which unconditionally wrote to `localStorage`. Anyone who visited while light was still the default got `tonoki-theme: light` written permanently, even though they never touched the toggle. The later switch to a dark default could never reach them: storage always won.

## Fix

- `src/lib/stores/theme.ts`:
  - `applyTheme(theme, { persist })` — persistence is now opt-in. `initialize()` applies without writing; only `set()` and `toggle()` persist.
  - New `STORAGE_KEY = 'tonoki-theme-choice'`, holding explicit choices only.
  - `LEGACY_STORAGE_KEY = 'tonoki-theme'` is removed on `initialize()`, so every visitor carrying an auto-persisted value is reset once to the ceremonial dark default. Self-healing — no manual cache clearing needed.
- `src/app.html`: the pre-paint script reads `tonoki-theme-choice`. Without an explicit choice, the `data-theme="dark"` on `<html>` stands.
- `src/lib/components/ThemeToggle.svelte`: local `$state` seeds from `DEFAULT_THEME` instead of a hardcoded `'light'`, so the `aria-label`/`aria-pressed` are correct before `initialize()` runs.

## Current Verification

- `npm test`: 11 files, 79 passed, 1 skipped.
- `svelte-check`: 0 errors, 2 pre-existing cosmetic warnings in `CursorPointer.svelte`.
- `npm run build`: passed.

## Note

Theme preference is intentionally not tied to `prefers-color-scheme`: the sanctuary opens dark for everyone, and the toggle is a deliberate act.

## Still Open

- Jaume's eye on the six third-pass effects; delete `rise`/`breath` once approved.
- Tune `JADE_BELL_TUNING` timbre and decide on a mute toggle.
- Next roadmap item: `/club` backend with Supabase + invitation codes.

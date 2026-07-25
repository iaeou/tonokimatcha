# Tonoki Matcha Project Status

Date: 2026-07-25

## Summary

Two changes to the theme system: the default is now **light** (Jaume's call), and the store no longer persists a theme the visitor did not explicitly choose.

## Default Theme: Light

`DEFAULT_THEME` is now `'light'`, matching `<html data-theme="light">` in `app.html`. Dark remains available through the toggle and keeps its own Magatama material tuning.

## The Persistence Bug

`theme.initialize()` called `applyTheme()`, which unconditionally wrote to `localStorage`. Every visitor got the resolved theme written permanently even when they never touched the toggle — so any later change of default could never reach them: storage always won. This is what made the earlier dark default appear not to apply.

## Fix

- `src/lib/stores/theme.ts`:
  - `applyTheme(theme, { persist })` — persistence is now opt-in. `initialize()` applies without writing; only `set()` and `toggle()` persist.
  - New `STORAGE_KEY = 'tonoki-theme-choice'`, holding explicit choices only.
  - `LEGACY_STORAGE_KEY = 'tonoki-theme'` is removed on `initialize()`, so every visitor carrying an auto-persisted value is reset once to the current default. Self-healing — no manual cache clearing needed.
- `src/app.html`: the pre-paint script reads `tonoki-theme-choice`. Without an explicit choice, the `data-theme="light"` on `<html>` stands.
- `src/lib/components/ThemeToggle.svelte`: local `$state` seeds from `DEFAULT_THEME` rather than a hardcoded literal, so the `aria-label`/`aria-pressed` stay correct before `initialize()` runs and survive future default changes.

## Current Verification

- `npm test`: 11 files, 79 passed, 1 skipped.
- `svelte-check`: 0 errors, 2 pre-existing cosmetic warnings in `CursorPointer.svelte`.
- `npm run build`: passed.

## Note

Theme preference is intentionally not tied to `prefers-color-scheme`: the sanctuary opens in light for everyone, and switching is a deliberate act.

## Still Open

- Jaume's eye on the six third-pass effects; delete `rise`/`breath` once approved.
- Tune `JADE_BELL_TUNING` timbre and decide on a mute toggle.
- Next roadmap item: `/club` backend with Supabase + invitation codes.

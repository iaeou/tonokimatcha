import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export type Theme = 'light' | 'dark';

/**
 * Only an explicit visitor choice is stored. The previous implementation
 * persisted whatever theme it resolved at startup, so every visitor who
 * arrived while light was still the default got `light` written into storage
 * permanently — later default changes could never reach them.
 */
export const STORAGE_KEY = 'tonoki-theme-choice';

/**
 * Storage key used before the choice-only model. Values under it are not
 * trustworthy as a deliberate choice, so it is cleared on first load.
 */
export const LEGACY_STORAGE_KEY = 'tonoki-theme';

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

export const DEFAULT_THEME: Theme = 'dark';

export function getInitialTheme(savedTheme: unknown): Theme {
  return isTheme(savedTheme) ? savedTheme : DEFAULT_THEME;
}

export function getNextTheme(theme: Theme): Theme {
  return theme === 'light' ? 'dark' : 'light';
}

function readStoredTheme(): Theme {
  if (!browser) return DEFAULT_THEME;
  return getInitialTheme(window.localStorage.getItem(STORAGE_KEY));
}

function applyTheme(theme: Theme, { persist = false }: { persist?: boolean } = {}) {
  if (!browser) return;

  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;

  if (persist) {
    window.localStorage.setItem(STORAGE_KEY, theme);
  }
}

function createThemeStore() {
  const { subscribe, set, update } = writable<Theme>(DEFAULT_THEME);

  return {
    subscribe,
    initialize() {
      if (browser) {
        window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      }

      const theme = readStoredTheme();
      set(theme);
      applyTheme(theme);
    },
    set(theme: Theme) {
      set(theme);
      applyTheme(theme, { persist: true });
    },
    toggle() {
      update((theme) => {
        const nextTheme = getNextTheme(theme);
        applyTheme(nextTheme, { persist: true });
        return nextTheme;
      });
    }
  };
}

export const theme = createThemeStore();

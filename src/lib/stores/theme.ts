import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'tonoki-theme';

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

function applyTheme(theme: Theme) {
  if (!browser) return;

  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem(STORAGE_KEY, theme);
}

function createThemeStore() {
  const { subscribe, set, update } = writable<Theme>(DEFAULT_THEME);

  return {
    subscribe,
    initialize() {
      const theme = readStoredTheme();
      set(theme);
      applyTheme(theme);
    },
    set(theme: Theme) {
      set(theme);
      applyTheme(theme);
    },
    toggle() {
      update((theme) => {
        const nextTheme = getNextTheme(theme);
        applyTheme(nextTheme);
        return nextTheme;
      });
    }
  };
}

export const theme = createThemeStore();

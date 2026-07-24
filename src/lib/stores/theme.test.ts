import { describe, expect, test } from 'vitest';
import {
  DEFAULT_THEME,
  LEGACY_STORAGE_KEY,
  STORAGE_KEY,
  getInitialTheme,
  getNextTheme,
  isTheme
} from './theme';

describe('isTheme', () => {
  test('accepts only supported Tonoki themes', () => {
    expect(isTheme('light')).toBe(true);
    expect(isTheme('dark')).toBe(true);
    expect(isTheme('system')).toBe(false);
    expect(isTheme(null)).toBe(false);
  });
});

describe('getInitialTheme', () => {
  test('defaults to ceremonial dark when no saved theme exists', () => {
    expect(DEFAULT_THEME).toBe('dark');
    expect(getInitialTheme(null)).toBe('dark');
    expect(getInitialTheme('system')).toBe('dark');
  });

  test('uses a saved supported theme', () => {
    expect(getInitialTheme('dark')).toBe('dark');
    expect(getInitialTheme('light')).toBe('light');
  });
});

describe('storage keys', () => {
  test('reads explicit choices from a key distinct from the legacy one', () => {
    // The legacy key also received auto-persisted defaults, so a value there
    // cannot be trusted as a deliberate choice.
    expect(STORAGE_KEY).toBe('tonoki-theme-choice');
    expect(LEGACY_STORAGE_KEY).toBe('tonoki-theme');
    expect(STORAGE_KEY).not.toBe(LEGACY_STORAGE_KEY);
  });
});

describe('getNextTheme', () => {
  test('toggles between light and dark', () => {
    expect(getNextTheme('light')).toBe('dark');
    expect(getNextTheme('dark')).toBe('light');
  });
});

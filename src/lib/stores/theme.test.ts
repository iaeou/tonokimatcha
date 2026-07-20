import { describe, expect, test } from 'vitest';
import { DEFAULT_THEME, getInitialTheme, getNextTheme, isTheme } from './theme';

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

describe('getNextTheme', () => {
  test('toggles between light and dark', () => {
    expect(getNextTheme('light')).toBe('dark');
    expect(getNextTheme('dark')).toBe('light');
  });
});

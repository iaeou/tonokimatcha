import { describe, expect, test } from 'vitest';
import { getInitialTheme, getNextTheme, isTheme } from './theme';

describe('isTheme', () => {
  test('accepts only supported Tonoki themes', () => {
    expect(isTheme('light')).toBe(true);
    expect(isTheme('dark')).toBe(true);
    expect(isTheme('system')).toBe(false);
    expect(isTheme(null)).toBe(false);
  });
});

describe('getInitialTheme', () => {
  test('defaults to light when no saved theme exists', () => {
    expect(getInitialTheme(null)).toBe('light');
  });

  test('uses a saved supported theme', () => {
    expect(getInitialTheme('dark')).toBe('dark');
  });
});

describe('getNextTheme', () => {
  test('toggles between light and dark', () => {
    expect(getNextTheme('light')).toBe('dark');
    expect(getNextTheme('dark')).toBe('light');
  });
});

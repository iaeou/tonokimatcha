import { describe, expect, test } from 'vitest';
import { FOCUS_SCRUB_SELECTOR, createFocusScrubOptions } from './focus-scrub';

describe('createFocusScrubOptions', () => {
  test('dims paragraphs outside the reading band and scrubs them to full ink', () => {
    const opts = createFocusScrubOptions();

    expect(opts.opacityFrom).toBeGreaterThan(0);
    expect(opts.opacityFrom).toBeLessThan(0.5);
    expect(opts.start).toBe('top 92%');
    expect(opts.end).toBe('top 58%');
  });

  test('targets paragraph-like content only', () => {
    expect(FOCUS_SCRUB_SELECTOR).toContain('p');
    expect(FOCUS_SCRUB_SELECTOR).not.toContain('h2');
  });
});

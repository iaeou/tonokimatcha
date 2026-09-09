import { describe, expect, test } from 'vitest';
import { createFigureDriftOptions } from './figure-drift';

describe('createFigureDriftOptions', () => {
  test('drifts the watermark down through the hall at a few percent opacity', () => {
    const opts = createFigureDriftOptions();

    expect(opts.yPercentFrom).toBeLessThan(0);
    expect(opts.yPercentTo).toBeGreaterThan(0);
    expect(opts.opacityPeak).toBeGreaterThan(0);
    expect(opts.opacityPeak).toBeLessThanOrEqual(0.12);
  });

  test('sits lighter than a single character did', () => {
    // The drawings carry roughly a quarter of their box in ink; the kanji they
    // replaced carried far less, so inheriting its 0.07 would stain the copy.
    expect(createFigureDriftOptions().opacityPeak).toBeLessThan(0.07);
  });

  test('accepts overrides', () => {
    expect(createFigureDriftOptions({ opacityPeak: 0.1 }).opacityPeak).toBe(0.1);
  });
});

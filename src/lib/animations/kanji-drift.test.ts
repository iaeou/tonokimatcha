import { describe, expect, test } from 'vitest';
import { createKanjiDriftOptions } from './kanji-drift';

describe('createKanjiDriftOptions', () => {
  test('drifts the watermark down through the hall at a few percent opacity', () => {
    const opts = createKanjiDriftOptions();

    expect(opts.yPercentFrom).toBeLessThan(0);
    expect(opts.yPercentTo).toBeGreaterThan(0);
    expect(opts.opacityPeak).toBeGreaterThan(0);
    expect(opts.opacityPeak).toBeLessThanOrEqual(0.12);
  });

  test('accepts overrides', () => {
    expect(createKanjiDriftOptions({ opacityPeak: 0.1 }).opacityPeak).toBe(0.1);
  });
});

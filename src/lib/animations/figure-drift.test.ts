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

  test('travels far enough to read as depth rather than as a nudge', () => {
    const { yPercentFrom, yPercentTo } = createFigureDriftOptions();
    // A hall is about a screen tall, so anything much under the figure’s own
    // height reads as a nudge rather than as another plane.
    expect(yPercentTo - yPercentFrom).toBeGreaterThan(150);
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

describe('the wipe', () => {
  test('rests both edges off the drawing so nothing shows at either end', () => {
    const { wipeFrom, wipeTo } = createFigureDriftOptions();
    // Clamped to exactly 0 and 1 the feathered band leaves a sliver of the
    // crown or the feet visible at rest.
    expect(wipeFrom).toBeLessThan(0);
    expect(wipeTo).toBeGreaterThan(1);
  });

  test('draws downward and lifts back upward, rather than closing like a shutter', () => {
    const { wipeFrom, wipeTo } = createFigureDriftOptions();
    // The edge starts above the crown and ends below the feet, and the exit
    // retraces it. A second edge descending instead would erase the figure
    // from the head down, which is the opposite gesture.
    expect(wipeFrom).toBeLessThan(wipeTo);
    expect(wipeTo - wipeFrom).toBeGreaterThan(1);
  });
});

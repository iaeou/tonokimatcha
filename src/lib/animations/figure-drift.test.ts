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

  test('stays a watermark, however much headroom the mask buys', () => {
    // It sat at 0.05 while the drawing overlapped a column of copy, and was
    // present without being seen. Hanging it off the right edge behind a
    // horizontal mask bought the headroom to raise it — but a figure that
    // competes with the writing is a picture, not a watermark, so there is
    // still a ceiling.
    const { opacityPeak } = createFigureDriftOptions();
    expect(opacityPeak).toBeGreaterThan(0.07);
    expect(opacityPeak).toBeLessThan(0.16);
  });

  test('centres the figure on the hall it belongs to', () => {
    const { anchorYPercent, travelYPercent, yPercentFrom, yPercentTo } =
      createFigureDriftOptions();

    // The travel is symmetric about the anchor, so the midpoint of the scrub —
    // where the ink peaks — leaves the figure exactly on it. Drop the anchor
    // and the peak wanders off the top of the screen, which is the bug this
    // replaced.
    expect((yPercentFrom + yPercentTo) / 2).toBe(anchorYPercent);
    expect(yPercentTo - yPercentFrom).toBe(travelYPercent);
    // −50% of its own height is what centres a `top: 50%` element.
    expect(anchorYPercent).toBe(-50);
  });

  test('accepts overrides', () => {
    expect(createFigureDriftOptions({ opacityPeak: 0.1 }).opacityPeak).toBe(0.1);
  });
});

describe('staying whole', () => {
  test('spends most of the hall at full ink, not arriving or leaving', () => {
    const { fadeShare } = createFigureDriftOptions();
    // Jaume, 2026-09-10: a figure caught half-drawn reads as a broken image.
    // The mask wipe that used to draw it on is gone; the fade that replaced it
    // is even across the whole drawing and has to stay short, or the figure
    // spends its time on screen in a state of arriving.
    expect(fadeShare).toBeGreaterThan(0);
    expect(fadeShare).toBeLessThan(0.25);
    expect(1 - 2 * fadeShare).toBeGreaterThan(0.6);
  });
});

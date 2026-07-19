import { describe, expect, it } from 'vitest';
import { createSmoothScrollOptions, shouldEnableSmoothScroll } from './smooth-scroll';

describe('createSmoothScrollOptions', () => {
  it('lets the GSAP ticker own the RAF loop', () => {
    expect(createSmoothScrollOptions().autoRaf).toBe(false);
  });

  it('glides in-page anchors instead of jumping', () => {
    expect(createSmoothScrollOptions().anchors).toBe(true);
  });

  it('keeps native touch scrolling for mobile performance', () => {
    expect(createSmoothScrollOptions().syncTouch).toBe(false);
  });

  it('uses a weighted museum-pace duration', () => {
    const { duration } = createSmoothScrollOptions();
    expect(duration).toBeGreaterThan(1);
    expect(duration).toBeLessThan(2);
  });

  it('eases monotonically from 0 to 1', () => {
    const { easing } = createSmoothScrollOptions();
    expect(easing(0)).toBeCloseTo(0, 2);
    expect(easing(1)).toBe(1);

    let previous = easing(0);
    for (let t = 0.1; t <= 1; t += 0.1) {
      const value = easing(t);
      expect(value).toBeGreaterThanOrEqual(previous);
      previous = value;
    }
  });
});

describe('shouldEnableSmoothScroll', () => {
  it('enables smooth scroll when motion is allowed', () => {
    expect(shouldEnableSmoothScroll(() => ({ matches: false }))).toBe(true);
  });

  it('disables smooth scroll when the user prefers reduced motion', () => {
    expect(shouldEnableSmoothScroll(() => ({ matches: true }))).toBe(false);
  });

  it('queries the reduced motion media feature', () => {
    let received = '';
    shouldEnableSmoothScroll((query) => {
      received = query;
      return { matches: false };
    });
    expect(received).toBe('(prefers-reduced-motion: reduce)');
  });
});

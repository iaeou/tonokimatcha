import { describe, expect, test } from 'vitest';
import { HERO_BACKDROP_TUNING, createBackdropOpacities } from './hero-backdrop';

const VIEWPORT = 1000;

function at(scrollY: number, closingHallTop: number | null = null) {
  return createBackdropOpacities({ scrollY, viewportHeight: VIEWPORT, closingHallTop });
}

describe('createBackdropOpacities', () => {
  test('opens on the photograph alone', () => {
    expect(at(0)).toEqual({ photo: 1, drawing: 0 });
  });

  test('does not start drawing until the photograph is mostly gone', () => {
    const { photo, drawing } = at(VIEWPORT * HERO_BACKDROP_TUNING.drawingEntryViewports);
    expect(drawing).toBe(0);
    expect(photo).toBeLessThan(0.5);
  });

  test('hands the threshold over: the photograph leaves, the drawing arrives', () => {
    const handoff = at(VIEWPORT * 0.8);
    expect(handoff.photo).toBeLessThan(0.3);
    expect(handoff.drawing).toBeGreaterThan(0);

    const settled = at(VIEWPORT * 1.6);
    expect(settled.photo).toBe(0);
    expect(settled.drawing).toBeCloseTo(1, 2);
  });

  test('withdraws the drawing as the closing hall climbs the viewport', () => {
    const scrolled = VIEWPORT * 2;

    // Hall still below the fold.
    expect(at(scrolled, VIEWPORT).drawing).toBeCloseTo(1, 2);

    const arriving = at(scrolled, VIEWPORT * 0.75).drawing;
    expect(arriving).toBeGreaterThan(0);
    expect(arriving).toBeLessThan(1);

    // Hall has claimed its share of the viewport: the drawing is gone.
    const claimed = VIEWPORT * (1 - HERO_BACKDROP_TUNING.withdrawalViewports);
    expect(at(scrolled, claimed).drawing).toBe(0);
    expect(at(scrolled, 0).drawing).toBe(0);
  });

  test('keeps both layers within bounds at every stage', () => {
    for (let scrollY = 0; scrollY <= VIEWPORT * 4; scrollY += VIEWPORT / 8) {
      for (const top of [null, VIEWPORT * 1.5, VIEWPORT * 0.5, 0, -VIEWPORT]) {
        const { photo, drawing } = at(scrollY, top);
        expect(photo).toBeGreaterThanOrEqual(0);
        expect(photo).toBeLessThanOrEqual(1);
        expect(drawing).toBeGreaterThanOrEqual(0);
        expect(drawing).toBeLessThanOrEqual(1);
      }
    }
  });

  test('survives a viewport that has not been measured yet', () => {
    expect(createBackdropOpacities({ scrollY: 0, viewportHeight: 0, closingHallTop: null })).toEqual(
      { photo: 1, drawing: 0 }
    );
  });
});

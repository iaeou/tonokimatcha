import { describe, expect, test } from 'vitest';
import {
  HERO_BACKDROP_TUNING,
  createBackdropOpacities,
  createInterludeInk
} from './hero-backdrop';

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
    const { withdrawalEntryViewports, withdrawalViewports } = HERO_BACKDROP_TUNING;

    // Hall still below the fold.
    expect(at(scrolled, VIEWPORT).drawing).toBeCloseTo(1, 2);

    // Merely visible is not yet arriving: the city keeps the gap it lives in.
    const peeking = VIEWPORT * (1 - withdrawalEntryViewports * 0.5);
    expect(at(scrolled, peeking).drawing).toBeCloseTo(1, 2);

    const arriving = at(
      scrolled,
      VIEWPORT * (1 - withdrawalEntryViewports - withdrawalViewports * 0.5)
    ).drawing;
    expect(arriving).toBeGreaterThan(0);
    expect(arriving).toBeLessThan(1);

    // Hall has claimed its share of the viewport: the drawing is gone.
    const claimed = VIEWPORT * (1 - withdrawalEntryViewports - withdrawalViewports);
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

describe('createInterludeInk', () => {
  const { readingBandTop, readingBandBottom, inkBehindCopy } = HERO_BACKDROP_TUNING;
  const band = {
    top: VIEWPORT * readingBandTop,
    bottom: VIEWPORT * readingBandBottom
  };

  test('gives the city the whole gap when no copy is in the band', () => {
    expect(createInterludeInk([], VIEWPORT)).toBe(1);
    // A hall that has already scrolled past overhead.
    expect(createInterludeInk([{ top: -800, bottom: -100 }], VIEWPORT)).toBe(1);
  });

  test('dims to the floor while copy fills the band', () => {
    expect(createInterludeInk([band], VIEWPORT)).toBeCloseTo(inkBehindCopy, 5);
  });

  test('takes the deepest intrusion, not the sum', () => {
    // Two blocks each covering half the band must not read as a full cover.
    const middle = (band.top + band.bottom) / 2;
    const halves = [
      { top: band.top, bottom: middle },
      { top: middle, bottom: band.bottom }
    ];

    expect(createInterludeInk(halves, VIEWPORT)).toBeGreaterThan(
      createInterludeInk([band], VIEWPORT)
    );
  });

  test('fades rather than snaps as a hall enters the band', () => {
    const entering = createInterludeInk(
      [{ top: band.bottom - (band.bottom - band.top) * 0.25, bottom: VIEWPORT * 2 }],
      VIEWPORT
    );

    expect(entering).toBeGreaterThan(inkBehindCopy);
    expect(entering).toBeLessThan(1);
  });

  test('stays within bounds and survives an unmeasured viewport', () => {
    expect(createInterludeInk([band], 0)).toBe(1);
    for (const top of [-500, 0, 300, 900, 2000]) {
      const ink = createInterludeInk([{ top, bottom: top + 600 }], VIEWPORT);
      expect(ink).toBeGreaterThanOrEqual(inkBehindCopy);
      expect(ink).toBeLessThanOrEqual(1);
    }
  });
});

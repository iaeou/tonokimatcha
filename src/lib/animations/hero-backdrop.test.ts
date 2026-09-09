import { describe, expect, test } from 'vitest';
import {
  HERO_BACKDROP_TUNING,
  createBackdropOpacities,
  createInterludeInk
} from './hero-backdrop';

const VIEWPORT = 1000;

function at(
  scrollY: number,
  closingHallTop: number | null = null,
  finalHallTop: number | null = null
) {
  return createBackdropOpacities({
    scrollY,
    viewportHeight: VIEWPORT,
    closingHallTop,
    finalHallTop
  });
}

describe('createBackdropOpacities', () => {
  test('opens on the photograph alone', () => {
    expect(at(0)).toEqual({ photo: 1, drawing: 0, figure: 0 });
  });

  test('lets the photograph lead, then crosses over rather than queueing', () => {
    // The hero is one viewport tall and the first hall starts immediately
    // below it, so the city cannot afford to wait for the photograph to
    // finish. They overlap on purpose — but the photograph still opens alone
    // and is the weaker of the two by the time the city is up.
    const { photo, drawing } = at(VIEWPORT * HERO_BACKDROP_TUNING.drawingEntryViewports);
    expect(drawing).toBe(0);
    expect(photo).toBeGreaterThan(0.5);

    const crossed = at(VIEWPORT * 0.6);
    expect(crossed.drawing).toBeGreaterThan(crossed.photo);
  });

  test('brings the city up inside the hero, not a screen below it', () => {
    // Full strength while the hero is still on screen. It used to need 1.5
    // viewports, by which point the closing hall had already killed it: the
    // city never rose above 4% of itself and was invisible on the page.
    const { photo, drawing } = at(VIEWPORT * 0.6);
    expect(drawing).toBeCloseTo(1, 2);
    expect(photo).toBeGreaterThan(0);
  });

  test('withdraws the drawing once the closing hall takes the top of the screen', () => {
    const scrolled = VIEWPORT * 2;
    const { withdrawalViewports } = HERO_BACKDROP_TUNING;

    // Hall still below the fold.
    expect(at(scrolled, VIEWPORT).drawing).toBeCloseTo(1, 2);

    // Filling the screen is not enough while its top is still in view: the
    // city holds the wall right up to the moment the hall owns it.
    expect(at(scrolled, VIEWPORT * 0.5).drawing).toBeCloseTo(1, 2);
    expect(at(scrolled, 0).drawing).toBeCloseTo(1, 2);

    const arriving = at(scrolled, -VIEWPORT * withdrawalViewports * 0.5).drawing;
    expect(arriving).toBeGreaterThan(0);
    expect(arriving).toBeLessThan(1);

    // The hall's top has climbed a full withdrawal past the edge: city gone.
    expect(at(scrolled, -VIEWPORT * withdrawalViewports).drawing).toBe(0);
  });

  test('hands the wall to the figure on exactly the curve that takes the city away', () => {
    const scrolled = VIEWPORT * 2;
    const { withdrawalEntryViewports, withdrawalViewports } = HERO_BACKDROP_TUNING;

    // City still holds the wall: no figure yet.
    expect(at(scrolled, VIEWPORT).figure).toBe(0);

    // Mid hand-off, both are partly present and neither is absent.
    const midpoint = VIEWPORT * (1 - withdrawalEntryViewports - withdrawalViewports * 0.5);
    const mid = at(scrolled, midpoint);
    expect(mid.drawing).toBeGreaterThan(0);
    expect(mid.figure).toBeGreaterThan(0);
    expect(mid.drawing + mid.figure).toBeCloseTo(1, 5);

    // City gone, figure holding the wall alone.
    const claimed = VIEWPORT * (1 - withdrawalEntryViewports - withdrawalViewports);
    expect(at(scrolled, claimed)).toMatchObject({ drawing: 0, figure: 1 });
  });

  test('withdraws the figure in turn as the final hall climbs', () => {
    const scrolled = VIEWPORT * 3;
    const { withdrawalEntryViewports, withdrawalViewports } = HERO_BACKDROP_TUNING;
    const gone = VIEWPORT * (1 - withdrawalEntryViewports - withdrawalViewports);

    // Final hall below the fold: the figure stays.
    expect(at(scrolled, gone, VIEWPORT).figure).toBe(1);

    const leaving = at(
      scrolled,
      gone,
      VIEWPORT * (1 - withdrawalEntryViewports - withdrawalViewports * 0.5)
    ).figure;
    expect(leaving).toBeGreaterThan(0);
    expect(leaving).toBeLessThan(1);

    expect(at(scrolled, gone, gone).figure).toBe(0);
  });

  test('leaves the figure in place when the final hall is absent', () => {
    // Same forgiveness the drawing gets without its closing hall.
    const gone =
      VIEWPORT *
      (1 - HERO_BACKDROP_TUNING.withdrawalEntryViewports - HERO_BACKDROP_TUNING.withdrawalViewports);
    expect(at(VIEWPORT * 3, gone, null).figure).toBe(1);
  });

  test('keeps every layer within bounds at every stage', () => {
    for (let scrollY = 0; scrollY <= VIEWPORT * 4; scrollY += VIEWPORT / 8) {
      for (const top of [null, VIEWPORT * 1.5, VIEWPORT * 0.5, 0, -VIEWPORT]) {
        for (const final of [null, VIEWPORT * 1.5, 0, -VIEWPORT]) {
          const { photo, drawing, figure } = at(scrollY, top, final);
          for (const value of [photo, drawing, figure]) {
            expect(value).toBeGreaterThanOrEqual(0);
            expect(value).toBeLessThanOrEqual(1);
          }
        }
      }
    }
  });

  test('survives a viewport that has not been measured yet', () => {
    expect(createBackdropOpacities({ scrollY: 0, viewportHeight: 0, closingHallTop: null })).toEqual(
      { photo: 1, drawing: 0, figure: 0 }
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

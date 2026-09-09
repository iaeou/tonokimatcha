import { describe, expect, test } from 'vitest';
import {
  HERO_BACKDROP_TUNING,
  createBackdropOpacities,
  createInterludeInk
} from './hero-backdrop';

const VIEWPORT = 1000;

function at(scrollY: number, finalHallTop: number | null = null) {
  return createBackdropOpacities({
    scrollY,
    viewportHeight: VIEWPORT,
    finalHallTop
  });
}

describe('createBackdropOpacities', () => {
  test('opens on the photograph alone', () => {
    expect(at(0)).toEqual({ photo: 1, figure: 0 });
  });

  test('lets the photograph lead, then crosses over rather than queueing', () => {
    // The hero is one viewport tall and the first hall starts immediately
    // below it, so the figure cannot afford to wait for the photograph to
    // finish. They overlap on purpose — but the photograph still opens alone
    // and is the weaker of the two by the time the figure is up.
    const { photo, figure } = at(VIEWPORT * HERO_BACKDROP_TUNING.figureEntryViewports);
    expect(figure).toBe(0);
    expect(photo).toBeGreaterThan(0.5);

    const crossed = at(VIEWPORT * 0.6);
    expect(crossed.figure).toBeGreaterThan(crossed.photo);
  });

  test('brings the figure up inside the hero, not a screen below it', () => {
    // Full strength while the hero is still on screen. Given a longer runway
    // the closing hall kills it first: it never rises above a few percent of
    // itself and is invisible on the page.
    const { photo, figure } = at(VIEWPORT * 0.6);
    expect(figure).toBeCloseTo(1, 2);
    expect(photo).toBeGreaterThan(0);
  });

  test('carries no Osaka stage — the city lives on /lineage now', () => {
    // The relay is two-handed. A third key here would mean the landing page
    // had quietly grown its drawing back.
    expect(Object.keys(at(VIEWPORT * 0.6)).sort()).toEqual(['figure', 'photo']);
  });

  test('withdraws the figure once the final hall takes the top of the screen', () => {
    const scrolled = VIEWPORT * 2;
    const { withdrawalEntryViewports, withdrawalViewports } = HERO_BACKDROP_TUNING;

    // Hall still below the fold.
    expect(at(scrolled, VIEWPORT).figure).toBeCloseTo(1, 2);

    // Filling the screen is not enough while its top is still in view: the
    // figure holds the wall right up to the moment the hall owns it.
    expect(at(scrolled, VIEWPORT * 0.5).figure).toBeCloseTo(1, 2);
    expect(at(scrolled, 0).figure).toBeCloseTo(1, 2);

    const arriving = at(
      scrolled,
      VIEWPORT * (1 - withdrawalEntryViewports - withdrawalViewports * 0.5)
    ).figure;
    expect(arriving).toBeGreaterThan(0);
    expect(arriving).toBeLessThan(1);

    // The hall's top has climbed a full withdrawal past the trigger: gone.
    expect(at(scrolled, VIEWPORT * (1 - withdrawalEntryViewports - withdrawalViewports)).figure)
      .toBe(0);
  });

  test('leaves the figure in place when the final hall is absent', () => {
    expect(at(VIEWPORT * 3, null).figure).toBe(1);
  });

  test('keeps every layer within bounds at every stage', () => {
    for (let scrollY = 0; scrollY <= VIEWPORT * 4; scrollY += VIEWPORT / 8) {
      for (const final of [null, VIEWPORT * 1.5, VIEWPORT * 0.5, 0, -VIEWPORT]) {
        const { photo, figure } = at(scrollY, final);
        for (const value of [photo, figure]) {
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  test('survives a viewport that has not been measured yet', () => {
    expect(createBackdropOpacities({ scrollY: 0, viewportHeight: 0 })).toEqual({
      photo: 1,
      figure: 0
    });
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

import { describe, expect, test } from 'vitest';
import { findVessel, vessels } from './vessels';

describe('vessels', () => {
  test('shelves the three presentations tube first and loose sachet last', () => {
    expect(vessels.map((vessel) => vessel.slug)).toEqual(['tube', 'pouch', 'sachet']);
  });

  test('letters the vessels in shelf order', () => {
    // The letter is house shorthand for a position on the shelf, so it must be
    // derived from the order rather than pinned to a product.
    expect(vessels.map((vessel) => vessel.key)).toEqual(['A', 'B', 'C']);
  });

  test('keeps slugs unique', () => {
    // Slugs are the URL and the view-transition-name; a collision would both
    // break deep links and abort the morph.
    expect(new Set(vessels.map((vessel) => vessel.slug)).size).toBe(vessels.length);
  });

  test('carries an image and alt text for every vessel', () => {
    for (const vessel of vessels) {
      expect(vessel.image.startsWith('/images/packaging/')).toBe(true);
      expect(vessel.alt.length).toBeGreaterThan(0);
    }
  });

  test('states the hundred-sachet condition only on the loose sachet', () => {
    expect(findVessel('sachet')?.note).toMatch(/one hundred/);
    expect(findVessel('tube')?.note).toBeUndefined();
    expect(findVessel('pouch')?.note).toBeUndefined();
  });
});

describe('findVessel', () => {
  test('finds a vessel by slug', () => {
    expect(findVessel('tube')?.name).toBe('The Vessel');
  });

  test('returns nothing for an unknown or missing slug', () => {
    expect(findVessel('teapot')).toBeUndefined();
    expect(findVessel(undefined)).toBeUndefined();
  });
});

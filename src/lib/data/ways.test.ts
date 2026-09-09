import { describe, expect, test } from 'vitest';
import { ways } from './ways';

describe('ways', () => {
  test('offers the three ways with the fastest first', () => {
    expect(ways.map((way) => way.id)).toEqual(['cold', 'hot', 'ceremony']);
  });

  test('states an effort for every way', () => {
    // The section's argument is that two of the three are quick, and that only
    // works if the cost is legible before any step is read.
    for (const way of ways) {
      expect(way.effort.length).toBeGreaterThan(0);
    }
  });

  test('keeps the everyday ways to three steps and the long way to four', () => {
    expect(ways.map((way) => way.steps.length)).toEqual([3, 3, 4]);
  });

  test('numbers the steps with kanji numerals in order', () => {
    const numerals = ['一', '二', '三', '四'];

    for (const way of ways) {
      expect(way.steps.map((step) => step.numeral)).toEqual(numerals.slice(0, way.steps.length));
    }
  });

  test('names every step in both registers', () => {
    for (const way of ways) {
      for (const step of way.steps) {
        expect(step.name.length).toBeGreaterThan(0);
        expect(step.japanese.length).toBeGreaterThan(0);
        expect(step.body.length).toBeGreaterThan(0);
      }
    }
  });
});

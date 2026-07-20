import { describe, expect, test } from 'vitest';
import {
  CURSOR_TRAIL_TUNING,
  createTrailPoint,
  shouldEnableCursorTrail,
  stepTrailPoints
} from './cursor-trail';

const fixedRandom = () => 0.5;

describe('createTrailPoint', () => {
  test('spawns a full-life mote at the pointer with bounded size', () => {
    const point = createTrailPoint(10, 20, fixedRandom);

    expect(point.x).toBe(10);
    expect(point.y).toBe(20);
    expect(point.life).toBe(1);
    expect(point.size).toBeGreaterThanOrEqual(CURSOR_TRAIL_TUNING.sizeMin);
    expect(point.size).toBeLessThanOrEqual(CURSOR_TRAIL_TUNING.sizeMax);
  });
});

describe('stepTrailPoints', () => {
  test('advances position, decays life, and drops dead motes without mutating input', () => {
    const start = [createTrailPoint(0, 0, fixedRandom)];
    const stepped = stepTrailPoints(start, 0.1);

    expect(start[0].life).toBe(1);
    expect(stepped[0].life).toBeLessThan(1);
    expect(stepped[0].x).not.toBe(0);

    const gone = stepTrailPoints(start, CURSOR_TRAIL_TUNING.lifespan + 0.01);
    expect(gone).toHaveLength(0);
  });
});

describe('shouldEnableCursorTrail', () => {
  test('requires a fine pointer and no reduced-motion preference', () => {
    const make = (reduced: boolean, fine: boolean) => (query: string) => ({
      matches: query.includes('reduced-motion') ? reduced : fine
    });

    expect(shouldEnableCursorTrail(make(false, true))).toBe(true);
    expect(shouldEnableCursorTrail(make(true, true))).toBe(false);
    expect(shouldEnableCursorTrail(make(false, false))).toBe(false);
    expect(shouldEnableCursorTrail(undefined)).toBe(false);
  });
});

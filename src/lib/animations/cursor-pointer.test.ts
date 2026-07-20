import { describe, expect, test } from 'vitest';
import {
  CURSOR_POINTER_TUNING,
  approach,
  createPointerState,
  magnetizedPosition,
  shouldEnableCursorPointer,
  stepPointer,
  targetScales
} from './cursor-pointer';

describe('approach', () => {
  test('moves toward the target without overshooting and is frame-rate independent', () => {
    const oneStep = approach(0, 100, 9, 0.2);
    expect(oneStep).toBeGreaterThan(0);
    expect(oneStep).toBeLessThan(100);

    // Two half-steps land in the same place as one full step.
    const half = approach(approach(0, 100, 9, 0.1), 100, 9, 0.1);
    expect(half).toBeCloseTo(oneStep, 10);
  });

  test('stays put when already at the target', () => {
    expect(approach(42, 42, 9, 0.5)).toBe(42);
  });
});

describe('magnetizedPosition', () => {
  test('passes through untouched with no magnet or out of range', () => {
    expect(magnetizedPosition(10, 20, null)).toEqual({ x: 10, y: 20 });

    const far = magnetizedPosition(0, 0, {
      centerX: CURSOR_POINTER_TUNING.magnetRange + 1,
      centerY: 0
    });
    expect(far).toEqual({ x: 0, y: 0 });
  });

  test('pulls toward the center with falloff, strongest near the center', () => {
    const near = magnetizedPosition(10, 0, { centerX: 0, centerY: 0 });
    const farther = magnetizedPosition(60, 0, { centerX: 0, centerY: 0 });

    // Pulled toward center (negative direction) but never past it.
    expect(near.x).toBeLessThan(10);
    expect(near.x).toBeGreaterThan(-10);

    // Relative pull (fraction of distance covered) is larger when closer.
    const nearFraction = (10 - near.x) / 10;
    const fartherFraction = (60 - farther.x) / 60;
    expect(nearFraction).toBeGreaterThan(fartherFraction);
  });

  test('is continuous at the range boundary (no jump on hover enter)', () => {
    const justInside = magnetizedPosition(CURSOR_POINTER_TUNING.magnetRange - 0.01, 0, {
      centerX: 0,
      centerY: 0
    });
    expect(justInside.x).toBeCloseTo(CURSOR_POINTER_TUNING.magnetRange - 0.01, 1);
  });
});

describe('targetScales', () => {
  test('rest, hover, and press states', () => {
    expect(targetScales(false, false)).toEqual({ ring: 1, dot: 1 });

    const hover = targetScales(true, false);
    expect(hover.ring).toBe(CURSOR_POINTER_TUNING.hoverRingScale);
    expect(hover.dot).toBe(CURSOR_POINTER_TUNING.hoverDotScale);

    const pressed = targetScales(false, true);
    expect(pressed.ring).toBe(CURSOR_POINTER_TUNING.pressScale);

    const both = targetScales(true, true);
    expect(both.ring).toBeCloseTo(
      CURSOR_POINTER_TUNING.hoverRingScale * CURSOR_POINTER_TUNING.pressScale
    );
  });
});

describe('stepPointer', () => {
  test('dot snaps to the pointer, ring lags behind, and input is not mutated', () => {
    const start = createPointerState(0, 0);
    const next = stepPointer(start, 100, 0, null, false, false, 0.016);

    expect(start.ringX).toBe(0);
    expect(next.x).toBe(100);
    expect(next.ringX).toBeGreaterThan(0);
    expect(next.ringX).toBeLessThan(100);
  });

  test('converges on the pointer over time', () => {
    let state = createPointerState(0, 0);
    for (let i = 0; i < 300; i++) {
      state = stepPointer(state, 100, 50, null, true, false, 0.016);
    }
    expect(state.ringX).toBeCloseTo(100, 0);
    expect(state.ringY).toBeCloseTo(50, 0);
    expect(state.ringScale).toBeCloseTo(CURSOR_POINTER_TUNING.hoverRingScale, 2);
  });
});

describe('shouldEnableCursorPointer', () => {
  test('requires a fine pointer and no reduced-motion preference', () => {
    const make = (reduced: boolean, fine: boolean) => (query: string) => ({
      matches: query.includes('reduced-motion') ? reduced : fine
    });

    expect(shouldEnableCursorPointer(make(false, true))).toBe(true);
    expect(shouldEnableCursorPointer(make(true, true))).toBe(false);
    expect(shouldEnableCursorPointer(make(false, false))).toBe(false);
    expect(shouldEnableCursorPointer(undefined)).toBe(false);
  });
});

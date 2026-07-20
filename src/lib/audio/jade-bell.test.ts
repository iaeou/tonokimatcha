import { describe, expect, test } from 'vitest';
import { JADE_BELL_TUNING, pickNoteIndex, shouldStrike } from './jade-bell';

describe('JADE_BELL_TUNING', () => {
  test('keeps a quiet D-minor pentatonic ladder in a low-mid register', () => {
    expect(JADE_BELL_TUNING.notes).toEqual(['D3', 'F3', 'G3', 'A3', 'C4', 'D4', 'F4']);
    expect(JADE_BELL_TUNING.volumeDb).toBeLessThanOrEqual(-12);
  });
});

describe('pickNoteIndex', () => {
  test('maps the vertical pointer position onto the ladder, top = highest', () => {
    expect(pickNoteIndex(0, 7)).toBe(0);
    expect(pickNoteIndex(0.5, 7)).toBe(3);
    expect(pickNoteIndex(0.999, 7)).toBe(6);
  });

  test('clamps out-of-range positions onto the ladder', () => {
    expect(pickNoteIndex(-2, 7)).toBe(0);
    expect(pickNoteIndex(1, 7)).toBe(6);
    expect(pickNoteIndex(5, 7)).toBe(6);
  });
});

describe('shouldStrike', () => {
  const tuning = { minDragPx: 46, minIntervalMs: 130 };

  test('requires both enough drag distance and enough elapsed time', () => {
    expect(shouldStrike({ accumulatedPx: 46, elapsedMs: 130 }, tuning)).toBe(true);
    expect(shouldStrike({ accumulatedPx: 45, elapsedMs: 1000 }, tuning)).toBe(false);
    expect(shouldStrike({ accumulatedPx: 1000, elapsedMs: 129 }, tuning)).toBe(false);
  });
});

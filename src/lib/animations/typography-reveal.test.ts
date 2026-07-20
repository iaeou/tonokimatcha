import { describe, expect, test } from 'vitest';
import {
  TONOKI_REVEAL_EASE,
  createBreathRevealOptions,
  createRevealObserverOptions,
  createKintsugiOptions,
  createKintsugiPathD,
  createRiseHiddenState,
  createRiseRevealOptions,
  createSumiRevealOptions,
  splitElementIntoLetterSpans,
  observeReveal,
  tokenizeWords
} from './typography-reveal';

describe('TONOKI_REVEAL_EASE', () => {
  test('matches the project-wide ceremonial easing curve', () => {
    expect(TONOKI_REVEAL_EASE).toBe('cubic-bezier(0.22, 1, 0.36, 1)');
  });
});

describe('createRiseRevealOptions', () => {
  test('uses the slow, ceremonial defaults that distinguish this from a generic SplitText reveal', () => {
    expect(createRiseRevealOptions()).toMatchObject({
      riseFromPercent: 110,
      duration: 1.4,
      stagger: 0.08,
      ease: TONOKI_REVEAL_EASE,
      letterSpacingFrom: '-0.02em',
      letterSpacingTo: '0em'
    });
  });

  test('rises words from below the descender line so letters like "y" / "g" never clip', () => {
    expect(createRiseRevealOptions().riseFromPercent).toBeGreaterThanOrEqual(100);
  });

  test('merges overrides on top of the defaults', () => {
    const opts = createRiseRevealOptions({ duration: 2.2, stagger: 0.12 });
    expect(opts.duration).toBe(2.2);
    expect(opts.stagger).toBe(0.12);
    expect(opts.ease).toBe(TONOKI_REVEAL_EASE);
    expect(opts.riseFromPercent).toBe(110);
  });
});

describe('createRiseHiddenState', () => {
  test('resets parsed pixel y so the pre-hide transform cannot survive the reveal', () => {
    expect(createRiseHiddenState()).toEqual({
      y: 0,
      yPercent: 110
    });
  });
});

describe('createBreathRevealOptions', () => {
  test('exhales longer than the rise so eyebrows announce the section rather than snap in', () => {
    expect(createBreathRevealOptions()).toMatchObject({
      duration: 1.8,
      ease: TONOKI_REVEAL_EASE,
      letterSpacingFrom: '0em',
      opacityFrom: 0.2
    });
  });

  test('is intentionally slower than the rise effect', () => {
    expect(createBreathRevealOptions().duration).toBeGreaterThan(
      createRiseRevealOptions().duration
    );
  });

  test('merges overrides on top of the defaults', () => {
    const opts = createBreathRevealOptions({ opacityFrom: 0 });
    expect(opts.opacityFrom).toBe(0);
    expect(opts.duration).toBe(1.8);
  });
});

describe('createRevealObserverOptions', () => {
  test('uses an IntersectionObserver viewport line equivalent to top 82%', () => {
    expect(createRevealObserverOptions()).toEqual({
      root: null,
      rootMargin: '0px 0px -18% 0px',
      threshold: 0
    });
  });
});

describe('observeReveal', () => {
  test('plays immediately when IntersectionObserver is unavailable', () => {
    let revealed = false;

    const cleanup = observeReveal({} as HTMLElement, () => {
      revealed = true;
    });

    expect(revealed).toBe(true);
    cleanup();
  });
});

describe('tokenizeWords', () => {
  test('splits a heading into the words that will each receive a mask span', () => {
    expect(tokenizeWords('The Dignified Tree')).toEqual(['The', 'Dignified', 'Tree']);
  });

  test('preserves punctuation as part of the adjacent word so it animates together', () => {
    expect(tokenizeWords('Before history was written, we were here.')).toEqual([
      'Before',
      'history',
      'was',
      'written,',
      'we',
      'were',
      'here.'
    ]);
  });

  test('drops all whitespace, including runs of whitespace and edge whitespace', () => {
    expect(tokenizeWords('   Tonoki   Matcha   ')).toEqual(['Tonoki', 'Matcha']);
  });

  test('returns an empty array for empty or whitespace-only input', () => {
    expect(tokenizeWords('')).toEqual([]);
    expect(tokenizeWords('     ')).toEqual([]);
  });
});

describe('createKintsugiOptions', () => {
  test('draws a short gold seam slower than a flick, faster than the rise', () => {
    const opts = createKintsugiOptions();

    expect(opts.duration).toBeCloseTo(1.1);
    expect(opts.widthEm).toBeCloseTo(4.5);
    expect(opts.seed).toBe(7);
  });
});

describe('createKintsugiPathD', () => {
  test('is deterministic per seed and varies across seeds', () => {
    expect(createKintsugiPathD(100, 8, 7)).toBe(createKintsugiPathD(100, 8, 7));
    expect(createKintsugiPathD(100, 8, 7)).not.toBe(createKintsugiPathD(100, 8, 8));
  });

  test('builds three cubic segments spanning the full width', () => {
    const d = createKintsugiPathD(100, 8, 7);

    expect(d.startsWith('M 0 ')).toBe(true);
    expect(d.match(/C /g)).toHaveLength(3);
    expect(d).toContain('100.00');
  });

  test('keeps the wobble inside the viewBox height', () => {
    const d = createKintsugiPathD(100, 8, 7);
    const yValues = [...d.matchAll(/(-?\d+\.\d+)(?=[,\s]|$)/g)].map((m) => Number(m[1]));

    for (const value of yValues) {
      expect(value).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('createSumiRevealOptions', () => {
  test('surfaces letters from wet blur to sharp ink with a sweeping stagger', () => {
    const opts = createSumiRevealOptions();

    expect(opts.blurFrom).toBeGreaterThan(4);
    expect(opts.opacityFrom).toBe(0);
    expect(opts.scaleFrom).toBeGreaterThan(1);
    expect(opts.stagger).toBeLessThan(0.1);
  });

  test('accepts overrides', () => {
    expect(createSumiRevealOptions({ blurFrom: 4 }).blurFrom).toBe(4);
  });
});

describe('splitElementIntoLetterSpans', () => {
  test.skipIf(typeof document === 'undefined')(
    'wraps each letter, keeps words unbreakable, and preserves spaces',
    () => {
    const element = document.createElement('h2');
    element.textContent = 'The Tree';

    const letters = splitElementIntoLetterSpans(element);

      expect(letters).toHaveLength(7);
      expect(element.querySelectorAll('.sumi-word')).toHaveLength(2);
      expect(element.textContent).toBe('The Tree');
    }
  );
});

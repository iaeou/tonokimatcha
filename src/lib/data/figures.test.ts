import { describe, expect, test } from 'vitest';
import { figures, getFigure } from './figures';

describe('figures', () => {
  test('every figure has a still, and the still is the fallback for everything', () => {
    for (const figure of Object.values(figures)) {
      expect(figure.src).toMatch(/^\/images\/figures\/.+\.webp$/);
      expect(figure.srcset).toContain('480w');
    }
  });

  test('a filmed figure brings its own poster, not the scan', () => {
    // The animated source is framed tighter than the scan (480×854 against
    // 669×910). Borrowing the scan as poster squashed the face by a quarter
    // of its height when the film faded in over it.
    const filmed = Object.values(figures).filter((figure) => figure.film);
    expect(filmed.length).toBeGreaterThan(0);

    for (const figure of filmed) {
      expect(figure.film?.src).toMatch(/^\/videos\/figures\/.+\.mp4$/);
      expect(figure.film?.poster).toMatch(/-film\.webp$/);
      expect(figure.film?.poster).not.toBe(figure.src);
    }
  });

  test('having a film is not the same as showing one', () => {
    // Halls opt in with `<Section filmed>`. `oriental` stands in four halls
    // across the site; filming the drawing rather than the room quietly put
    // two videos on the landing page at once.
    expect(getFigure('oriental')?.film).toBeDefined();
    expect(getFigure('samurai')?.film).toBeUndefined();
    expect(getFigure('wa')?.film).toBeUndefined();
  });
});

import { describe, expect, test } from 'vitest';
import { createHeroRevealOptions } from './hero-reveal';

describe('createHeroRevealOptions', () => {
  test('uses the Tonoki slow reveal timing for heritage text', () => {
    expect(createHeroRevealOptions()).toMatchObject({
      delay: 0.5,
      duration: 2.5,
      ease: 'power4.out',
      opacity: 0,
      y: 30
    });
  });
});

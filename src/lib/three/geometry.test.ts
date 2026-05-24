import { describe, expect, test } from 'vitest';
import {
  createLineageParticleGeometry,
  createMagatamaShape,
  createLineageParticlePositions
} from './geometry';

describe('createMagatamaShape', () => {
  test('creates a closed comma bead outline with an inner aperture', () => {
    const shape = createMagatamaShape();

    expect(shape.getPoints(24).length).toBeGreaterThan(20);
    expect(shape.holes).toHaveLength(1);
  });

  test('keeps the upper jade silhouette rounded without a long flat ridge', () => {
    const points = createMagatamaShape().getPoints(96);
    const topPoints = points.filter((point) => point.y > 0.78);

    const topWidth = Math.max(...topPoints.map((point) => point.x)) - Math.min(...topPoints.map((point) => point.x));
    const topHeight = Math.max(...topPoints.map((point) => point.y)) - Math.min(...topPoints.map((point) => point.y));

    expect(topPoints.length).toBeGreaterThan(12);
    expect(topHeight / topWidth).toBeGreaterThan(0.28);
  });
});

describe('createLineageParticlePositions', () => {
  test('creates deterministic xyz particle coordinates inside the requested spread', () => {
    const first = createLineageParticlePositions({ count: 4, spread: 2, seed: 7 });
    const second = createLineageParticlePositions({ count: 4, spread: 2, seed: 7 });

    expect(first).toHaveLength(12);
    expect([...first]).toEqual([...second]);
    expect(Math.max(...first)).toBeLessThanOrEqual(2);
    expect(Math.min(...first)).toBeGreaterThanOrEqual(-2);
  });
});

describe('createLineageParticleGeometry', () => {
  test('adds GPU attributes for vortex size and random particle behavior', () => {
    const geometry = createLineageParticleGeometry({ count: 8, spread: 3, seed: 1500 });

    expect(geometry.getAttribute('position').count).toBe(8);
    expect(geometry.getAttribute('aSize').count).toBe(8);
    expect(geometry.getAttribute('aRandom').count).toBe(8);

    const size = geometry.getAttribute('aSize').getX(0);
    const random = geometry.getAttribute('aRandom');

    expect(size).toBeGreaterThanOrEqual(6);
    expect(size).toBeLessThanOrEqual(18);
    expect(random.getX(0)).toBeGreaterThanOrEqual(0);
    expect(random.getX(0)).toBeLessThanOrEqual(1);
  });
});

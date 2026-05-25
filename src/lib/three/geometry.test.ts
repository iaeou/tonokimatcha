import { describe, expect, test } from 'vitest';
import {
  createLineageParticleGeometry,
  createMagatamaShape,
  createLineageParticlePositions
} from './geometry';

describe('createMagatamaShape', () => {
  test('creates a closed bezier silhouette with a single suspension hole', () => {
    const shape = createMagatamaShape();

    expect(shape.getPoints(24).length).toBeGreaterThan(20);
    expect(shape.holes).toHaveLength(1);
  });

  test('uses the rounder stout-comma proportions of the new reference bead', () => {
    const points = createMagatamaShape().getPoints(128);
    const width = Math.max(...points.map((point) => point.x)) - Math.min(...points.map((point) => point.x));
    const height = Math.max(...points.map((point) => point.y)) - Math.min(...points.map((point) => point.y));

    // The new bead sits noticeably wider than the slim comma — width is now
    // close to height, not roughly two-thirds of it.
    expect(width / height).toBeGreaterThan(0.7);
    expect(width / height).toBeLessThan(1.05);
  });

  test('crowns the silhouette near y = 1.8 and tails down past y = -2', () => {
    const points = createMagatamaShape().getPoints(96);
    const maxY = Math.max(...points.map((point) => point.y));
    const minY = Math.min(...points.map((point) => point.y));

    expect(maxY).toBeCloseTo(1.8, 1);
    expect(minY).toBeLessThan(-1.95);
  });

  test('drills the suspension hole as a circle high in the upper lobe', () => {
    const holePoints = createMagatamaShape().holes[0].getPoints(48);
    const minX = Math.min(...holePoints.map((point) => point.x));
    const maxX = Math.max(...holePoints.map((point) => point.x));
    const minY = Math.min(...holePoints.map((point) => point.y));
    const maxY = Math.max(...holePoints.map((point) => point.y));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const diameter = maxX - minX;

    expect(centerX).toBeCloseTo(-0.16, 1);
    expect(centerY).toBeCloseTo(0.9, 1);
    // Diameter is twice the absarc radius of 0.24.
    expect(diameter).toBeCloseTo(0.48, 1);
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

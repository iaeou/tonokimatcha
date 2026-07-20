import { describe, expect, test } from 'vitest';
import {
  createKofunConstellationPositions,
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

describe('createKofunConstellationPositions', () => {
  const options = { count: 200, seed: 1500, scale: 2.7, jitter: 0.12 };

  test('is deterministic for a given seed', () => {
    const first = createKofunConstellationPositions(options);
    const second = createKofunConstellationPositions(options);

    expect(first).toHaveLength(600);
    expect([...first]).toEqual([...second]);
  });

  test('stays inside the silhouette bounds and keeps depth jitter shallow', () => {
    const positions = createKofunConstellationPositions(options);
    const bound = options.scale * 1.1;

    for (let index = 0; index < positions.length; index += 3) {
      expect(Math.abs(positions[index])).toBeLessThanOrEqual(bound);
      expect(Math.abs(positions[index + 1])).toBeLessThanOrEqual(bound);
      expect(Math.abs(positions[index + 2])).toBeLessThanOrEqual(options.jitter * options.scale * 1.01);
    }
  });

  test('splits points between the round mound above and the square front below', () => {
    const positions = createKofunConstellationPositions(options);
    let above = 0;
    let below = 0;

    for (let index = 1; index < positions.length; index += 3) {
      if (positions[index] > 0) above += 1;
      else below += 1;
    }

    expect(above).toBeGreaterThan(options.count * 0.3);
    expect(below).toBeGreaterThan(options.count * 0.2);
  });
});

describe('kofun geometry attribute', () => {
  test('lineage geometry carries aKofun constellation targets', () => {
    const geometry = createLineageParticleGeometry({ count: 8, spread: 3, seed: 1500 });
    expect(geometry.getAttribute('aKofun').count).toBe(8);
  });
});

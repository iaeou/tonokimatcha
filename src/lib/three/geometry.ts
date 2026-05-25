import {
  BufferGeometry,
  CatmullRomCurve3,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Path,
  Shape,
  Vector3
} from 'three';

interface ParticleOptions {
  count: number;
  spread: number;
  seed: number;
}

/**
 * Magatama silhouette — rounder, deeper "stout comma" form rather than the
 * earlier slim curve. The path is six contiguous cubic beziers walking the
 * outer edge clockwise from the top crown, plus a single circular suspension
 * hole (cord aperture) drilled high in the upper lobe.
 *
 * Coordinate space is intentionally larger than the previous bead (~3.5 wide
 * × ~3.9 tall before centering); the consuming scene scales it down to taste.
 */
export function createMagatamaShape() {
  const shape = new Shape();

  shape.moveTo(0, 1.8);
  shape.bezierCurveTo(1.4, 1.8, 1.9, 0.2, 0.9, -1.0);
  shape.bezierCurveTo(0.4, -1.7, -0.2, -2.1, -0.6, -2.1);
  shape.bezierCurveTo(-1.1, -2.1, -1.3, -1.7, -1.0, -1.2);
  shape.bezierCurveTo(-0.4, -0.5, -0.5, 0.5, -1.2, 0.9);
  shape.bezierCurveTo(-1.8, 1.2, -1.1, 1.8, 0, 1.8);

  // Suspension hole — circular cord aperture in the upper lobe.
  const holePath = new Path();
  holePath.absarc(-0.16, 0.9, 0.24, 0, Math.PI * 2, true);
  shape.holes.push(holePath);

  return shape;
}

export function createMagatamaGeometry() {
  const geometry = new ExtrudeGeometry(createMagatamaShape(), {
    depth: 0.6,
    bevelEnabled: true,
    bevelThickness: 0.16,
    bevelSize: 0.16,
    bevelOffset: 0,
    bevelSegments: 8,
    curveSegments: 96,
    steps: 2
  });

  geometry.center();
  geometry.computeVertexNormals();

  return geometry;
}

export function createLineageParticlePositions({ count, spread, seed }: ParticleOptions) {
  const positions = new Float32Array(count * 3);
  let state = seed || 1;

  for (let index = 0; index < count; index += 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const radiusNoise = state / 4294967295;
    state = (state * 1664525 + 1013904223) >>> 0;
    const angleNoise = state / 4294967295;
    state = (state * 1664525 + 1013904223) >>> 0;
    const heightNoise = state / 4294967295;

    const radius = Math.sqrt(radiusNoise) * spread;
    const angle = angleNoise * Math.PI * 2;
    const base = index * 3;

    positions[base] = Math.cos(angle) * radius;
    positions[base + 1] = (heightNoise - 0.5) * spread * 0.55;
    positions[base + 2] = Math.sin(angle) * radius;
  }

  return positions;
}

export function createLineageParticleGeometry(options: ParticleOptions) {
  const geometry = new BufferGeometry();
  const randoms = new Float32Array(options.count * 3);
  const sizes = new Float32Array(options.count);
  let state = options.seed + 101;

  for (let index = 0; index < options.count; index += 1) {
    const base = index * 3;

    state = (state * 1664525 + 1013904223) >>> 0;
    randoms[base] = state / 4294967295;
    state = (state * 1664525 + 1013904223) >>> 0;
    randoms[base + 1] = state / 4294967295;
    state = (state * 1664525 + 1013904223) >>> 0;
    randoms[base + 2] = state / 4294967295;

    sizes[index] = 6 + randoms[base + 2] * 12;
  }

  geometry.setAttribute('position', new Float32BufferAttribute(createLineageParticlePositions(options), 3));
  geometry.setAttribute('aRandom', new Float32BufferAttribute(randoms, 3));
  geometry.setAttribute('aSize', new Float32BufferAttribute(sizes, 1));
  return geometry;
}

export function createCameraPath() {
  return new CatmullRomCurve3([
    new Vector3(0, 0.05, 6.2),
    new Vector3(0.25, 0.14, 5.6),
    new Vector3(-0.16, 0.08, 5.1)
  ]);
}

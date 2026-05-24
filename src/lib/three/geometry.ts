import {
  BufferGeometry,
  CatmullRomCurve3,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Shape,
  Vector3
} from 'three';

interface ParticleOptions {
  count: number;
  spread: number;
  seed: number;
}

export function createMagatamaShape() {
  const shape = new Shape();

  shape.moveTo(-0.34, 0.9);
  shape.bezierCurveTo(-0.02, 1.56, 0.72, 1.32, 1.04, 0.5);
  shape.bezierCurveTo(1.28, -0.12, 0.92, -0.7, 0.34, -0.78);
  shape.bezierCurveTo(0.05, -0.82, -0.04, -0.98, 0.12, -1.16);
  shape.bezierCurveTo(0.28, -1.34, -0.08, -1.44, -0.42, -1.22);
  shape.bezierCurveTo(-0.92, -0.9, -1.04, -0.24, -0.9, 0.28);
  shape.bezierCurveTo(-0.78, 0.68, -0.56, 0.82, -0.34, 0.9);
  shape.closePath();
  shape.holes.push(new Shape().absellipse(0.35, 0.42, 0.12, 0.12, 0, Math.PI * 2, false, 0));

  return shape;
}

export function createMagatamaGeometry() {
  const geometry = new ExtrudeGeometry(createMagatamaShape(), {
    depth: 0.3,
    bevelEnabled: true,
    bevelSegments: 36,
    bevelSize: 0.09,
    bevelThickness: 0.13,
    curveSegments: 96
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

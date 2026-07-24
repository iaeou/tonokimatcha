import {
  BufferGeometry,
  CatmullRomCurve3,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Path,
  Shape,
  Vector3
} from 'three';
import { MAGATAMA_TUNING } from './magatama-tuning';
import {
  MAGATAMA_LOWPOLY_COLORS,
  MAGATAMA_LOWPOLY_POSITIONS
} from './magatama-lowpoly-data';

/**
 * Faceted low-poly Magatama, baked from the brand's `texture.svg` artwork
 * (27 colored facets → front + back faces + a unioned side rim). Non-indexed
 * geometry so `flatShading` gives each facet its own crisp normal, and a
 * per-vertex `color` attribute carries the artwork's greens + gold straight
 * onto the mesh. Consumed by a vertex-colored MeshStandardMaterial in the
 * scene; scaled to taste there like the procedural bead.
 */
export function createMagatamaLowPolyGeometry() {
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(MAGATAMA_LOWPOLY_POSITIONS, 3));
  geometry.setAttribute('color', new Float32BufferAttribute(MAGATAMA_LOWPOLY_COLORS, 3));
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

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
    ...MAGATAMA_TUNING.geometry
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

interface KofunOptions {
  count: number;
  seed: number;
  scale: number;
  jitter: number;
  /** Vertical shift in local space (counters the cloud's positionY offset). */
  offsetY?: number;
}

/**
 * Kofun constellation targets — the keyhole silhouette of a zenpō-kōen-fun
 * (front-square, rear-round imperial mound like the Daisenryō Kofun), traced
 * as points along its perimeter for the lineage particles to migrate into.
 *
 * Layout in local particle space, facing the camera (XY plane):
 *   - the round rear mound: a circle of radius 0.62·scale centered above,
 *   - the square front: a trapezoid flaring from the circle down to the base.
 *
 * ~58% of the points walk the circle, the rest walk the trapezoid perimeter,
 * with a deterministic LCG jitter so it reads as a constellation, not a wire.
 */
export function createKofunConstellationPositions({
  count,
  seed,
  scale,
  jitter,
  offsetY = 0
}: KofunOptions) {
  const positions = new Float32Array(count * 3);
  let state = (seed + 331) >>> 0;
  const next = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967295;
  };

  const circleRadius = 0.62 * scale;
  const circleCenterY = 0.38 * scale;
  const trapezoidTopY = circleCenterY - circleRadius * 0.72;
  const trapezoidBottomY = -0.78 * scale;
  const trapezoidTopHalf = 0.34 * scale;
  const trapezoidBottomHalf = 0.52 * scale;
  const circleShare = 0.58;

  for (let index = 0; index < count; index += 1) {
    const base = index * 3;
    const onCircle = index / count < circleShare;
    let x: number;
    let y: number;

    if (onCircle) {
      const angle = next() * Math.PI * 2;
      x = Math.cos(angle) * circleRadius;
      y = circleCenterY + Math.sin(angle) * circleRadius;
    } else {
      // Walk the trapezoid perimeter: left edge, bottom, right edge.
      const t = next();
      if (t < 0.35) {
        const k = t / 0.35;
        x = -(trapezoidTopHalf + (trapezoidBottomHalf - trapezoidTopHalf) * k);
        y = trapezoidTopY + (trapezoidBottomY - trapezoidTopY) * k;
      } else if (t < 0.65) {
        const k = (t - 0.35) / 0.3;
        x = -trapezoidBottomHalf + trapezoidBottomHalf * 2 * k;
        y = trapezoidBottomY;
      } else {
        const k = (t - 0.65) / 0.35;
        x = trapezoidBottomHalf - (trapezoidBottomHalf - trapezoidTopHalf) * k;
        y = trapezoidBottomY + (trapezoidTopY - trapezoidBottomY) * k;
      }
    }

    positions[base] = x + (next() - 0.5) * 2 * jitter * scale;
    positions[base + 1] = y + offsetY + (next() - 0.5) * 2 * jitter * scale;
    positions[base + 2] = (next() - 0.5) * 2 * jitter * scale;
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

    sizes[index] = MAGATAMA_TUNING.particles.sizeMin + randoms[base + 2] * (MAGATAMA_TUNING.particles.sizeMax - MAGATAMA_TUNING.particles.sizeMin);
  }

  geometry.setAttribute('position', new Float32BufferAttribute(createLineageParticlePositions(options), 3));
  geometry.setAttribute('aRandom', new Float32BufferAttribute(randoms, 3));
  geometry.setAttribute('aSize', new Float32BufferAttribute(sizes, 1));
  geometry.setAttribute(
    'aKofun',
    new Float32BufferAttribute(
      createKofunConstellationPositions({
        count: options.count,
        seed: options.seed,
        scale: MAGATAMA_TUNING.particles.kofun.scale,
        jitter: MAGATAMA_TUNING.particles.kofun.jitter,
        offsetY: MAGATAMA_TUNING.particles.kofun.offsetY
      }),
      3
    )
  );
  return geometry;
}

export function createCameraPath() {
  return new CatmullRomCurve3([
    new Vector3(0, 0.05, 6.2),
    new Vector3(0.25, 0.14, 5.6),
    new Vector3(-0.16, 0.08, 5.1)
  ]);
}

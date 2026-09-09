import {
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Path,
  Shape,
  ShapeGeometry,
  Vector2,
  Vector3
} from 'three';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { MAGATAMA_TUNING } from './magatama-tuning';
import {
  MAGATAMA_LOWPOLY_COLORS,
  MAGATAMA_LOWPOLY_POSITIONS
} from './magatama-lowpoly-data';
import {
  MAGATAMA_ICON_BEVEL_SIZE,
  MAGATAMA_ICON_LAYERS,
  type MagatamaIconLayer
} from './magatama-icon-data';

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

function iconShapes(contours: number[][][]) {
  const ring = (flat: number[]) => {
    const points: Vector2[] = [];
    for (let index = 0; index < flat.length; index += 2) {
      points.push(new Vector2(flat[index], flat[index + 1]));
    }
    return points;
  };

  return contours.map((polygon) => {
    const shape = new Shape(ring(polygon[0]));
    for (let hole = 1; hole < polygon.length; hole += 1) {
      shape.holes.push(new Path(ring(polygon[hole])));
    }
    return shape;
  });
}

/**
 * Height of the drop's dome at a point `distance` from the silhouette.
 *
 * A circular arc, not a linear ramp: vertical at the outline and flattening
 * as it fills, which is the profile of a cabochon. Because the input is the
 * distance to the edge, the bead's thickness ends up following its own width
 * for free — the body swells, the tail stays thin, and the stone reads as a
 * drop instead of a uniformly puffed pillow.
 */
export function domeHeight(distance: number, reach: number, bulge: number): number {
  if (bulge <= 0 || reach <= 0) return 0;

  const t = Math.min(Math.max(distance / reach, 0), 1);
  const shoulder = 1 - t;

  return bulge * Math.sqrt(1 - shoulder * shoulder);
}

/**
 * Shortest distance from a point to the silhouette, holes counted as edges
 * too, so the surface comes back down to meet them rather than tenting over.
 * Segments are flattened once and reused for every vertex.
 */
function createSilhouetteDistance(contours: number[][][]) {
  const segments: number[] = [];

  for (const polygon of contours) {
    for (const ring of polygon) {
      for (let index = 0; index < ring.length; index += 2) {
        const next = (index + 2) % ring.length;
        segments.push(ring[index], ring[index + 1], ring[next], ring[next + 1]);
      }
    }
  }

  // The refined soup carries every vertex once per triangle that touches it —
  // about six lookups for each distinct point — and each lookup walks every
  // segment of the outline. Remembering the answer is the difference between
  // this being the slowest thing the scene does and it not registering.
  const seen = new Map<string, number>();

  return (x: number, y: number) => {
    const key = `${x},${y}`;
    const remembered = seen.get(key);

    if (remembered !== undefined) return remembered;

    let best = Infinity;

    for (let index = 0; index < segments.length; index += 4) {
      const ax = segments[index];
      const ay = segments[index + 1];
      const bx = segments[index + 2] - ax;
      const by = segments[index + 3] - ay;
      const lengthSq = bx * bx + by * by;
      let t = lengthSq > 0 ? ((x - ax) * bx + (y - ay) * by) / lengthSq : 0;

      t = t < 0 ? 0 : t > 1 ? 1 : t;

      const dx = x - (ax + t * bx);
      const dy = y - (ay + t * by);
      const distanceSq = dx * dx + dy * dy;

      if (distanceSq < best) best = distanceSq;
    }

    const distance = Math.sqrt(best);
    seen.set(key, distance);
    return distance;
  };
}

/**
 * Split triangles until no edge is longer than `maxEdge`, so the flat caps
 * have something to bend with. The decision is made per *edge*, from its two
 * endpoints alone — a neighbouring triangle sharing that edge reaches the
 * same verdict, so the surface refines without T-junctions splitting open
 * into cracks once it is displaced.
 *
 * Input and output are a non-indexed triangle soup: 9 floats per triangle.
 */
function refineTriangles(source: ArrayLike<number>, maxEdge: number, maxPasses: number) {
  let current = Array.from(source);
  const maxEdgeSq = maxEdge * maxEdge;

  const far = (a: number, b: number) => {
    const dx = current[a] - current[b];
    const dy = current[a + 1] - current[b + 1];
    const dz = current[a + 2] - current[b + 2];
    return dx * dx + dy * dy + dz * dz > maxEdgeSq;
  };

  for (let pass = 0; pass < maxPasses; pass += 1) {
    const next: number[] = [];
    let refined = false;
    const at = (index: number) => [current[index], current[index + 1], current[index + 2]];
    const middle = (p: number[], q: number[]) => [
      (p[0] + q[0]) / 2,
      (p[1] + q[1]) / 2,
      (p[2] + q[2]) / 2
    ];
    const emit = (...points: number[][]) => {
      for (const point of points) next.push(point[0], point[1], point[2]);
    };

    for (let t = 0; t < current.length; t += 9) {
      const a = at(t);
      const b = at(t + 3);
      const c = at(t + 6);
      const longAB = far(t, t + 3);
      const longBC = far(t + 3, t + 6);
      const longCA = far(t + 6, t);

      if (!longAB && !longBC && !longCA) {
        emit(a, b, c);
        continue;
      }

      refined = true;
      const ab = middle(a, b);
      const bc = middle(b, c);
      const ca = middle(c, a);

      if (longAB && longBC && longCA) {
        emit(a, ab, ca, ab, b, bc, ca, bc, c, ab, bc, ca);
      } else if (longAB && longBC) {
        emit(a, ab, bc, ab, b, bc, a, bc, c);
      } else if (longBC && longCA) {
        emit(b, bc, ca, bc, c, ca, b, ca, a);
      } else if (longCA && longAB) {
        emit(c, ca, ab, ca, a, ab, c, ab, b);
      } else if (longAB) {
        emit(a, ab, c, ab, b, c);
      } else if (longBC) {
        emit(b, bc, a, bc, c, a);
      } else {
        emit(c, ca, b, ca, a, b);
      }
    }

    current = next;
    if (!refined) break;
  }

  return current;
}

/**
 * Refine a face and push it out into the dome.
 *
 * `z` is scaled by how far the vertex already sits from the slab's midplane,
 * so the two caps take the full bulge, the bevel takes a fraction, and the
 * outermost rim — which defines the silhouette — takes none of it and stays
 * exactly where the drawing put it. Paint planes sit past the cap, clamp to
 * 1, and so land on the same surface as the face they belong to.
 */
function domeIconFace(
  geometry: BufferGeometry,
  distanceTo: (x: number, y: number) => number,
  halfDepth: number
) {
  const { bulge, reach, maxEdge, maxPasses } = MAGATAMA_TUNING.icon.dome;
  const flat = geometry.index ? geometry.toNonIndexed() : geometry;
  const refined = refineTriangles(flat.attributes.position.array, maxEdge, maxPasses);

  for (let index = 0; index < refined.length; index += 3) {
    const z = refined[index + 2];
    const lean = halfDepth > 0 ? Math.min(Math.max(z / halfDepth, -1), 1) : 0;

    refined[index + 2] = z + lean * domeHeight(distanceTo(refined[index], refined[index + 1]), reach, bulge);
  }

  const domed = new BufferGeometry();
  domed.setAttribute('position', new Float32BufferAttribute(refined, 3));
  return domed;
}

function finishIconPart(geometry: BufferGeometry, colors: Float32Array) {
  geometry.setAttribute('color', new BufferAttribute(colors, 3));
  // ExtrudeGeometry and ShapeGeometry disagree on UVs and on indexing;
  // mergeGeometries refuses a mismatched set, so both are stripped flat.
  geometry.deleteAttribute('uv');
  return geometry.index ? geometry.toNonIndexed() : geometry;
}

function paintIconColor(geometry: BufferGeometry, hex: string) {
  // Vertex colors feed a linear pipeline, so the artwork's sRGB values have to
  // be converted or every green comes out washed.
  const color = new Color(hex).convertSRGBToLinear();
  const count = geometry.attributes.position.count;
  const colors = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
  }

  return finishIconPart(geometry, colors);
}

/**
 * Nearest colour fill to a point, for deciding what the bare shoulder should
 * wear. Only the true colour layers are sampled — the ink-coloured front
 * layers are the drawn face, and letting an eye or the mouth win the lookup
 * would smear a dark patch onto the rim beside it.
 */
function createPaintSampler(layers: MagatamaIconLayer[], inkHex: string) {
  const points: number[] = [];
  const swatches: Color[] = [];

  for (const layer of layers) {
    if (layer.role !== 'front' || layer.color === inkHex) continue;

    const color = new Color(layer.color).convertSRGBToLinear();

    for (const polygon of layer.contours) {
      const ring = polygon[0];
      for (let index = 0; index < ring.length; index += 2) {
        points.push(ring[index], ring[index + 1]);
        swatches.push(color);
      }
    }
  }

  const seen = new Map<string, Color>();

  return (x: number, y: number) => {
    const key = `${x},${y}`;
    const remembered = seen.get(key);

    if (remembered !== undefined) return remembered;

    let best = Infinity;
    let found = swatches[0];

    for (let index = 0; index < points.length; index += 2) {
      const dx = x - points[index];
      const dy = y - points[index + 1];
      const distanceSq = dx * dx + dy * dy;

      if (distanceSq < best) {
        best = distanceSq;
        found = swatches[index / 2];
      }
    }

    seen.set(key, found);
    return found;
  };
}

/**
 * Colour the slab per vertex: ink for `inkWidth` at the silhouette, then a
 * short blend into whichever paint that stretch of shoulder runs into. The
 * cap is painted over by the layers anyway, so this only ever shows on the
 * rim and on the bare reverse — which is exactly where it was wanted.
 */
function paintIconRim(
  geometry: BufferGeometry,
  inkHex: string,
  distanceTo: (x: number, y: number) => number,
  sample: (x: number, y: number) => Color
) {
  const { inkWidth, inkFade, inkStrength } = MAGATAMA_TUNING.icon.rim;
  const ink = new Color(inkHex).convertSRGBToLinear();
  const position = geometry.attributes.position;
  const colors = new Float32Array(position.count * 3);

  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index);
    const y = position.getY(index);
    const distance = distanceTo(x, y);
    const span = inkFade > 0 ? (distance - inkWidth) / inkFade : distance > inkWidth ? 1 : 0;
    const t = Math.min(Math.max(span, 0), 1);
    const eased = t * t * (3 - 2 * t);
    const paint = sample(x, y);
    // The edge is the paint darkened toward the ink, not the ink itself, so
    // the rim stays the face's own green with a shadow in it.
    const edge = 1 - (1 - eased) * inkStrength;

    colors[index * 3] = ink.r + (paint.r - ink.r) * edge;
    colors[index * 3 + 1] = ink.g + (paint.g - ink.g) * edge;
    colors[index * 3 + 2] = ink.b + (paint.b - ink.b) * edge;
  }

  return finishIconPart(geometry, colors);
}

/**
 * Illustrated Magatama, built from the drawn brand logo the header carries
 * (`static/matchaTonoki-logo.svg`, baked into `magatama-icon-data.ts`).
 *
 * Made the way an enamel pin is: one slab with the artwork's colors on its two
 * faces — except the slab is domed, so the stone is a drop rather than a card,
 * and the paint is displaced onto that same curve instead of floating on a
 * plane above it.
 *
 * The ink outline is still not a layer. The paint is inset, and the slab shows
 * through around it; the difference is that the slab is no longer ink all the
 * way out. Domed, that inset margin *is* the shoulder of the drop, and left
 * bare it read as a dark tyre — so the shoulder takes the colour of the paint
 * beside it and the ink keeps only a line's width at the silhouette.
 *
 * Paint sits `paintGap` proud of each face, stacked in the artwork's own draw
 * order so the ink details stay above the color they sit on. The back takes
 * only the color fills: no face, no blush — the reverse of a pin.
 */
export function createMagatamaIconGeometry() {
  const { depth, bevelThickness, bevelSegments, paintGap } = MAGATAMA_TUNING.icon;
  const layers = MAGATAMA_ICON_LAYERS;
  const base = layers.find((layer: MagatamaIconLayer) => layer.role === 'base');

  if (!base) throw new Error('magatama-icon-data is missing its base layer');

  const slab = new ExtrudeGeometry(iconShapes(base.contours), {
    depth,
    bevelEnabled: true,
    bevelThickness,
    bevelSize: MAGATAMA_ICON_BEVEL_SIZE,
    bevelOffset: 0,
    bevelSegments,
    steps: 1
  });

  slab.center();
  slab.computeBoundingBox();

  const frontZ = slab.boundingBox?.max.z ?? 0;
  const backZ = slab.boundingBox?.min.z ?? 0;
  const dome = MAGATAMA_TUNING.icon.dome;
  const distanceTo = createSilhouetteDistance(base.contours);
  const swell = (geometry: BufferGeometry) =>
    dome.enabled ? domeIconFace(geometry, distanceTo, frontZ) : geometry;
  const samplePaint = createPaintSampler(layers, base.color);
  const parts = [paintIconRim(swell(slab), base.color, distanceTo, samplePaint)];

  for (const layer of layers) {
    if (layer.role === 'base') continue;

    const paint = new ShapeGeometry(iconShapes(layer.contours), 1);
    const lift = paintGap * layer.tier;

    // `tier`, not draw index: nothing within a tier overlaps, so two steps are
    // enough, and the ink stays a hair off the color instead of the last layer
    // floating a twentieth of the bead above its face.
    //
    // Back paint is left unrotated on purpose. It shares the front's footprint,
    // and the material draws both sides, so three flips the normal per fragment
    // for the camera that sees it; rotating it to face outward would mirror it
    // off the silhouette.
    paint.translate(0, 0, layer.role === 'front' ? frontZ + lift : backZ - lift);
    parts.push(paintIconColor(swell(paint), layer.color));
  }

  const merged = mergeGeometries(parts, false);

  if (!merged) throw new Error('magatama icon layers failed to merge');

  // Weld before shading. Every part arrives as a triangle soup, and on a soup
  // `computeVertexNormals` can only give each triangle its own normal — which
  // is exactly the faceting the dome exists to get rid of. Welding shares the
  // vertices back so the curve shades as one surface. Colour is part of the
  // comparison, so the layers stay separate and their edges stay crisp.
  const geometry = mergeVertices(merged, 1e-4);

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

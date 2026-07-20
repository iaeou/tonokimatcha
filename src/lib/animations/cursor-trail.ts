/**
 * Ceremonial cursor trail — pure logic.
 *
 * The pointer leaves a short-lived wake of ink motes: each pointermove spawns
 * a point that drifts slightly and dissolves within a second, drawn on a
 * fixed 2D canvas overlay (see CursorTrail.svelte). Gold ink on the dark
 * theme, moss ink on light. Desktop pointers only; disabled for touch and
 * under prefers-reduced-motion.
 */

export interface TrailPoint {
  x: number;
  y: number;
  /** Drift velocity in px/s. */
  vx: number;
  vy: number;
  /** Remaining life, 1 → 0. */
  life: number;
  /** Base radius in px. */
  size: number;
}

export const CURSOR_TRAIL_TUNING = {
  /** Seconds a mote lives. */
  lifespan: 0.9,
  /** Minimum pointer travel (px) before a new mote spawns. */
  minSpawnDistance: 9,
  /** Mote radius range, px. */
  sizeMin: 0.8,
  sizeMax: 2.6,
  /** Drift speed range, px/s. */
  driftMax: 26,
  /** Peak alpha of a fresh mote. */
  alpha: 0.5,
  /** Hard cap so pathological pointer rates can't grow the array. */
  maxPoints: 160,
} as const;

export function createTrailPoint(
  x: number,
  y: number,
  random: () => number = Math.random
): TrailPoint {
  const angle = random() * Math.PI * 2;
  const speed = random() * CURSOR_TRAIL_TUNING.driftMax;

  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - CURSOR_TRAIL_TUNING.driftMax * 0.35,
    life: 1,
    size:
      CURSOR_TRAIL_TUNING.sizeMin +
      random() * (CURSOR_TRAIL_TUNING.sizeMax - CURSOR_TRAIL_TUNING.sizeMin)
  };
}

/**
 * Advance all points by `dt` seconds and drop the dead ones. Pure: returns a
 * new array, does not mutate the input points.
 */
export function stepTrailPoints(points: readonly TrailPoint[], dt: number): TrailPoint[] {
  const next: TrailPoint[] = [];

  for (const point of points) {
    const life = point.life - dt / CURSOR_TRAIL_TUNING.lifespan;
    if (life <= 0) continue;

    next.push({
      ...point,
      x: point.x + point.vx * dt,
      y: point.y + point.vy * dt,
      life
    });
  }

  return next;
}

/** Whether the environment should show the trail at all. */
export function shouldEnableCursorTrail(
  matchMediaFn: ((query: string) => { matches: boolean }) | undefined =
    typeof window !== 'undefined' ? window.matchMedia?.bind(window) : undefined
): boolean {
  if (!matchMediaFn) return false;
  if (matchMediaFn('(prefers-reduced-motion: reduce)').matches) return false;
  // Fine pointer only — no trail chasing touch taps.
  return matchMediaFn('(pointer: fine)').matches;
}

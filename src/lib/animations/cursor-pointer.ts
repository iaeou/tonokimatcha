/**
 * Ceremonial pointer — pure logic.
 *
 * Replaces the native cursor with a small dot that tracks the pointer exactly
 * and a thin ring that follows with a soft lag (see CursorPointer.svelte).
 * Over interactive elements the ring expands and both are gently pulled
 * toward the element's center (magnetism); on press everything contracts.
 * Gold ink in the dark hall, moss ink on paper. Fine pointers only; the
 * native cursor is left untouched for touch and prefers-reduced-motion.
 *
 * One knob per feel: `ringLag` is THE knob — lower is dreamier, higher is
 * snappier. Everything else is proportion.
 */

export interface PointerState {
  /** Raw pointer position. */
  x: number;
  y: number;
  /** Ring position (lags behind the pointer). */
  ringX: number;
  ringY: number;
  /** Current ring scale, eased toward its target. */
  ringScale: number;
  /** Current dot scale, eased toward its target. */
  dotScale: number;
}

export interface MagnetTarget {
  /** Center of the hovered interactive element. */
  centerX: number;
  centerY: number;
}

export const CURSOR_POINTER_TUNING = {
  /**
   * THE knob. Exponential-decay rate (1/s) of the ring chasing the pointer —
   * lower drifts like incense smoke, higher snaps to attention.
   */
  ringLag: 9,
  /** Decay rate for scale easing (ring growth / press contraction). */
  scaleLag: 12,
  /** Ring radius at rest, px. */
  ringRadius: 16,
  /** Dot radius, px. */
  dotRadius: 2.5,
  /** Ring scale while hovering an interactive element. */
  hoverRingScale: 1.7,
  /** Dot scale while hovering (the dot recedes as the ring opens). */
  hoverDotScale: 0.5,
  /** Scale applied to both while the pointer is pressed. */
  pressScale: 0.8,
  /** Fraction of the distance to a magnet's center the cursor is pulled. */
  magnetStrength: 0.28,
  /** Beyond this distance (px) from a magnet's center the pull fades out. */
  magnetRange: 96,
  /** Selector marking interactive elements that attract the cursor. */
  interactiveSelector: 'a, button, [role="button"], [data-cursor-magnet]',
} as const;

/**
 * Frame-rate-independent exponential approach: how far `current` moves toward
 * `target` in `dt` seconds at decay `rate`.
 */
export function approach(current: number, target: number, rate: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-rate * dt));
}

/**
 * Where the cursor should aim, given the raw pointer and an optional magnet.
 * The pull is strongest at the element's center and fades to nothing at
 * `magnetRange`, so entering/leaving never jumps.
 */
export function magnetizedPosition(
  x: number,
  y: number,
  magnet: MagnetTarget | null
): { x: number; y: number } {
  if (!magnet) return { x, y };

  const dx = magnet.centerX - x;
  const dy = magnet.centerY - y;
  const distance = Math.hypot(dx, dy);
  if (distance >= CURSOR_POINTER_TUNING.magnetRange) return { x, y };

  const falloff = 1 - distance / CURSOR_POINTER_TUNING.magnetRange;
  const pull = CURSOR_POINTER_TUNING.magnetStrength * falloff;

  return { x: x + dx * pull, y: y + dy * pull };
}

/** Target scales for the current interaction state. */
export function targetScales(hovering: boolean, pressed: boolean): { ring: number; dot: number } {
  let ring = hovering ? CURSOR_POINTER_TUNING.hoverRingScale : 1;
  let dot = hovering ? CURSOR_POINTER_TUNING.hoverDotScale : 1;

  if (pressed) {
    ring *= CURSOR_POINTER_TUNING.pressScale;
    dot *= CURSOR_POINTER_TUNING.pressScale;
  }

  return { ring, dot };
}

/**
 * Advance the cursor by `dt` seconds. Pure: returns a new state.
 * The dot sits on the (magnetized) pointer; the ring eases toward it.
 */
export function stepPointer(
  state: PointerState,
  pointerX: number,
  pointerY: number,
  magnet: MagnetTarget | null,
  hovering: boolean,
  pressed: boolean,
  dt: number
): PointerState {
  const aim = magnetizedPosition(pointerX, pointerY, magnet);
  const scales = targetScales(hovering, pressed);
  const { ringLag, scaleLag } = CURSOR_POINTER_TUNING;

  return {
    x: aim.x,
    y: aim.y,
    ringX: approach(state.ringX, aim.x, ringLag, dt),
    ringY: approach(state.ringY, aim.y, ringLag, dt),
    ringScale: approach(state.ringScale, scales.ring, scaleLag, dt),
    dotScale: approach(state.dotScale, scales.dot, scaleLag, dt)
  };
}

export function createPointerState(x = -100, y = -100): PointerState {
  return { x, y, ringX: x, ringY: y, ringScale: 1, dotScale: 1 };
}

/** Same gate as the trail: fine pointer, no reduced motion. */
export function shouldEnableCursorPointer(
  matchMediaFn: ((query: string) => { matches: boolean }) | undefined =
    typeof window !== 'undefined' ? window.matchMedia?.bind(window) : undefined
): boolean {
  if (!matchMediaFn) return false;
  if (matchMediaFn('(prefers-reduced-motion: reduce)').matches) return false;
  return matchMediaFn('(pointer: fine)').matches;
}

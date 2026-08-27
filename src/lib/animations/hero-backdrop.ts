/**
 * The threshold changes hands as the visitor descends.
 *
 * The photograph holds the first screen. As it withdraws, Osaka is drawn in
 * its place — the city the tea comes from, rendered as ink rather than as a
 * second photograph. The drawing then withdraws before The Leaf, so the halls
 * below keep their quiet for the magatama and the ghost kanji.
 *
 * Everything here is measured in viewport heights, except the withdrawal,
 * which follows the real position of the hall that ends the relay: section
 * heights change with the copy, and a hardcoded scroll distance would drift.
 */

export const HERO_BACKDROP_TUNING = {
  /** Viewport heights over which the photograph fades out. */
  photoFadeViewports: 1,
  /** Where the drawing starts to arrive, in viewport heights. */
  drawingEntryViewports: 0.55,
  /** Viewport heights the drawing takes to arrive in full. */
  drawingRiseViewports: 0.95,
  /**
   * How much of the viewport the closing hall must claim, from its first
   * appearance at the bottom edge, for the drawing to be fully gone.
   */
  withdrawalViewports: 0.6
} as const;

function clamp01(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

/** Smoothstep: no corners at either end of a scroll-driven fade. */
function ease(progress: number) {
  const t = clamp01(progress);
  return t * t * (3 - 2 * t);
}

export interface BackdropGeometry {
  scrollY: number;
  viewportHeight: number;
  /**
   * Viewport-relative top of the hall that ends the relay (`#collection`),
   * as reported by `getBoundingClientRect()`. `null` when that hall is not in
   * the document — the drawing then simply stays.
   */
  closingHallTop: number | null;
}

export interface BackdropOpacities {
  photo: number;
  drawing: number;
}

export function createBackdropOpacities({
  scrollY,
  viewportHeight,
  closingHallTop
}: BackdropGeometry): BackdropOpacities {
  if (viewportHeight <= 0) return { photo: 1, drawing: 0 };

  const {
    photoFadeViewports,
    drawingEntryViewports,
    drawingRiseViewports,
    withdrawalViewports
  } = HERO_BACKDROP_TUNING;

  const photo = 1 - ease(scrollY / (viewportHeight * photoFadeViewports));

  const rise = ease(
    (scrollY - viewportHeight * drawingEntryViewports) /
      (viewportHeight * drawingRiseViewports)
  );

  // The closing hall enters at the bottom edge and pushes the drawing out as
  // it climbs. Below the threshold there is nothing to withdraw from yet.
  const withdrawal =
    closingHallTop === null
      ? 0
      : ease(
          (viewportHeight - closingHallTop) / (viewportHeight * withdrawalViewports)
        );

  return { photo, drawing: rise * (1 - withdrawal) };
}

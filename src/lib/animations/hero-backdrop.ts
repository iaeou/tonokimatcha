/**
 * The threshold changes hands as the visitor descends.
 *
 * Three stages, each handing to the next. The photograph holds the first
 * screen. As it withdraws, Osaka is drawn in its place — the city the name
 * comes from, rendered as ink rather than as a second photograph. As the city
 * leaves before The Leaf, one of Jaume's drawn figures takes the wall, and it
 * in turn withdraws before The Lineage, so the halls below keep their quiet
 * for the magatama.
 *
 * The hand-off is literal: the figure's arrival *is* the city's withdrawal
 * curve, so one cannot be present without the other being absent.
 *
 * Everything here is measured in viewport heights, except the withdrawals,
 * which follow the real positions of the halls that end each stage: section
 * heights change with the copy, and a hardcoded scroll distance would drift.
 */

export const HERO_BACKDROP_TUNING = {
  /** Viewport heights over which the photograph fades out. */
  photoFadeViewports: 1,
  /**
   * Where the drawing starts to arrive, in viewport heights. Early, and the
   * rise is short: the hero is exactly one viewport tall, so the city has
   * about that much scroll to live in before the first hall claims the screen.
   * The old 0.55 + 0.95 meant the rise had barely started when the withdrawal
   * began, and Osaka never got above 4% of itself — invisible.
   */
  drawingEntryViewports: 0.2,
  /** Viewport heights the drawing takes to arrive in full. */
  drawingRiseViewports: 0.35,
  /**
   * How much of the viewport the closing hall must claim before the drawing
   * begins to withdraw at all. Leaving at its first appearance cut the city's
   * life short: it died while The Lineage was still being read, so it never
   * got the empty stretch below that hall — the one gap wide enough to see it
   * in. The hall now has to be genuinely arriving, not merely visible.
   */
  withdrawalEntryViewports: 1,
  /**
   * How much further the hall must climb, once withdrawal has begun, for the
   * drawing to be fully gone.
   */
  withdrawalViewports: 0.18,
  /**
   * The band of the screen where reading actually happens, in viewport
   * fractions. Copy crossing it dims the city; the drawing is meant to be
   * seen in the breaths between halls, not underneath their sentences.
   */
  readingBandTop: 0.16,
  readingBandBottom: 0.94,
  /**
   * How much ink survives while copy occupies the whole band. Legibility is
   * mostly the *horizontal* mask's job — it holds the drawing at 40% over the
   * column the copy occupies and full strength in the open right. Dimming
   * hard vertically as well left nothing to see: on a page this dense there is
   * no scroll position with an empty reading band, so the floor is the ink.
   */
  inkBehindCopy: 0.45
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
  /**
   * Viewport-relative top of the block that ends the *figure's* stage — the
   * first hall's copy. `null` when that block is absent — the figure then stays,
   * exactly as the drawing does without its own closing hall.
   */
  finalHallTop?: number | null;
}

export interface BackdropOpacities {
  photo: number;
  drawing: number;
  figure: number;
}

/**
 * A hall pushing a layer out as it climbs, but only once it has claimed its
 * share of the screen. Merely appearing at the bottom edge is not arriving:
 * leaving then cut the city's life short, before the gap it lives in.
 */
function withdrawalFor(hallTop: number | null | undefined, viewportHeight: number) {
  if (hallTop === null || hallTop === undefined) return 0;

  const { withdrawalEntryViewports, withdrawalViewports } = HERO_BACKDROP_TUNING;
  const claimed = viewportHeight - hallTop;

  return ease(
    (claimed - viewportHeight * withdrawalEntryViewports) /
      (viewportHeight * withdrawalViewports)
  );
}

export function createBackdropOpacities({
  scrollY,
  viewportHeight,
  closingHallTop,
  finalHallTop = null
}: BackdropGeometry): BackdropOpacities {
  if (viewportHeight <= 0) return { photo: 1, drawing: 0, figure: 0 };

  const { photoFadeViewports, drawingEntryViewports, drawingRiseViewports } =
    HERO_BACKDROP_TUNING;

  const photo = 1 - ease(scrollY / (viewportHeight * photoFadeViewports));

  const rise = ease(
    (scrollY - viewportHeight * drawingEntryViewports) /
      (viewportHeight * drawingRiseViewports)
  );

  const cityLeaves = withdrawalFor(closingHallTop, viewportHeight);
  const figureLeaves = withdrawalFor(finalHallTop, viewportHeight);

  return {
    photo,
    drawing: rise * (1 - cityLeaves),
    // The hand-off: the figure arrives on exactly the curve that takes the
    // city away, so the wall is never held by both and never by neither.
    figure: cityLeaves * (1 - figureLeaves)
  };
}

/** Viewport-relative bounds of a block of copy, as `getBoundingClientRect()` gives them. */
export interface CopyBounds {
  top: number;
  bottom: number;
}

/**
 * How much of the city survives at this scroll position.
 *
 * Osaka is dense line work, and dense line work directly behind a paragraph is
 * just noise. Rather than thinning the ink everywhere — which would leave the
 * drawing too faint to be worth having — the city is dimmed only while copy
 * crosses the reading band, and comes back to full strength in the gaps
 * between halls.
 *
 * Returns a multiplier: `1` in an empty gap, `inkBehindCopy` when copy fills
 * the band, smoothly between while a hall is entering or leaving.
 */
export function createInterludeInk(
  copyBounds: CopyBounds[],
  viewportHeight: number
): number {
  const { readingBandTop, readingBandBottom, inkBehindCopy } = HERO_BACKDROP_TUNING;

  if (viewportHeight <= 0) return 1;

  const bandTop = viewportHeight * readingBandTop;
  const bandBottom = viewportHeight * readingBandBottom;
  const bandHeight = bandBottom - bandTop;
  if (bandHeight <= 0) return 1;

  // The deepest single intrusion decides it. Summing overlaps would let two
  // half-covering blocks read as a full one and blink the city out early.
  let deepest = 0;
  for (const { top, bottom } of copyBounds) {
    const overlap = Math.min(bottom, bandBottom) - Math.max(top, bandTop);
    deepest = Math.max(deepest, clamp01(overlap / bandHeight));
  }

  return 1 - ease(deepest) * (1 - inkBehindCopy);
}

/**
 * The threshold changes hands as the visitor descends.
 *
 * Two stages, one handing to the next. The photograph holds the first screen.
 * As it withdraws, one of Jaume's drawn figures takes the wall, and it in turn
 * withdraws as the first hall's copy arrives, so the halls below keep their
 * quiet for the magatama and for their own watermarks.
 *
 * Osaka used to stand between the two. It came out on 2026-09-09: the city is
 * the *name's* story, not the tea's, and the landing page is about the tea.
 * The drawing now lives on /lineage, where it is the wall behind The Dignified
 * Tree and can be looked at rather than read through. Nothing about the
 * photograph or the figure changed — the middle stage was simply removed and
 * the figure now rises on the curve the city used to rise on.
 *
 * Everything here is measured in viewport heights, except the withdrawal,
 * which follows the real position of the hall that ends the stage: section
 * heights change with the copy, and a hardcoded scroll distance would drift.
 */

export const HERO_BACKDROP_TUNING = {
  /** Viewport heights over which the photograph fades out. */
  photoFadeViewports: 1,
  /**
   * Where the figure starts to arrive, in viewport heights. Early, and the
   * rise is short: the hero is exactly one viewport tall, so the figure has
   * about that much scroll to live in before the first hall claims the screen.
   */
  figureEntryViewports: 0.2,
  /** Viewport heights the figure takes to arrive in full. */
  figureRiseViewports: 0.35,
  /**
   * How much of the viewport the closing hall must claim before the figure
   * begins to withdraw at all. Leaving at the hall's first appearance cut the
   * stage short: it died while the hall was still arriving, so it never got
   * the empty stretch below the hero — the one gap wide enough to see it in.
   * The hall now has to be genuinely arriving, not merely visible.
   */
  withdrawalEntryViewports: 1,
  /**
   * How much further the hall must climb, once withdrawal has begun, for the
   * figure to be fully gone.
   */
  withdrawalViewports: 0.18,
  /**
   * The band of the screen where reading actually happens, in viewport
   * fractions. Copy crossing it dims the figure; the drawing is meant to be
   * seen in the breaths between halls, not underneath their sentences.
   */
  readingBandTop: 0.16,
  readingBandBottom: 0.94,
  /**
   * How much ink survives while copy occupies the whole band. Legibility is
   * mostly the *horizontal* mask's job — it holds the drawing back over the
   * column the copy occupies and at full strength in the open right. Dimming
   * hard vertically as well leaves nothing to see: on a page this dense there
   * is no scroll position with an empty reading band, so the floor is the ink.
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
   * Viewport-relative top of the block that ends the figure's stage — the
   * first hall's copy — as reported by `getBoundingClientRect()`. `null` when
   * that block is absent from the document; the figure then simply stays.
   */
  finalHallTop?: number | null;
}

export interface BackdropOpacities {
  photo: number;
  figure: number;
}

/**
 * A hall pushing a layer out as it climbs, but only once it has claimed its
 * share of the screen. Merely appearing at the bottom edge is not arriving:
 * leaving then cut the drawing's life short, before the gap it lives in.
 */
function withdrawalFor(hallTop: number | null | undefined, viewportHeight: number) {
  if (hallTop === null || hallTop === undefined) return 0;

  const { withdrawalEntryViewports, withdrawalViewports } = HERO_BACKDROP_TUNING;
  const claimed = viewportHeight - hallTop;

  return ease(
    (claimed - viewportHeight * withdrawalEntryViewports) / (viewportHeight * withdrawalViewports)
  );
}

export function createBackdropOpacities({
  scrollY,
  viewportHeight,
  finalHallTop = null
}: BackdropGeometry): BackdropOpacities {
  if (viewportHeight <= 0) return { photo: 1, figure: 0 };

  const { photoFadeViewports, figureEntryViewports, figureRiseViewports } = HERO_BACKDROP_TUNING;

  const photo = 1 - ease(scrollY / (viewportHeight * photoFadeViewports));

  const rise = ease(
    (scrollY - viewportHeight * figureEntryViewports) / (viewportHeight * figureRiseViewports)
  );

  return {
    photo,
    figure: rise * (1 - withdrawalFor(finalHallTop, viewportHeight))
  };
}

/** Viewport-relative bounds of a block of copy, as `getBoundingClientRect()` gives them. */
export interface CopyBounds {
  top: number;
  bottom: number;
}

/**
 * How much of the drawing survives at this scroll position.
 *
 * Dense line work directly behind a paragraph is just noise. Rather than
 * thinning the ink everywhere — which would leave the drawing too faint to be
 * worth having — it is dimmed only while copy crosses the reading band, and
 * comes back to full strength in the gaps between halls.
 *
 * Returns a multiplier: `1` in an empty gap, `inkBehindCopy` when copy fills
 * the band, smoothly between while a hall is entering or leaving.
 */
export function createInterludeInk(copyBounds: CopyBounds[], viewportHeight: number): number {
  const { readingBandTop, readingBandBottom, inkBehindCopy } = HERO_BACKDROP_TUNING;

  if (viewportHeight <= 0) return 1;

  const bandTop = viewportHeight * readingBandTop;
  const bandBottom = viewportHeight * readingBandBottom;
  const bandHeight = bandBottom - bandTop;
  if (bandHeight <= 0) return 1;

  // The deepest single intrusion decides it. Summing overlaps would let two
  // half-covering blocks read as a full one and blink the drawing out early.
  let deepest = 0;
  for (const { top, bottom } of copyBounds) {
    const overlap = Math.min(bottom, bandBottom) - Math.max(top, bandTop);
    deepest = Math.max(deepest, clamp01(overlap / bandHeight));
  }

  return 1 - ease(deepest) * (1 - inkBehindCopy);
}

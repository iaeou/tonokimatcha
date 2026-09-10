import type { Action } from 'svelte/action';
import { prefersReducedMotion } from './typography-reveal';

/**
 * Drawn figure drift.
 *
 * Each museum hall carries one of Jaume's three figures behind its headline,
 * rendered at a few percent opacity like a watermark pressed into the paper.
 * As the visitor scrolls through the section the figure surfaces, drifts
 * slowly downward past the headline, and sinks away again: scrubbed 1:1 to
 * scroll (via ScrollTrigger synced to Lenis), never on a timer.
 *
 * This replaced `kanji-drift` on 2026-09-09. The motion is unchanged — a
 * dense drawing needs a lower ceiling than a single character did, which is
 * the one number that moved.
 */

export interface FigureDriftOptions {
  /**
   * The transform that puts the figure's middle on its anchor. The figure is
   * placed at `top: 50%` of the hall, so it needs pulling back by half its own
   * height — and because GSAP drives the same transform property, the offset
   * has to live here rather than in a CSS `translateY`.
   */
  anchorYPercent: number;
  /** How far the figure travels across the hall, in its own heights. */
  travelYPercent: number;
  /** yPercent at section entry (the figure sits high, mostly hidden). */
  yPercentFrom: number;
  /** yPercent at section exit (has drifted down past the headline). */
  yPercentTo: number;
  /** Peak opacity at the center of the section. */
  opacityPeak: number;
  /**
   * The share of the scrub spent arriving, and the same again leaving. The
   * rest of the hall the figure holds at full ink, whole. Short on purpose:
   * the fade is only there so nothing snaps on at the trigger's edge, where
   * the figure's own travel has already carried it near the screen.
   */
  fadeShare: number;
}

export function createFigureDriftOptions(
  overrides: Partial<FigureDriftOptions> = {}
): FigureDriftOptions {
  /**
   * The scrub runs from the hall's top reaching the bottom of the screen to
   * its bottom reaching the top, so the ink peaks exactly when the hall's
   * middle crosses the middle of the screen. Anchoring the figure to that
   * middle is what puts the peak in front of the reader.
   *
   * It used to hang at 4% of the hall's height — inherited from the kanji,
   * when a hall was about one screen tall. The halls are now twice that, and
   * measured on the page the figure's top sat 361px *above* the viewport at
   * full ink: barely a third of the drawing was on screen, and what showed
   * were its feet. That is the "descoordinado" — the drawing did its whole
   * performance where nobody was looking.
   */
  const anchorYPercent = -50;
  const travelYPercent = 250;

  return {
    anchorYPercent,
    travelYPercent,
    yPercentFrom: anchorYPercent - travelYPercent / 2,
    yPercentTo: anchorYPercent + travelYPercent / 2,
    // Parallax, and deliberately overstated: the holder scrolls with the hall
    // and this pushes the figure the other way, so it lags the page and reads
    // as standing well behind it. Measured at a 0.75 ratio — the page travels
    // 1833px while the figure travels 1373px on screen.
    //
    // Heavier than the 0.05 it started at, where the drawings were present but
    // not seen. It used to be the horizontal mask that bought this headroom;
    // with the masks gone (a figure must be whole) the ink is held back a
    // little instead, and the drawing is pushed further off the right edge.
    opacityPeak: 0.095,
    fadeShare: 0.16,
    ...overrides
  };
}

/**
 * Svelte action: `use:figureDrift` on the `.section__figure` element. The
 * scrub trigger is the closest `.section`, so the drift spans the full hall.
 */
export const figureDrift: Action<HTMLElement> = (node) => {
  const opts = createFigureDriftOptions();
  const trigger = node.closest('.section') ?? node;

  let disposed = false;
  let cleanup: (() => void) | null = null;

  // Pre-hide so the figure never flashes at full CSS opacity before GSAP loads.
  node.style.opacity = '0';

  if (prefersReducedMotion()) {
    // Static watermark: present and whole, but it does not travel.
    node.style.opacity = String(opts.opacityPeak * 0.7);
    return {};
  }

  (async () => {
    const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
      import('gsap'),
      import('gsap/dist/ScrollTrigger')
    ]);
    if (disposed) return;

    gsap.registerPlugin(ScrollTrigger);
    gsap.set(node, { yPercent: opts.yPercentFrom, opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });

    /**
     * The figure crosses the hall whole. It used to be drawn on by a wiping
     * mask edge and lifted off the same way, which was the point — until you
     * caught one mid-sweep and it read as a half-loaded image rather than as
     * ink. So: it travels, and it arrives and leaves by an even fade over a
     * sixth of the scrub at each end. Between those it holds at full ink and
     * is never partly there.
     */
    tl.to(node, { yPercent: opts.yPercentTo, ease: 'none', duration: 1 }, 0);
    tl.to(node, { opacity: opts.opacityPeak, ease: 'none', duration: opts.fadeShare }, 0);
    tl.to(node, { opacity: 0, ease: 'none', duration: opts.fadeShare }, 1 - opts.fadeShare);

    cleanup = () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };

    if (disposed) cleanup();
  })();

  return {
    destroy() {
      disposed = true;
      cleanup?.();
    }
  };
};

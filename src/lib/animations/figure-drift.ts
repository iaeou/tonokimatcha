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
   * Where the wipe's edge rests, as a fraction of the figure's height, at
   * each end of its journey. Past the drawing on both sides so the feathered
   * band is fully clear of it: stopped at exactly 0 or 1 the soft edge leaves
   * a sliver of the crown or the feet showing.
   */
  wipeFrom: number;
  wipeTo: number;
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
    // 1833px while the figure travels 1373px on screen. Spilling past the
    // hall's bounds is harmless: the wipe has closed at both ends.
    //
    // Heavier than the 0.05 it replaced. At that value, and behind a drawing
    // whose own ink is thin lines rather than solid mass, the figures were
    // there but not *seen*. The horizontal mask is what buys the headroom:
    // the strong half of the drawing hangs off the right edge, clear of the
    // copy, so the ink can be raised without being read through.
    opacityPeak: 0.11,
    wipeFrom: -0.16,
    wipeTo: 1.16,
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
    // Static watermark: present and whole, but it neither travels nor draws.
    node.style.setProperty('--figure-wipe', String(opts.wipeTo));
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
    gsap.set(node, {
      yPercent: opts.yPercentFrom,
      opacity: 0,
      '--figure-wipe': opts.wipeFrom
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });

    /**
     * The figure is drawn onto the hall rather than faded into it. One soft
     * edge does the whole gesture: it sweeps down from the crown to the feet
     * to draw the figure in, then rises back from the feet to the crown to
     * take it away — ink laid on, then lifted off the way it came.
     *
     * A single edge, not two. Descending a second edge would have erased the
     * figure from its head downwards, which is the opposite gesture and looks
     * like a shutter closing.
     *
     * The parallax is on the same halves, so the drawing is still moving
     * while it is being drawn. Opacity only takes the first and last sliver
     * of the scrub: fading the whole way as well would flatten the wipe back
     * into the ordinary dissolve this replaces.
     */
    tl.to(node, { '--figure-wipe': opts.wipeTo, ease: 'none', duration: 0.5 }, 0);
    tl.to(node, { yPercent: 0, ease: 'none', duration: 0.5 }, 0);
    tl.to(node, { opacity: opts.opacityPeak, ease: 'none', duration: 0.09 }, 0);

    tl.to(node, { '--figure-wipe': opts.wipeFrom, ease: 'none', duration: 0.5 }, 0.5);
    tl.to(node, { yPercent: opts.yPercentTo, ease: 'none', duration: 0.5 }, 0.5);
    tl.to(node, { opacity: 0, ease: 'none', duration: 0.09 }, 0.91);

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

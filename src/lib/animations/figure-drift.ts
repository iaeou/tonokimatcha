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
  return {
    // Parallax, and deliberately overstated. The holder scrolls with the hall;
    // this pushes the figure the other way as it goes, so the figure lags the
    // page and reads as standing well behind it. The kanji travelled 24% of
    // their own height and the first pass 92%, both of which read as a nudge
    // rather than as depth — a hall is roughly a screen tall, so the figure
    // has to travel a comparable distance to look like it is on another plane.
    // Spilling past the hall's bounds is harmless: opacity is 0 at both ends.
    yPercentFrom: -125,
    yPercentTo: 125,
    // Lower than the kanji's 0.07: these drawings cover a quarter of their
    // box in ink where a character covered a fraction of it, so the same
    // opacity would read as a much heavier stain behind the copy.
    opacityPeak: 0.05,
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

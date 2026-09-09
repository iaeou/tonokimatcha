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
}

export function createFigureDriftOptions(
  overrides: Partial<FigureDriftOptions> = {}
): FigureDriftOptions {
  return {
    // Parallax. The holder scrolls with the hall; this pushes the figure the
    // other way as it goes, so the figure lags the page and reads as standing
    // further back. The kanji travelled 24% of their own height, which was
    // subtle to the point of being invisible — a figure needs a real journey
    // to look like it is at a different depth rather than just misaligned.
    // Spilling past the hall's bounds is harmless: opacity is 0 at both ends.
    yPercentFrom: -46,
    yPercentTo: 46,
    // Lower than the kanji's 0.07: these drawings cover a quarter of their
    // box in ink where a character covered a fraction of it, so the same
    // opacity would read as a much heavier stain behind the copy.
    opacityPeak: 0.05,
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
    // Static watermark: present, but it does not travel.
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

    tl.to(node, { opacity: opts.opacityPeak, yPercent: 0, ease: 'none', duration: 0.5 });
    tl.to(node, { opacity: 0, yPercent: opts.yPercentTo, ease: 'none', duration: 0.5 });

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

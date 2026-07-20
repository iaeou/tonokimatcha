import type { Action } from 'svelte/action';
import { prefersReducedMotion } from './typography-reveal';

/**
 * Ghost kanji drift.
 *
 * Each museum hall carries a single enormous kanji behind its headline —
 * 樹 for the Lineage, 玉 for the Collection, 陵 for the Guardian — rendered at
 * a few percent opacity like a watermark pressed into the paper. As the
 * visitor scrolls through the section the character surfaces, drifts slowly
 * downward past the headline, and sinks away again: scrubbed 1:1 to scroll
 * (via ScrollTrigger synced to Lenis), never on a timer.
 */

export interface KanjiDriftOptions {
  /** yPercent at section entry (character sits high, mostly hidden). */
  yPercentFrom: number;
  /** yPercent at section exit (has drifted down past the headline). */
  yPercentTo: number;
  /** Peak opacity at the center of the section. */
  opacityPeak: number;
}

export function createKanjiDriftOptions(
  overrides: Partial<KanjiDriftOptions> = {}
): KanjiDriftOptions {
  return {
    yPercentFrom: -14,
    yPercentTo: 10,
    opacityPeak: 0.07,
    ...overrides
  };
}

/**
 * Svelte action: `use:kanjiDrift` on the `.section__kanji` element. The
 * scrub trigger is the closest `.section`, so the drift spans the full hall.
 */
export const kanjiDrift: Action<HTMLElement> = (node) => {
  const opts = createKanjiDriftOptions();
  const trigger = node.closest('.section') ?? node;

  let disposed = false;
  let cleanup: (() => void) | null = null;

  // Pre-hide so the kanji never flashes at full CSS opacity before GSAP loads.
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

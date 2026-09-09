import type { Action } from 'svelte/action';
import { prefersReducedMotion } from './typography-reveal';

/**
 * Full-bleed backdrop parallax.
 *
 * Where `figure-drift` walks a standing figure down past a headline, this is
 * for a horizon: an image that spans the whole width of the hall and sits
 * behind the copy as a wash. It surfaces as the hall enters the viewport,
 * drifts against the scroll so it reads as another plane, and sinks away
 * again — scrubbed 1:1 to scroll (via ScrollTrigger synced to Lenis).
 *
 * Added 2026-09-09 for the Osaka skyline behind The Dignified Tree.
 */
export interface BackdropParallaxOptions {
  /** yPercent at hall entry — the horizon sits low and rises against it. */
  yPercentFrom: number;
  /** yPercent at hall exit. */
  yPercentTo: number;
  /** Peak opacity at the centre of the hall. */
  opacityPeak: number;
}

export function createBackdropParallaxOptions(
  overrides: Partial<BackdropParallaxOptions> = {}
): BackdropParallaxOptions {
  return {
    // A quieter travel than the standing figure's. The drawing already spans
    // the full width, so it does not need distance to read as depth — past
    // roughly a tenth of its own height it starts to look like a slideshow
    // rather than like a city standing still while the page moves. It was 16
    // first, which let the skyline climb far enough to reach the paragraphs;
    // the drawing is anchored to the foot of the hall and has to stay there.
    yPercentFrom: 9,
    yPercentTo: -9,
    // Higher than a figure's 0.05: this is a horizon of thin lines spread
    // across the whole hall, not a quarter-box of dense ink, so the same
    // number would leave nothing on the wall at all. Lowered from 0.14 once
    // the copy proved harder to read than the city was worth — legibility is
    // mostly the mask's job now, and this is the floor under it.
    opacityPeak: 0.09,
    ...overrides
  };
}

/**
 * Svelte action: `use:backdropParallax` on the image itself. The scrub trigger
 * is the closest `.section`, so the drift spans the full hall.
 */
export const backdropParallax: Action<HTMLElement, Partial<BackdropParallaxOptions> | undefined> = (
  node,
  params
) => {
  const opts = createBackdropParallaxOptions(params);
  const trigger = node.closest('.section') ?? node;

  let disposed = false;
  let cleanup: (() => void) | null = null;

  // Pre-hide so the wall never flashes at full CSS opacity before GSAP loads.
  node.style.opacity = '0';

  if (prefersReducedMotion()) {
    // Static wash: present and whole, but it neither travels nor fades.
    node.style.opacity = String(opts.opacityPeak * 0.8);
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

    // The travel runs the whole length of the hall, uninterrupted. The fade
    // takes only the first and last fifth of it, so the city is at full
    // presence for the middle of the scroll rather than only at one instant.
    tl.to(node, { yPercent: opts.yPercentTo, ease: 'none', duration: 1 }, 0);
    tl.to(node, { opacity: opts.opacityPeak, ease: 'none', duration: 0.2 }, 0);
    tl.to(node, { opacity: 0, ease: 'none', duration: 0.2 }, 0.8);

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

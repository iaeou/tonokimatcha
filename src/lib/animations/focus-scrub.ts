import type { Action } from 'svelte/action';
import { prefersReducedMotion } from './typography-reveal';

/**
 * Focus scrub — reading as a band of light.
 *
 * Body paragraphs sit dimmed until they enter the reading band of the
 * viewport; as they cross it (scrubbed 1:1 to Lenis scroll, not on a timer)
 * they come to full ink. Scrolling back down-dims them again, so attention
 * always lives where the eyes are. The paragraph is the unit — no fragile
 * line-splitting, so wrapping and resizing stay untouched.
 */

export interface FocusScrubOptions {
  /** Opacity while outside the reading band. */
  opacityFrom: number;
  /** ScrollTrigger start — where a paragraph begins to focus. */
  start: string;
  /** ScrollTrigger end — where it reaches full ink. */
  end: string;
}

export function createFocusScrubOptions(
  overrides: Partial<FocusScrubOptions> = {}
): FocusScrubOptions {
  return {
    opacityFrom: 0.24,
    start: 'top 92%',
    end: 'top 58%',
    ...overrides
  };
}

/** Elements inside the container that get their own focus trigger. */
export const FOCUS_SCRUB_SELECTOR = 'p, li, dt, dd' as const;

/**
 * Svelte action: `use:focusScrub` on a content container (e.g. the section
 * body). Every paragraph-like descendant receives a scrubbed opacity tween.
 */
export const focusScrub: Action<HTMLElement> = (node) => {
  if (prefersReducedMotion()) return {};

  const targets = Array.from(node.querySelectorAll<HTMLElement>(FOCUS_SCRUB_SELECTOR));
  if (targets.length === 0) return {};

  const opts = createFocusScrubOptions();

  let disposed = false;
  let cleanup: (() => void) | null = null;

  // Pre-dim synchronously so nothing flashes at full ink before GSAP loads.
  for (const target of targets) {
    target.style.opacity = String(opts.opacityFrom);
  }

  (async () => {
    const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
      import('gsap'),
      import('gsap/dist/ScrollTrigger')
    ]);
    if (disposed) return;

    gsap.registerPlugin(ScrollTrigger);

    const tweens = targets.map((target) =>
      gsap.fromTo(
        target,
        { opacity: opts.opacityFrom },
        {
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: target,
            start: opts.start,
            end: opts.end,
            scrub: true
          }
        }
      )
    );

    cleanup = () => {
      for (const tween of tweens) {
        tween.scrollTrigger?.kill();
        tween.kill();
      }
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

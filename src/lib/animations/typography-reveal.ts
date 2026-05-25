import type { Action } from 'svelte/action';

/**
 * Tonoki typography reveal.
 *
 * Two coordinated effects that translate the brand's ma (negative space) and
 * ceremonial restraint into motion on headings and eyebrow text:
 *
 *   - `rise`   — splits a heading into word-level spans, masks each word with
 *                `overflow: hidden`, then animates the inner span from
 *                `translateY(110%)` to `0` with a small per-word stagger. While
 *                the words rise, the parent heading's `letter-spacing` animates
 *                from a slightly tightened value to its resting tracking, so
 *                the title appears to *exhale into place*.
 *   - `breath` — used on eyebrow / caption text. No word splitting. The element
 *                fades in while its letter-spacing eases from a tight value out
 *                to its resting (wider) value — a single soft expansion.
 *
 * Both effects respect `prefers-reduced-motion: reduce`. GSAP is lazy-imported
 * so it doesn't run during SSR or load until the action is mounted.
 */

/** Resting ease that matches the project's `--ease-ceremony` CSS variable. */
export const TONOKI_REVEAL_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)' as const;

export interface RiseRevealOptions {
  /** Initial translateY for the inner word spans, as a percent string. */
  riseFromPercent: number;
  /** Duration of the rise (and parent letter-spacing) animation, in seconds. */
  duration: number;
  /** Per-word stagger between rises, in seconds. */
  stagger: number;
  /** Easing curve. */
  ease: string;
  /** Letter-spacing the heading starts at while the words rise. */
  letterSpacingFrom: string;
  /** Letter-spacing the heading settles to once the rise completes. */
  letterSpacingTo: string;
}

export interface BreathRevealOptions {
  /** Duration of the breath animation, in seconds. */
  duration: number;
  /** Easing curve. */
  ease: string;
  /** Letter-spacing the element starts at (tight). */
  letterSpacingFrom: string;
  /**
   * Optional opacity to start from. The breath is intentionally subtle, so a
   * small fade in (0.2 → 1) accompanies the spacing expansion without pulling
   * the eye.
   */
  opacityFrom: number;
}

/**
 * Defaults for the rise effect.
 *
 * - 1.4 s duration with 0.08 s stagger is slow enough to read as ceremonial
 *   rather than playful.
 * - `riseFromPercent: 110` clears the descenders on letters like "y" / "g".
 * - The `-0.02em → 0em` letter-spacing arc is the typographic "breath" piece
 *   that distinguishes this from a generic SplitText reveal.
 */
export function createRiseRevealOptions(
  overrides: Partial<RiseRevealOptions> = {}
): RiseRevealOptions {
  return {
    riseFromPercent: 110,
    duration: 1.4,
    stagger: 0.08,
    ease: TONOKI_REVEAL_EASE,
    letterSpacingFrom: '-0.02em',
    letterSpacingTo: '0em',
    ...overrides
  };
}

export function createRiseHiddenState(options = createRiseRevealOptions()) {
  return {
    y: 0,
    yPercent: options.riseFromPercent
  } as const;
}

/**
 * Defaults for the breath effect.
 *
 * Used on `.eyebrow` and other short caps-tracked text. The duration is longer
 * than the rise (1.8 s) on purpose: eyebrows announce the room, they shouldn't
 * snap into place.
 */
export function createBreathRevealOptions(
  overrides: Partial<BreathRevealOptions> = {}
): BreathRevealOptions {
  return {
    duration: 1.8,
    ease: TONOKI_REVEAL_EASE,
    letterSpacingFrom: '0em',
    opacityFrom: 0.2,
    ...overrides
  };
}

/**
 * Pure-logic tokenizer. Returns the words from a string that would each be
 * wrapped in a mask span. Whitespace tokens are dropped from the result but
 * preserved in the live DOM mutation (`splitElementIntoWordSpans`) so that
 * inline text flow is unchanged.
 */
export function tokenizeWords(text: string): string[] {
  return text.split(/(\s+)/).filter((token) => token.length > 0 && !/^\s+$/.test(token));
}

/**
 * Replace an element's text content with word-level mask spans:
 *
 *   <h2>The Dignified Tree</h2>
 *
 * becomes
 *
 *   <h2>
 *     <span class="reveal-word"><span class="reveal-word__inner">The</span></span>
 *     <span class="reveal-word"><span class="reveal-word__inner">Dignified</span></span>
 *     <span class="reveal-word"><span class="reveal-word__inner">Tree</span></span>
 *   </h2>
 *
 * with the original whitespace preserved as text nodes between masks. Returns
 * the inner spans so the caller can animate their `transform`.
 *
 * NB: assumes the target element holds plain text only. Headings in this
 * project are plain strings, so this is safe.
 */
export function splitElementIntoWordSpans(element: HTMLElement): HTMLSpanElement[] {
  const original = element.textContent ?? '';
  const tokens = original.split(/(\s+)/);
  element.textContent = '';

  const innerSpans: HTMLSpanElement[] = [];

  for (const token of tokens) {
    if (token.length === 0) continue;

    if (/^\s+$/.test(token)) {
      element.appendChild(document.createTextNode(token));
      continue;
    }

    const mask = document.createElement('span');
    mask.className = 'reveal-word';

    const inner = document.createElement('span');
    inner.className = 'reveal-word__inner';
    inner.textContent = token;

    mask.appendChild(inner);
    element.appendChild(mask);
    innerSpans.push(inner);
  }

  return innerSpans;
}

/**
 * Read the current `prefers-reduced-motion` media query. Returns false in
 * non-browser environments so SSR rendering is stable.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * IntersectionObserver trigger that matches the previous viewport start line:
 * `top 82%` means reveal when the element reaches 82% of the viewport height.
 */
export function createRevealObserverOptions(): IntersectionObserverInit {
  return {
    root: null,
    rootMargin: '0px 0px -18% 0px',
    threshold: 0
  };
}

export function observeReveal(
  node: HTMLElement,
  onReveal: () => void,
  options: IntersectionObserverInit = createRevealObserverOptions()
): () => void {
  if (typeof window === 'undefined' || !window.IntersectionObserver) {
    onReveal();
    return () => {};
  }

  let revealed = false;
  const observer = new window.IntersectionObserver((entries) => {
    if (revealed) return;

    if (entries.some((entry) => entry.isIntersecting || entry.intersectionRatio > 0)) {
      revealed = true;
      observer.disconnect();
      onReveal();
    }
  }, options);

  observer.observe(node);

  return () => {
    revealed = true;
    observer.disconnect();
  };
}

export type RevealMode = 'rise' | 'breath';

export interface TypographyRevealParams {
  /** Which effect to apply. Defaults to `rise`. */
  mode?: RevealMode;
  /**
   * For `breath` mode: the target resting letter-spacing. Defaults to the
   * element's computed `letter-spacing` read at mount, but passing it
   * explicitly avoids a layout read and is more reliable for em-relative
   * values (which `getComputedStyle` returns in resolved px).
   */
  restLetterSpacing?: string;
  /** Optional delay before the timeline starts, in seconds. */
  delay?: number;
}

/**
 * Svelte action: `use:typographyReveal={{ mode: 'rise' }}` on a heading, or
 * `use:typographyReveal={{ mode: 'breath', restLetterSpacing: '0.18em' }}` on
 * an eyebrow.
 *
 * The `gsap` import is async and dynamic so this module is tree-shake friendly
 * and stays out of the SSR bundle.
 */
export const typographyReveal: Action<HTMLElement, TypographyRevealParams | undefined> = (
  node,
  params
) => {
  const mode: RevealMode = params?.mode ?? 'rise';
  const delay = params?.delay ?? 0;
  const observerOptions = createRevealObserverOptions();

  let disposed = false;
  let cleanup: (() => void) | null = null;

  const reduced = prefersReducedMotion();

  // Pre-hide synchronously so there's no flash of un-animated text between the
  // DOM split and GSAP loading (it's a dynamic import, so it can be a few ms).
  // Once GSAP is ready, gsap.set() re-asserts the same state through its own
  // tracking so the animation continues smoothly.
  if (mode === 'rise') {
    const opts = createRiseRevealOptions();
    const innerSpans = splitElementIntoWordSpans(node);

    if (!reduced) {
      for (const span of innerSpans) {
        span.style.transform = `translateY(${opts.riseFromPercent}%)`;
      }
      node.style.letterSpacing = opts.letterSpacingFrom;
    }

    (async () => {
      const { default: gsap } = await import('gsap');

      if (disposed) return;

      if (reduced) {
        gsap.set(innerSpans, { yPercent: 0, opacity: 1 });
        return;
      }

      gsap.set(innerSpans, createRiseHiddenState(opts));
      gsap.set(node, { letterSpacing: opts.letterSpacingFrom });

      const tl = gsap.timeline({ paused: true });

      tl.to(innerSpans, {
        y: 0,
        yPercent: 0,
        duration: opts.duration,
        ease: opts.ease,
        stagger: opts.stagger
      });
      tl.to(
        node,
        {
          letterSpacing: opts.letterSpacingTo,
          duration: opts.duration,
          ease: opts.ease
        },
        '<'
      );

      let delayedPlay: { kill: () => void } | null = null;
      const observerCleanup = observeReveal(
        node,
        () => {
          if (disposed) return;

          if (delay > 0) {
            delayedPlay = gsap.delayedCall(delay, () => {
              if (!disposed) tl.play(0);
            });
            return;
          }

          tl.play(0);
        },
        observerOptions
      );

      cleanup = () => {
        observerCleanup();
        delayedPlay?.kill();
        tl.kill();
      };
    })();
  } else {
    const opts = createBreathRevealOptions();
    const restSpacing = params?.restLetterSpacing ?? getComputedStyle(node).letterSpacing;

    if (!reduced) {
      node.style.letterSpacing = opts.letterSpacingFrom;
      node.style.opacity = String(opts.opacityFrom);
    }

    (async () => {
      const { default: gsap } = await import('gsap');

      if (disposed) return;

      if (reduced) {
        gsap.set(node, { letterSpacing: restSpacing, opacity: 1 });
        return;
      }

      gsap.set(node, { letterSpacing: opts.letterSpacingFrom, opacity: opts.opacityFrom });

      const tl = gsap.timeline({ paused: true });

      tl.to(node, {
        letterSpacing: restSpacing,
        opacity: 1,
        duration: opts.duration,
        ease: opts.ease
      });

      let delayedPlay: { kill: () => void } | null = null;
      const observerCleanup = observeReveal(
        node,
        () => {
          if (disposed) return;

          if (delay > 0) {
            delayedPlay = gsap.delayedCall(delay, () => {
              if (!disposed) tl.play(0);
            });
            return;
          }

          tl.play(0);
        },
        observerOptions
      );

      cleanup = () => {
        observerCleanup();
        delayedPlay?.kill();
        tl.kill();
      };
    })();
  }

  return {
    destroy() {
      disposed = true;
      cleanup?.();
    }
  };
};

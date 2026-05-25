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
 * Both effects respect `prefers-reduced-motion: reduce`. The timeline is built
 * paused and triggered by an IntersectionObserver (not GSAP's ScrollTrigger):
 * IO is built into the browser, fires reliably for above-the-fold elements
 * without a refresh dance, and keeps the bundle one chunk lighter.
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
 * Pre-hide state passed to `gsap.set()` for word spans in rise mode.
 *
 * Both `y: 0` and `yPercent: 110` are returned on purpose. The synchronous
 * pre-hide writes `transform: translateY(110%)` as inline CSS before GSAP
 * loads; once GSAP arrives, its transform parser may interpret an existing
 * inline transform as a pixel `y` value. Explicitly resetting `y` to 0
 * guarantees the only vertical offset GSAP tracks afterwards is the
 * `yPercent`, so the rise animation lands at exactly `translate(0, 0)` and
 * the words become fully visible.
 */
export function createRiseHiddenState(): { y: number; yPercent: number } {
  return { y: 0, yPercent: 110 };
}

/**
 * Defaults for the IntersectionObserver that triggers each reveal.
 *
 * `rootMargin: '0px 0px -18% 0px'` moves the bottom edge of the trigger
 * region up by 18% of the viewport height, so a heading only triggers once
 * its top has crossed roughly 82% from the top of the viewport — the IO
 * equivalent of GSAP ScrollTrigger's `start: 'top 82%'`.
 */
export function createRevealObserverOptions(): IntersectionObserverInit {
  return {
    root: null,
    rootMargin: '0px 0px -18% 0px',
    threshold: 0
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
 * Trigger `reveal` once when `node` first intersects the viewport.
 *
 * Defensive: in environments without `IntersectionObserver` (Vitest with no
 * jsdom shim, older browsers, certain SSR mocks) the callback fires
 * synchronously so the content is never left in its pre-hide state. The
 * returned cleanup is always safe to call multiple times.
 */
export function observeReveal(node: HTMLElement, reveal: () => void): () => void {
  if (typeof IntersectionObserver === 'undefined') {
    reveal();
    return () => {};
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        reveal();
        observer.disconnect();
        return;
      }
    }
  }, createRevealObserverOptions());

  observer.observe(node);

  return () => observer.disconnect();
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
 * GSAP is imported dynamically so it stays out of the SSR bundle and the
 * action itself remains synchronous for the pre-hide. The reveal is gated on
 * `observeReveal`, which uses IntersectionObserver in the browser and a
 * synchronous fallback in test / non-DOM environments.
 */
export const typographyReveal: Action<HTMLElement, TypographyRevealParams | undefined> = (
  node,
  params
) => {
  const mode: RevealMode = params?.mode ?? 'rise';
  const delay = params?.delay ?? 0;

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
        gsap.set(innerSpans, { y: 0, yPercent: 0, opacity: 1 });
        node.style.letterSpacing = opts.letterSpacingTo;
        return;
      }

      // Reset y back to 0 alongside yPercent so the pre-hide inline transform
      // can't survive as a stale pixel offset after the reveal completes.
      gsap.set(innerSpans, createRiseHiddenState());
      gsap.set(node, { letterSpacing: opts.letterSpacingFrom });

      const tl = gsap.timeline({ paused: true, delay });
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

      const stopObserving = observeReveal(node, () => tl.play());

      cleanup = () => {
        stopObserving();
        tl.kill();
      };

      if (disposed) cleanup();
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

      const tl = gsap.timeline({ paused: true, delay });
      tl.to(node, {
        letterSpacing: restSpacing,
        opacity: 1,
        duration: opts.duration,
        ease: opts.ease
      });

      const stopObserving = observeReveal(node, () => tl.play());

      cleanup = () => {
        stopObserving();
        tl.kill();
      };

      if (disposed) cleanup();
    })();
  }

  return {
    destroy() {
      disposed = true;
      cleanup?.();
    }
  };
};

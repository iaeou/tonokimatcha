/**
 * Ceremonial smooth scroll built on Lenis, synced with GSAP ScrollTrigger.
 *
 * The scroll should feel like moving through a museum hall: weighted,
 * unhurried, and settling without bounce. Lenis drives `window` scroll while
 * GSAP's ticker owns the RAF loop so ScrollTrigger and Lenis never disagree
 * about time.
 */

export function createSmoothScrollOptions() {
  return {
    // GSAP's ticker calls lenis.raf; Lenis must not run its own loop.
    autoRaf: false,
    // In-page anchors (e.g. the hero "Scroll to explore" cue) glide instead of jumping.
    anchors: true,
    // Weighted, museum-pace glide.
    duration: 1.35,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    // Keep native touch scrolling: synthetic touch scroll fights mobile
    // browsers and hurts the 60 FPS target.
    syncTouch: false
  } as const;
}

export function shouldEnableSmoothScroll(
  matchMediaFn: (query: string) => { matches: boolean } = (query) => window.matchMedia(query)
) {
  return !matchMediaFn('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Initializes Lenis lazily (keeps it out of the initial shell chunk, like the
 * Three/GSAP scene) and wires it to ScrollTrigger. Returns a cleanup function.
 */
export async function initSmoothScroll(): Promise<() => void> {
  if (!shouldEnableSmoothScroll()) {
    return () => {};
  }

  const [{ default: Lenis }, { default: gsap }, { ScrollTrigger }] = await Promise.all([
    import('lenis'),
    import('gsap'),
    import('gsap/dist/ScrollTrigger')
  ]);

  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis(createSmoothScrollOptions());

  const handleScroll = () => ScrollTrigger.update();
  lenis.on('scroll', handleScroll);

  const handleTick = (time: number) => {
    lenis.raf(time * 1000);
  };
  gsap.ticker.add(handleTick);
  gsap.ticker.lagSmoothing(0);

  return () => {
    gsap.ticker.remove(handleTick);
    lenis.off('scroll', handleScroll);
    lenis.destroy();
  };
}

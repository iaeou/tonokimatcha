export function createHeroRevealOptions() {
  return {
    delay: 0.5,
    duration: 2.5,
    ease: 'power4.out',
    opacity: 0,
    y: 30
  } as const;
}

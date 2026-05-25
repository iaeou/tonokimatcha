<script lang="ts">
  import { onMount } from 'svelte';
  import { createHeroRevealOptions } from '$lib/animations/hero-reveal';
  import { typographyReveal } from '$lib/animations/typography-reveal';

  let heroContent: HTMLDivElement;

  onMount(async () => {
    const { default: gsap } = await import('gsap');

    // The h1 and eyebrow are animated by `typographyReveal` (word-mask rise +
    // ma letter-spacing breath). The subtitle and cue keep the original soft
    // fade/translate so body copy stays readable and doesn't compete with the
    // headline for attention.
    gsap.from(heroContent.querySelectorAll('.hero-subtitle, .hero__cue'), {
      ...createHeroRevealOptions(),
      stagger: 0.14
    });
  });
</script>

<section class="hero" aria-labelledby="threshold-title">
  <div class="hero__content" bind:this={heroContent}>
    <p class="eyebrow" use:typographyReveal={{ mode: 'breath', restLetterSpacing: '0.18em' }}>
      The Threshold
    </p>
    <h1
      id="threshold-title"
      class="hero-title heritage-text"
      use:typographyReveal={{ mode: 'rise', delay: 0.35 }}
    >
      Before history was written, we were here.
    </h1>
    <p class="hero__text hero-subtitle">
From the sacred land of Osaka to the essence of jade: Tonoki Matcha is the art of transforming an ancestral lineage into a liquid jewel of absolute purity.
    </p>
    <a class="hero__cue" href="#lineage">Scroll to explore</a>
  </div>
</section>

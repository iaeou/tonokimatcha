<script lang="ts">
  import { onMount } from 'svelte';
  import { createHeroRevealOptions } from '$lib/animations/hero-reveal';

  let heroContent: HTMLDivElement;

  onMount(async () => {
    const { default: gsap } = await import('gsap');

    gsap.from(heroContent.querySelectorAll('.hero-title, .hero-subtitle, .hero__cue'), {
      ...createHeroRevealOptions(),
      stagger: 0.14
    });
  });
</script>

<section class="hero" aria-labelledby="threshold-title">
  <div class="hero__content" bind:this={heroContent}>
    <p class="eyebrow">The Threshold</p>
    <h1 id="threshold-title" class="hero-title heritage-text">Before history was written, we were here.</h1>
    <p class="hero__text hero-subtitle">
      Tonoki Matcha is a digital sanctuary for ancestral lineage, ceremonial jade, and modern
      European restraint.
    </p>
    <a class="hero__cue" href="#lineage">Scroll to explore the lineage</a>
  </div>
</section>

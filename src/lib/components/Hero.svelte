<script lang="ts">
  import { onMount } from 'svelte';
  import { createBackdropOpacities } from '$lib/animations/hero-backdrop';
  import { createHeroRevealOptions } from '$lib/animations/hero-reveal';
  import { typographyReveal } from '$lib/animations/typography-reveal';

  let heroSection: HTMLElement;
  let heroContent: HTMLDivElement;

  onMount(() => {
    // The hall that ends the relay. Its live position is what withdraws the
    // drawing, so the handoff keeps pace with the copy instead of a guess.
    const closingHall = document.querySelector('#collection');

    const updateImageFade = () => {
      const { photo, drawing } = createBackdropOpacities({
        scrollY: window.scrollY,
        viewportHeight: window.innerHeight,
        closingHallTop: closingHall?.getBoundingClientRect().top ?? null
      });

      heroSection.style.setProperty('--hero-image-opacity', String(photo));
      heroSection.style.setProperty('--hero-drawing-opacity', String(drawing));
    };

    updateImageFade();
    window.addEventListener('scroll', updateImageFade, { passive: true });
    window.addEventListener('resize', updateImageFade);

    const revealContent = async () => {
      const { default: gsap } = await import('gsap');

      // The h1 and eyebrow are animated by `typographyReveal` (word-mask rise +
      // ma letter-spacing breath). The subtitle and cue keep the original soft
      // fade/translate so body copy stays readable and doesn't compete with the
      // headline for attention.
      gsap.from(heroContent.querySelectorAll('.hero-subtitle, .hero__cue'), {
        ...createHeroRevealOptions(),
        stagger: 0.14
      });
    };

    revealContent();

    return () => {
      window.removeEventListener('scroll', updateImageFade);
      window.removeEventListener('resize', updateImageFade);
    };
  });
</script>

<section class="hero" aria-labelledby="threshold-title" bind:this={heroSection}>
  <figure class="hero__figure" aria-hidden="true">
    <picture class="hero__photo">
      <source srcset="/images/home-header2-m.webp" media="(max-width: 767px)" type="image/webp" />
      <img
        class="hero__image"
        src="/images/home-header2.webp"
        alt=""
        decoding="async"
        fetchpriority="high"
      />
    </picture>
    <!-- Osaka, drawn. It arrives only once the photograph has withdrawn, so it
         yields the connection to the photograph, which is the first paint.
         The figure covers the viewport, so `lazy` alone would not hold it
         back — the low priority is what keeps it out of the way. -->
    <img
      class="hero__drawing"
      fetchpriority="low"
      src="/images/osaka-skyline-1200.webp"
      srcset="
        /images/osaka-skyline-768.webp   768w,
        /images/osaka-skyline-1200.webp 1200w,
        /images/osaka-skyline-1600.webp 1600w
      "
      sizes="100vw"
      alt=""
      loading="lazy"
      decoding="async"
    />
  </figure>
  <div class="hero__content" bind:this={heroContent}>
    <p class="eyebrow" use:typographyReveal={{ mode: 'sumi' }}>
      The Threshold
    </p>
    <h1
      id="threshold-title"
      class="hero-title heritage-text"
      use:typographyReveal={{ mode: 'sumi', delay: 0.35 }}
    >
      Before history was written, we were here.
    </h1>
    <p class="hero__text hero-subtitle">
      Matcha Tonoki is one tea from the shaded fields of Osaka: first-harvest leaf, stone-milled, held to
      a single standard. Whisk it in a bowl or shake it in a bottle — it is the same two grams.
    </p>
    <a class="hero__cue" href="#lineage">Scroll to explore</a>
  </div>
</section>

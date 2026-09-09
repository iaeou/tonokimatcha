<script lang="ts">
  import { onMount } from 'svelte';
  import { createBackdropOpacities, createInterludeInk } from '$lib/animations/hero-backdrop';
  import { createHeroRevealOptions } from '$lib/animations/hero-reveal';
  import { typographyReveal } from '$lib/animations/typography-reveal';

  let heroSection: HTMLElement;
  let heroContent: HTMLDivElement;

  onMount(() => {
    // The hall that ends the relay. Its live position is what withdraws the
    // drawing, so the handoff keeps pace with the copy instead of a guess.
    const closingHall = document.querySelector('#collection');
    // The blocks the city must not compete with. Read once: sections are not
    // added or removed while the page is scrolled.
    const copyBlocks = Array.from(document.querySelectorAll('.section__inner'));
    /**
     * What ends the figure's stage: the arrival of the first hall's *copy*,
     * not a hall further down. The figure is punctuation between the threshold
     * and the halls, and it has to be brief — while it holds the wall the
     * halls keep their own figures down, and a long third stage meant three of
     * the five landing halls never showed theirs at all.
     */
    const firstCopy = copyBlocks[0] ?? null;

    const updateImageFade = () => {
      const viewportHeight = window.innerHeight;
      const { photo, drawing, figure } = createBackdropOpacities({
        scrollY: window.scrollY,
        viewportHeight,
        closingHallTop: closingHall?.getBoundingClientRect().top ?? null,
        finalHallTop: firstCopy?.getBoundingClientRect().top ?? null
      });

      const interlude = createInterludeInk(
        copyBlocks.map((block) => block.getBoundingClientRect()),
        viewportHeight
      );

      heroSection.style.setProperty('--hero-image-opacity', String(photo));
      heroSection.style.setProperty('--hero-drawing-opacity', String(drawing));
      heroSection.style.setProperty('--hero-figure-opacity', String(figure));
      heroSection.style.setProperty('--hero-drawing-interlude', String(interlude));

      // The halls read this to keep their own figures down while the relay
      // still holds the wall. It goes on the root because the sections are
      // nowhere near this component in the tree.
      document.documentElement.style.setProperty(
        '--backdrop-presence',
        String(Math.max(drawing, figure))
      );
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
      // The relay is the landing page's alone. Left behind on a client-side
      // navigation, its last value would hold the other routes' figures down
      // for a page that has no backdrop at all.
      document.documentElement.style.removeProperty('--backdrop-presence');
    };
  });
</script>

<section class="hero" aria-labelledby="hero-title" bind:this={heroSection}>
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
    <!-- The third hand: as the city leaves, one of Jaume's figures takes the
         wall, and leaves in turn before The Lineage. Last in the relay, so it
         is also the last thing worth fetching. -->
    <img
      class="hero__standing-figure"
      fetchpriority="low"
      src="/images/figures/wa.webp"
      srcset="/images/figures/wa-480.webp 480w, /images/figures/wa.webp 700w"
      sizes="(min-width: 760px) 52vh, 62vh"
      alt=""
      loading="lazy"
      decoding="async"
    />
  </figure>
  <div class="hero__content" bind:this={heroContent}>
    <!-- The threshold moved to /lineage with the rest of the heritage. What
         opens the landing page now is the thing the landing page is about: one
         tea. The drawn city stays as weather behind it — it never claimed the
         leaf grew there, and it is the only depth this frame has. -->
    <p class="eyebrow" use:typographyReveal={{ mode: 'sumi' }}>
      The Tea
    </p>
    <h1
      id="hero-title"
      class="hero-title heritage-text"
      use:typographyReveal={{ mode: 'sumi', delay: 0.35 }}
    >
      One field, one harvest, one tea.
    </h1>
    <p class="hero__text hero-subtitle">
      Organic first-flush leaf from the shaded fields of Kagoshima, stone-milled and held to a
      single standard. Whisk it in a bowl or shake it in a bottle — it is the same two grams.
    </p>
    <a class="hero__cue" href="#collection">Scroll to explore</a>
  </div>
</section>

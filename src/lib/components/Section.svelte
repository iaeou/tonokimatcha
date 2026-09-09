<script lang="ts">
  import { typographyReveal } from '$lib/animations/typography-reveal';
  import { figureDrift } from '$lib/animations/figure-drift';
  import { focusScrub } from '$lib/animations/focus-scrub';
  import { getFigure, type FigureId } from '$lib/data/figures';

  interface Props {
    id?: string;
    className?: string;
    eyebrow: string;
    title: string;
    /** Optional drawn figure standing behind the hall's headline. */
    figure?: FigureId;
    children?: import('svelte').Snippet;
  }

  let { id, className = '', eyebrow, title, figure, children }: Props = $props();
  const drawn = $derived(getFigure(figure));
  const sectionId = $derived(
    id ?? eyebrow.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  );
</script>

<section class={`section ${className}`} id={sectionId} aria-labelledby={`${sectionId}-title`}>
  {#if drawn}
    <!-- Decorative: the figure repeats across halls and carries no meaning a
         screen reader would miss, so it stays out of the accessibility tree. -->
    <img
      class="section__figure"
      src={drawn.src}
      srcset={drawn.srcset}
      sizes="(min-width: 760px) 32vw, 46vw"
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      use:figureDrift
    />
  {/if}
  <div class="section__inner">
    <p class="eyebrow" use:typographyReveal={{ mode: 'sumi' }}>
      {eyebrow}
    </p>
    <h2
      id={`${sectionId}-title`}
      use:typographyReveal={{ mode: 'sumi', delay: 0.12, kintsugi: true }}
    >
      {title}
    </h2>
    <div class="section__body" use:focusScrub>
      {#if children}
        {@render children()}
      {/if}
    </div>
  </div>
</section>

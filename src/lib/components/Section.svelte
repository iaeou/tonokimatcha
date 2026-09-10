<script lang="ts">
  import { typographyReveal } from '$lib/animations/typography-reveal';
  import { figureDrift } from '$lib/animations/figure-drift';
  import { figureFilm } from '$lib/animations/figure-film';
  import { focusScrub } from '$lib/animations/focus-scrub';
  import { getFigure, type FigureId } from '$lib/data/figures';

  interface Props {
    id?: string;
    className?: string;
    eyebrow: string;
    title: string;
    /** Optional drawn figure standing behind the hall's headline. */
    figure?: FigureId;
    /**
     * Opt this hall's figure into its filmed version, if one exists.
     *
     * The film is a property of the *hall*, not of the drawing: `oriental`
     * stands in four halls across the site, and filming the drawing rather
     * than the room quietly put two videos on the landing page at once.
     */
    filmed?: boolean;
    /**
     * Optional full-bleed wash behind the hall — a horizon rather than a
     * figure. Rendered edge to edge, under the copy and under the figure.
     */
    backdrop?: import('svelte').Snippet;
    children?: import('svelte').Snippet;
  }

  let {
    id,
    className = '',
    eyebrow,
    title,
    figure,
    filmed = false,
    backdrop,
    children
  }: Props = $props();
  const drawn = $derived(getFigure(figure));
  const film = $derived(filmed ? drawn?.film : undefined);
  const sectionId = $derived(
    id ?? eyebrow.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  );
</script>

<section class={`section ${className}`} id={sectionId} aria-labelledby={`${sectionId}-title`}>
  {#if backdrop}
    <!-- Full-bleed and decorative: it breaks the hall's inline padding to run
         the whole width of the viewport, and carries nothing a screen reader
         would miss. It sits below the figure holder so a hall that somehow
         had both would still read as one drawing in front of another. -->
    <span class="section__backdrop" aria-hidden="true">
      {@render backdrop()}
    </span>
  {/if}
  {#if drawn}
    <!-- The holder exists to carry the backdrop's veto. GSAP owns the image's
         own opacity for the scroll drift, so the two cannot share a property:
         the product of holder × image is what keeps a hall's figure from ever
         standing on top of the one holding the backdrop. -->
    <span class="section__figure-holder" aria-hidden="true">
      <!-- The stage carries the parallax and the fade, so the drawing inside it
           can be a still or a film without either of them owning the motion.
           Decorative throughout: the figure repeats across halls and carries no
           meaning a screen reader would miss. -->
      <span class="section__figure-stage" use:figureDrift>
        <!-- A filmed figure poses with its own first frame: the animated
             source is framed tighter than the scan, and the two are not
             interchangeable without squashing one of them. -->
        {#if film}
          <img class="section__figure" src={film.poster} alt="" loading="lazy" decoding="async" />
          <!-- Fades in over its poster only once it is actually painting. -->
          <canvas class="section__figure-film" use:figureFilm={{ src: film.src }}></canvas>
        {:else}
          <img
            class="section__figure"
            src={drawn.src}
            srcset={drawn.srcset}
            sizes="(min-width: 760px) 32vw, 46vw"
            alt=""
            loading="lazy"
            decoding="async"
          />
        {/if}
      </span>
    </span>
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

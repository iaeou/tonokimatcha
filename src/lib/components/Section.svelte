<script lang="ts">
  import { typographyReveal } from '$lib/animations/typography-reveal';
  import { kanjiDrift } from '$lib/animations/kanji-drift';

  interface Props {
    id?: string;
    className?: string;
    eyebrow: string;
    title: string;
    /** Optional ghost kanji watermark drifting behind the hall's headline. */
    kanji?: string;
    children?: import('svelte').Snippet;
  }

  let { id, className = '', eyebrow, title, kanji, children }: Props = $props();
  const sectionId = $derived(
    id ?? eyebrow.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  );
</script>

<section class={`section ${className}`} id={sectionId} aria-labelledby={`${sectionId}-title`}>
  {#if kanji}
    <span class="section__kanji" aria-hidden="true" use:kanjiDrift>{kanji}</span>
  {/if}
  <div class="section__inner">
    <p class="eyebrow" use:typographyReveal={{ mode: 'breath', restLetterSpacing: '0.18em' }}>
      {eyebrow}
    </p>
    <h2
      id={`${sectionId}-title`}
      use:typographyReveal={{ mode: 'rise', delay: 0.12, kintsugi: true }}
    >
      {title}
    </h2>
    <div class="section__body">
      {#if children}
        {@render children()}
      {/if}
    </div>
  </div>
</section>

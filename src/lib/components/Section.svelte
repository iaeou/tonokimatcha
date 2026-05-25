<script lang="ts">
  import { typographyReveal } from '$lib/animations/typography-reveal';

  interface Props {
    id?: string;
    className?: string;
    eyebrow: string;
    title: string;
    children?: import('svelte').Snippet;
  }

  let { id, className = '', eyebrow, title, children }: Props = $props();
  const sectionId = $derived(
    id ?? eyebrow.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  );
</script>

<section class={`section ${className}`} id={sectionId} aria-labelledby={`${sectionId}-title`}>
  <div class="section__inner">
    <p class="eyebrow" use:typographyReveal={{ mode: 'breath', restLetterSpacing: '0.18em' }}>
      {eyebrow}
    </p>
    <h2
      id={`${sectionId}-title`}
      use:typographyReveal={{ mode: 'rise', delay: 0.12 }}
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

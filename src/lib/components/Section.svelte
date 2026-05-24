<script lang="ts">
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
    <p class="eyebrow">{eyebrow}</p>
    <h2 id={`${sectionId}-title`}>{title}</h2>
    <div class="section__body">
      {#if children}
        {@render children()}
      {/if}
    </div>
  </div>
</section>

<script lang="ts">
  import '$lib/styles/main.css';
  import { page } from '$app/state';
  import SiteLayout from '$lib/components/SiteLayout.svelte';

  let { children } = $props();
</script>

{#if page.route.id?.startsWith('/alts/')}
  {@render children()}
{:else}
  <SiteLayout {children} />
{/if}

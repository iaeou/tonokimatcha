<script lang="ts">
  import VesselDetail from '$lib/components/VesselDetail.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>{data.vessel.name} — Tonoki Matcha</title>
  <meta name="description" content={data.vessel.description} />
</svelte:head>

<section class="section vessel-hall">
  <VesselDetail vessel={data.vessel} />
</section>

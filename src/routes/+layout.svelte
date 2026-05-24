<script lang="ts">
  import '$lib/styles/main.css';
  import Scene from '$lib/three/Scene.svelte';
  import Navigation from '$lib/components/Navigation.svelte';
  import Footer from '$lib/components/Footer.svelte';

  let { children } = $props();
</script>

<Scene />
<Navigation />

<main class="site-shell">
  {@render children()}
  <Footer />
</main>

<script lang="ts">
  import 'lenis/dist/lenis.css';
  import '$lib/styles/main.css';
  import { onMount } from 'svelte';
  import { onNavigate } from '$app/navigation';
  import { initSmoothScroll } from '$lib/animations/smooth-scroll';
  import Scene from '$lib/three/Scene.svelte';
  import Navigation from '$lib/components/Navigation.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import CursorTrail from '$lib/components/CursorTrail.svelte';

  let { children } = $props();

  onMount(() => {
    let cleanup = () => {};
    let disposed = false;

    initSmoothScroll().then((destroy) => {
      if (disposed) {
        destroy();
        return;
      }
      cleanup = destroy;
    });

    return () => {
      disposed = true;
      cleanup();
    };
  });

  // Ceremonial room-to-room transition: a slow cross-fade between routes,
  // like moving into another hall of the museum. Falls back to instant
  // navigation where the View Transitions API is unavailable.
  onNavigate((navigation) => {
    if (!document.startViewTransition) return;

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });
</script>

<Scene />
<CursorTrail />
<Navigation />

<main class="site-shell">
  {@render children()}
  <Footer />
</main>

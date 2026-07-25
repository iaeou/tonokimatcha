<script lang="ts">
  import 'lenis/dist/lenis.css';
  import '$lib/styles/main.css';
  import { onMount } from 'svelte';
  import { onNavigate } from '$app/navigation';
  import { initSmoothScroll } from '$lib/animations/smooth-scroll';
  import {
    getNavigationDirection,
    prefersReducedMotion,
    startTypedViewTransition,
    supportsViewTransitions
  } from '$lib/animations/view-transitions';
  import Scene from '$lib/three/Scene.svelte';
  import Navigation from '$lib/components/Navigation.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import CursorTrail from '$lib/components/CursorTrail.svelte';
  import CursorPointer from '$lib/components/CursorPointer.svelte';

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

  // Ceremonial room-to-room transition. The hall slides in the direction the
  // visitor is travelling while the header, brand and footer stay put — they
  // are named for the duration of the transition, so they morph instead of
  // flickering. Falls back to instant navigation where the API is missing or
  // motion is unwelcome.
  onNavigate((navigation) => {
    if (!supportsViewTransitions() || prefersReducedMotion()) return;

    const direction = getNavigationDirection(
      navigation.from?.url.pathname,
      navigation.to?.url.pathname,
      navigation.type
    );

    return new Promise((resolve) => {
      startTypedViewTransition({
        types: [direction],
        update: async () => {
          resolve();
          await navigation.complete;
        }
      });
    });
  });
</script>

<Scene />
<CursorTrail />
<CursorPointer />
<Navigation />

<main class="site-shell">
  {@render children()}
  <Footer />
</main>

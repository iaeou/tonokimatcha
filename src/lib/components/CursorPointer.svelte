<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import {
    CURSOR_POINTER_TUNING,
    createPointerState,
    shouldEnableCursorPointer,
    stepPointer,
    type MagnetTarget
  } from '$lib/animations/cursor-pointer';

  let dot: HTMLDivElement;
  let ring: HTMLDivElement;

  let enabled = $state(false);

  onMount(() => {
    if (!browser || !shouldEnableCursorPointer()) return;
    enabled = true;
    document.documentElement.classList.add('has-custom-cursor');

    let pointerState = createPointerState();
    let pointerX = -100;
    let pointerY = -100;
    let magnetElement: Element | null = null;
    let hovering = false;
    let pressed = false;
    let visible = false;
    let lastTime = performance.now();
    let frameId = 0;

    const handlePointerMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!visible) {
        // First contact: appear in place instead of gliding in from a corner.
        pointerState = createPointerState(pointerX, pointerY);
        visible = true;
        dot.style.opacity = '1';
        ring.style.opacity = '1';
      }
    };

    const handlePointerOver = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      magnetElement = target.closest(CURSOR_POINTER_TUNING.interactiveSelector);
      hovering = magnetElement !== null;
    };

    const handlePointerDown = () => (pressed = true);
    const handlePointerUp = () => (pressed = false);

    const hide = () => {
      visible = false;
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    };

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Re-read the magnet's rect every frame so Lenis scroll can't leave the
      // pull anchored to a stale position.
      let magnet: MagnetTarget | null = null;
      if (magnetElement?.isConnected) {
        const rect = magnetElement.getBoundingClientRect();
        magnet = { centerX: rect.left + rect.width / 2, centerY: rect.top + rect.height / 2 };
      }

      pointerState = stepPointer(pointerState, pointerX, pointerY, magnet, hovering, pressed, dt);

      dot.style.transform = `translate3d(${pointerState.x}px, ${pointerState.y}px, 0) translate(-50%, -50%) scale(${pointerState.dotScale})`;
      ring.style.transform = `translate3d(${pointerState.ringX}px, ${pointerState.ringY}px, 0) translate(-50%, -50%) scale(${pointerState.ringScale})`;

      frameId = requestAnimationFrame(render);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('pointerover', handlePointerOver, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    document.documentElement.addEventListener('pointerleave', hide);
    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
      document.documentElement.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerover', handlePointerOver);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.documentElement.removeEventListener('pointerleave', hide);
    };
  });
</script>

{#if browser}
  <div
    class="cursor-pointer"
    class:cursor-pointer--active={enabled}
    aria-hidden="true"
  >
    <div class="cursor-pointer__ring" bind:this={ring}></div>
    <div class="cursor-pointer__dot" bind:this={dot}></div>
  </div>
{/if}

<style>
  /*
   * Hide the native cursor everywhere while the ceremonial one is active.
   * The doubled class outranks `:root.is-rotating-magatama * { grabbing }`
   * so no native glyph reappears mid-drag.
   */
  :global(:root.has-custom-cursor.has-custom-cursor),
  :global(:root.has-custom-cursor.has-custom-cursor *) {
    cursor: none !important;
  }

  .cursor-pointer {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 90;
    pointer-events: none;
  }

  .cursor-pointer--active {
    display: block;
  }

  .cursor-pointer__dot,
  .cursor-pointer__ring {
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0;
    border-radius: 50%;
    will-change: transform;
    transition: opacity 320ms ease;
  }

  .cursor-pointer__dot {
    width: 5px;
    height: 5px;
    background: var(--color-gold);
  }

  .cursor-pointer__ring {
    width: 32px;
    height: 32px;
    border: 1px solid color-mix(in srgb, var(--color-gold) 72%, transparent);
  }
</style>

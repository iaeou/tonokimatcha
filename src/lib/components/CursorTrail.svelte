<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import {
    CURSOR_TRAIL_TUNING,
    createTrailPoint,
    shouldEnableCursorTrail,
    stepTrailPoints,
    type TrailPoint
  } from '$lib/animations/cursor-trail';

  let canvas: HTMLCanvasElement;

  onMount(() => {
    if (!browser || !shouldEnableCursorTrail()) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let points: TrailPoint[] = [];
    let lastX = -1e3;
    let lastY = -1e3;
    let lastTime = performance.now();
    let frameId = 0;
    let ink = 'rgba(200, 169, 106, 1)';

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const syncInk = () => {
      // Gold ink in the dark hall, moss ink on paper in the light one.
      const gold = getComputedStyle(document.documentElement).getPropertyValue('--color-gold');
      ink = gold.trim() || ink;
    };

    const themeObserver = new MutationObserver(syncInk);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    const handlePointerMove = (event: PointerEvent) => {
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;

      if (dx * dx + dy * dy < CURSOR_TRAIL_TUNING.minSpawnDistance ** 2) return;
      lastX = event.clientX;
      lastY = event.clientY;

      if (points.length < CURSOR_TRAIL_TUNING.maxPoints) {
        points = [...points, createTrailPoint(event.clientX, event.clientY)];
      }
    };

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      points = stepTrailPoints(points, dt);
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (const point of points) {
        const alpha = CURSOR_TRAIL_TUNING.alpha * point.life * point.life;
        context.globalAlpha = alpha;
        context.fillStyle = ink;
        context.beginPath();
        context.arc(point.x, point.y, point.size * (0.4 + point.life * 0.6), 0, Math.PI * 2);
        context.fill();
      }

      frameId = requestAnimationFrame(render);
    };

    resize();
    syncInk();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
      themeObserver.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  });
</script>

<canvas class="cursor-trail" bind:this={canvas} aria-hidden="true"></canvas>

<style>
  .cursor-trail {
    position: fixed;
    inset: 0;
    z-index: 40;
    pointer-events: none;
  }
</style>

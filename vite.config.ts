import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  build: {
    // Lift the per-chunk size budget. Three.js is intentionally large; we split
    // it into its own async chunk below so it never blocks the initial page
    // shell, but Rollup will still warn at the default 500 kB threshold.
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three';
          if (id.includes('node_modules/gsap')) return 'gsap';
        }
      }
    }
  }
});

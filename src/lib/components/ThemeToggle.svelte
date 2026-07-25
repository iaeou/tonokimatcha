<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { DEFAULT_THEME, theme, type Theme } from '$lib/stores/theme';

  let currentTheme = $state<Theme>(DEFAULT_THEME);

  const unsubscribe = theme.subscribe((value) => {
    currentTheme = value;
  });

  onMount(() => {
    theme.initialize();
  });

  onDestroy(unsubscribe);
</script>

<button
  class="theme-toggle"
  type="button"
  aria-label={currentTheme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
  aria-pressed={currentTheme === 'dark'}
  onclick={(event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    theme.toggle({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  }}
>
  <span class="theme-toggle__icon" aria-hidden="true"></span>
</button>

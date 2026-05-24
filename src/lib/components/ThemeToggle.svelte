<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { theme } from '$lib/stores/theme';

  let currentTheme = $state<'light' | 'dark'>('light');

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
  onclick={() => theme.toggle()}
>
  <span class="theme-toggle__icon" aria-hidden="true"></span>
</button>

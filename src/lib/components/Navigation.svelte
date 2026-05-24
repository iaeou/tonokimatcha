<script lang="ts">
  import ThemeToggle from './ThemeToggle.svelte';
</script>

<header class="navigation">
  <a class="navigation__brand" href="/" aria-label="Tonoki Matcha home">Tonoki Matcha</a>
  <div class="navigation__actions">
    <nav class="navigation__links" aria-label="Primary navigation">
      <a href="/#lineage">Lineage</a>
      <a href="/#collection">Collection</a>
      <a href="/private-club">Private Club</a>
    </nav>
    <ThemeToggle />
  </div>
</header>

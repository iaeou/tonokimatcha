<script lang="ts">
  import ThemeToggle from './ThemeToggle.svelte';
</script>

<header class="navigation">
  <a class="navigation__brand" href="/" aria-label="Tonoki Matcha home">Tonoki Matcha</a>
  <div class="navigation__actions">
    <nav class="navigation__links" aria-label="Primary navigation">
      <a href="/#lineage">Lineage</a>
      <a href="/#collection">The Leaf</a>
      <a href="/#vessels">Vessels</a>
      <a href="/club">Club</a>
      <a href="/legacy">Legacy</a>
    </nav>
    <ThemeToggle />
  </div>
</header>

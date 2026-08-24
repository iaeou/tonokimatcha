<script lang="ts">
  import ThemeToggle from './ThemeToggle.svelte';
</script>

<header class="navigation">
  <a class="navigation__brand" href="/" aria-label="Matcha Tonoki home">
    <span class="navigation__brand-name">
      <span>Matcha</span>
      <span>Tonoki</span>
    </span>
    <img
      class="navigation__brand-mark"
      src="/images/magatama-mark.svg"
      alt=""
      aria-hidden="true"
      width="398"
      height="501"
    />
  </a>
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

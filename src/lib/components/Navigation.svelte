<script lang="ts">
  import ThemeToggle from './ThemeToggle.svelte';
</script>

<header class="navigation">
  <a class="navigation__brand" href="/" aria-label="Matcha Tonoki home">
    <!-- Both variants ship so the theme swap is a CSS display switch on an
         already-decoded image. Fetching the dark file on first toggle would
         blink the mark out mid-reveal. -->
    <img
      class="navigation__brand-logo navigation__brand-logo--light"
      src="/matchaTonoki-logo-nav.svg"
      alt=""
      aria-hidden="true"
      width="568"
      height="208"
    />
    <img
      class="navigation__brand-logo navigation__brand-logo--dark"
      src="/matchaTonoki-logo-nav-dark.svg"
      alt=""
      aria-hidden="true"
      width="568"
      height="208"
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

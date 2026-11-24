<script lang="ts">
  import { page } from '$app/state';

  let { children } = $props();
  const links = [
    { label: 'The Leaf', href: '/#collection' },
    { label: 'How to Use', href: '/#ceremony' },
    { label: 'Vessels', href: '/#vessels' },
    { label: 'Lineage', href: '/lineage' },
    { label: 'Request', href: '/request' }
  ];
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
  {#if page.route.id === '/alts/alt2'}
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@700;800&display=swap" />
  {/if}
</svelte:head>

<div class={['alternative', { storybook: page.route.id === '/alts/alt1' }]}>
  <header>
    <a class="brand" href="/" aria-label="Matcha Tonoki home">
      <img src="/matchaTonoki-logo-nav.svg" alt="" width="134" height="44" />
      <img src="/matchaTonoki-kanji.svg" alt="" width="27" height="44" />
    </a>
    <nav aria-label="Main navigation">
      {#each links as { href, label } (href)}
        <a {href} class={{ request: href === '/request' }}>{label}</a>
      {/each}
    </nav>
  </header>
  <main>
    {@render children()}
  </main>
</div>

<style>
  .alternative {
    --alt-gutter: clamp(1.25rem, 5.2vw, 5rem);
    --alt-leaf: #22511d;
    --alt-paper: #f0e7d4;
    min-height: 100svh;
    color: #14150f;
    background: #fff;
    color-scheme: light;
    font: 1rem/1.5 Inter, system-ui, sans-serif;
  }

  .alternative :global(:focus-visible) {
    outline: 2px solid var(--alt-leaf);
    outline-offset: 4px;
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.45rem var(--alt-gutter);
  }

  .storybook header {
    background: linear-gradient(90deg, var(--alt-paper) 43%, #f9f6ef 43%);
  }

  .brand {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    gap: 0.35rem;
  }

  .brand img {
    display: block;
    object-fit: contain;
  }

  .brand img:first-child {
    width: clamp(6.7rem, 9.5vw, 8rem);
  }

  .brand img:last-child {
    width: clamp(1.25rem, 1.8vw, 1.65rem);
  }

  nav {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    column-gap: clamp(0.7rem, 2.8vw, 2.6rem);
    row-gap: 0.1rem;
  }

  nav a {
    display: inline-flex;
    align-items: center;
    min-height: 2.75rem;
    font-size: clamp(0.84rem, 1.16vw, 1.08rem);
    font-weight: 500;
    white-space: nowrap;
  }

  nav a:hover {
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }

  .storybook .request {
    min-height: 2.35rem;
    align-self: center;
    padding-inline: 1.15rem;
    border: 1px solid var(--alt-leaf);
    color: var(--alt-leaf);
  }

  @media (max-width: 39rem) {
    header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.18rem;
      padding-block: 0.5rem 0.22rem;
    }

    .storybook header {
      background: var(--alt-paper);
    }

    nav {
      width: 100%;
      justify-content: space-between;
      column-gap: 0.3rem;
    }

    nav a {
      font-size: clamp(0.73rem, 3vw, 0.87rem);
    }

    .storybook .request {
      padding-inline: 0.45rem;
    }
  }
</style>

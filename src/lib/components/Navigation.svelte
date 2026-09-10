<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import { pauseSmoothScroll, resumeSmoothScroll } from '$lib/animations/smooth-scroll';
  import ThemeToggle from './ThemeToggle.svelte';

  // The nav follows the page while the page lasts — leaf, use, shelf — and then
  // leaves it: the grower, the heritage and the order desk are rooms of their
  // own now. On a phone the same six live behind a shoji: the three that move
  // within the landing page under The Tea, the three rooms under The House.
  const groups = [
    {
      label: 'The Tea',
      links: [
        { href: '/#collection', label: 'The Leaf' },
        { href: '/#ceremony', label: 'How To Use' },
        { href: '/#vessels', label: 'Vessels' }
      ]
    },
    {
      label: 'The House',
      links: [
        { href: '/grower', label: 'Grower' },
        { href: '/lineage', label: 'Lineage' },
        { href: '/request', label: 'Request' }
      ]
    }
  ];

  const DESKTOP_QUERY = '(min-width: 760px)';

  let open = $state(false);
  let trigger = $state<HTMLButtonElement | null>(null);
  let panel = $state<HTMLElement | null>(null);

  function close() {
    open = false;
  }

  // The door is a phone affordance only. Widening past the breakpoint hands the
  // six links back to the header row, so a panel left open would hang over a
  // nav that already shows everything it holds.
  onMount(() => {
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) close();
    };
    desktop.addEventListener('change', handleChange);
    return () => desktop.removeEventListener('change', handleChange);
  });

  // Back and forward land in a new room; the door should not still be standing
  // open in front of it. Each link closes the door itself (below), so this is
  // the history case.
  afterNavigate(() => close());

  // Lenis is paused *and* the document is locked: with `syncTouch` off, native
  // touch scrolling would carry the hall along behind the panel on the very
  // devices this menu exists for.
  $effect(() => {
    const root = document.documentElement;
    if (open) {
      root.classList.add('is-menu-open');
      pauseSmoothScroll();
    } else {
      root.classList.remove('is-menu-open');
      resumeSmoothScroll();
    }
  });

  // Focus follows the door: into the panel when it slides open, back to the
  // button when it shuts, so the keyboard never lands on a link behind a closed
  // screen.
  $effect(() => {
    if (open) {
      panel?.querySelector<HTMLAnchorElement>('a')?.focus();
    }
  });

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && open) {
      close();
      trigger?.focus();
    }
  }

  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('is-menu-open');
    }
  });
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- The shoji sits below the header in the stack, so the brand, the theme
     circle and the door handle stay lit while the screen slides across. -->
<div
  id="nav-shoji"
  class="nav-shoji"
  class:nav-shoji--open={open}
  bind:this={panel}
  inert={!open}
  aria-hidden={!open}
>
  <nav class="nav-shoji__inner" aria-label="Mobile navigation">
    {#each groups as group, groupIndex (group.label)}
      <section class="nav-shoji__group">
        <p class="eyebrow nav-shoji__label" style="--i: {groupIndex * 4}">{group.label}</p>
        <ul class="nav-shoji__list">
          {#each group.links as link, linkIndex (link.href)}
            <li class="nav-shoji__item" style="--i: {groupIndex * 4 + linkIndex + 1}">
              <a class="nav-shoji__link" href={link.href} onclick={close}>{link.label}</a>
            </li>
          {/each}
        </ul>
      </section>
    {/each}
  </nav>
</div>

<header class="navigation">
  <a class="navigation__brand" href="/" aria-label="Matcha Tonoki home">
    <!-- Both variants of each mark ship so the theme swap is a CSS display
         switch on an already-decoded image. Fetching the dark file on first
         toggle would blink the brand out mid-reveal. -->
    <img
      class="navigation__brand-logo navigation__brand--light"
      src="/matchaTonoki-logo-nav.svg"
      alt=""
      aria-hidden="true"
      width="568"
      height="208"
    />
    <img
      class="navigation__brand-logo navigation__brand--dark"
      src="/matchaTonoki-logo-nav-dark.svg"
      alt=""
      aria-hidden="true"
      width="568"
      height="208"
    />
    <img
      class="navigation__brand-kanji navigation__brand--light"
      src="/matchaTonoki-kanji.svg"
      alt=""
      aria-hidden="true"
      width="178"
      height="317"
    />
    <img
      class="navigation__brand-kanji navigation__brand--dark"
      src="/matchaTonoki-kanji-dark.svg"
      alt=""
      aria-hidden="true"
      width="178"
      height="317"
    />
  </a>
  <div class="navigation__actions">
    <nav class="navigation__links" aria-label="Primary navigation">
      <a href="/#collection">The Leaf</a>
      <a href="/#ceremony">How To Use</a>
      <a href="/#vessels">Vessels</a>
      <a href="/grower">Grower</a>
      <a href="/lineage">Lineage</a>
      <a href="/request">Request</a>
    </nav>
    <ThemeToggle />
    <!-- Two strokes, not three: the handle is the same drawn hand as the
         lockup, and it folds into a cross while the door stands open. -->
    <button
      class="nav-handle"
      class:nav-handle--open={open}
      type="button"
      bind:this={trigger}
      aria-expanded={open}
      aria-controls="nav-shoji"
      aria-label={open ? 'Close menu' : 'Open menu'}
      onclick={() => (open = !open)}
    >
      <span class="nav-handle__stroke" aria-hidden="true"></span>
      <span class="nav-handle__stroke" aria-hidden="true"></span>
    </button>
  </div>
</header>

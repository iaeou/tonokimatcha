<script lang="ts">
  import { tick } from 'svelte';
  import { pushState } from '$app/navigation';
  import { page } from '$app/state';
  import Ceremony from '$lib/components/Ceremony.svelte';
  import Hero from '$lib/components/Hero.svelte';
  import Section from '$lib/components/Section.svelte';
  import VesselDetail from '$lib/components/VesselDetail.svelte';
  import { startTypedViewTransition } from '$lib/animations/view-transitions';
  import { vessels, type Vessel } from '$lib/data/vessels';

  const leaf = {
    name: 'Premium Ceremonial Organic Matcha',
    degree: 'Single Degree',
    description:
      'One tea only, and it is the top of the tree: organic ichibancha, the first flush, picked once a year and never cut with a later harvest. There is no second tier beneath it because we do not sell one.',
    origin:
      'It comes from one grower — Kagoshima Horiguchi Seicha, in Shibushi at the southern end of Japan, where the season opens weeks before the rest of the country and the fields are worked without pesticides.',
    marks: [
      { label: 'Grower', value: 'Kagoshima Horiguchi Seicha' },
      { label: 'Harvest', value: 'Ichibancha — first flush, once a year' },
      { label: 'Cultivation', value: 'Organic, shade-grown, IPM' },
      { label: 'Milling', value: 'Granite stone, 30 g per hour' },
      { label: 'Certificate', value: 'TKC-0001' }
    ]
  };

  /**
   * Why the first flush is the expensive one. Sunlight turns theanine — the
   * amino acid behind matcha's sweetness and its calm — into catechins, which
   * are what taste bitter. A tea bush spends the winter dormant, storing
   * theanine; the first cut takes that stored sweetness away with it, and every
   * later cut grows under a stronger sun on a plant that has less left to give.
   */
  const harvests = [
    {
      name: 'Ichibancha',
      when: 'First flush · late April',
      note: 'The winter’s store, cut once. Highest in theanine, lowest in bitterness. This is the only harvest we buy.',
      ours: true
    },
    {
      name: 'Nibancha',
      when: 'Second flush · June',
      note: 'The regrowth, under a stronger sun. More catechin, less theanine — brisker, sharper, and cheaper.',
      ours: false
    },
    {
      name: 'Sanbancha',
      when: 'Third flush · July',
      note: 'Thinner again. Usually bound for blends, bottled tea and everyday grades.',
      ours: false
    },
    {
      name: 'Bancha',
      when: 'Late leaf and stem',
      note: 'What is left when the season is spent. An honest daily tea — but not a ceremonial one.',
      ours: false
    }
  ];

  const openVessel = $derived(page.state.vessel);

  /**
   * Opening a vessel is a change of state, not of place: the card's image
   * morphs into the detail panel while the landing page stays underneath.
   * The URL still changes, so the vessel remains linkable and the browser's
   * back gesture closes it. Without JavaScript the same link simply loads
   * `/vessels/<slug>` as its own hall.
   */
  /**
   * Where the visitor was standing when the vessel was opened. Smooth scrolling
   * runs the page from its own loop, so the browser's restoration on the way
   * back lands at the top instead of the grid — the shelf is put back by hand.
   */
  let scrollBeforeOpen = 0;

  function open(event: MouseEvent, vessel: Vessel) {
    // Let modified clicks (new tab, download, middle button) behave natively.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }

    event.preventDefault();
    scrollBeforeOpen = window.scrollY;

    startTypedViewTransition({
      types: ['vessel'],
      // The vessel is already in hand — no need to fetch the hall's data.
      update: () => pushState(`/vessels/${vessel.slug}`, { vessel })
    });
  }

  /** Resolves once the history entry has actually been popped. */
  function stepBack() {
    return new Promise<void>((resolve) => {
      window.addEventListener('popstate', () => resolve(), { once: true });
      history.back();
    });
  }

  function close() {
    const target = scrollBeforeOpen;
    scrollBeforeOpen = 0;

    startTypedViewTransition({
      types: ['vessel'],
      update: async () => {
        await stepBack();
        // Inside the callback, so the incoming snapshot already has the grid
        // back under the panel. Restore it afterwards and the photograph would
        // morph towards a card that is not on screen yet — which is exactly
        // what made closing feel like a cut.
        if (target) window.scrollTo({ top: target, behavior: 'instant' });
        await tick();
      }
    });
  }

  // The browser's own back gesture closes the vessel without passing through
  // close(), so the reading position is put back here instead.
  $effect(() => {
    if (openVessel || !scrollBeforeOpen) return;

    const target = scrollBeforeOpen;
    scrollBeforeOpen = 0;
    requestAnimationFrame(() => window.scrollTo({ top: target, behavior: 'instant' }));
  });
</script>

<Hero />

<!--
  The three sections a first-time visitor needs, in the order they need them:
  what the tea is, how you make it, and how it is sold. The heritage follows
  afterwards — it is why the house exists, not why anyone would buy the tea.
-->
<Section id="collection" eyebrow="The Leaf" title="A Single Degree" figure="oriental">
  <article class="leaf-panel">
    <p class="leaf-panel__type">{leaf.degree}</p>
    <h3>{leaf.name}</h3>
    <p class="leaf-panel__lede">{leaf.description}</p>
    <p class="leaf-panel__origin">
      {leaf.origin}
      <a class="text-link leaf-panel__link" href="/grower">Meet the grower</a>
    </p>
    <dl class="certificate">
      {#each leaf.marks as mark}
        <div>
          <dt>{mark.label}</dt>
          <dd>{mark.value}</dd>
        </div>
      {/each}
    </dl>
  </article>

  <div class="harvests">
    <h4 class="harvests__title">Why the first flush</h4>
    <p class="harvests__lede">
      Sunlight turns theanine — the amino acid behind matcha's sweetness and its steady calm — into
      the catechins that taste bitter. A bush spends the winter dormant, storing theanine up. The
      first cut takes that store away with it; every later cut grows under a stronger sun on a plant
      with less left to give.
    </p>
    <ol class="harvests__list">
      {#each harvests as harvest}
        <li class="harvest" class:harvest--ours={harvest.ours}>
          <p class="harvest__when">{harvest.when}</p>
          <h5>
            {harvest.name}
            {#if harvest.ours}<span class="harvest__flag">Ours</span>{/if}
          </h5>
          <p class="harvest__note">{harvest.note}</p>
        </li>
      {/each}
    </ol>
  </div>
</Section>

<!-- className widens only this hall's body: three columns inside the 42rem
     reading measure are 200px each, which is a column of one word. -->
<!-- Not `wa`: that is the figure holding the backdrop across this stretch, and
     the same drawing twice on one screen reads as a mistake. -->
<Section id="ceremony" className="ways-section" eyebrow="How To Use" title="Three Ways" figure="samurai">
  <p class="vessels-lede">
    Good matcha has a reputation for being fussy. It is not: two grams, water, and fifteen seconds
    of shaking will do it. The long way is here too, for when the long way is the point.
  </p>
  <Ceremony />
</Section>

<Section id="vessels" eyebrow="The Vessels" title="Three Presentations" figure="oriental">
  <p class="vessels-lede">
    The tea does not change. Only the vessel that carries it to the bowl.
  </p>
  <div class="collection-grid">
    {#each vessels as vessel}
      <!-- The whole card is the target, but only the action line is focusable:
           its ::after is stretched across the card, so there is one link, one
           focus ring, and a real URL in the context menu. -->
      <article class="vessel-card" data-vessel={vessel.slug}>
        <figure class="vessel-card__media">
          <img src={vessel.image} alt={vessel.alt} loading="lazy" decoding="async" />
        </figure>
        <p class="vessel-card__type"><span aria-hidden="true">{vessel.key}</span> {vessel.format}</p>
        <h3>{vessel.name}</h3>
        <p>{vessel.description}</p>
        {#if vessel.note}
          <p class="vessel-card__note">{vessel.note}</p>
        {/if}
        <a
          class="text-link vessel-card__open"
          href={`/vessels/${vessel.slug}`}
          onclick={(event) => open(event, vessel)}
        >
          Open the vessel
          <span class="vessel-card__open-mark" aria-hidden="true">→</span>
          <span class="visually-hidden">: {vessel.name}</span>
        </a>
      </article>
    {/each}
  </div>
</Section>

{#if openVessel}
  <!-- The opened vessel sits over the hall it came from. Escape and the
       browser's back gesture both close it, since the state is a history entry. -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div
    class="vessel-overlay"
    role="dialog"
    aria-modal="true"
    aria-label={openVessel.name}
    tabindex="-1"
    onclick={(event) => {
      // Only the ground around the vessel closes it — clicks that landed on
      // the panel itself belong to the panel. The keyboard has Escape and the
      // photograph is a real button, so no keyboard handler is missing here.
      if (event.target === event.currentTarget) close();
    }}
  >
    <VesselDetail vessel={openVessel} onclose={close} />
  </div>
{/if}

<svelte:window
  onkeydown={(event) => {
    if (event.key === 'Escape' && openVessel) close();
  }}
/>

<Section
  id="lineage"
  className="heritage-section"
  eyebrow="The Lineage"
  title="The Dignified Tree"
  figure="samurai"
>
  <div class="narrative-grid">
    <p>
      Tonoki begins with the idea of an upright tree: a dignified witness whose roots remain
      below speech and whose canopy carries memory forward.
    </p>
    <p>
      The sanctuary frames the Tonoki-no-muraji lineage beside Haniwa silhouettes, Sueki
      ceramics, and the immense quiet of the Daisenryo Kofun. The name is Osaka's; the field is
      Kagoshima's.
    </p>
    <p>
      This is arranged like a small museum: documented provenance, room around each object. But
      the tea is meant to be drunk, not admired — we would rather you served it than shelved it.
    </p>
  </div>
</Section>

<Section id="guardian" eyebrow="The Guardian" title="By Request" figure="wa">
  <div class="guardian-panel">
    <p>
      Tearooms, restaurants and shops order Tonoki in their own quantities and their own
      packaging. Tell us what you need and who it is for, and we will tell you honestly whether we
      can make it.
    </p>
    <a class="text-link" href="/club">Start a request</a>
  </div>
</Section>

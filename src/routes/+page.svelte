<script lang="ts">
  import { pushState } from '$app/navigation';
  import { page } from '$app/state';
  import Ceremony from '$lib/components/Ceremony.svelte';
  import Hero from '$lib/components/Hero.svelte';
  import Section from '$lib/components/Section.svelte';
  import VesselDetail from '$lib/components/VesselDetail.svelte';
  import { startTypedViewTransition } from '$lib/animations/view-transitions';
  import { vessels, type Vessel } from '$lib/data/vessels';

  const leaf = {
    name: 'Tonoki Ceremonial',
    degree: 'Single Degree',
    description:
      'One tea only. First-harvest leaf, shade-grown and stone-milled, held to a single uncompromised standard. There is no second tier beneath it.',
    marks: [
      { label: 'Harvest', value: 'First flush, hand-picked' },
      { label: 'Milling', value: 'Granite stone, 30g per hour' },
      { label: 'Certificate', value: 'TKC-0001' }
    ]
  };

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

  $effect(() => {
    if (openVessel || !scrollBeforeOpen) return;

    const target = scrollBeforeOpen;
    scrollBeforeOpen = 0;
    // After the transition has committed, so the restored position is not
    // captured as part of the outgoing snapshot.
    requestAnimationFrame(() => window.scrollTo({ top: target, behavior: 'instant' }));
  });

  function close() {
    startTypedViewTransition({
      types: ['vessel'],
      update: () => history.back()
    });
  }
</script>

<Hero />

<Section id="lineage" className="heritage-section" eyebrow="The Lineage" title="The Dignified Tree" kanji="樹">
  <div class="narrative-grid">
    <p>
      Tonoki begins with the idea of an upright tree: a dignified witness whose roots remain
      below speech and whose canopy carries memory forward.
    </p>
    <p>
      The sanctuary frames the Tonoki-no-muraji lineage beside Haniwa silhouettes, Sueki
      ceramics, and the immense quiet of the Daisenryo Kofun.
    </p>
    <p>
      Nothing here behaves like a store. The experience is arranged as a private museum: slow
      admission, documented provenance, and ceremonial restraint.
    </p>
  </div>
</Section>

<Section id="collection" eyebrow="The Leaf" title="A Single Degree" kanji="玉">
  <article class="leaf-panel">
    <p class="leaf-panel__type">{leaf.degree}</p>
    <h3>{leaf.name}</h3>
    <p class="leaf-panel__lede">{leaf.description}</p>
    <dl class="certificate">
      {#each leaf.marks as mark}
        <div>
          <dt>{mark.label}</dt>
          <dd>{mark.value}</dd>
        </div>
      {/each}
    </dl>
  </article>
</Section>

<Section id="vessels" eyebrow="The Vessels" title="Three Presentations" kanji="器">
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

<Section id="ceremony" eyebrow="The Ceremony" title="Four Movements" kanji="点">
  <p class="vessels-lede">
    The same two grams, handled in the same order, every time. The order is the recipe.
  </p>
  <Ceremony />
</Section>

<Section id="guardian" eyebrow="The Guardian" title="Custom Request" kanji="陵">
  <div class="guardian-panel">
    <p>
      Admission requests are reviewed for cultural fit, storage discipline, and the seriousness of
      the service context.
    </p>
    <a class="text-link" href="/club">Begin sponsorship request</a>
  </div>
</Section>

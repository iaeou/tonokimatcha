<script lang="ts">
  import Hero from '$lib/components/Hero.svelte';
  import Section from '$lib/components/Section.svelte';

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

  const vessels = [
    {
      key: 'A',
      name: 'The Single Serving',
      format: '2 g sachet',
      description:
        'One bowl, sealed at the mill. Individual foil sachet that protects the leaf from light and air until the moment of service.',
      image: '/images/packaging/sachet-2g.webp',
      alt: 'Individual 2 gram matcha sachets'
    },
    {
      key: 'B',
      name: 'The Vessel',
      format: '25 sachets · refined paper tube',
      description:
        'Twenty-five single servings held in a seamless paper tube. The travelling form: a month of ceremony, carried without ceremony.',
      image: '/images/packaging/tube-25.webp',
      alt: 'Refined paper tube containing twenty-five matcha sachets'
    },
    {
      key: 'C',
      name: 'The Reserve',
      format: '30 g hermetic pouch',
      description:
        'The house format for those who measure their own bowl. Hermetically sealed, resealable, sized for daily practice.',
      image: '/images/packaging/pouch-30g.webp',
      alt: 'Hermetic 30 gram matcha pouch'
    }
  ];
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
      <article class="vessel-card">
        <figure class="vessel-card__media">
          <img src={vessel.image} alt={vessel.alt} loading="lazy" decoding="async" />
        </figure>
        <p class="vessel-card__type"><span aria-hidden="true">{vessel.key}</span> {vessel.format}</p>
        <h3>{vessel.name}</h3>
        <p>{vessel.description}</p>
      </article>
    {/each}
  </div>
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

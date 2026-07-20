<script lang="ts">
  import Hero from '$lib/components/Hero.svelte';
  import Section from '$lib/components/Section.svelte';

  const collection = [
    {
      name: 'Kofun Imperial',
      degree: 'Koicha',
      description: 'Hand-harvested, stone-milled, numbered editions reserved for solemn service.',
      certificate: 'TKI-1500',
      milling: 'Milled within 21 days of admission'
    },
    {
      name: 'Hisui Ceremonial',
      degree: 'Usucha',
      description: 'The gold standard of jade liquid: vivid, quiet, and exacting in texture.',
      certificate: 'THC-0001',
      milling: 'Monthly micro-lot release'
    },
    {
      name: 'Sakai Premium',
      degree: 'Heritage Usucha',
      description: 'An homage to Sakai, the commercial heart of tea and the memory of Sen no Rikyu.',
      certificate: 'TSP-SAKAI',
      milling: 'Partner allocation only'
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

<Section id="collection" eyebrow="The Collection" title="Product Degrees" kanji="玉">
  <div class="collection-grid">
    {#each collection as item}
      <article class="degree-card">
        <p class="degree-card__type">{item.degree}</p>
        <h3>{item.name}</h3>
        <p>{item.description}</p>
        <dl class="certificate">
          <div>
            <dt>Certificate</dt>
            <dd>{item.certificate}</dd>
          </div>
          <div>
            <dt>Milling</dt>
            <dd>{item.milling}</dd>
          </div>
        </dl>
      </article>
    {/each}
  </div>
</Section>

<Section id="guardian" eyebrow="The Guardian" title="Private Admission" kanji="陵">
  <div class="guardian-panel">
    <p>
      Admission requests are reviewed for cultural fit, storage discipline, and the seriousness of
      the service context.
    </p>
    <a class="text-link" href="/club">Begin sponsorship request</a>
  </div>
</Section>

<script lang="ts">
  import Section from '$lib/components/Section.svelte';
  import { backdropParallax } from '$lib/animations/backdrop-parallax';
</script>

<svelte:head>
  <title>The Lineage — Matcha Tonoki</title>
  <meta
    name="description"
    content="Where the name comes from: the Tonoki-no-muraji lineage of Osaka, the Daisenryo Kofun, and the upright tree the house is named for. The name is Osaka's; the field is Kagoshima's."
  />
</svelte:head>

<!-- The threshold used to be the landing page's opening breath and the lineage
     a hall halfway down it. Neither sold the tea, and split across a scroll
     neither could finish its sentence. They are one room now, and the landing
     page is free to be about the tea. -->
<Section
  id="threshold"
  className="heritage-section"
  eyebrow="The Threshold"
  title="Before history was written, we were here."
  figure="wa"
>
  <div class="narrative-grid">
    <p>
      The name is older than the record that would have kept it. Tonoki belongs to Osaka — to the
      plain around Sakai, to the keyhole mounds raised there before anyone wrote down why, and to a
      family who stood beside them.
    </p>
    <p>
      Nothing of that is in the bowl. It is in the reason a house that could have been called
      anything is called this.
    </p>
  </div>
</Section>

<!-- Osaka, drawn — the same ink the landing page's threshold used to carry.
     It stood framed in the hall above, where it was a picture to be looked at;
     it is a wall here instead. Full width, a few percent of ink, drifting
     against the scroll behind the tree the house is named for.

     The samurai came off this hall when the city went up: one drawing at a
     time is the rule everywhere else on the site, and two watermarks over the
     same copy read as a smudge rather than as depth. -->
<Section id="lineage" eyebrow="The Lineage" title="The Dignified Tree">
  {#snippet backdrop()}
    <img
      class="lineage-skyline"
      src="/images/osaka-skyline-1600.webp"
      srcset="
        /images/osaka-skyline-768.webp   768w,
        /images/osaka-skyline-1200.webp 1200w,
        /images/osaka-skyline-1600.webp 1600w
      "
      sizes="100vw"
      alt=""
      loading="lazy"
      decoding="async"
      use:backdropParallax
    />
  {/snippet}

  <div class="narrative-grid">
    <p>
      Tonoki begins with the idea of an upright tree: a dignified witness whose roots remain below
      speech and whose canopy carries memory forward.
    </p>
    <p>
      The sanctuary frames the Tonoki-no-muraji lineage beside Haniwa silhouettes, Sueki ceramics,
      and the immense quiet of the Daisenryo Kofun. The name is Osaka's; the field is Kagoshima's —
      the leaf has never grown here, and we have never said it did.
    </p>
    <p>
      This is arranged like a small museum: documented provenance, room around each object. But the
      tea is meant to be drunk, not admired — we would rather you served it than shelved it.
    </p>
    <p>
      <a class="text-link" href="/grower">Meet the grower</a>
    </p>
  </div>
</Section>

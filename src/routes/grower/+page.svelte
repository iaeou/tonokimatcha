<script lang="ts">
  import Section from '$lib/components/Section.svelte';

  // Every figure here is Horiguchi Seicha's own, taken from their corporate
  // site (linked at the foot of this hall). Nothing is estimated, and nothing
  // about Matcha Tonoki's own handling belongs on this page — this hall is
  // about the field, not about us.
  const field = [
    { label: 'Grower', value: 'Kagoshima Horiguchi Seicha' },
    { label: 'Place', value: 'Shibushi, Ōsumi peninsula, Kagoshima' },
    { label: 'Under management', value: '≈300 ha — 120 owned, 180 affiliated' },
    { label: 'Cultivation', value: 'IPM — water, wind and rice bran in place of pesticides' },
    { label: 'Tencha mill', value: '“T-Pole”, dedicated to the leaf that becomes matcha' },
    { label: 'Food safety', value: 'FSSC 22000 across the tencha and finishing factories' }
  ];
</script>

<svelte:head>
  <title>The Grower — Matcha Tonoki</title>
  <meta
    name="description"
    content="Matcha Tonoki comes from one grower: Kagoshima Horiguchi Seicha, in Shibushi on the Ōsumi peninsula, where roughly 300 hectares are farmed without pesticides under an IPM regime."
  />
</svelte:head>

<Section
  id="field"
  className="heritage-section"
  eyebrow="The Grower"
  title="Kagoshima Horiguchi Seicha"
  kanji="農"
>
  <div class="narrative-grid">
    <p>
      One tea means one grower. Matcha Tonoki does not blend across farms or seasons, so the whole
      of what we sell rests on a single field in Shibushi, on the Ōsumi peninsula at the southern
      end of Kyūshū.
    </p>
    <p>
      Kagoshima sits far enough south that its season opens weeks before the rest of Japan. Warmth
      arrives early, the ground is gently rolling rather than terraced, and water is abundant — the
      farm runs one of the country's highest rates of sprinkler frost protection, because a single
      cold night in April can take the first flush away entirely.
    </p>
    <p>
      Horiguchi has been growing tea on this peninsula for around seventy-five years, beginning
      after the war with black tea. Today they manage roughly three hundred hectares: a hundred and
      twenty of their own and a hundred and eighty belonging to affiliated farmers they have grown
      alongside for decades.
    </p>
  </div>
</Section>

<Section id="method" eyebrow="The Method" title="Machines Instead of Poison" kanji="虫">
  <div class="narrative-grid">
    <p>
      The house belief is that good tea comes from a healthy environment, and they have farmed that
      way since long before it was fashionable. Rather than spraying, they built machines: one that
      blows pests off the leaf with water and wind, another that suppresses them with water and rice
      bran. The farm calls them the Tea Rangers, which is more charming than the results are —
      integrated pest management is slow, mechanical, and unglamorous work.
    </p>
    <p>
      Field sensors on a 5G network now read the rows continuously, so harvest timing, pests and
      frost are judged from measurements rather than from a walk through the field. The point is not
      novelty. It is that a farm which does not reach for pesticides needs to see trouble earlier
      than one that does.
    </p>
  </div>

  <article class="legacy-seal">
    <p class="legacy-seal__standard">The Field</p>
    <dl class="certificate">
      {#each field as mark}
        <div>
          <dt>{mark.label}</dt>
          <dd>{mark.value}</dd>
        </div>
      {/each}
    </dl>
  </article>
</Section>

<Section id="mill" eyebrow="The Mill" title="Tencha Before Matcha" kanji="碾">
  <div class="narrative-grid">
    <p>
      Matcha is not a kind of leaf; it is a kind of handling. Shaded leaf is steamed and dried
      without rolling, and what comes out is tencha — flat, brittle, still recognisably a leaf. Only
      after the stems and veins are cut away does the stone take it.
    </p>
    <p>
      Horiguchi built a mill for that step alone, and the tencha and finishing factories are
      certified to FSSC 22000. This is the same standard named on our own record, and it is worth
      saying plainly which is which: theirs covers how the leaf is made, ours covers how it is
      milled, sealed and kept.
    </p>
    <p>
      From there the leaf becomes ours: stone-milled at thirty grams an hour, sealed, and sent out
      under a single degree. Nothing is added and nothing is blended in.
    </p>
  </div>

  <div class="guardian-panel">
    <a
      class="text-link"
      href="https://horiguchi-tea.sakura.ne.jp/en/"
      target="_blank"
      rel="noopener noreferrer"
    >
      Visit Kagoshima Horiguchi Seicha
      <span aria-hidden="true">↗</span>
      <span class="visually-hidden">(opens in a new tab)</span>
    </a>
    <a class="text-link" href="/#collection">Back to the leaf</a>
  </div>
</Section>

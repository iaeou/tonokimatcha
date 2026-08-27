<script lang="ts">
  import Section from '$lib/components/Section.svelte';

  // Placeholder copy in the house register. The scarcity figures and the
  // privacy wording are Jaume's to confirm — nothing here should be treated as
  // a legal text until a lawyer has read it.
  const certification = {
    standard: 'FSSC 22000',
    marks: [
      { label: 'Scheme', value: 'FSSC 22000 v6, food safety system certification' },
      { label: 'Scope', value: 'Milling, sealing, and cold storage of ceremonial matcha' },
      { label: 'Audit', value: 'Annual, unannounced surveillance audit' },
      { label: 'Certificate', value: 'TKC-0001 — issued against the single degree' }
    ]
  };
</script>

<svelte:head>
  <title>Eternal Legacy — Matcha Tonoki</title>
  <meta
    name="description"
    content="Scarcity policy, food safety certification, and the handling of admission requests at Matcha Tonoki."
  />
</svelte:head>

<Section
  id="scarcity"
  className="heritage-section"
  eyebrow="Eternal Legacy"
  title="Scarcity Policy"
  kanji="陵"
>
  <div class="narrative-grid">
    <p>
      A granite mill turns thirty grams an hour. That figure is not a constraint to be engineered
      away; it is the reason the tea tastes as it does. Production is bounded by the stone, not by
      demand.
    </p>
    <p>
      Allocation follows the harvest, not the calendar. When a season yields less, less is offered,
      and no substitute leaf is admitted to carry the name. Waiting is the ordinary condition of
      the house.
    </p>
    <p>
      Sachets are released loose from one hundred; below that threshold the leaf travels inside the
      tube. Institutional allocations are reviewed one by one, and an unfilled request is not a
      refusal — only a season that did not stretch far enough.
    </p>
  </div>
</Section>

<Section id="certification" eyebrow="The Record" title="Certification" kanji="証">
  <div class="narrative-grid">
    <p>
      Ceremony without documentation is theatre. Every lot leaves the mill with a certificate that
      names its harvest, its milling window, and the hands that sealed it.
    </p>
  </div>

  <article class="legacy-seal">
    <p class="legacy-seal__standard">{certification.standard}</p>
    <dl class="certificate">
      {#each certification.marks as mark}
        <div>
          <dt>{mark.label}</dt>
          <dd>{mark.value}</dd>
        </div>
      {/each}
    </dl>
  </article>
</Section>

<Section id="privacy" eyebrow="The Guardian" title="Privacy" kanji="守">
  <div class="narrative-grid">
    <p>
      An admission request carries three things: a name, an institution, and the ceremony you
      intend. They are read by a guardian and kept to review the request. Nothing is sold, and
      nothing is passed to a third party for advertising.
    </p>
    <p>
      Write to the house to ask what is held about you, to correct it, or to have it removed. A
      withdrawn request leaves no residue beyond what law requires the house to keep.
    </p>
    <p class="legacy-note">
      Provisional text, pending legal review. The final policy must name the data controller, the
      retention period, and the supervisory authority before the site is published.
    </p>
  </div>

  <div class="guardian-panel">
    <a class="text-link" href="/club">Start a request</a>
  </div>
</Section>

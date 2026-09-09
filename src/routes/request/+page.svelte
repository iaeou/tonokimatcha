<script lang="ts">
  import MembershipForm from '$lib/components/MembershipForm.svelte';
  import Section from '$lib/components/Section.svelte';
</script>

<svelte:head>
  <title>By Request — Matcha Tonoki</title>
  <meta
    name="description"
    content="Tearooms, restaurants, shops and private hosts order Matcha Tonoki in their own quantities and their own packaging. Tell us what you need and we will answer either way."
  />
</svelte:head>

<!-- Was /club, and the landing page carried a second copy of it under The
     Guardian whose only real content was a link to here. One room now: the
     teaser and the page said the same thing, and "Club" promised a membership
     that does not exist. The eyebrow keeps the museum voice; the title says
     plainly what happens here. -->
<Section id="request" eyebrow="The Guardian" title="By Request">
  <div class="narrative-grid">
    <p>
      Tearooms, restaurants, shops and private hosts buy Tonoki in the quantity they need, in the
      packaging that suits the way they serve it. Tell us what you need and who it is for, and we
      will tell you honestly whether we can make it.
    </p>
    <p>
      Tell us where the tea will be poured and how much of it you go through. A guardian reads every
      request and answers either way, even when the answer is that we cannot do it yet.
    </p>
  </div>

  <MembershipForm />
</Section>

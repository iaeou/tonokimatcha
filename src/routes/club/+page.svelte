<script lang="ts">
  import MembershipForm from '$lib/components/MembershipForm.svelte';
  import Section from '$lib/components/Section.svelte';
</script>

<Section eyebrow="The Guardian" title="Tonoki Club">
  <div class="narrative-grid">
    <p>
      The club is how tearooms, restaurants, shops and private hosts buy Tonoki: in the quantity
      they need, in the packaging that suits the way they serve it.
    </p>
    <p>
      Tell us where the tea will be poured and how much of it you go through. A guardian reads
      every request and answers either way, even when the answer is that we cannot do it yet.
    </p>
  </div>

  <MembershipForm />
</Section>

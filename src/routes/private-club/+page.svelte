<script lang="ts">
  import MembershipForm from '$lib/components/MembershipForm.svelte';
  import Section from '$lib/components/Section.svelte';
</script>

<Section eyebrow="The Guardian" title="Private Club">
  <div class="narrative-grid">
    <p>
      Admission is reserved for invited patrons, hospitality partners, and cultural institutions
      able to preserve Tonoki's handling standards.
    </p>
    <p>
      Requests are treated as sponsorship inquiries, not transactions. A guardian reviews each
      institution, intended ceremony, and storage context before access is considered.
    </p>
  </div>

  <MembershipForm />
</Section>

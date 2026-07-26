<script lang="ts">
  import type { Vessel } from '$lib/data/vessels';

  interface Props {
    vessel: Vessel;
    /** Present when the detail is opened over the landing page. */
    onclose?: () => void;
  }

  let { vessel, onclose }: Props = $props();
</script>

<article class="vessel-detail" data-vessel={vessel.slug}>
  {#if onclose}
    <!-- Opened over the hall, the photograph is the lid: pressing it closes
         the vessel again. A real button, so it answers the keyboard too. -->
    <button
      class="vessel-detail__media vessel-detail__media--closes"
      type="button"
      aria-label="Close the vessel"
      onclick={onclose}
    >
      <img src={vessel.image} alt={vessel.alt} />
    </button>
  {:else}
    <figure class="vessel-detail__media">
      <img src={vessel.image} alt={vessel.alt} />
    </figure>
  {/if}

  <div class="vessel-detail__body">
    <p class="vessel-detail__type"><span aria-hidden="true">{vessel.key}</span> {vessel.format}</p>
    <h1 class="vessel-detail__title">{vessel.name}</h1>
    <p class="vessel-detail__lede">{vessel.description}</p>

    <dl class="certificate">
      {#each vessel.marks as mark}
        <div>
          <dt>{mark.label}</dt>
          <dd>{mark.value}</dd>
        </div>
      {/each}
    </dl>

    {#if vessel.note}
      <p class="vessel-detail__note">{vessel.note}</p>
    {/if}

    {#if onclose}
      <button class="text-link vessel-detail__close" type="button" onclick={onclose}>
        Close the vessel
      </button>
    {:else}
      <a class="text-link" href="/#vessels">Return to the vessels</a>
    {/if}
  </div>
</article>

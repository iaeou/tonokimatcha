<script lang="ts">
  import { tick } from 'svelte';
  import {
    centreOf,
    setRevealOrigin,
    startTypedViewTransition
  } from '$lib/animations/view-transitions';

  type Step = {
    numeral: string;
    name: string;
    japanese: string;
    body: string;
    mark: string;
  };

  // Provisional text in the house register — the temperatures and timings are
  // Jaume's to confirm against how the tea is actually served.
  const steps: Step[] = [
    {
      numeral: '一',
      name: 'Warm the bowl',
      japanese: '碗を温める',
      body: 'Hot water is poured into the chawan and turned once, then discarded. A cold bowl steals the first heat from the tea and flattens the aroma before it arrives.',
      mark: 'Bowl at hand temperature, wiped dry'
    },
    {
      numeral: '二',
      name: 'Sift the leaf',
      japanese: '篩う',
      body: 'Two grams pass through a fine sieve into the warmed bowl. Stone-milled leaf clings to itself; sifting is what stands between a smooth surface and a bowl of small bitter knots.',
      mark: '2 g — one sachet, one bowl'
    },
    {
      numeral: '三',
      name: 'Whisk',
      japanese: '点てる',
      body: 'Seventy millilitres at eighty degrees. The chasen moves in a brisk W, wrist loose, until a fine even foam rises and the surface holds its own light.',
      mark: '70 ml at 80 °C, fifteen seconds'
    },
    {
      numeral: '四',
      name: 'Serve',
      japanese: '供する',
      body: 'The bowl is turned so its face meets the guest, and it is drunk without delay. Matcha does not wait: within a minute the foam falls and the tea begins to describe a different afternoon.',
      mark: 'Served at once, turned twice'
    }
  ];

  let index = $state(0);
  const step = $derived(steps[index]);

  /**
   * Each step is revealed by the same blurred circle that swaps the theme,
   * grown from the numeral the visitor just pressed. The state change has to
   * be flushed inside the transition callback — Svelte updates the DOM after a
   * microtask, and the snapshot would otherwise capture the old step.
   */
  function go(event: MouseEvent, next: number) {
    if (next === index) return;

    setRevealOrigin(centreOf(event.currentTarget as Element));

    startTypedViewTransition({
      types: ['ceremony'],
      update: async () => {
        index = next;
        await tick();
      }
    });
  }
</script>

<div class="ceremony">
  <ol class="ceremony__numerals">
    {#each steps as item, itemIndex}
      <li>
        <button
          type="button"
          class="ceremony__numeral"
          aria-current={itemIndex === index ? 'step' : undefined}
          onclick={(event) => go(event, itemIndex)}
        >
          <span class="ceremony__glyph" aria-hidden="true">{item.numeral}</span>
          <span class="ceremony__label">{item.name}</span>
        </button>
      </li>
    {/each}
  </ol>

  <article class="ceremony__step" aria-live="polite">
    <p class="ceremony__japanese" lang="ja">{step.japanese}</p>
    <h3>{step.name}</h3>
    <p class="ceremony__body">{step.body}</p>
    <p class="ceremony__mark">{step.mark}</p>
  </article>
</div>

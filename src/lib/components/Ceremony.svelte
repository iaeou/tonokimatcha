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

  type Way = {
    id: string;
    label: string;
    kicker: string;
    steps: Step[];
  };

  // Two everyday ways and one long way. The everyday ways are written plainly
  // on purpose — they are instructions, not liturgy. Temperatures and timings
  // are Jaume's to confirm against how the tea is actually served.
  const ways: Way[] = [
    {
      id: 'cold',
      label: 'Cold',
      kicker: 'One sachet, one bottle, fifteen seconds.',
      steps: [
        {
          numeral: '一',
          name: 'Pour',
          japanese: '注ぐ',
          body: 'Open a 33 cl bottle of cold water and empty one 2 g sachet into it. No sieve, no bowl, no tools.',
          mark: '2 g into 33 cl, cold'
        },
        {
          numeral: '二',
          name: 'Shake',
          japanese: '振る',
          body: 'Cap it and shake hard for about fifteen seconds. Stop when nothing is clinging to the walls and the water has turned an even jade green all the way through.',
          mark: 'About 15 seconds, hard'
        },
        {
          numeral: '三',
          name: 'Drink, then keep',
          japanese: '冷やす',
          body: 'Drink it straight from the bottle. What is left goes in the fridge and holds for a day — shake it again before the next glass, since the leaf settles.',
          mark: 'Up to 24 h refrigerated'
        }
      ]
    },
    {
      id: 'hot',
      label: 'Hot',
      kicker: 'Same gesture, hotter water, insulated bottle.',
      steps: [
        {
          numeral: '一',
          name: 'Fill',
          japanese: '湯を注ぐ',
          body: 'Fill an insulated bottle with about 33 cl of hot water — near 80 °C, not boiling. Boiling water scorches the leaf and turns it bitter. Leave a few centimetres of air at the top.',
          mark: '33 cl at about 80 °C'
        },
        {
          numeral: '二',
          name: 'Shake',
          japanese: '振る',
          body: 'Add one 2 g sachet, close it, hold the cap down and shake for about fifteen seconds. Same test as the cold way: even jade, nothing left on the walls.',
          mark: 'Hold the cap — hot liquid'
        },
        {
          numeral: '三',
          name: 'Drink',
          japanese: '飲む',
          body: 'Drink it warm, straight from the bottle. Insulated, it stays drinkable for hours, so it travels as well as the cold one.',
          mark: 'Best within the hour'
        }
      ]
    },
    {
      id: 'ceremony',
      label: 'Ceremony',
      kicker: 'The long way, when there is time for it.',
      steps: [
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
      ]
    }
  ];

  let wayIndex = $state(0);
  let index = $state(0);
  const way = $derived(ways[wayIndex]);
  const step = $derived(way.steps[index]);

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

  /** Switching way always returns to its first movement — step 4 does not exist in the short ways. */
  function goWay(event: MouseEvent, next: number) {
    if (next === wayIndex) return;

    setRevealOrigin(centreOf(event.currentTarget as Element));

    startTypedViewTransition({
      types: ['ceremony'],
      update: async () => {
        wayIndex = next;
        index = 0;
        await tick();
      }
    });
  }
</script>

<div class="ceremony">
  <div class="ceremony__ways" role="group" aria-label="Preparation">
    {#each ways as item, itemIndex}
      <button
        type="button"
        class="ceremony__way"
        aria-pressed={itemIndex === wayIndex}
        onclick={(event) => goWay(event, itemIndex)}
      >
        {item.label}
      </button>
    {/each}
  </div>

  <p class="ceremony__kicker">{way.kicker}</p>

  <ol class="ceremony__numerals">
    {#each way.steps as item, itemIndex}
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

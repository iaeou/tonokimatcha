/**
 * Three ways to prepare the same two grams, shown side by side rather than
 * behind a selector: the argument of this section is that the easy ways are
 * legitimate, and an argument you have to click to see is an argument the
 * visitor never reads.
 *
 * Order is deliberate — the fastest way leads. Cold and Hot are written as
 * instructions, not liturgy; only the third way keeps the ceremonial register,
 * because there the slowness is the point.
 *
 * Timings and temperatures are provisional, pending Jaume's confirmation
 * against how the tea actually behaves.
 */
export type Step = {
  numeral: string;
  name: string;
  japanese: string;
  body: string;
};

export type Way = {
  id: string;
  label: string;
  /** Shown beside the label: what this way costs you, before any step is read. */
  effort: string;
  kicker: string;
  steps: Step[];
  /** Closing line — the keeping note, or what the way is for. */
  mark: string;
};

export const ways: Way[] = [
  {
    id: 'cold',
    label: 'Cold',
    effort: '15 seconds · no tools',
    kicker: 'Ceremonial matcha in a water bottle. This is not a compromise — cold water draws less bitterness out of the leaf than hot.',
    steps: [
      {
        numeral: '一',
        name: 'Pour',
        japanese: '注ぐ',
        body: 'Empty one 2 g sachet into a 15-75cl bottle of cold water. No sieve, no bowl, no whisk.'
      },
      {
        numeral: '二',
        name: 'Shake',
        japanese: '振る',
        body: 'Cap it and shake hard for about fifteen seconds — until nothing clings to the walls and the water has turned an even jade green.'
      },
      {
        numeral: '三',
        name: 'Drink',
        japanese: '飲む',
        body: 'Straight from the bottle. Cold brewing is the forgiving way: there is no temperature to get wrong.'
      }
    ],
    mark: 'Keeps a day in the fridge — shake again, the leaf settles'
  },
  {
    id: 'hot',
    label: 'Hot',
    effort: 'One minute · standard cutlery',
    kicker: 'Warm matcha without the ritual. One rule only: not boiling.',
    steps: [
      {
        numeral: '一',
        name: 'Fill',
        japanese: '湯を注ぐ',
        body: 'Hot water into a cup or mug, near 80 °C. Boiling water scorches the leaf and turns it bitter.'
      },
      {
        numeral: '二',
        name: 'Mix',
        japanese: '混ぜる',
        body: 'Add one 2 g sachet and mix briskly. It is easy if you have a chasen (bamboo whisk), but also doable using standard cutlery.'
      },
      {
        numeral: '三',
        name: 'Drink',
        japanese: '飲む',
        body: 'Warm, straight from the cup. Drink while fresh, before the leaf begins to settle.'
      }
    ],
    mark: 'Best within the hour'
  },
  {
    id: 'ceremony',
    label: 'Ceremony',
    effort: 'Fifteen minutes · chawan and chasen',
    kicker: 'The long way, when there is time for it. Nothing here improves the tea — it improves the half hour around it.',
    steps: [
      {
        numeral: '一',
        name: 'Warm the bowl',
        japanese: '碗を温める',
        body: 'Hot water is poured into the chawan and turned once, then discarded. A cold bowl steals the first heat from the tea and flattens the aroma before it arrives.'
      },
      {
        numeral: '二',
        name: 'Sift',
        japanese: '篩う',
        body: 'Two grams through a fine sieve into the warmed bowl. Stone-milled leaf clings to itself; sifting stands between a smooth surface and a bowl of small bitter knots.'
      },
      {
        numeral: '三',
        name: 'Whisk',
        japanese: '点てる',
        body: 'Seventy millilitres at eighty degrees. The chasen moves in a brisk W, wrist loose, until a fine even foam rises and the surface holds its own light.'
      },
      {
        numeral: '四',
        name: 'Serve',
        japanese: '供する',
        body: 'The bowl is turned so its face meets the guest, and drunk without delay. Within a minute the foam falls and the tea begins to describe a different afternoon.'
      }
    ],
    mark: 'Served at once, turned twice'
  }
];

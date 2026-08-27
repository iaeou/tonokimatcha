/**
 * The three presentations of the single degree. One tea; only the vessel that
 * carries it to the bowl changes. Shared by the landing grid and the vessel
 * halls so the card and its detail can never drift apart.
 */
export type Vessel = {
  slug: string;
  /** The letter the house uses when speaking about a presentation. */
  key: string;
  name: string;
  format: string;
  description: string;
  /** Condition of service, shown as a hairline footnote rather than a badge. */
  note?: string;
  image: string;
  alt: string;
  marks: { label: string; value: string }[];
};

export const vessels: Vessel[] = [
  {
    slug: 'sachet',
    key: 'A',
    name: 'The Single Serving',
    format: '2 g sachet',
    description:
      'One bowl, sealed at the mill. Individual foil sachet that protects the leaf from light and air until the moment of service.',
    note: 'Offered loose from one hundred sachets, or held inside the tube.',
    image: '/images/packaging/matchatonoki-sachet-2g.webp',
    alt: 'An open Matcha Tonoki tube with four 2 gram sachets laid beside it',
    marks: [
      { label: 'Contents', value: '2 g — one bowl of usucha' },
      { label: 'Material', value: 'Triple-layer foil, nitrogen flushed' },
      { label: 'Keeping', value: 'Sealed: 12 months. Opened: serve at once' },
      { label: 'Minimum', value: '100 sachets when ordered loose' }
    ]
  },
  {
    slug: 'tube',
    key: 'B',
    name: 'The Vessel',
    format: '25 sachets · refined paper tube',
    description:
      'Twenty-five single servings held in a seamless paper tube. The travelling form: a month of ceremony, carried without ceremony.',
    image: '/images/packaging/matchatonoki-tube-25.webp',
    alt: 'The closed Matcha Tonoki paper tube, labelled and sealed',
    marks: [
      { label: 'Contents', value: '25 × 2 g sachets — 50 g' },
      { label: 'Material', value: 'Seamless uncoated paper, foil-lined' },
      { label: 'Keeping', value: '12 months from the sealing date' },
      { label: 'Intent', value: 'A month of daily practice, or a gift' }
    ]
  },
  {
    slug: 'pouch',
    key: 'C',
    name: 'The Reserve',
    format: '30 g hermetic pouch',
    description:
      'The house format for those who measure their own bowl. Hermetically sealed, resealable, sized for daily practice.',
    image: '/images/packaging/matchatonoki-pouch-30g.webp',
    alt: 'The standing Matcha Tonoki pouch, thirty grams, hermetically sealed',
    marks: [
      { label: 'Contents', value: '30 g — roughly fifteen bowls' },
      { label: 'Material', value: 'Hermetic resealable pouch, opaque' },
      { label: 'Keeping', value: 'Opened: four weeks, refrigerated and closed' },
      { label: 'Intent', value: 'Measured by hand, with a chashaku' }
    ]
  }
];

export function findVessel(slug: string | undefined): Vessel | undefined {
  return vessels.find((vessel) => vessel.slug === slug);
}

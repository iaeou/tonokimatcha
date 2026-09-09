/**
 * The three drawn figures that stand behind the halls.
 *
 * They replaced the ghost kanji (樹 / 玉 / 器 / 陵 …) on 2026-09-09: one
 * character per hall was a private language, and eleven of them across the
 * site read as decoration rather than as the house. Jaume's three drawings say
 * the same thing out loud — lineage, guard, ceremony — in the hand the brand
 * already speaks in.
 *
 * Three figures for eleven halls means they repeat. The assignment below is
 * deliberate rather than cyclic: each figure is given the halls it actually
 * belongs to, and no two neighbouring halls on a page carry the same one.
 */
export type FigureId = 'oriental' | 'samurai' | 'wa';

export interface Figure {
  id: FigureId;
  /** Native-width source; the 480 variant is derived from the same file name. */
  src: string;
  srcset: string;
}

function figure(id: FigureId): Figure {
  return {
    id,
    src: `/images/figures/${id}.webp`,
    srcset: `/images/figures/${id}-480.webp 480w, /images/figures/${id}.webp 700w`
  };
}

export const figures: Record<FigureId, Figure> = {
  oriental: figure('oriental'),
  samurai: figure('samurai'),
  wa: figure('wa')
};

export function getFigure(id: FigureId | undefined): Figure | undefined {
  return id ? figures[id] : undefined;
}

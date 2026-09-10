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
  film?: FigureFilm;
}

/**
 * A gently animated loop of the same drawing, when one exists.
 *
 * The film brings its **own poster**, cut from its own first frame, rather than
 * borrowing the still above. The animated source is framed tighter than the
 * scan — 480×854 against the still's 669×910 — and laying one over the other
 * squashed the face by a quarter of its height. Cropping the film to match the
 * scan was the alternative, but both drawings run edge to edge, so any crop
 * would have been a guess at someone else's composition.
 *
 * The video must be encoded with pure-white paper: `figure-film.ts` reads the
 * ink's darkness as alpha, and paper at 250 rather than 255 would veil the
 * whole rectangle. See `.agents/docs` for the ffmpeg recipe.
 */
export interface FigureFilm {
  src: string;
  /** Same framing as the film, so nothing shifts when the film takes over. */
  poster: string;
}

function figure(id: FigureId, filmed = false): Figure {
  return {
    id,
    src: `/images/figures/${id}.webp`,
    srcset: `/images/figures/${id}-480.webp 480w, /images/figures/${id}.webp 700w`,
    ...(filmed
      ? {
          film: {
            src: `/videos/figures/${id}.mp4`,
            poster: `/images/figures/${id}-film.webp`
          }
        }
      : {})
  };
}

export const figures: Record<FigureId, Figure> = {
  // Only `oriental` has been filmed so far. Having a film does not put it on
  // screen: a hall opts in with `<Section filmed>`, and exactly one does. A
  // deliberate trial of one, not a rollout — three moving drawings would
  // compete with each other and with the reading, and iOS caps how many
  // videos decode at once.
  oriental: figure('oriental', true),
  samurai: figure('samurai'),
  wa: figure('wa')
};

export function getFigure(id: FigureId | undefined): Figure | undefined {
  return id ? figures[id] : undefined;
}

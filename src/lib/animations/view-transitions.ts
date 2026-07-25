/**
 * Shared plumbing for the site's View Transitions.
 *
 * Every transition is tagged with a *type* so the stylesheet can tell them
 * apart: the theme swap reveals through a blurred circle, while room-to-room
 * navigation slides in the direction the visitor is travelling. Types also let
 * us scope `view-transition-name` to navigation only — naming the header and
 * footer permanently would carve them out of the theme circle and break it.
 */

export type ViewTransitionType = 'theme' | 'forward' | 'backward' | 'vessel' | 'ceremony';

/**
 * Point the blurred circle at whatever the visitor just touched. Both the
 * theme swap and the ceremony steps grow their reveal from these coordinates,
 * so the gesture always starts under the hand rather than at the centre of
 * the screen.
 */
export function setRevealOrigin(origin: { x: number; y: number } | undefined) {
  const { x, y } = origin ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  document.documentElement.style.setProperty('--reveal-x', `${x}px`);
  document.documentElement.style.setProperty('--reveal-y', `${y}px`);
}

/** The centre of an element, in viewport coordinates. */
export function centreOf(element: Element): { x: number; y: number } {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

export type ViewTransitionOptions = {
  update: () => void | Promise<void>;
  types?: ViewTransitionType[];
};

type ViewTransition = { finished: Promise<void> };

type DocumentWithViewTransition = Document & {
  startViewTransition?: (
    callbackOrOptions: (() => void | Promise<void>) | ViewTransitionOptions
  ) => ViewTransition;
};

export function supportsViewTransitions(doc: Document = document): boolean {
  return typeof (doc as DocumentWithViewTransition).startViewTransition === 'function';
}

export function prefersReducedMotion(win: Window | undefined = globalThis.window): boolean {
  // No window means no motion to worry about — server render or a test.
  return win?.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/**
 * Which way the visitor is moving through the halls. Depth is measured by path
 * segments, so `/` -> `/club` reads as forward and the reverse as backward.
 * A browser back/forward gesture always reads as backward, whatever the paths,
 * because the visitor is retracing their own steps.
 */
export function getNavigationDirection(
  from: string | null | undefined,
  to: string | null | undefined,
  navigationType?: string
): 'forward' | 'backward' {
  if (navigationType === 'popstate') return 'backward';
  if (!from || !to) return 'forward';

  const depth = (path: string) => path.split('/').filter(Boolean).length;
  return depth(to) < depth(from) ? 'backward' : 'forward';
}

/**
 * Starts a typed View Transition, degrading to an immediate update when the
 * API is missing or the visitor asked for stillness. Types are passed through
 * the object form of `startViewTransition`; browsers that only implement the
 * callback form still get the transition, just untyped.
 */
export function startTypedViewTransition(
  options: ViewTransitionOptions,
  doc: Document = document
): ViewTransition | null {
  const target = doc as DocumentWithViewTransition;

  if (!target.startViewTransition || prefersReducedMotion()) {
    void options.update();
    return null;
  }

  // `:active-view-transition-type()` is newer than the API itself, so the type
  // is mirrored onto a data attribute. CSS keys off the attribute and every
  // browser that can run a transition at all gets the right choreography.
  const root = doc.documentElement;
  const type = options.types?.[0];
  if (type) root.dataset.viewTransition = type;

  const transition = target.startViewTransition(options);
  void transition.finished
    .catch(() => {})
    .finally(() => {
      delete root.dataset.viewTransition;
    });

  return transition;
}

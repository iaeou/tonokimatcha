import { describe, expect, test, vi } from 'vitest';
import { getNavigationDirection, startTypedViewTransition } from './view-transitions';

describe('getNavigationDirection', () => {
  test('reads a deeper path as travelling forward', () => {
    expect(getNavigationDirection('/', '/club')).toBe('forward');
  });

  test('reads a shallower path as travelling backward', () => {
    expect(getNavigationDirection('/club', '/')).toBe('backward');
  });

  test('treats a browser back gesture as backward whatever the paths', () => {
    // Retracing your own steps should feel the same in both directions.
    expect(getNavigationDirection('/', '/club', 'popstate')).toBe('backward');
  });

  test('falls forward when a path is unknown', () => {
    expect(getNavigationDirection(null, '/club')).toBe('forward');
    expect(getNavigationDirection('/club', undefined)).toBe('forward');
  });

  test('keeps same-depth moves moving forward', () => {
    expect(getNavigationDirection('/club', '/lineage')).toBe('forward');
  });
});

function fakeDocument(withApi: boolean) {
  const root = { dataset: {} as Record<string, string> };
  const doc = { documentElement: root } as unknown as Document & {
    startViewTransition?: unknown;
  };

  if (withApi) {
    // The real signature carries `ready`/`updateCallbackDone` too; the helper
    // only ever touches `finished`, so a slim stand-in keeps the test readable.
    doc.startViewTransition = ((options: { update: () => void }) => {
      options.update();
      return { finished: Promise.resolve() };
    }) as unknown as Document['startViewTransition'];
  }

  return { doc, root };
}

describe('startTypedViewTransition', () => {
  test('runs the update immediately when the API is missing', () => {
    const { doc } = fakeDocument(false);
    const update = vi.fn();

    expect(startTypedViewTransition({ update, types: ['theme'] }, doc)).toBeNull();
    expect(update).toHaveBeenCalledOnce();
  });

  test('mirrors the type onto the root so CSS can tell transitions apart', async () => {
    const { doc, root } = fakeDocument(true);
    const seen: string[] = [];

    const transition = startTypedViewTransition(
      {
        types: ['forward'],
        // The attribute has to be present while the snapshot is taken.
        update: () => {
          seen.push(root.dataset.viewTransition ?? 'unset');
        }
      },
      doc
    );

    expect(seen).toEqual(['forward']);

    await transition?.finished;
    await Promise.resolve();
    expect(root.dataset.viewTransition).toBeUndefined();
  });
});

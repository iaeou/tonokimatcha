import { fail } from '@sveltejs/kit';
import { hasErrors, parseRequestForm } from '$lib/server/request-form';
import { announceRequest, recordRequest } from '$lib/server/request-inbox';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request, fetch }) => {
    const data = await request.formData();
    const { values, errors, trapped } = parseRequestForm(data);

    // A filled honeypot is answered like any other request. Telling a bot it
    // was caught is how it learns to stop filling the trap.
    if (trapped) return { sent: true };

    if (hasErrors(errors)) {
      // The values come back so nobody retypes a paragraph over a missing @.
      return fail(400, { sent: false, values, errors });
    }

    try {
      await recordRequest(values, fetch);
    } catch (error) {
      // Loud in the log, quiet on the page: the visitor can do nothing about
      // a misconfigured key, and should not be shown one.
      console.error('[request] not recorded', error);

      return fail(500, {
        sent: false,
        values,
        errors: {
          form: 'Something failed on our side and your request was not saved. Please try again in a moment.'
        }
      });
    }

    // Awaited, not fired and forgotten: the serverless function is frozen the
    // moment the response is returned, and a floating promise dies with it.
    // It cannot fail the submission — the row is already written.
    await announceRequest(values, fetch);

    return { sent: true };
  }
};

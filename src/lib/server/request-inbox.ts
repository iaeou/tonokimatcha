/**
 * Where a request goes once it is judged answerable.
 *
 * Two destinations, and they are not equals. **Supabase is the record** — if
 * the row does not land, the visitor is told the house did not hear them.
 * **The email is the doorbell** — it tells a guardian to go and read, and a
 * doorbell that fails must never lose a request that is already written down.
 * So the insert throws and the notification does not.
 *
 * Supabase is reached over PostgREST with `fetch` rather than through
 * `@supabase/supabase-js`. One insert does not earn a dependency, and the
 * service-role key must never travel to the browser — keeping the call here,
 * under `$lib/server`, is a rule SvelteKit enforces at build time.
 */

import { env } from '$env/dynamic/private';
import type { RequestValues } from '$lib/data/request-fields';

/** Table the requests land in. Overridable so a staging project can differ. */
const TABLE = env.SUPABASE_REQUESTS_TABLE || 'requests';

export class RequestNotRecorded extends Error {}

function supabaseConfig() {
  const url = env.SUPABASE_URL?.replace(/\/+$/, '');
  const key = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new RequestNotRecorded(
      'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are not set — the request form has nowhere to write.'
    );
  }

  return { url, key };
}

/**
 * Writes the request to Supabase. Throws `RequestNotRecorded` on any failure,
 * because the caller must not tell the visitor "received" over a lost row.
 */
export async function recordRequest(
  values: RequestValues,
  fetcher: typeof fetch = fetch
): Promise<void> {
  const { url, key } = supabaseConfig();

  const response = await fetcher(`${url}/rest/v1/${TABLE}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      // Nothing is read back: the row's own id is of no use to the visitor.
      Prefer: 'return=minimal'
    },
    body: JSON.stringify({
      name: values.name,
      email: values.email,
      // Empty optional fields go in as NULL, not as '': a query for "requests
      // with a phone number" should not have to know about both.
      phone: values.phone || null,
      business: values.business || null,
      message: values.request,
      source: 'request-page'
    })
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new RequestNotRecorded(
      `Supabase refused the insert (${response.status}): ${detail.slice(0, 500)}`
    );
  }
}

/**
 * Tells a guardian a request is waiting. Best effort by design: returns
 * `false` instead of throwing, and returns `false` quietly when no email
 * provider is configured, so the form works with Supabase alone.
 */
export async function announceRequest(
  values: RequestValues,
  fetcher: typeof fetch = fetch
): Promise<boolean> {
  const key = env.RESEND_API_KEY;
  const to = env.REQUEST_NOTIFY_TO;
  const from = env.REQUEST_NOTIFY_FROM;

  if (!key || !to || !from) return false;

  const lines = [
    `Name: ${values.name}`,
    `Email: ${values.email}`,
    values.phone ? `Phone: ${values.phone}` : null,
    values.business ? `Business: ${values.business}` : null,
    '',
    values.request
  ].filter((line): line is string => line !== null);

  try {
    const response = await fetcher('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to: to.split(',').map((address) => address.trim()),
        // Hitting reply answers the person who asked, not the robot.
        reply_to: values.email,
        subject: `Request — ${values.business || values.name}`,
        text: lines.join('\n')
      })
    });

    if (!response.ok) {
      console.error('[request] notification refused', response.status, await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('[request] notification failed', error);
    return false;
  }
}

/**
 * Keeps Supabase from entering inactivity-pause on the Free Tier.
 *
 * Supabase pauses projects that receive no database queries for 7 days.
 * In this project, Supabase is only queried when a visitor submits /request.
 * Without periodic requests, PostgREST sees zero activity and Supabase flags
 * the project for auto-pausing.
 *
 * This function issues a lightweight, read-only query (LIMIT 1) to PostgREST
 * using the server-side service-role key, registering active database usage.
 */

import { env } from '$env/dynamic/private';

export class SupabasePingError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.name = 'SupabasePingError';
    this.status = status;
  }
}

function supabaseKeepaliveConfig() {
  const url = env.SUPABASE_URL?.replace(/\/+$/, '');
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  const table = env.SUPABASE_REQUESTS_TABLE || 'requests';

  if (!url || !key) {
    throw new SupabasePingError(
      'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for keepalive ping.',
      500
    );
  }

  return { url, key, table };
}

export interface PingResult {
  ok: boolean;
  table: string;
  durationMs: number;
}

/**
 * Pings Supabase PostgREST with a single-row SELECT query.
 * Throws `SupabasePingError` if credentials are missing or the database refuses.
 */
export async function pingSupabase(fetcher: typeof fetch = fetch): Promise<PingResult> {
  const { url, key, table } = supabaseKeepaliveConfig();
  const start = Date.now();

  const response = await fetcher(`${url}/rest/v1/${table}?select=id&limit=1`, {
    method: 'GET',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: 'application/json'
    }
  });

  const durationMs = Date.now() - start;

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new SupabasePingError(
      `Supabase keepalive ping failed (${response.status}): ${detail.slice(0, 300)}`,
      response.status >= 500 ? 502 : response.status
    );
  }

  return {
    ok: true,
    table,
    durationMs
  };
}

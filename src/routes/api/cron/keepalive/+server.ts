import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import { pingSupabase, SupabasePingError } from '$lib/server/supabase-keepalive';

/**
 * Invoked periodically by Vercel Cron to keep Supabase Free Tier awake.
 *
 * Configured in vercel.json. If CRON_SECRET is defined in the Vercel project's
 * environment variables, Vercel automatically passes it in the Authorization header.
 */
export const GET: RequestHandler = async ({ request, fetch }) => {
  if (env.CRON_SECRET) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const result = await pingSupabase(fetch);
    return json({
      message: 'Supabase keepalive ping successful',
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = error instanceof SupabasePingError ? error.status : 500;
    console.error('[cron/keepalive] Ping failed:', message);

    return json(
      {
        ok: false,
        error: message,
        timestamp: new Date().toISOString()
      },
      { status }
    );
  }
};

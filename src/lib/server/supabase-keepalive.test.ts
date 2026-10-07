import { afterEach, describe, expect, test, vi } from 'vitest';
import { pingSupabase, SupabasePingError } from './supabase-keepalive';

vi.mock('$env/dynamic/private', () => ({
  env: {
    SUPABASE_URL: 'https://project.supabase.co/',
    SUPABASE_SERVICE_ROLE_KEY: 'service-key',
    SUPABASE_REQUESTS_TABLE: 'requests'
  }
}));

function mockFetcher(status: number, body = '[]') {
  return vi.fn(async () =>
    new Response(body, {
      status,
      statusText: status === 200 ? 'OK' : 'Error'
    })
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('pingSupabase', () => {
  test('queries Supabase PostgREST with LIMIT 1 and service-role auth headers', async () => {
    const fetcher = mockFetcher(200, '[{"id":"123"}]');

    const result = await pingSupabase(fetcher as unknown as typeof fetch);

    expect(result.ok).toBe(true);
    expect(result.table).toBe('requests');
    expect(typeof result.durationMs).toBe('number');

    const [url, init] = fetcher.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://project.supabase.co/rest/v1/requests?select=id&limit=1');
    expect(init.method).toBe('GET');
    expect((init.headers as Record<string, string>).apikey).toBe('service-key');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer service-key');
  });

  test('succeeds even if the table is empty (returns empty array)', async () => {
    const fetcher = mockFetcher(200, '[]');

    const result = await pingSupabase(fetcher as unknown as typeof fetch);

    expect(result.ok).toBe(true);
    expect(result.table).toBe('requests');
  });

  test('throws SupabasePingError when Supabase responds with non-2xx', async () => {
    const fetcher = mockFetcher(500, 'Database error');

    await expect(pingSupabase(fetcher as unknown as typeof fetch)).rejects.toThrowError(
      SupabasePingError
    );
  });
});

import { describe, expect, test, vi, beforeEach } from 'vitest';
import { GET } from './+server';
import type { RequestEvent } from './$types';
import * as keepaliveModule from '$lib/server/supabase-keepalive';

let mockCronSecret = '';

vi.mock('$env/dynamic/private', () => ({
  get env() {
    return {
      CRON_SECRET: mockCronSecret
    };
  }
}));

describe('GET /api/cron/keepalive', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockCronSecret = '';
  });

  test('returns 200 with result when ping succeeds without CRON_SECRET configured', async () => {
    vi.spyOn(keepaliveModule, 'pingSupabase').mockResolvedValue({
      ok: true,
      table: 'requests',
      durationMs: 42
    });

    const mockRequest = new Request('https://matchatonoki.com/api/cron/keepalive');
    const event = {
      request: mockRequest,
      fetch: vi.fn()
    } as unknown as RequestEvent;

    const response = await GET(event);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.table).toBe('requests');
    expect(body.durationMs).toBe(42);
    expect(body.message).toBe('Supabase keepalive ping successful');
  });

  test('blocks unauthorized requests when CRON_SECRET is set and header is absent/incorrect', async () => {
    mockCronSecret = 'super-secret-token';

    const mockRequest = new Request('https://matchatonoki.com/api/cron/keepalive', {
      headers: {
        authorization: 'Bearer wrong-token'
      }
    });
    const event = {
      request: mockRequest,
      fetch: vi.fn()
    } as unknown as RequestEvent;

    const response = await GET(event);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe('Unauthorized');
  });

  test('allows authorized requests when CRON_SECRET matches', async () => {
    mockCronSecret = 'super-secret-token';
    vi.spyOn(keepaliveModule, 'pingSupabase').mockResolvedValue({
      ok: true,
      table: 'requests',
      durationMs: 15
    });

    const mockRequest = new Request('https://matchatonoki.com/api/cron/keepalive', {
      headers: {
        authorization: 'Bearer super-secret-token'
      }
    });
    const event = {
      request: mockRequest,
      fetch: vi.fn()
    } as unknown as RequestEvent;

    const response = await GET(event);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
  });

  test('returns error status when keepalive ping fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(keepaliveModule, 'pingSupabase').mockRejectedValue(
      new keepaliveModule.SupabasePingError('Database offline', 502)
    );

    const mockRequest = new Request('https://matchatonoki.com/api/cron/keepalive');
    const event = {
      request: mockRequest,
      fetch: vi.fn()
    } as unknown as RequestEvent;

    const response = await GET(event);
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.ok).toBe(false);
    expect(body.error).toBe('Database offline');
  });
});

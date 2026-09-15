import { afterEach, describe, expect, test, vi } from 'vitest';
import type { RequestValues } from '../data/request-fields';
import { RequestNotRecorded, announceRequest, recordRequest } from './request-inbox';

// The module reads its configuration from the private environment, which only
// exists inside a running SvelteKit server. The trailing slash on the URL is
// deliberate: it proves the request path does not end up with a double one.
vi.mock('$env/dynamic/private', () => ({
  env: {
    SUPABASE_URL: 'https://project.supabase.co/',
    SUPABASE_SERVICE_ROLE_KEY: 'service-key',
    RESEND_API_KEY: 'resend-key',
    REQUEST_NOTIFY_TO: 'guardian@matchatonoki.com, second@matchatonoki.com',
    REQUEST_NOTIFY_FROM: 'Matcha Tonoki <requests@matchatonoki.com>'
  }
}));

const values: RequestValues = {
  name: 'Mika Horiuchi',
  email: 'mika@tearoom.example',
  phone: '',
  business: '',
  request: 'Two tubes a month for the counter.'
};

function respond(ok: boolean, body = '') {
  return vi.fn(async () =>
    new Response(body, { status: ok ? 201 : 401, statusText: ok ? 'Created' : 'Unauthorized' })
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('recordRequest', () => {
  test('posts one row to the table with the service-role key', async () => {
    const fetcher = respond(true);

    await recordRequest(values, fetcher as unknown as typeof fetch);

    const [url, init] = fetcher.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://project.supabase.co/rest/v1/requests');
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>).apikey).toBe('service-key');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer service-key');

    const row = JSON.parse(init.body as string);
    expect(row).toEqual({
      name: 'Mika Horiuchi',
      email: 'mika@tearoom.example',
      // Empty optionals go in as NULL, so a query for "requests with a phone
      // number" does not have to know about both '' and null.
      phone: null,
      business: null,
      message: 'Two tubes a month for the counter.',
      source: 'request-page'
    });
  });

  test('throws when the row does not land, so nobody is told "received"', async () => {
    const fetcher = respond(false, 'invalid api key');

    await expect(recordRequest(values, fetcher as unknown as typeof fetch)).rejects.toBeInstanceOf(
      RequestNotRecorded
    );
  });
});

describe('announceRequest', () => {
  test('sends the doorbell with the visitor as the reply address', async () => {
    const fetcher = respond(true);

    await expect(announceRequest(values, fetcher as unknown as typeof fetch)).resolves.toBe(true);

    const [, init] = fetcher.mock.calls[0] as unknown as [string, RequestInit];
    const mail = JSON.parse(init.body as string);
    expect(mail.reply_to).toBe('mika@tearoom.example');
    expect(mail.to).toEqual(['guardian@matchatonoki.com', 'second@matchatonoki.com']);
    expect(mail.text).toContain('Two tubes a month for the counter.');
    // Fields nobody filled are left out rather than sent as empty lines.
    expect(mail.text).not.toContain('Phone:');
  });

  test('never throws, because the row is already written', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const refused = respond(false, 'domain not verified');
    const offline = vi.fn(async () => {
      throw new Error('network down');
    });

    await expect(announceRequest(values, refused as unknown as typeof fetch)).resolves.toBe(false);
    await expect(announceRequest(values, offline as unknown as typeof fetch)).resolves.toBe(false);
  });
});

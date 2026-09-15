# 2026-09-15 — The request form actually sends

Until today the form on `/request` was a picture of a form. No `method`, no
`action`, no server route: pressing "Send request" reloaded the page with the
answers in the query string and dropped them on the floor. Worse, the three
fields it collected — name, institution, request — contained **no way to reply
to anybody**. Every request the site ever received, if it received any, was
unanswerable by construction.

It now writes to Supabase and, optionally, rings a guardian by email.

## The fields

Required: **name, email, request.** Optional: **phone, business.** Jaume's
call, and the reasoning is that those three are exactly what a guardian needs
to answer — who asked, where to write back, what they want. A tearoom usually
volunteers a phone and a trading name anyway; refusing the request for want of
them would be refusing business.

The ceilings (`src/lib/data/request-fields.ts`) live in `data/`, not in
`server/`, because the component needs the same numbers the validator
enforces and SvelteKit forbids a component to import from `$lib/server`. Two
copies of a number that must agree is how `maxlength` and the validator drift.

## Two destinations, and they are not equals

- **Supabase is the record.** If the row does not land, the visitor is told the
  house did not hear them (500 + a plain message), and the failure is loud in
  the server log.
- **The email is the doorbell.** `announceRequest` never throws and returns
  `false` when no provider is configured. A doorbell that fails must not lose a
  request that is already written down.

Supabase is reached over PostgREST with `fetch`, not `@supabase/supabase-js`:
one insert does not earn a dependency, and keeping the call under `$lib/server`
is a rule the build enforces, so the service-role key cannot reach a browser.

`await announceRequest(...)`, never fire-and-forget — a serverless function is
frozen the moment it returns, and a floating promise dies with it.

## Security model, in one line

RLS is **on** with **no policies**, so the anon key can neither read nor write
`public.requests`. Only the service-role key reaches the table, and it only
exists inside the server action. Adding an "anon can insert" policy would open
a write path that skips every check in the action — don't.

The spam guard is a honeypot field (`website`, off-page, `aria-hidden`,
`tabindex="-1"`). A filled trap gets **the same confirmation a human gets** and
no row: telling a bot it was caught is how it learns to stop filling the trap.

## Progressive enhancement, and what was verified

`use:enhance` when JavaScript is there; the plain browser POST when it is not.
The whole flow was exercised against `vite preview` with a stub standing in for
Supabase, **with JavaScript off** (`Accept: text/html`, which is what makes
SvelteKit render the page instead of answering the JSON an enhanced form gets —
curl's default `Accept: */*` negotiates to JSON and will fool you):

| case | result |
| --- | --- |
| bad email, three-letter request | 400, both messages rendered, `aria-invalid` on those two fields, the name kept |
| complete request | 200, receipt replaces the form, row lands with `phone: null` and the name tidied |
| honeypot filled | 200, same receipt, **no row** |
| Supabase unreachable | 500, "not saved" on the page, `[request] not recorded` in the log |

`npm test` 155 passed / 1 skipped (13 new), `npm run check` 0 errors (the two
standing `CursorPointer` warnings), `npm run build` clean.

## What Jaume has to do, in this order

1. Run `.agents/docs/request-form-supabase-2026-09-15.sql` in the SQL editor of
   project `yytzsqvphsdjlwlgkapl`. It is idempotent.
2. Set in Vercel (Project → Settings → Environment Variables), for Production
   **and** Preview: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. Names must not
   start with `PUBLIC_` — SvelteKit ships those to the browser.
3. Optional, for the doorbell: `RESEND_API_KEY`, `REQUEST_NOTIFY_TO`,
   `REQUEST_NOTIFY_FROM` (an address on a domain verified in Resend).
4. Only then push. Without step 2 the live form answers 500 on every send.

`.env.example` carries the same list for local work.

## Open

- **No contact address anywhere on the site.** When the form fails there is
  nothing to fall back to — "try again in a moment" is all the visitor gets. An
  address in the footer would also give the failure an escape hatch.
- The privacy copy in `/legacy#privacy` was updated to name the email and phone
  the form now collects, but it is still Jaume's provisional text, not a
  lawyer's. It does not name a data controller, a retention period, or a legal
  basis, and the form now collects real personal data in the EU.
- Rate limiting is the honeypot and nothing else. If the trap starts leaking,
  Vercel's firewall is the next lever, not a counter in module scope — every
  serverless instance would keep its own.

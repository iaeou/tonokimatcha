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

## Configured and verified live (same day)

All of it is done, and done from the terminal rather than by hand:

- **Table**: applied through the Supabase MCP server (project
  `yytzsqvphsdjlwlgkapl`) as migration `create_requests_table`. The security
  advisor reports exactly one notice, `rls_enabled_no_policy` at INFO — that is
  the design, not a gap.
- **Vercel**: CLI installed and signed in on Jaume's Mac, project linked to
  `jasubals-projects/tonokimatcha`. `SUPABASE_URL` as Config, and
  `SUPABASE_SERVICE_ROLE_KEY` as a Secret, both on Production, Preview and
  Development. The key was piped in over stdin from a file that was deleted
  straight after, so it never entered a chat, a shell history or a process
  list. Note `vercel env ls` prints the ciphertext of a Config value — to see
  what a deploy actually gets, `vercel env pull`.
- **Live check** against matchatonoki.com/request after the deploy: bad email
  and a two-letter request → 400 with both messages; a complete request → the
  receipt, and exactly one row in the table with the phone and business filled;
  a filled honeypot → the same receipt and no row. The two test rows were
  deleted afterwards; the table is empty.

## The doorbell, wired the same day

`request@matchatonoki.com` → Jaume's Gmail, and the form sends from
`request@send.matchatonoki.com`. Two addresses that read alike and do opposite
things, because **Cloudflare Email Routing only receives** — it cannot send, so
the From needs a sending provider regardless.

**Why the sending address lives on a subdomain.** Email Routing takes over the
root's MX and writes the root SPF. Verifying `matchatonoki.com` itself in Resend
would have put two sets of records in the same place, which is how half your
mail starts disappearing. `send.matchatonoki.com` keeps Resend's DKIM, SPF and
bounce MX in their own subtree; the root keeps Cloudflare's. Neither knows about
the other. (The record names read oddly — `send.send`, `rsend.send` — because
the subdomain is already called `send`. They are correct.)

Set up from the terminal with two scoped credentials, both deleted after use: a
Cloudflare token limited to this zone (DNS:Edit + Email Routing Rules:Edit) and
a Resend full-access key. What the zone token could **not** do: enable Email
Routing on the zone, or add a destination address — those are account-level and
were done in the dashboard. `jaume.subirats@gmail.com` was already a verified
destination from years back, so no confirmation email was needed.

Region `eu-west-1`, so the mail stays in the EU like the Supabase project.

**Verified end to end** on the deployed site: a request through the live form
returned the receipt, and Resend reports the notification `delivered` to
`request@matchatonoki.com`, from `Matcha Tonoki <request@send.matchatonoki.com>`,
subject `Request — <business>`. Hitting reply answers the visitor, not the
robot: `reply_to` carries their address.

A local `dig` was useless throughout — Jaume's network answers DNS from a
different source than the one queried ("reply from unexpected source"). Check
propagation over DoH instead: `curl "https://dns.google/resolve?name=…&type=TXT"`.

The table is still the durable record; the email is only the doorbell. If the
notification ever stops arriving, requests keep landing in
`public.requests` — `select * from public.requests where status = 'new'`.

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

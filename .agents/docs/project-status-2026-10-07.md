# 2026-10-07 — Supabase Inactivity Keepalive via Vercel Cron

## The Problem

Every week Supabase sent an inactivity warning email:

> "To save on cloud resources I just did a scan of all our projects and identified
> those which have not seen sufficient activity for more than 7 days. Your project
> Matcha Tonoki (ID: yytzsqvphsdjlwlgkapl) from your organization was one of those
> and it is scheduled to be paused in the near future."

Supabase automatically pauses Free Tier databases after **7 days without database activity**.

In Matcha Tonoki, Supabase is only used as the persistent store for the wholesale/private
inquiry form on `/request` (table `public.requests`). If no customer submits a request
during a 7-day period, zero queries are sent to Supabase.

When paused:
1. Any prospective client submitting `/request` receives an error.
2. A guardian has to notice, log into the Supabase dashboard, and click "Unpause"
   (which takes several minutes to spin the database back up).
3. If unpaused isn't clicked within 90 days, the database is subject to permanent archival.

## Why Internal Solutions (pg_cron) Do Not Work

Supabase measures database activity through its incoming API gateway (Kong) and
connection pooler (PgBouncer). A PostgreSQL internal cron (`pg_cron`) runs inside
the database engine:
- If the database enters an inactive state, internal cron jobs may not register
  as external client activity on Supabase's monitoring infrastructure.
- More crucially, if the project is ever paused, the database instance is powered down,
  so internal `pg_cron` jobs stop completely and cannot wake it up.

Activity **must originate externally** to reset the inactivity timer.

## The Solution: Vercel Cron Heartbeat

Because `matchatonoki.com` is already hosted on Vercel and already holds `SUPABASE_URL`
and `SUPABASE_SERVICE_ROLE_KEY` across Production, Preview, and Development environments,
we can use Vercel's native Cron Jobs.

### 1. The Schedule (`vercel.json`)

Vercel Hobby plan supports cron jobs scheduled up to once per 24 hours. A daily ping
is more than enough to beat the 7-day inactivity clock (it guarantees Supabase sees
activity every 24 hours).

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "crons": [
    {
      "path": "/api/cron/keepalive",
      "schedule": "0 5 * * *"
    }
  ]
}
```

### 2. The Logic (`src/lib/server/supabase-keepalive.ts`)

Performs a lightweight `GET` query to PostgREST:

```sh
GET ${SUPABASE_URL}/rest/v1/${SUPABASE_REQUESTS_TABLE}?select=id&limit=1
```

Headers:
- `apikey: ${SUPABASE_SERVICE_ROLE_KEY}`
- `Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
- `Accept: application/json`

Why this query:
- `select=id&limit=1` instructs Postgres to execute a real `SELECT id FROM requests LIMIT 1;`.
- Whether `requests` contains 0 rows or 1,000 rows, it returns HTTP 200 with `[]` or
  `[{"id":"..."}]` within 20–50 ms.
- It never alters data (read-only).
- Uses the `SUPABASE_SERVICE_ROLE_KEY` to cleanly read regardless of RLS restrictions.

### 3. The Endpoint (`src/routes/api/cron/keepalive/+server.ts`)

- Receives Vercel's scheduled `GET` request.
- **Security**: If `CRON_SECRET` is set in Vercel environment variables, the route verifies
  `Authorization: Bearer ${CRON_SECRET}` (which Vercel automatically sends on cron invocations).
  If not yet configured in Vercel, the route runs without failing so it works out of the box.
- Returns `{ message: "Supabase keepalive ping successful", ok: true, table: "requests", durationMs: ..., timestamp: ... }`.

### 4. Verification & Testing

- Unit tests in `src/lib/server/supabase-keepalive.test.ts` test:
  - Header structure, URL format, `select=id&limit=1` parameter.
  - Success with rows and empty table.
  - Error propagation on non-2xx responses from Supabase.
- Unit tests in `src/routes/api/cron/keepalive/server.test.ts` test:
  - Default execution without `CRON_SECRET`.
  - Rejection with 401 when `CRON_SECRET` is configured and mismatched/missing.
  - Acceptance with 200 when `CRON_SECRET` matches.
  - Proper status code translation (502) on Supabase downtime.

All 20 test files (162 tests) pass and `npm run check` reports 0 errors.

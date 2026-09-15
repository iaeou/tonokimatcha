-- The table behind the form on /request.
--
-- Run it once in the Supabase SQL editor (project yytzsqvphsdjlwlgkapl).
-- It is written to be safe to run twice.
--
-- Security model, in one line: RLS is ON and there is NO policy, so the anon
-- and authenticated keys can neither read nor write this table. Only the
-- service-role key reaches it, and that key lives in the SvelteKit server
-- action ($lib/server, never shipped to the browser).

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- The three a guardian needs to answer.
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  message text not null check (char_length(message) between 10 and 4000),

  -- Volunteered, not required.
  phone text check (char_length(phone) <= 40),
  business text check (char_length(business) <= 160),

  -- Which form it came from, for when there is a second one.
  source text not null default 'request-page',

  -- Triage, for the guardian reading the table.
  status text not null default 'new' check (status in ('new', 'answered', 'archived')),
  notes text
);

comment on table public.requests is
  'Wholesale and private requests from /request. Written only by the SvelteKit server action with the service-role key.';

-- The inbox is read newest first; the open ones are read most often.
create index if not exists requests_created_at_idx on public.requests (created_at desc);
create index if not exists requests_status_idx on public.requests (status) where status = 'new';

alter table public.requests enable row level security;

-- Deliberately no policies. Adding one that lets `anon` insert would open a
-- write path that skips every check in the server action.

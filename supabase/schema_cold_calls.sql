-- Outbound prospecting tracker (cold calls, directory finds, referrals) — separate
-- from quote_requests/contact_messages, which are inbound leads that came to us.
-- This is for the reverse: prospects we're reaching out to first.

create table if not exists cold_calls (
  id bigint generated always as identity primary key,
  name text not null,
  company text,
  phone text not null,
  source text not null default 'cold_call' check (source in ('cold_call', 'directory', 'referral', 'linkedin', 'other')),
  status text not null default 'not_called' check (status in ('not_called', 'called', 'interested', 'follow_up', 'not_interested', 'converted')),
  notes text,
  follow_up_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cold_calls_status_idx on cold_calls(status);

alter table cold_calls enable row level security;

create policy "Authenticated full access on cold_calls" on cold_calls
  for all to authenticated using (true) with check (true);

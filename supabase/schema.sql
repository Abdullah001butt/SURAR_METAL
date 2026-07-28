-- Al Surur website lead capture schema
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query).

create table if not exists quote_requests (
  id bigint generated always as identity primary key,
  name text not null,
  company text not null,
  email text not null,
  phone text not null,
  product_interest text not null,
  message text,
  created_at timestamptz not null default now()
);

create table if not exists contact_messages (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- Row Level Security: the site uses Supabase's public "anon" key in the browser,
-- so RLS must restrict it to INSERT-only. No one can read/update/delete leads
-- through the public API — only via the Supabase dashboard (as the project owner).

alter table quote_requests enable row level security;
alter table contact_messages enable row level security;

create policy "Allow public inserts on quote_requests"
  on quote_requests for insert
  to anon
  with check (true);

create policy "Allow public inserts on contact_messages"
  on contact_messages for insert
  to anon
  with check (true);

-- No SELECT/UPDATE/DELETE policies are created for the anon role,
-- so submitted leads are write-only from the website's perspective.

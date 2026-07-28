-- Al Surur Management System — schema v2
-- Adds: document activity log, product stock/reorder tracking.
-- Run after schema_admin.sql.

-- ── Product stock tracking ───────────────────────────────────────────────────
alter table products add column if not exists stock_qty numeric(12,2) not null default 0;
alter table products add column if not exists reorder_level numeric(12,2) not null default 0;

-- ── Document activity log ────────────────────────────────────────────────────
create table if not exists document_activity (
  id bigint generated always as identity primary key,
  document_id bigint not null references documents(id) on delete cascade,
  event_type text not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists document_activity_document_id_idx on document_activity(document_id);

alter table document_activity enable row level security;

create policy "Authenticated full access on document_activity" on document_activity
  for all to authenticated using (true) with check (true);

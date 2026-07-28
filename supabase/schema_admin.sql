-- Al Surur Management System schema
-- Run this in the Supabase SQL editor AFTER schema.sql.
-- Adds: lead status/notes, customers, product catalog, documents (quotations/
-- invoices/tax invoices/delivery notes), document line items, and numbering
-- sequences. All new tables are locked to the "authenticated" role only —
-- the public website (anon key) can still insert leads but cannot see or
-- touch any of this.

-- ── Leads: add workflow columns ────────────────────────────────────────────
alter table quote_requests add column if not exists status text not null default 'new'
  check (status in ('new', 'contacted', 'quoted', 'won', 'lost'));
alter table quote_requests add column if not exists notes text;

alter table contact_messages add column if not exists status text not null default 'new'
  check (status in ('new', 'contacted', 'quoted', 'won', 'lost'));
alter table contact_messages add column if not exists notes text;

-- ── Customers ───────────────────────────────────────────────────────────────
create table if not exists customers (
  id bigint generated always as identity primary key,
  name text not null,
  phone text,
  address text,
  state_country text,
  trn_no text,
  created_at timestamptz not null default now()
);

-- ── Product catalog ─────────────────────────────────────────────────────────
create table if not exists products (
  id bigint generated always as identity primary key,
  item_code text,
  description text not null,
  unit text not null default 'pcs',
  default_unit_price numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

-- ── Document numbering ───────────────────────────────────────────────────────
-- Quotations use one range, invoices/tax invoices/delivery notes share another,
-- matching the existing paper trail (quotations ~0800s, the rest ~1200s+).
create sequence if not exists quotation_number_seq start with 822;
create sequence if not exists invoice_number_seq start with 1272;

-- Callable from the client (PostgREST) via supabase.rpc('nextval_public', ...)
-- since raw nextval() isn't directly exposed over the REST API.
create or replace function nextval_public(seq_name text)
returns bigint
language sql
security definer
set search_path = public
as $$
  select nextval(seq_name);
$$;

grant execute on function nextval_public(text) to authenticated;

-- ── Documents (quotation / invoice / tax_invoice / delivery_note) ──────────
create table if not exists documents (
  id bigint generated always as identity primary key,
  doc_number text not null unique,
  doc_type text not null check (doc_type in ('quotation', 'invoice', 'tax_invoice', 'delivery_note')),
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue')),
  customer_id bigint references customers(id) on delete set null,
  doc_date date not null default current_date,
  payment_terms text default '50% advance and 50% balance on completion',
  sales_consultant text,
  po_ref text,
  place_of_supply text,
  prepared_by text,
  approved_by text,
  delivery_note text,
  duration_note text,
  load_capacity text,
  validity_days integer default 10,
  discount numeric(12,2) not null default 0,
  vat_rate numeric(5,2) not null default 5,
  converted_from_id bigint references documents(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists document_items (
  id bigint generated always as identity primary key,
  document_id bigint not null references documents(id) on delete cascade,
  sr_no integer not null,
  item_code text,
  description text not null,
  weight numeric(12,2),
  qty numeric(12,2) not null default 1,
  unit text default 'pcs',
  unit_price numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists document_items_document_id_idx on document_items(document_id);
create index if not exists documents_customer_id_idx on documents(customer_id);
create index if not exists documents_doc_type_idx on documents(doc_type);

-- ── Row Level Security: authenticated (admin) users only ───────────────────
alter table customers enable row level security;
alter table products enable row level security;
alter table documents enable row level security;
alter table document_items enable row level security;

create policy "Authenticated full access on customers" on customers
  for all to authenticated using (true) with check (true);

create policy "Authenticated full access on products" on products
  for all to authenticated using (true) with check (true);

create policy "Authenticated full access on documents" on documents
  for all to authenticated using (true) with check (true);

create policy "Authenticated full access on document_items" on document_items
  for all to authenticated using (true) with check (true);

-- Leads: allow authenticated admins to read/update (anon keeps insert-only
-- from schema.sql — no changes needed there).
create policy "Authenticated read/update quote_requests" on quote_requests
  for select to authenticated using (true);
create policy "Authenticated update quote_requests" on quote_requests
  for update to authenticated using (true) with check (true);

create policy "Authenticated read/update contact_messages" on contact_messages
  for select to authenticated using (true);
create policy "Authenticated update contact_messages" on contact_messages
  for update to authenticated using (true) with check (true);

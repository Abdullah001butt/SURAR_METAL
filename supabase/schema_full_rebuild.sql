-- ============================================================================
-- Al Surur — FULL SCHEMA REBUILD for a brand-new Supabase project
-- Run this once, top to bottom, in Project → SQL Editor → New query.
-- Combines every migration from this project's history in dependency order.
-- ============================================================================

-- ── 1. Lead capture (public site forms) ─────────────────────────────────────
create table if not exists quote_requests (
  id bigint generated always as identity primary key,
  name text not null,
  company text,
  email text,
  phone text not null,
  product_interest text not null,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'won', 'lost')),
  notes text,
  source text not null default 'website',
  created_at timestamptz not null default now()
);

create table if not exists contact_messages (
  id bigint generated always as identity primary key,
  name text not null,
  email text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'won', 'lost')),
  notes text,
  created_at timestamptz not null default now()
);

alter table quote_requests enable row level security;
alter table contact_messages enable row level security;

create policy "Allow public inserts on quote_requests"
  on quote_requests for insert to anon with check (true);
create policy "Allow public inserts on contact_messages"
  on contact_messages for insert to anon with check (true);

create policy "Authenticated insert on quote_requests" on quote_requests
  for insert to authenticated with check (true);
create policy "Authenticated read/update quote_requests" on quote_requests
  for select to authenticated using (true);
create policy "Authenticated update quote_requests" on quote_requests
  for update to authenticated using (true) with check (true);

create policy "Authenticated read/update contact_messages" on contact_messages
  for select to authenticated using (true);
create policy "Authenticated update contact_messages" on contact_messages
  for update to authenticated using (true) with check (true);

-- ── 2. Customers, products, documents, document items ──────────────────────
create table if not exists customers (
  id bigint generated always as identity primary key,
  name text not null,
  phone text,
  address text,
  state_country text,
  trn_no text,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id bigint generated always as identity primary key,
  item_code text,
  description text not null,
  unit text not null default 'pcs',
  default_unit_price numeric(12,2) not null default 0,
  stock_qty numeric(12,2) not null default 0,
  reorder_level numeric(12,2) not null default 0,
  photo_url text,
  pdf_catalog_url text,
  specifications text,
  category text,
  moq numeric(12,2) not null default 1,
  created_at timestamptz not null default now()
);

create sequence if not exists quotation_number_seq start with 822;
create sequence if not exists invoice_number_seq start with 1272;

create or replace function nextval_public(seq_name text)
returns bigint
language sql
security definer
set search_path = public
as $$
  select nextval(seq_name);
$$;

grant execute on function nextval_public(text) to authenticated;

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
  cost_price numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists document_activity (
  id bigint generated always as identity primary key,
  document_id bigint not null references documents(id) on delete cascade,
  event_type text not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists document_items_document_id_idx on document_items(document_id);
create index if not exists documents_customer_id_idx on documents(customer_id);
create index if not exists documents_doc_type_idx on documents(doc_type);
create index if not exists document_activity_document_id_idx on document_activity(document_id);

alter table customers enable row level security;
alter table products enable row level security;
alter table documents enable row level security;
alter table document_items enable row level security;
alter table document_activity enable row level security;

create policy "Authenticated full access on customers" on customers
  for all to authenticated using (true) with check (true);
create policy "Authenticated full access on products" on products
  for all to authenticated using (true) with check (true);
create policy "Authenticated full access on documents" on documents
  for all to authenticated using (true) with check (true);
create policy "Authenticated full access on document_items" on document_items
  for all to authenticated using (true) with check (true);
create policy "Authenticated full access on document_activity" on document_activity
  for all to authenticated using (true) with check (true);

-- ── 3. Projects module ───────────────────────────────────────────────────────
create table if not exists projects (
  id bigint generated always as identity primary key,
  name text not null,
  client_id bigint references customers(id) on delete set null,
  status text not null default 'planning' check (status in ('planning', 'in_progress', 'on_hold', 'completed', 'cancelled')),
  progress_pct integer not null default 0 check (progress_pct >= 0 and progress_pct <= 100),
  budget numeric(14,2) not null default 0,
  deadline date,
  assigned_staff text,
  category text,
  photos text[] not null default '{}',
  documents jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_status_idx on projects(status);
create index if not exists projects_client_id_idx on projects(client_id);

alter table projects enable row level security;

create policy "Authenticated full access on projects" on projects
  for all to authenticated using (true) with check (true);

-- ── 4. Blog CMS ───────────────────────────────────────────────────────────────
create table if not exists blog_posts (
  id bigint generated always as identity primary key,
  slug text not null unique,
  title text not null,
  excerpt text not null,
  content text not null,
  cover_image text,
  meta_title text,
  meta_description text,
  keywords text,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_slug_idx on blog_posts(slug);
create index if not exists blog_posts_published_idx on blog_posts(published, published_at desc);

alter table blog_posts enable row level security;

create policy "Public read published posts" on blog_posts
  for select to anon using (published = true);
create policy "Authenticated full access on blog_posts" on blog_posts
  for all to authenticated using (true) with check (true);

-- ── 5. Storage buckets ────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public) values ('document-pdfs', 'document-pdfs', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('blog-images', 'blog-images', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('product-assets', 'product-assets', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('project-assets', 'project-assets', true) on conflict (id) do nothing;

create policy "Public read access on document-pdfs" on storage.objects for select to public using (bucket_id = 'document-pdfs');
create policy "Authenticated upload to document-pdfs" on storage.objects for insert to authenticated with check (bucket_id = 'document-pdfs');
create policy "Authenticated update on document-pdfs" on storage.objects for update to authenticated using (bucket_id = 'document-pdfs');

create policy "Public read access on blog-images" on storage.objects for select to public using (bucket_id = 'blog-images');
create policy "Authenticated upload to blog-images" on storage.objects for insert to authenticated with check (bucket_id = 'blog-images');

create policy "Public read access on product-assets" on storage.objects for select to public using (bucket_id = 'product-assets');
create policy "Authenticated upload to product-assets" on storage.objects for insert to authenticated with check (bucket_id = 'product-assets');
create policy "Authenticated update on product-assets" on storage.objects for update to authenticated using (bucket_id = 'product-assets');
create policy "Authenticated delete on product-assets" on storage.objects for delete to authenticated using (bucket_id = 'product-assets');

create policy "Public read access on project-assets" on storage.objects for select to public using (bucket_id = 'project-assets');
create policy "Authenticated upload to project-assets" on storage.objects for insert to authenticated with check (bucket_id = 'project-assets');
create policy "Authenticated update on project-assets" on storage.objects for update to authenticated using (bucket_id = 'project-assets');
create policy "Authenticated delete on project-assets" on storage.objects for delete to authenticated using (bucket_id = 'project-assets');

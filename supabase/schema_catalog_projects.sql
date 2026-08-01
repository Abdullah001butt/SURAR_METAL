-- Product Catalog upgrade: photos, PDF spec sheets, specifications, category, MOQ.
alter table products add column if not exists photo_url text;
alter table products add column if not exists pdf_catalog_url text;
alter table products add column if not exists specifications text;
alter table products add column if not exists category text;
alter table products add column if not exists moq numeric(12,2) not null default 1;

-- Projects module.
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

-- Storage buckets for product photos/PDFs and project photos/documents.
insert into storage.buckets (id, name, public)
values ('product-assets', 'product-assets', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('project-assets', 'project-assets', true)
on conflict (id) do nothing;

create policy "Public read access on product-assets"
on storage.objects for select to public using (bucket_id = 'product-assets');
create policy "Authenticated upload to product-assets"
on storage.objects for insert to authenticated with check (bucket_id = 'product-assets');
create policy "Authenticated update on product-assets"
on storage.objects for update to authenticated using (bucket_id = 'product-assets');
create policy "Authenticated delete on product-assets"
on storage.objects for delete to authenticated using (bucket_id = 'product-assets');

create policy "Public read access on project-assets"
on storage.objects for select to public using (bucket_id = 'project-assets');
create policy "Authenticated upload to project-assets"
on storage.objects for insert to authenticated with check (bucket_id = 'project-assets');
create policy "Authenticated update on project-assets"
on storage.objects for update to authenticated using (bucket_id = 'project-assets');
create policy "Authenticated delete on project-assets"
on storage.objects for delete to authenticated using (bucket_id = 'project-assets');

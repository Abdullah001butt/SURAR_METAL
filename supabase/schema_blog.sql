-- Blog CMS: real, editable articles for organic SEO traffic.
-- Public (anon) can read published posts only; authenticated admins have
-- full CRUD, matching the pattern used for customers/products/documents.

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
  for select to anon
  using (published = true);

create policy "Authenticated full access on blog_posts" on blog_posts
  for all to authenticated
  using (true) with check (true);

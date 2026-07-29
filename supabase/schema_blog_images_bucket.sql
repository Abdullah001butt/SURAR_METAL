-- Public storage bucket for blog article cover images.

insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

create policy "Public read access on blog-images"
on storage.objects for select
to public
using (bucket_id = 'blog-images');

create policy "Authenticated upload to blog-images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'blog-images');

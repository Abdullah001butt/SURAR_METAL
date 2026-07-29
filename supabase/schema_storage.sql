-- Storage bucket for generated document PDFs (quotations/invoices), shared
-- with customers via WhatsApp. Public read (so wa.me links work without
-- auth), authenticated-only write.

insert into storage.buckets (id, name, public)
values ('document-pdfs', 'document-pdfs', true)
on conflict (id) do nothing;

create policy "Public read access on document-pdfs"
on storage.objects for select
to public
using (bucket_id = 'document-pdfs');

create policy "Authenticated upload to document-pdfs"
on storage.objects for insert
to authenticated
with check (bucket_id = 'document-pdfs');

create policy "Authenticated update on document-pdfs"
on storage.objects for update
to authenticated
using (bucket_id = 'document-pdfs');

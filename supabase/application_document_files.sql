insert into storage.buckets (id, name, public)
values ('application-documents', 'application-documents', false)
on conflict (id) do update set public = false;

alter table public.application_documents
add column if not exists file_path text;

alter table public.application_documents
add column if not exists file_url text;

comment on column public.application_documents.file_path is
  'Private Supabase Storage path for a generated PDF version of the application document.';

create index if not exists application_documents_user_file_path_idx
  on public.application_documents (user_id, file_path)
  where file_path is not null;

drop policy if exists "Users can read own application document PDFs"
  on storage.objects;

create policy "Users can read own application document PDFs"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'application-documents'
  and (storage.foldername(name))[1] = 'application-documents'
  and (storage.foldername(name))[2] = auth.uid()::text
);

drop policy if exists "Users can upload own application document PDFs"
  on storage.objects;

create policy "Users can upload own application document PDFs"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'application-documents'
  and (storage.foldername(name))[1] = 'application-documents'
  and (storage.foldername(name))[2] = auth.uid()::text
  and lower(right(name, 4)) = '.pdf'
);

drop policy if exists "Users can update own application document PDFs"
  on storage.objects;

create policy "Users can update own application document PDFs"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'application-documents'
  and (storage.foldername(name))[1] = 'application-documents'
  and (storage.foldername(name))[2] = auth.uid()::text
)
with check (
  bucket_id = 'application-documents'
  and (storage.foldername(name))[1] = 'application-documents'
  and (storage.foldername(name))[2] = auth.uid()::text
  and lower(right(name, 4)) = '.pdf'
);

drop policy if exists "Users can delete own application document PDFs"
  on storage.objects;

create policy "Users can delete own application document PDFs"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'application-documents'
  and (storage.foldername(name))[1] = 'application-documents'
  and (storage.foldername(name))[2] = auth.uid()::text
);

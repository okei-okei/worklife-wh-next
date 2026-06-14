create table if not exists public.application_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_source text not null default 'saved' check (target_source in ('saved', 'public', 'manual')),
  target_type text not null check (target_type in ('job', 'property')),
  target_id uuid null,
  document_type text not null check (document_type in ('email', 'cover_letter', 'application_email', 'property_inquiry')),
  title text,
  content text not null,
  status text not null default 'draft',
  file_path text,
  file_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.application_documents is
  'Stores user-created application emails and cover letters linked to saved_jobs or saved_properties.';

comment on column public.application_documents.target_id is
  'When target_type is job, this references saved_jobs.id. When target_type is property, this references saved_properties.id. Conditional foreign keys are enforced by the application and RLS ownership checks.';

comment on column public.application_documents.file_path is
  'Private Supabase Storage path for a generated PDF version of the application document.';

create index if not exists application_documents_user_target_idx
  on public.application_documents (user_id, target_source, target_type, target_id);

create index if not exists application_documents_user_document_idx
  on public.application_documents (user_id, document_type, status, created_at desc);

create index if not exists application_documents_user_file_path_idx
  on public.application_documents (user_id, file_path)
  where file_path is not null;

create or replace function public.set_application_documents_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_application_documents_updated_at
  on public.application_documents;

create trigger set_application_documents_updated_at
before update on public.application_documents
for each row
execute function public.set_application_documents_updated_at();

alter table public.application_documents enable row level security;

drop policy if exists "Users can read own application documents"
  on public.application_documents;

create policy "Users can read own application documents"
on public.application_documents
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own application documents"
  on public.application_documents;

create policy "Users can insert own application documents"
on public.application_documents
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own application documents"
  on public.application_documents;

create policy "Users can update own application documents"
on public.application_documents
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own application documents"
  on public.application_documents;

create policy "Users can delete own application documents"
on public.application_documents
for delete
to authenticated
using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do update set public = false;

create table if not exists public.resume_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_url text,
  created_at timestamptz default now()
);

comment on table public.resume_files is
  'Stores metadata for user-uploaded resume PDF files in the private resumes storage bucket.';

create index if not exists resume_files_user_created_at_idx
  on public.resume_files (user_id, created_at desc);

alter table public.resume_files enable row level security;

drop policy if exists "Users can read own resume files" on public.resume_files;
create policy "Users can read own resume files"
on public.resume_files
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own resume files" on public.resume_files;
create policy "Users can insert own resume files"
on public.resume_files
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own resume files" on public.resume_files;
create policy "Users can delete own resume files"
on public.resume_files
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can update own resume files" on public.resume_files;
create policy "Users can update own resume files"
on public.resume_files
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can read own resume PDFs" on storage.objects;
create policy "Users can read own resume PDFs"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = 'resumes'
  and (storage.foldername(name))[2] = auth.uid()::text
);

drop policy if exists "Users can upload own resume PDFs" on storage.objects;
create policy "Users can upload own resume PDFs"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = 'resumes'
  and (storage.foldername(name))[2] = auth.uid()::text
  and lower(right(name, 4)) = '.pdf'
);

drop policy if exists "Users can update own resume PDFs" on storage.objects;
create policy "Users can update own resume PDFs"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = 'resumes'
  and (storage.foldername(name))[2] = auth.uid()::text
)
with check (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = 'resumes'
  and (storage.foldername(name))[2] = auth.uid()::text
  and lower(right(name, 4)) = '.pdf'
);

drop policy if exists "Users can delete own resume PDFs" on storage.objects;
create policy "Users can delete own resume PDFs"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = 'resumes'
  and (storage.foldername(name))[2] = auth.uid()::text
);

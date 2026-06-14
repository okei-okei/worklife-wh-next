alter table public.application_documents
add column if not exists target_source text not null default 'saved';

alter table public.application_documents
alter column target_id drop not null;

alter table public.application_documents
add column if not exists status text not null default 'draft';

alter table public.application_documents
add column if not exists file_path text;

alter table public.application_documents
add column if not exists file_url text;

do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select conname
    from pg_constraint
    where conrelid = 'public.application_documents'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%target_source%'
  loop
    execute format(
      'alter table public.application_documents drop constraint %I',
      constraint_name
    );
  end loop;
end $$;

alter table public.application_documents
add constraint application_documents_target_source_check
check (target_source in ('saved', 'public', 'manual'));

do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select conname
    from pg_constraint
    where conrelid = 'public.application_documents'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%document_type%'
  loop
    execute format(
      'alter table public.application_documents drop constraint %I',
      constraint_name
    );
  end loop;
end $$;

alter table public.application_documents
add constraint application_documents_document_type_check
check (
  document_type in (
    'email',
    'cover_letter',
    'application_email',
    'property_inquiry'
  )
);

do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select conname
    from pg_constraint
    where conrelid = 'public.application_documents'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%target_type%'
  loop
    execute format(
      'alter table public.application_documents drop constraint %I',
      constraint_name
    );
  end loop;
end $$;

alter table public.application_documents
add constraint application_documents_target_type_check
check (target_type in ('job', 'property'));

create index if not exists application_documents_user_target_idx
  on public.application_documents (
    user_id,
    target_source,
    target_type,
    target_id
  );

create index if not exists application_documents_user_document_idx
  on public.application_documents (
    user_id,
    document_type,
    status,
    created_at desc
  );

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

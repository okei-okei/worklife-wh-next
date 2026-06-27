-- Restore WorkLife WH saved_jobs table if it was accidentally deleted.
-- Run this in Supabase SQL Editor.

create table if not exists public.saved_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  company text null,
  url text null,
  apply_url text null,
  location text null,
  address text null,
  country_code text null default 'NZ',
  region text null,
  district text null,
  city text null,
  suburb text null,
  area text null,
  hourly_rate numeric null,
  hourly_rate_min numeric null,
  hourly_rate_max numeric null,
  work_hours numeric null,
  weekly_hours numeric null,
  employment_type text null,
  accommodation_available boolean null,
  japanese_ok boolean null,
  english_level text null,
  visa_conditions text null,
  visa_support boolean null,
  start_date date null,
  image_url text null,
  image_urls jsonb not null default '[]'::jsonb,
  status text null default '気になる',
  source_type text null default 'manual',
  public_job_id uuid null,
  latitude double precision null,
  longitude double precision null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.saved_jobs
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists title text,
  add column if not exists company text,
  add column if not exists url text,
  add column if not exists apply_url text,
  add column if not exists location text,
  add column if not exists address text,
  add column if not exists country_code text default 'NZ',
  add column if not exists region text,
  add column if not exists district text,
  add column if not exists city text,
  add column if not exists suburb text,
  add column if not exists area text,
  add column if not exists hourly_rate numeric,
  add column if not exists hourly_rate_min numeric,
  add column if not exists hourly_rate_max numeric,
  add column if not exists work_hours numeric,
  add column if not exists weekly_hours numeric,
  add column if not exists employment_type text,
  add column if not exists accommodation_available boolean,
  add column if not exists japanese_ok boolean,
  add column if not exists english_level text,
  add column if not exists visa_conditions text,
  add column if not exists visa_support boolean,
  add column if not exists start_date date,
  add column if not exists image_url text,
  add column if not exists image_urls jsonb not null default '[]'::jsonb,
  add column if not exists status text default '気になる',
  add column if not exists source_type text default 'manual',
  add column if not exists public_job_id uuid,
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if to_regclass('public.public_jobs') is not null
    and not exists (
      select 1
      from pg_constraint
      where conname = 'saved_jobs_public_job_id_fkey'
        and conrelid = 'public.saved_jobs'::regclass
    )
  then
    alter table public.saved_jobs
      add constraint saved_jobs_public_job_id_fkey
      foreign key (public_job_id)
      references public.public_jobs(id)
      on delete set null;
  end if;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists saved_jobs_set_updated_at on public.saved_jobs;
create trigger saved_jobs_set_updated_at
before update on public.saved_jobs
for each row execute function public.set_updated_at();

create index if not exists saved_jobs_user_id_idx
on public.saved_jobs (user_id);

create index if not exists saved_jobs_user_status_idx
on public.saved_jobs (user_id, status);

create index if not exists saved_jobs_region_district_idx
on public.saved_jobs (user_id, region, district);

create index if not exists saved_jobs_public_job_id_idx
on public.saved_jobs (public_job_id);

create unique index if not exists saved_jobs_user_url_unique_idx
on public.saved_jobs (user_id, url)
where url is not null;

create unique index if not exists saved_jobs_user_public_job_id_idx
on public.saved_jobs (user_id, public_job_id)
where public_job_id is not null;

alter table public.saved_jobs enable row level security;

grant select, insert, update, delete on public.saved_jobs to authenticated;

drop policy if exists "Users can view own jobs" on public.saved_jobs;
create policy "Users can view own jobs"
on public.saved_jobs
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own jobs" on public.saved_jobs;
create policy "Users can insert own jobs"
on public.saved_jobs
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own jobs" on public.saved_jobs;
create policy "Users can update own jobs"
on public.saved_jobs
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own jobs" on public.saved_jobs;
create policy "Users can delete own jobs"
on public.saved_jobs
for delete
to authenticated
using (auth.uid() = user_id);

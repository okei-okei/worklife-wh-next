create table if not exists public_jobs (
  id uuid primary key default gen_random_uuid(),
  source_submission_id uuid null references listing_submissions(id) on delete set null,
  title text not null,
  company text null,
  city text null,
  address text null,
  hourly_rate numeric null,
  work_hours integer null,
  description text null,
  visa_support boolean not null default false,
  japanese_ok boolean not null default false,
  accommodation_available boolean not null default false,
  apply_url text null,
  contact_email text null,
  country text not null default 'NZ',
  latitude double precision null,
  longitude double precision null,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  unique (source_submission_id)
);

create table if not exists public_properties (
  id uuid primary key default gen_random_uuid(),
  source_submission_id uuid null references listing_submissions(id) on delete set null,
  title text not null,
  owner_name text null,
  contact_email text null,
  city text null,
  area text null,
  address text null,
  rent_weekly numeric null,
  description text null,
  url text null,
  country text not null default 'NZ',
  latitude double precision null,
  longitude double precision null,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  unique (source_submission_id)
);

alter table public_jobs add column if not exists source_submission_id uuid null references listing_submissions(id) on delete set null;
alter table public_jobs add column if not exists company text null;
alter table public_jobs add column if not exists city text null;
alter table public_jobs add column if not exists address text null;
alter table public_jobs add column if not exists hourly_rate numeric null;
alter table public_jobs add column if not exists work_hours integer null;
alter table public_jobs add column if not exists description text null;
alter table public_jobs add column if not exists visa_support boolean not null default false;
alter table public_jobs add column if not exists japanese_ok boolean not null default false;
alter table public_jobs add column if not exists accommodation_available boolean not null default false;
alter table public_jobs add column if not exists apply_url text null;
alter table public_jobs add column if not exists contact_email text null;
alter table public_jobs add column if not exists country text not null default 'NZ';
alter table public_jobs add column if not exists latitude double precision null;
alter table public_jobs add column if not exists longitude double precision null;
alter table public_jobs add column if not exists is_active boolean not null default true;
alter table public_jobs add column if not exists created_at timestamp with time zone not null default now();

alter table public_properties add column if not exists source_submission_id uuid null references listing_submissions(id) on delete set null;
alter table public_properties add column if not exists owner_name text null;
alter table public_properties add column if not exists contact_email text null;
alter table public_properties add column if not exists city text null;
alter table public_properties add column if not exists area text null;
alter table public_properties add column if not exists address text null;
alter table public_properties add column if not exists rent_weekly numeric null;
alter table public_properties add column if not exists description text null;
alter table public_properties add column if not exists url text null;
alter table public_properties add column if not exists country text not null default 'NZ';
alter table public_properties add column if not exists latitude double precision null;
alter table public_properties add column if not exists longitude double precision null;
alter table public_properties add column if not exists is_active boolean not null default true;
alter table public_properties add column if not exists created_at timestamp with time zone not null default now();

create unique index if not exists public_jobs_source_submission_id_key
on public_jobs (source_submission_id)
where source_submission_id is not null;

create unique index if not exists public_properties_source_submission_id_key
on public_properties (source_submission_id)
where source_submission_id is not null;

create index if not exists public_jobs_active_created_at_idx
on public_jobs (is_active, created_at desc);

create index if not exists public_properties_active_created_at_idx
on public_properties (is_active, created_at desc);

alter table public_jobs enable row level security;
alter table public_properties enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public_jobs to anon, authenticated;
grant select on public_properties to anon, authenticated;

drop policy if exists "Anyone can view active public jobs" on public_jobs;
create policy "Anyone can view active public jobs"
on public_jobs
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Anyone can view active public properties" on public_properties;
create policy "Anyone can view active public properties"
on public_properties
for select
to anon, authenticated
using (is_active = true);

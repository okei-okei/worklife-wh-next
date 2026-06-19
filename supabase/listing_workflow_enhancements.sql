-- WorkLife WH listing submission, public listing, location, and image fields.
-- Run in Supabase SQL Editor before using the expanded submission form.

alter table public.listing_submissions
  add column if not exists submitted_by uuid references auth.users(id) on delete set null,
  add column if not exists country_code text not null default 'NZ',
  add column if not exists region text,
  add column if not exists district text,
  add column if not exists suburb text,
  add column if not exists area text,
  add column if not exists structured_data jsonb not null default '{}'::jsonb,
  add column if not exists image_urls jsonb not null default '[]'::jsonb,
  add column if not exists consent_versions jsonb not null default '{}'::jsonb,
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by uuid references auth.users(id) on delete set null,
  add column if not exists rejected_reason text;

alter table public.listing_submissions
  drop constraint if exists listing_submissions_status_check;

alter table public.listing_submissions
  add constraint listing_submissions_status_check
  check (status in ('pending', 'approved', 'rejected'));

alter table public.public_jobs
  add column if not exists country_code text not null default 'NZ',
  add column if not exists region text,
  add column if not exists district text,
  add column if not exists suburb text,
  add column if not exists area text,
  add column if not exists employment_type text,
  add column if not exists hourly_rate_min numeric,
  add column if not exists hourly_rate_max numeric,
  add column if not exists weekly_hours integer,
  add column if not exists start_date date,
  add column if not exists image_url text;

alter table public.public_properties
  add column if not exists country_code text not null default 'NZ',
  add column if not exists region text,
  add column if not exists district text,
  add column if not exists suburb text,
  add column if not exists bedrooms numeric,
  add column if not exists bathrooms numeric,
  add column if not exists parking_spaces numeric,
  add column if not exists available_from date,
  add column if not exists pets_allowed boolean not null default false,
  add column if not exists furnished boolean not null default false,
  add column if not exists bills_included boolean not null default false,
  add column if not exists image_urls jsonb not null default '[]'::jsonb;

create index if not exists public_jobs_location_idx
on public.public_jobs (country_code, region, district);

create index if not exists public_properties_location_idx
on public.public_properties (country_code, region, district);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-images',
  'listing-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can upload listing images"
on storage.objects;
create policy "Anyone can upload listing images"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'listing-images');

drop policy if exists "Public can read listing images"
on storage.objects;
create policy "Public can read listing images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'listing-images');

-- Optional role field for future admin/owner checks.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists role text not null default 'user';

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('user', 'admin', 'owner', 'moderator'));

-- WorkLife WH location management additive setup.
-- Safe to run from Supabase SQL Editor. This does not rewrite existing listings.

create extension if not exists pgcrypto;

create table if not exists public.nz_locations (
  id uuid primary key default gen_random_uuid(),
  linz_id text unique,
  country_code text not null default 'NZ',
  region text not null,
  territorial_authority text not null,
  major_name text,
  suburb_locality text not null,
  additional_names text[] not null default '{}',
  is_active boolean not null default true,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.nz_locations
  add column if not exists location_key text,
  add column if not exists display_order integer not null default 0,
  add column if not exists created_by uuid null references auth.users(id);

create unique index if not exists nz_locations_location_key_unique
  on public.nz_locations(location_key)
  where location_key is not null;

create index if not exists nz_locations_three_level_idx
  on public.nz_locations (
    lower(trim(region)),
    lower(trim(coalesce(major_name, territorial_authority))),
    lower(trim(suburb_locality))
  );

create index if not exists nz_locations_active_region_idx
  on public.nz_locations(is_active, region, major_name, suburb_locality);

alter table public.nz_locations enable row level security;

grant usage on schema public to anon, authenticated, service_role;
grant select on public.nz_locations to anon, authenticated, service_role;
grant insert on public.nz_locations to authenticated, service_role;
revoke update on public.nz_locations from authenticated;
grant all privileges on public.nz_locations to service_role;

drop policy if exists "Allow public read active nz locations" on public.nz_locations;
drop policy if exists "Admins manage nz locations" on public.nz_locations;
drop policy if exists "Admins can select all nz locations" on public.nz_locations;
drop policy if exists "Admins can insert nz locations" on public.nz_locations;
drop policy if exists "Admins can update nz locations" on public.nz_locations;

create policy "Allow public read active nz locations"
on public.nz_locations
for select
to public
using (is_active = true);

create policy "Admins can select all nz locations"
on public.nz_locations
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'owner')
  )
);

create policy "Admins can insert nz locations"
on public.nz_locations
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'owner')
  )
);

-- If profiles does not have readable admin role policy/grant in your project yet,
-- admin policies that check profiles.role can fail before they reach nz_locations.
grant select on public.profiles to authenticated, service_role;

create table if not exists public.location_options (
  id uuid primary key default gen_random_uuid(),
  level text not null check (level in ('region', 'city_district', 'locality')),
  name text not null,
  parent_region text null,
  parent_city_district text null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid null references auth.users(id)
);

create index if not exists location_options_lookup_idx
  on public.location_options(level, parent_region, parent_city_district, name)
  where is_active = true;

alter table public.location_options enable row level security;

grant select on public.location_options to anon, authenticated, service_role;
grant insert on public.location_options to authenticated, service_role;
grant all privileges on public.location_options to service_role;

drop policy if exists "Allow public read active location options" on public.location_options;
drop policy if exists "Admins can insert location options" on public.location_options;
drop policy if exists "Admins can update location options" on public.location_options;
drop policy if exists "Admins can delete location options" on public.location_options;

create policy "Allow public read active location options"
on public.location_options
for select
to public
using (is_active = true);

create policy "Admins can insert location options"
on public.location_options
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'owner')
  )
);

alter table public.public_jobs
  add column if not exists location_master_id uuid null references public.nz_locations(id),
  add column if not exists region_normalized text,
  add column if not exists territorial_authority_normalized text,
  add column if not exists major_name_normalized text,
  add column if not exists suburb_locality_normalized text,
  add column if not exists custom_locality text;

alter table public.public_properties
  add column if not exists location_master_id uuid null references public.nz_locations(id),
  add column if not exists region_normalized text,
  add column if not exists territorial_authority_normalized text,
  add column if not exists major_name_normalized text,
  add column if not exists suburb_locality_normalized text,
  add column if not exists custom_locality text;

alter table public.saved_jobs
  add column if not exists location_master_id uuid null references public.nz_locations(id),
  add column if not exists region_normalized text,
  add column if not exists territorial_authority_normalized text,
  add column if not exists major_name_normalized text,
  add column if not exists suburb_locality_normalized text,
  add column if not exists custom_locality text;

alter table public.saved_properties
  add column if not exists location_master_id uuid null references public.nz_locations(id),
  add column if not exists region_normalized text,
  add column if not exists territorial_authority_normalized text,
  add column if not exists major_name_normalized text,
  add column if not exists suburb_locality_normalized text,
  add column if not exists custom_locality text;

alter table public.listing_submissions
  add column if not exists location_master_id uuid null references public.nz_locations(id),
  add column if not exists region_normalized text,
  add column if not exists territorial_authority_normalized text,
  add column if not exists major_name_normalized text,
  add column if not exists suburb_locality_normalized text,
  add column if not exists custom_locality text;

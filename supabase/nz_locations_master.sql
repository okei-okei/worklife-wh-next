-- Phase 1/2 additive migration for NZ Area / Suburb / Locality master.
-- Safe rules:
-- - no existing rows are updated
-- - no columns are dropped
-- - no existing address/location/region/city/suburb values are overwritten
-- - all listing references are nullable and use on delete set null

create extension if not exists pg_trgm;

create table if not exists public.nz_locations (
  id uuid primary key default gen_random_uuid(),
  linz_id text unique,
  country_code text not null default 'NZ',
  region text,
  territorial_authority text,
  major_name text,
  suburb_locality text not null,
  additional_names text[] not null default '{}',
  latitude double precision,
  longitude double precision,
  search_text text not null,
  is_active boolean not null default true,
  source text not null default 'LINZ',
  source_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists nz_locations_region_idx
  on public.nz_locations (region);

create index if not exists nz_locations_territorial_authority_idx
  on public.nz_locations (territorial_authority);

create index if not exists nz_locations_major_name_idx
  on public.nz_locations (major_name);

create index if not exists nz_locations_suburb_locality_idx
  on public.nz_locations (suburb_locality);

create index if not exists nz_locations_search_text_trgm_idx
  on public.nz_locations using gin (search_text gin_trgm_ops);

alter table public.nz_locations enable row level security;

drop policy if exists "Public can read active NZ locations" on public.nz_locations;
create policy "Public can read active NZ locations"
on public.nz_locations
for select
to public
using (is_active = true);

drop policy if exists "Admins can manage NZ locations" on public.nz_locations;
create policy "Admins can manage NZ locations"
on public.nz_locations
for all
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'owner')
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'owner')
  )
);

do $$
declare
  target_table text;
begin
  foreach target_table in array array[
    'saved_jobs',
    'saved_properties',
    'public_jobs',
    'public_properties',
    'listing_submissions'
  ]
  loop
    if to_regclass(format('public.%I', target_table)) is not null then
      execute format('alter table public.%I add column if not exists location_master_id uuid null references public.nz_locations(id) on delete set null', target_table);
      execute format('alter table public.%I add column if not exists region_normalized text null', target_table);
      execute format('alter table public.%I add column if not exists territorial_authority_normalized text null', target_table);
      execute format('alter table public.%I add column if not exists major_name_normalized text null', target_table);
      execute format('alter table public.%I add column if not exists suburb_locality_normalized text null', target_table);
      execute format('create index if not exists %I on public.%I (location_master_id)', target_table || '_location_master_id_idx', target_table);
      execute format('create index if not exists %I on public.%I (region_normalized)', target_table || '_region_normalized_idx', target_table);
      execute format('create index if not exists %I on public.%I (territorial_authority_normalized)', target_table || '_ta_normalized_idx', target_table);
      execute format('create index if not exists %I on public.%I (suburb_locality_normalized)', target_table || '_suburb_locality_normalized_idx', target_table);
    end if;
  end loop;
end $$;

insert into public.nz_locations (
  linz_id,
  country_code,
  region,
  territorial_authority,
  major_name,
  suburb_locality,
  additional_names,
  search_text,
  source
) values (
  'seed-hornby-christchurch',
  'NZ',
  'Canterbury',
  'Christchurch City',
  'Christchurch',
  'Hornby',
  array['Hornby Christchurch', 'Christchurch Hornby'],
  lower('Canterbury Christchurch City Christchurch Hornby Hornby Christchurch Christchurch Hornby New Zealand NZ'),
  'seed'
) on conflict (linz_id) do update
set
  is_active = true,
  updated_at = now();

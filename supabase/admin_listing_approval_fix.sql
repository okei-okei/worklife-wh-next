-- WorkLife WH listing approval safety checks and minimal service_role grants.
-- This migration is additive only. It does not delete data, rewrite IDs,
-- disable RLS, or change UUID columns to text.

grant usage on schema public to service_role;

grant select, insert, update
on table public.public_jobs
to service_role;

grant select, insert, update
on table public.public_properties
to service_role;

grant select, update
on table public.listing_submissions
to service_role;

-- Safe diagnostics for the live Supabase SQL Editor:
-- UUID columns and defaults
select
  table_name,
  column_name,
  data_type,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in (
    'listing_submissions',
    'public_jobs',
    'public_properties'
  )
  and data_type = 'uuid'
order by table_name, ordinal_position;

-- Table grants
select
  grantee,
  table_name,
  privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in (
    'listing_submissions',
    'public_jobs',
    'public_properties'
  )
order by grantee, table_name, privilege_type;

-- RLS status
select
  schemaname,
  tablename,
  rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'listing_submissions',
    'public_jobs',
    'public_properties'
  );

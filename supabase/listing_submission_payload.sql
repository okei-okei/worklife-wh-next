-- WorkLife WH listing submission payload preservation.
-- Additive only: this does not delete, rename, rewrite, or backfill existing rows.
-- Run in Supabase SQL Editor before relying on the expanded review workflow.

alter table public.listing_submissions
  add column if not exists submission_payload jsonb not null default '{}'::jsonb,
  add column if not exists phone text null,
  add column if not exists contact_name text null,
  add column if not exists latitude double precision null,
  add column if not exists longitude double precision null,
  add column if not exists hourly_rate numeric null,
  add column if not exists work_hours numeric null,
  add column if not exists rent_weekly numeric null,
  add column if not exists utilities_included boolean null,
  add column if not exists available_from date null,
  add column if not exists employment_type text null,
  add column if not exists property_type text null,
  add column if not exists reviewed_at timestamptz null,
  add column if not exists reviewed_by uuid null references auth.users(id) on delete set null,
  add column if not exists review_note text null,
  add column if not exists published_record_id uuid null,
  add column if not exists published_table text null,
  add column if not exists updated_at timestamptz null;

create index if not exists listing_submissions_submission_payload_gin_idx
on public.listing_submissions using gin (submission_payload);

create index if not exists listing_submissions_review_status_idx
on public.listing_submissions (type, status, created_at desc);

-- Ensure public listing tables can receive all fields currently used by approval mapping.
alter table public.public_jobs
  add column if not exists country_code text null default 'NZ',
  add column if not exists region text null,
  add column if not exists district text null,
  add column if not exists suburb text null,
  add column if not exists area text null,
  add column if not exists location_master_id uuid null,
  add column if not exists region_normalized text null,
  add column if not exists territorial_authority_normalized text null,
  add column if not exists major_name_normalized text null,
  add column if not exists suburb_locality_normalized text null,
  add column if not exists custom_locality text null,
  add column if not exists location_source text null,
  add column if not exists location_review_status text null,
  add column if not exists employment_type text null,
  add column if not exists hourly_rate_min numeric null,
  add column if not exists hourly_rate_max numeric null,
  add column if not exists weekly_hours numeric null,
  add column if not exists start_date date null,
  add column if not exists english_level text null,
  add column if not exists visa_conditions text null,
  add column if not exists application_method text null,
  add column if not exists image_url text null;

alter table public.public_properties
  add column if not exists country_code text null default 'NZ',
  add column if not exists region text null,
  add column if not exists district text null,
  add column if not exists suburb text null,
  add column if not exists location_master_id uuid null,
  add column if not exists region_normalized text null,
  add column if not exists territorial_authority_normalized text null,
  add column if not exists major_name_normalized text null,
  add column if not exists suburb_locality_normalized text null,
  add column if not exists custom_locality text null,
  add column if not exists location_source text null,
  add column if not exists location_review_status text null,
  add column if not exists bedrooms numeric null,
  add column if not exists bathrooms numeric null,
  add column if not exists parking_spaces numeric null,
  add column if not exists available_from date null,
  add column if not exists pets_allowed boolean null,
  add column if not exists smoking_allowed boolean null,
  add column if not exists furnished boolean null,
  add column if not exists bills_included boolean null,
  add column if not exists utilities_included boolean null,
  add column if not exists inquiry_method text null;


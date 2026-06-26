-- Saved listing detail columns used by public-listing saves and mypage edit forms.
-- Safe to run multiple times.

alter table if exists public.saved_jobs
  add column if not exists company text,
  add column if not exists location text,
  add column if not exists employment_type text,
  add column if not exists hourly_rate_min numeric,
  add column if not exists hourly_rate_max numeric,
  add column if not exists weekly_hours numeric,
  add column if not exists accommodation_available boolean null,
  add column if not exists japanese_ok boolean null,
  add column if not exists english_level text,
  add column if not exists visa_conditions text,
  add column if not exists start_date date,
  add column if not exists apply_url text,
  add column if not exists source_type text default 'manual',
  add column if not exists public_job_id uuid null references public.public_jobs(id) on delete set null;

alter table if exists public.saved_properties
  add column if not exists location text,
  add column if not exists bedrooms numeric,
  add column if not exists bathrooms numeric,
  add column if not exists parking_spaces numeric,
  add column if not exists available_from date,
  add column if not exists utilities_included boolean null,
  add column if not exists bills_included boolean null,
  add column if not exists pets_allowed boolean null,
  add column if not exists smoking_allowed boolean null,
  add column if not exists image_urls jsonb not null default '[]'::jsonb,
  add column if not exists inquiry_url text,
  add column if not exists source_type text default 'manual',
  add column if not exists public_property_id uuid null references public.public_properties(id) on delete set null;

create index if not exists saved_jobs_public_job_id_idx
on public.saved_jobs (public_job_id);

create index if not exists saved_properties_public_property_id_idx
on public.saved_properties (public_property_id);

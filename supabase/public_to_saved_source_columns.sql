alter table public.saved_jobs
add column if not exists company text null,
add column if not exists apply_url text null,
add column if not exists source_type text null default 'manual',
add column if not exists public_job_id uuid null references public.public_jobs(id) on delete set null;

alter table public.saved_properties
add column if not exists inquiry_url text null,
add column if not exists source_type text null default 'manual',
add column if not exists public_property_id uuid null references public.public_properties(id) on delete set null;

create index if not exists saved_jobs_public_job_id_idx
on public.saved_jobs (public_job_id);

create index if not exists saved_properties_public_property_id_idx
on public.saved_properties (public_property_id);

create index if not exists saved_jobs_user_public_job_id_idx
on public.saved_jobs (user_id, public_job_id);

create index if not exists saved_properties_user_public_property_id_idx
on public.saved_properties (user_id, public_property_id);

-- Existing RLS policies for saved_jobs / saved_properties remain valid:
-- users can only select, insert, update, and delete rows where user_id = auth.uid().
-- These columns only record whether a saved item originated from public listings.

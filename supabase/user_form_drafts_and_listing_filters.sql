create table if not exists public.user_form_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  draft_type text not null check (
    draft_type in ('job_application', 'property_inquiry')
  ),
  form_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, draft_type)
);

alter table public.user_form_drafts enable row level security;

drop policy if exists "Users can view own form drafts" on public.user_form_drafts;
create policy "Users can view own form drafts"
on public.user_form_drafts
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own form drafts" on public.user_form_drafts;
create policy "Users can insert own form drafts"
on public.user_form_drafts
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own form drafts" on public.user_form_drafts;
create policy "Users can update own form drafts"
on public.user_form_drafts
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own form drafts" on public.user_form_drafts;
create policy "Users can delete own form drafts"
on public.user_form_drafts
for delete
using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_form_drafts_set_updated_at on public.user_form_drafts;
create trigger user_form_drafts_set_updated_at
before update on public.user_form_drafts
for each row execute function public.set_updated_at();

alter table public.public_jobs
add column if not exists region text null,
add column if not exists district text null,
add column if not exists employment_type text null,
add column if not exists english_level text null,
add column if not exists remote_available boolean not null default false;

alter table public.public_properties
add column if not exists region text null,
add column if not exists district text null,
add column if not exists room_type text null,
add column if not exists available_from date null,
add column if not exists furnished boolean not null default false,
add column if not exists bills_included boolean not null default false,
add column if not exists bedrooms numeric null,
add column if not exists bathrooms numeric null,
add column if not exists parking_spaces numeric null,
add column if not exists pets_allowed boolean not null default false;

alter table public.saved_jobs
add column if not exists region text null,
add column if not exists district text null;

alter table public.saved_properties
add column if not exists region text null,
add column if not exists district text null;

create index if not exists public_jobs_region_district_idx
on public.public_jobs (region, district);

create index if not exists public_properties_region_district_idx
on public.public_properties (region, district);

create index if not exists saved_jobs_region_district_idx
on public.saved_jobs (user_id, region, district);

create index if not exists saved_properties_region_district_idx
on public.saved_properties (user_id, region, district);

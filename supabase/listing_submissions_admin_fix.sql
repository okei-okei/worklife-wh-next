-- Listing submission admin and map/filter enhancements.
-- Run this in Supabase SQL Editor if admin review shows:
-- "permission denied for table listing_submissions".

alter table public.listing_submissions
add column if not exists submitted_by uuid null references auth.users(id) on delete set null,
add column if not exists country_code text null default 'NZ',
add column if not exists region text null,
add column if not exists district text null,
add column if not exists suburb text null,
add column if not exists area text null,
add column if not exists address text null,
add column if not exists structured_data jsonb not null default '{}'::jsonb,
add column if not exists image_urls text[] not null default '{}'::text[],
add column if not exists consent_versions jsonb not null default '{}'::jsonb,
add column if not exists approved_at timestamptz null,
add column if not exists approved_by uuid null references auth.users(id) on delete set null,
add column if not exists rejected_reason text null;

alter table public.public_jobs
add column if not exists japanese_ok boolean not null default false,
add column if not exists english_level text null,
add column if not exists visa_conditions text null,
add column if not exists application_method text null,
add column if not exists visa_support boolean not null default false,
add column if not exists address text null,
add column if not exists latitude double precision null,
add column if not exists longitude double precision null;

alter table public.public_properties
add column if not exists address text null,
add column if not exists inquiry_method text null,
add column if not exists latitude double precision null,
add column if not exists longitude double precision null;

grant usage on schema public to anon, authenticated;
grant select on public.profiles to authenticated;
grant select, insert, update on public.listing_submissions to authenticated;
grant insert on public.listing_submissions to anon;
grant insert, update on public.public_jobs to authenticated;
grant insert, update on public.public_properties to authenticated;

drop policy if exists "Anyone can submit listing applications" on public.listing_submissions;
create policy "Anyone can submit listing applications"
on public.listing_submissions
for insert
to anon, authenticated
with check (
  status = 'pending'
  and (
    user_id is null
    or auth.uid() = user_id
  )
);

drop policy if exists "Users can view own listing submissions" on public.listing_submissions;
create policy "Users can view own listing submissions"
on public.listing_submissions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Admins can review all listing submissions" on public.listing_submissions;
create policy "Admins can review all listing submissions"
on public.listing_submissions
for select
to authenticated
using (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'worklife.wh@gmail.com'
  or exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'owner')
  )
);

drop policy if exists "Admins can update listing submissions" on public.listing_submissions;
create policy "Admins can update listing submissions"
on public.listing_submissions
for update
to authenticated
using (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'worklife.wh@gmail.com'
  or exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'owner')
  )
)
with check (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'worklife.wh@gmail.com'
  or exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'owner')
  )
);

create index if not exists listing_submissions_type_status_idx
on public.listing_submissions (type, status, created_at desc);

drop policy if exists "Admins can insert public jobs" on public.public_jobs;
create policy "Admins can insert public jobs"
on public.public_jobs
for insert
to authenticated
with check (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'worklife.wh@gmail.com'
  or exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'owner')
  )
);

drop policy if exists "Admins can update public jobs" on public.public_jobs;
create policy "Admins can update public jobs"
on public.public_jobs
for update
to authenticated
using (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'worklife.wh@gmail.com'
  or exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'owner')
  )
)
with check (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'worklife.wh@gmail.com'
  or exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'owner')
  )
);

drop policy if exists "Admins can insert public properties" on public.public_properties;
create policy "Admins can insert public properties"
on public.public_properties
for insert
to authenticated
with check (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'worklife.wh@gmail.com'
  or exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'owner')
  )
);

drop policy if exists "Admins can update public properties" on public.public_properties;
create policy "Admins can update public properties"
on public.public_properties
for update
to authenticated
using (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'worklife.wh@gmail.com'
  or exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'owner')
  )
)
with check (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'worklife.wh@gmail.com'
  or exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'owner')
  )
);

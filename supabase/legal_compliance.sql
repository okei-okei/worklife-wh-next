-- WorkLife WH legal, consent, privacy, cookie, ad disclosure, and AI log schema.
-- Run this in Supabase SQL Editor.

create table if not exists public.legal_documents (
  document_key text not null,
  version text not null,
  title text not null,
  body_md text not null,
  published_at timestamptz not null default now(),
  is_active boolean not null default true,
  primary key (document_key, version)
);

create table if not exists public.user_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_key text not null,
  consent_version text not null,
  consented boolean not null default true,
  consent_at timestamptz not null default now(),
  source_page text,
  ip_address inet,
  user_agent text,
  unique (user_id, document_key, consent_version)
);

create table if not exists public.privacy_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data_sharing_opt_out boolean not null default false,
  marketing_opt_in boolean not null default false,
  cookie_preferences jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.privacy_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  request_type text not null check (
    request_type in (
      'access',
      'correction',
      'deletion',
      'restriction',
      'portability',
      'third_party_stop'
    )
  ),
  status text not null default 'open' check (
    status in ('open', 'in_review', 'completed', 'rejected')
  ),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Optional feature tables may be installed in a different order. Only extend
-- them when they already exist so this legal migration can run independently.
do $$
begin
  if to_regclass('public.partners') is not null then
    alter table public.partners
      add column if not exists is_active boolean not null default true,
      add column if not exists is_affiliate boolean not null default false,
      add column if not exists affiliate_note text,
      add column if not exists ranking_basis text,
      add column if not exists sponsor_label text,
      add column if not exists recommended_for text,
      add column if not exists caution_note text,
      add column if not exists price_note text,
      add column if not exists official_url text;
  end if;

  if to_regclass('public.listing_submissions') is not null then
    alter table public.listing_submissions
      add column if not exists consent_versions jsonb not null default '{}'::jsonb;
  end if;
end
$$;

create table if not exists public.ai_generation_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_type text check (
    document_type in (
      'job_application_email',
      'job_cover_letter',
      'property_inquiry'
    )
  ),
  generated_on date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.ai_generation_logs
  add column if not exists generation_type text,
  add column if not exists input_hash text,
  add column if not exists output_hash text,
  add column if not exists moderation_status text,
  add column if not exists accepted_warning boolean not null default false,
  add column if not exists data_retention_until timestamptz;

create index if not exists user_consents_user_idx
on public.user_consents (user_id, document_key);

create index if not exists privacy_requests_user_idx
on public.privacy_requests (user_id, created_at desc);

create index if not exists ai_generation_logs_user_day_idx
on public.ai_generation_logs (user_id, generated_on);

grant select on public.legal_documents to anon, authenticated;
grant select, insert on public.user_consents to authenticated;
grant select, insert, update on public.privacy_settings to authenticated;
grant select, insert on public.privacy_requests to authenticated;
grant select, insert on public.ai_generation_logs to authenticated;

alter table public.legal_documents enable row level security;
alter table public.user_consents enable row level security;
alter table public.privacy_settings enable row level security;
alter table public.privacy_requests enable row level security;
alter table public.ai_generation_logs enable row level security;

drop policy if exists "Public can read active legal documents"
on public.legal_documents;
create policy "Public can read active legal documents"
on public.legal_documents
for select
using (is_active = true);

drop policy if exists "Users can view own consents"
on public.user_consents;
create policy "Users can view own consents"
on public.user_consents
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own consents"
on public.user_consents;
create policy "Users can insert own consents"
on public.user_consents
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can view own privacy settings"
on public.privacy_settings;
create policy "Users can view own privacy settings"
on public.privacy_settings
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own privacy settings"
on public.privacy_settings;
create policy "Users can insert own privacy settings"
on public.privacy_settings
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own privacy settings"
on public.privacy_settings;
create policy "Users can update own privacy settings"
on public.privacy_settings
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can view own privacy requests"
on public.privacy_requests;
create policy "Users can view own privacy requests"
on public.privacy_requests
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own privacy requests"
on public.privacy_requests;
create policy "Users can insert own privacy requests"
on public.privacy_requests
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can view own AI generation logs"
on public.ai_generation_logs;
create policy "Users can view own AI generation logs"
on public.ai_generation_logs
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own AI generation logs"
on public.ai_generation_logs;
create policy "Users can insert own AI generation logs"
on public.ai_generation_logs
for insert
with check (auth.uid() = user_id);

-- Partners are optional. Apply its grants and policy only after that table has
-- been created by supabase/partners.sql.
do $$
begin
  if to_regclass('public.partners') is not null then
    grant select on public.partners to anon, authenticated;
    alter table public.partners enable row level security;

    drop policy if exists "Public can read active partners"
    on public.partners;
    create policy "Public can read active partners"
    on public.partners
    for select
    using (is_active = true);
  end if;
end
$$;

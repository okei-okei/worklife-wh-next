-- Run this file by itself in the Supabase SQL editor.
-- It has no dependency on public_jobs, public_properties, or partners.

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

grant select, insert, update, delete
on table public.user_form_drafts
to authenticated;

drop policy if exists "Users can view own form drafts" on public.user_form_drafts;
create policy "Users can view own form drafts"
on public.user_form_drafts for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own form drafts" on public.user_form_drafts;
create policy "Users can insert own form drafts"
on public.user_form_drafts for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own form drafts" on public.user_form_drafts;
create policy "Users can update own form drafts"
on public.user_form_drafts for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own form drafts" on public.user_form_drafts;
create policy "Users can delete own form drafts"
on public.user_form_drafts for delete to authenticated
using (auth.uid() = user_id);

create or replace function public.set_user_form_drafts_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_form_drafts_set_updated_at
on public.user_form_drafts;
create trigger user_form_drafts_set_updated_at
before update on public.user_form_drafts
for each row execute function public.set_user_form_drafts_updated_at();

create table if not exists public.user_checklist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_key text not null,
  label text,
  is_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, item_key)
);

alter table public.user_checklist_items enable row level security;

drop policy if exists "Users can view own checklist items" on public.user_checklist_items;
create policy "Users can view own checklist items"
on public.user_checklist_items
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own checklist items" on public.user_checklist_items;
create policy "Users can insert own checklist items"
on public.user_checklist_items
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own checklist items" on public.user_checklist_items;
create policy "Users can update own checklist items"
on public.user_checklist_items
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own checklist items" on public.user_checklist_items;
create policy "Users can delete own checklist items"
on public.user_checklist_items
for delete
using (auth.uid() = user_id);

alter table public.partners
add column if not exists is_affiliate boolean not null default false,
add column if not exists affiliate_note text null,
add column if not exists recommended_for text null,
add column if not exists caution_note text null,
add column if not exists price_note text null,
add column if not exists official_url text null;

alter table public.partners enable row level security;

drop policy if exists "Anyone can view active partners" on public.partners;
create policy "Anyone can view active partners"
on public.partners
for select
using (is_active = true);

-- Insert/update/delete for partners should be restricted to admins.
-- If you later add an admin profile table, create policies similar to:
-- using (exists (select 1 from public.admin_users where user_id = auth.uid()))
-- Until then, manage partners from Supabase dashboard or server-side admin APIs.

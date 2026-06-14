create table if not exists user_checklist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_key text not null,
  label text not null,
  is_completed boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  unique (user_id, item_key)
);

alter table user_checklist_items enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update, delete on user_checklist_items to authenticated;

drop policy if exists "Users can view own checklist items" on user_checklist_items;
create policy "Users can view own checklist items"
on user_checklist_items
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own checklist items" on user_checklist_items;
create policy "Users can insert own checklist items"
on user_checklist_items
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own checklist items" on user_checklist_items;
create policy "Users can update own checklist items"
on user_checklist_items
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own checklist items" on user_checklist_items;
create policy "Users can delete own checklist items"
on user_checklist_items
for delete
using (auth.uid() = user_id);

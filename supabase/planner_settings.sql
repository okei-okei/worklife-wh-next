create table if not exists planner_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  monthly_food_cost numeric not null default 500,
  monthly_transport_cost numeric not null default 150,
  monthly_phone_cost numeric not null default 40,
  monthly_other_cost numeric not null default 300,
  initial_cost numeric not null default 0,
  planned_stay_months numeric not null default 6,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table planner_settings
add column if not exists initial_cost numeric not null default 0;

alter table planner_settings enable row level security;

drop policy if exists "Users can view own planner settings" on planner_settings;
create policy "Users can view own planner settings"
on planner_settings
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own planner settings" on planner_settings;
create policy "Users can insert own planner settings"
on planner_settings
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own planner settings" on planner_settings;
create policy "Users can update own planner settings"
on planner_settings
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

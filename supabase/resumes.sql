create table if not exists resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text null,
  email text null,
  phone text null,
  current_city text null,
  visa_type text null,
  available_from date null,
  work_experience text null,
  skills text null,
  english_level text null,
  self_introduction text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  unique (user_id)
);

create index if not exists resumes_user_id_idx
on resumes (user_id);

alter table resumes enable row level security;

drop policy if exists "Users can view own resume" on resumes;
create policy "Users can view own resume"
on resumes
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own resume" on resumes;
create policy "Users can insert own resume"
on resumes
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own resume" on resumes;
create policy "Users can update own resume"
on resumes
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

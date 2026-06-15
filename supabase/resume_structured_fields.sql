alter table public.resumes
add column if not exists experience_items jsonb not null default '[]'::jsonb,
add column if not exists skills_list jsonb not null default '[]'::jsonb;

create unique index if not exists resumes_user_id_unique_idx
on public.resumes (user_id);

alter table public.resumes enable row level security;

drop policy if exists "Users can view own resume" on public.resumes;
create policy "Users can view own resume"
on public.resumes
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own resume" on public.resumes;
create policy "Users can insert own resume"
on public.resumes
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own resume" on public.resumes;
create policy "Users can update own resume"
on public.resumes
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own resume" on public.resumes;
create policy "Users can delete own resume"
on public.resumes
for delete
using (auth.uid() = user_id);

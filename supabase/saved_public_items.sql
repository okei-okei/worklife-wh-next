alter table public.saved_jobs enable row level security;
alter table public.saved_properties enable row level security;

create unique index if not exists saved_jobs_user_url_unique_idx
on public.saved_jobs (user_id, url)
where url is not null and url <> '';

create unique index if not exists saved_properties_user_url_unique_idx
on public.saved_properties (user_id, url)
where url is not null and url <> '';

drop policy if exists "Users can view own jobs" on public.saved_jobs;
create policy "Users can view own jobs"
on public.saved_jobs
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own jobs" on public.saved_jobs;
create policy "Users can insert own jobs"
on public.saved_jobs
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own jobs" on public.saved_jobs;
create policy "Users can update own jobs"
on public.saved_jobs
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own jobs" on public.saved_jobs;
create policy "Users can delete own jobs"
on public.saved_jobs
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can view own properties" on public.saved_properties;
create policy "Users can view own properties"
on public.saved_properties
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own properties" on public.saved_properties;
create policy "Users can insert own properties"
on public.saved_properties
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own properties" on public.saved_properties;
create policy "Users can update own properties"
on public.saved_properties
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own properties" on public.saved_properties;
create policy "Users can delete own properties"
on public.saved_properties
for delete
to authenticated
using (auth.uid() = user_id);

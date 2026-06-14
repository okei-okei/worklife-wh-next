alter table saved_jobs enable row level security;
alter table saved_properties enable row level security;

drop policy if exists "Users can view own jobs" on saved_jobs;
create policy "Users can view own jobs"
on saved_jobs
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own jobs" on saved_jobs;
create policy "Users can insert own jobs"
on saved_jobs
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own jobs" on saved_jobs;
create policy "Users can update own jobs"
on saved_jobs
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own jobs" on saved_jobs;
create policy "Users can delete own jobs"
on saved_jobs
for delete
using (auth.uid() = user_id);

drop policy if exists "Users can view own properties" on saved_properties;
create policy "Users can view own properties"
on saved_properties
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own properties" on saved_properties;
create policy "Users can insert own properties"
on saved_properties
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own properties" on saved_properties;
create policy "Users can update own properties"
on saved_properties
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own properties" on saved_properties;
create policy "Users can delete own properties"
on saved_properties
for delete
using (auth.uid() = user_id);

alter table public.saved_properties
add column if not exists status text default '気になる';

update public.saved_properties
set status = '気になる'
where status is null;

alter table public.saved_jobs
alter column status set default '気になる';

alter table public.saved_properties
alter column status set default '気になる';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'saved_jobs_status_check'
      and conrelid = 'public.saved_jobs'::regclass
  ) then
    alter table public.saved_jobs
    add constraint saved_jobs_status_check
    check (
      status is null
      or status in (
        '気になる',
        '応募予定',
        '応募済み',
        '返信待ち',
        '面接予定',
        'トライアル予定',
        '採用',
        '不採用',
        '辞退'
      )
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'saved_properties_status_check'
      and conrelid = 'public.saved_properties'::regclass
  ) then
    alter table public.saved_properties
    add constraint saved_properties_status_check
    check (
      status is null
      or status in (
        '気になる',
        '問い合わせ予定',
        '問い合わせ済み',
        '返信待ち',
        '内見予定',
        '申込済み',
        '入居決定',
        '見送り'
      )
    );
  end if;
end $$;

create index if not exists saved_jobs_user_status_idx
on public.saved_jobs (user_id, status);

create index if not exists saved_properties_user_status_idx
on public.saved_properties (user_id, status);

alter table public.saved_jobs enable row level security;
alter table public.saved_properties enable row level security;

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

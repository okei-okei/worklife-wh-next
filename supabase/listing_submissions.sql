create table if not exists listing_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete set null,
  type text not null check (type in ('job', 'property')),
  title text not null,
  company_or_owner text null,
  email text null,
  description text null,
  url text null,
  status text not null default 'pending',
  created_at timestamp with time zone not null default now()
);

create index if not exists listing_submissions_status_created_at_idx
on listing_submissions (status, created_at desc);

create index if not exists listing_submissions_type_status_created_at_idx
on listing_submissions (type, status, created_at desc);

create index if not exists listing_submissions_user_id_created_at_idx
on listing_submissions (user_id, created_at desc);

alter table listing_submissions enable row level security;

grant usage on schema public to anon, authenticated;
grant insert on listing_submissions to anon, authenticated;
grant select on listing_submissions to authenticated;

drop policy if exists "Anyone can submit listing applications" on listing_submissions;
create policy "Anyone can submit listing applications"
on listing_submissions
for insert
to anon, authenticated
with check (
  status = 'pending'
  and (user_id is null or auth.uid() = user_id)
);

drop policy if exists "Users can view own listing submissions" on listing_submissions;
create policy "Users can view own listing submissions"
on listing_submissions
for select
to authenticated
using (auth.uid() = user_id);

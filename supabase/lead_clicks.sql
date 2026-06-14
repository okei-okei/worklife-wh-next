create table if not exists lead_clicks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete set null,
  category text not null,
  partner_name text null,
  destination_url text null,
  source_page text null,
  created_at timestamp with time zone not null default now()
);

create index if not exists lead_clicks_category_created_at_idx
on lead_clicks (category, created_at desc);

create index if not exists lead_clicks_user_id_created_at_idx
on lead_clicks (user_id, created_at desc);

alter table lead_clicks enable row level security;

grant usage on schema public to anon, authenticated;
grant insert on lead_clicks to anon, authenticated;

drop policy if exists "Anyone can record lead clicks" on lead_clicks;
create policy "Anyone can record lead clicks"
on lead_clicks
for insert
to anon, authenticated
with check (user_id is null or auth.uid() = user_id);

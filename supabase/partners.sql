create table if not exists partners (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  name text not null,
  description text null,
  url text null,
  country text not null default 'NZ',
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamp with time zone not null default now()
);

create index if not exists partners_category_active_order_idx
on partners (category, is_active, display_order, created_at desc);

create unique index if not exists partners_category_name_country_key
on partners (category, name, country);

alter table partners enable row level security;

grant usage on schema public to anon, authenticated;
grant select on partners to anon, authenticated;

drop policy if exists "Anyone can view active partners" on partners;
create policy "Anyone can view active partners"
on partners
for select
to anon, authenticated
using (is_active = true);

insert into partners (
  category,
  name,
  description,
  url,
  country,
  is_active,
  display_order
)
values
  (
    'insurance',
    'Sample Insurance Partner',
    'ワーホリ生活で必要になる保険を比較できるダミー掲載です。',
    null,
    'NZ',
    true,
    10
  ),
  (
    'sim',
    'Sample SIM Partner',
    '到着後すぐに使えるSIM / eSIMサービスのダミー掲載です。',
    null,
    'NZ',
    true,
    10
  ),
  (
    'bank',
    'Sample Bank Partner',
    '給与受け取りや生活費管理に使う銀行口座サービスのダミー掲載です。',
    null,
    'NZ',
    true,
    10
  ),
  (
    'remittance',
    'Sample Remittance Partner',
    '日本とニュージーランド間の送金サービスのダミー掲載です。',
    null,
    'NZ',
    true,
    10
  ),
  (
    'power',
    'Sample Power Partner',
    '入居後に必要な電気契約サービスのダミー掲載です。',
    null,
    'NZ',
    true,
    10
  ),
  (
    'internet',
    'Sample Internet Partner',
    '住居で使うインターネット契約サービスのダミー掲載です。',
    null,
    'NZ',
    true,
    10
  ),
  (
    'furniture',
    'Sample Furniture Partner',
    '家具や生活用品を揃えるためのサービスのダミー掲載です。',
    null,
    'NZ',
    true,
    10
  ),
  (
    'english',
    'Sample English Partner',
    '仕事探しや生活に役立つ英語学習サービスのダミー掲載です。',
    null,
    'NZ',
    true,
    10
  )
on conflict (category, name, country) do nothing;

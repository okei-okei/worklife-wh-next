-- WorkLife WH analytics and article publishing foundation.
-- Run this file in the Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user',
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists role text not null default 'user';

insert into public.profiles (id, role)
select id, 'admin'
from auth.users
where lower(email) = 'worklife.wh@gmail.com'
on conflict (id) do update set role = 'admin';

create table if not exists public.admin_metrics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_name text not null,
  event_type text not null default 'action',
  page_path text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  visitor_id text,
  page_path text not null,
  referrer text,
  created_at timestamptz not null default now()
);

create table if not exists public.affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  service_name text,
  service_category text,
  target_url text,
  page_path text,
  created_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null default '',
  category text not null check (
    category in ('お金', '家探し', '仕事探し', '渡航準備', 'SIM・通信', '銀行・送金', '保険', '現地生活')
  ),
  cover_image_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  views bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists admin_metrics_events_name_created_idx
on public.admin_metrics_events (event_name, created_at desc);
create index if not exists admin_metrics_events_user_created_idx
on public.admin_metrics_events (user_id, created_at desc);
create index if not exists page_views_path_created_idx
on public.page_views (page_path, created_at desc);
create index if not exists page_views_visitor_created_idx
on public.page_views (visitor_id, created_at desc);
create index if not exists affiliate_clicks_service_created_idx
on public.affiliate_clicks (service_name, created_at desc);
create index if not exists articles_status_published_idx
on public.articles (status, published_at desc);

alter table public.admin_metrics_events enable row level security;
alter table public.page_views enable row level security;
alter table public.affiliate_clicks enable row level security;
alter table public.articles enable row level security;
alter table public.profiles enable row level security;

grant select on public.articles to anon, authenticated;
grant select on public.profiles to authenticated;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select to authenticated
using (auth.uid() = id);

drop policy if exists "Public can read published articles" on public.articles;
create policy "Public can read published articles"
on public.articles for select to anon, authenticated
using (status = 'published');

-- Analytics writes and article management are performed by server API routes
-- with the service role. No direct client write policy is intentionally added.

create or replace function public.set_article_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.updated_at = now();
    if new.status = 'published' and new.published_at is null then
      new.published_at = now();
    end if;
  else
    if row(
      new.title, new.slug, new.excerpt, new.content, new.category,
      new.cover_image_url, new.status
    ) is distinct from row(
      old.title, old.slug, old.excerpt, old.content, old.category,
      old.cover_image_url, old.status
    ) then
      new.updated_at = now();
    end if;
    if new.status is distinct from old.status and new.status = 'published' then
      new.published_at = coalesce(new.published_at, now());
    elsif new.status is distinct from old.status and new.status = 'draft' then
      new.published_at = null;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at
before insert or update on public.articles
for each row execute function public.set_article_updated_at();

create or replace function public.increment_article_views(article_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.articles
  set views = views + 1
  where id = article_id and status = 'published';
$$;

revoke all on function public.increment_article_views(uuid)
from public, anon, authenticated;
grant execute on function public.increment_article_views(uuid)
to service_role;

-- Optional automatic event capture for user-owned saved data.
create or replace function public.record_saved_item_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_metrics_events (
    user_id, event_name, event_type, page_path, metadata
  ) values (
    new.user_id,
    case tg_table_name
      when 'saved_jobs' then 'job_saved'
      when 'saved_properties' then 'property_saved'
      else 'saved_item'
    end,
    'feature',
    case tg_table_name
      when 'saved_jobs' then '/mypage/jobs'
      when 'saved_properties' then '/mypage/properties'
      else null
    end,
    jsonb_build_object('record_id', new.id)
  );
  return new;
end;
$$;

do $$
begin
  if to_regclass('public.saved_jobs') is not null then
    execute 'drop trigger if exists saved_jobs_record_metric on public.saved_jobs';
    execute 'create trigger saved_jobs_record_metric after insert on public.saved_jobs for each row execute function public.record_saved_item_event()';
  end if;
  if to_regclass('public.saved_properties') is not null then
    execute 'drop trigger if exists saved_properties_record_metric on public.saved_properties';
    execute 'create trigger saved_properties_record_metric after insert on public.saved_properties for each row execute function public.record_saved_item_event()';
  end if;
end;
$$;

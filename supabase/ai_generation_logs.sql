create table if not exists public.ai_generation_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_type text not null check (
    document_type in (
      'job_application_email',
      'job_cover_letter',
      'property_inquiry'
    )
  ),
  generated_on date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists ai_generation_logs_user_day_idx
on public.ai_generation_logs (user_id, generated_on);

alter table public.ai_generation_logs enable row level security;

drop policy if exists "Users can view own AI generation logs"
on public.ai_generation_logs;
create policy "Users can view own AI generation logs"
on public.ai_generation_logs
for select
using (auth.uid() = user_id);

-- Inserts are performed by the Next.js API route using SUPABASE_SERVICE_ROLE_KEY.
-- Users do not need direct insert/update/delete access to this table.

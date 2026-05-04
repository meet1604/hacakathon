-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Triage sessions table
create table public.triage_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  anonymous_id text,
  language text not null default 'English',
  conversation jsonb not null default '[]'::jsonb,
  final_severity text check (final_severity in ('emergency', 'clinic_today', 'clinic_soon', 'self_care')),
  red_flags jsonb default '[]'::jsonb,
  doctor_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint user_or_anon check (user_id is not null or anonymous_id is not null)
);

create index idx_sessions_user on public.triage_sessions(user_id);
create index idx_sessions_anon on public.triage_sessions(anonymous_id);
create index idx_sessions_created on public.triage_sessions(created_at desc);

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_sessions_updated
  before update on public.triage_sessions
  for each row execute function update_updated_at();

alter table public.triage_sessions enable row level security;

create policy "Users read own sessions"
  on public.triage_sessions for select
  using (auth.uid() = user_id);

create policy "Users insert own sessions"
  on public.triage_sessions for insert
  with check (auth.uid() = user_id or user_id is null);

-- Rate limiting table (simple version)
create table public.rate_limits (
  id uuid primary key default uuid_generate_v4(),
  identifier text not null,
  endpoint text not null,
  count int not null default 1,
  window_start timestamptz not null default now()
);

create index idx_rate_limits_lookup on public.rate_limits(identifier, endpoint, window_start);

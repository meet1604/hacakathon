-- ============================================================
-- 0003_dashboard_completeness_fixed.sql
-- Ensures every dashboard feature has a backing table/columns.
-- Safe to run even if some tables/columns already exist.
-- This migration is self-contained and will create missing tables.
-- ============================================================

-- Ensure required extensions and functions exist
create extension if not exists "uuid-ossp";

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 1. Ensure triage_sessions table exists, then extend with dashboard fields
create table if not exists public.triage_sessions (
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

-- Add dashboard-specific columns
alter table public.triage_sessions
  add column if not exists title text,
  add column if not exists symptoms_summary text,
  add column if not exists patient_name text,
  add column if not exists status text default 'completed',
  add column if not exists last_message_at timestamptz default now(),
  add column if not exists message_count int default 0,
  add column if not exists deleted_at timestamptz;

-- Add constraint if it doesn't exist
do $$
begin
  if not exists (select 1 from information_schema.check_constraints 
                 where constraint_name = 'triage_sessions_status_check') then
    alter table public.triage_sessions 
    add constraint triage_sessions_status_check 
    check (status in ('in_progress', 'completed', 'abandoned'));
  end if;
end $$;

-- Create indexes (basic ones first, then dashboard-specific)
create index if not exists idx_sessions_user on public.triage_sessions(user_id);
create index if not exists idx_sessions_anon on public.triage_sessions(anonymous_id);
create index if not exists idx_sessions_created on public.triage_sessions(created_at desc);
create index if not exists idx_sessions_status
  on public.triage_sessions(user_id, status);
create index if not exists idx_sessions_not_deleted
  on public.triage_sessions(user_id, created_at desc)
  where deleted_at is null;

-- Ensure the table has the updated_at trigger
drop trigger if exists trg_sessions_updated on public.triage_sessions;
create trigger trg_sessions_updated
  before update on public.triage_sessions
  for each row execute function update_updated_at();

-- Enable RLS
alter table public.triage_sessions enable row level security;

-- Update RLS policies for triage_sessions
drop policy if exists "Users read own sessions" on public.triage_sessions;
create policy "Users read own sessions"
  on public.triage_sessions for select
  using (auth.uid() = user_id);

drop policy if exists "Users insert own sessions" on public.triage_sessions;
create policy "Users insert own sessions"
  on public.triage_sessions for insert
  with check (auth.uid() = user_id or user_id is null);

drop policy if exists "Users update own sessions" on public.triage_sessions;
create policy "Users update own sessions"
  on public.triage_sessions for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users delete own sessions" on public.triage_sessions;
create policy "Users delete own sessions"
  on public.triage_sessions for delete
  using (auth.uid() = user_id);

-- 2. Ensure profiles table exists with all needed columns
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add columns to profiles (idempotent)
alter table public.profiles
  add column if not exists full_name text,
  add column if not exists preferred_language text default 'en-IN',
  add column if not exists timezone text default 'Asia/Kolkata',
  add column if not exists notification_email boolean default true,
  add column if not exists anonymized_data boolean default true,
  add column if not exists sms_alerts boolean default false,
  add column if not exists chronic_conditions text,
  add column if not exists known_allergies text,
  add column if not exists current_medications text,
  add column if not exists onboarding_completed boolean default false,
  add column if not exists deleted_at timestamptz;

-- Ensure profiles has updated_at trigger
drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated
  before update on public.profiles
  for each row execute function update_updated_at();

-- Enable RLS and policies for profiles
alter table public.profiles enable row level security;

drop policy if exists "Users manage own profile" on public.profiles;
create policy "Users manage own profile"
  on public.profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);

-- 3. Create reports table
create table if not exists public.reports (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null references public.triage_sessions(id) on delete cascade,
  title text not null,
  notes text,
  created_at timestamptz default now()
);

-- Add unique constraint if it doesn't exist
do $$
begin
  if not exists (select 1 from information_schema.table_constraints 
                 where constraint_name = 'reports_user_id_session_id_key') then
    alter table public.reports add constraint reports_user_id_session_id_key unique(user_id, session_id);
  end if;
end $$;

create index if not exists idx_reports_user
  on public.reports(user_id, created_at desc);

alter table public.reports enable row level security;

drop policy if exists "Users manage own reports" on public.reports;
create policy "Users manage own reports"
  on public.reports for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4. Create insights_cache table
create table if not exists public.insights_cache (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  computed_at timestamptz default now()
);

alter table public.insights_cache enable row level security;

drop policy if exists "Users read own insights" on public.insights_cache;
create policy "Users read own insights"
  on public.insights_cache for select using (auth.uid() = user_id);

-- 5. Create activity_log table
create table if not exists public.activity_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_activity_user
  on public.activity_log(user_id, created_at desc);

alter table public.activity_log enable row level security;

drop policy if exists "Users read own activity" on public.activity_log;
create policy "Users read own activity"
  on public.activity_log for select using (auth.uid() = user_id);

-- 6. Ensure family_members table has proper RLS (it should already exist from 0002)
-- Only update policies, don't try to create the table
do $$
begin
  if exists (select 1 from information_schema.tables where table_name = 'family_members') then
    -- Enable RLS if not already enabled
    alter table public.family_members enable row level security;
    
    -- Update policies
    drop policy if exists "Users read own family members" on public.family_members;
    create policy "Users read own family members"
      on public.family_members for select
      using (auth.uid() = user_id);

    drop policy if exists "Users insert own family members" on public.family_members;
    create policy "Users insert own family members"
      on public.family_members for insert
      with check (auth.uid() = user_id);

    drop policy if exists "Users update own family members" on public.family_members;
    create policy "Users update own family members"
      on public.family_members for update
      using (auth.uid() = user_id);

    drop policy if exists "Users delete own family members" on public.family_members;
    create policy "Users delete own family members"
      on public.family_members for delete
      using (auth.uid() = user_id);
  end if;
end $$;
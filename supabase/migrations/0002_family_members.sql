-- Family members table
create table public.family_members (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nickname text not null,
  relation text,
  age_band text check (age_band in ('child', 'teen', 'adult', 'elderly')),
  known_conditions text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_family_members_user on public.family_members(user_id);

create trigger trg_family_members_updated
  before update on public.family_members
  for each row execute function update_updated_at();

alter table public.family_members enable row level security;

create policy "Users read own family members"
  on public.family_members for select
  using (auth.uid() = user_id);

create policy "Users insert own family members"
  on public.family_members for insert
  with check (auth.uid() = user_id);

create policy "Users update own family members"
  on public.family_members for update
  using (auth.uid() = user_id);

create policy "Users delete own family members"
  on public.family_members for delete
  using (auth.uid() = user_id);

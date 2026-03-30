-- Supabase schema for Nexti testing platform POC
-- Execute in Supabase SQL editor.

-- Projects
create table if not exists public.projects (
  id text primary key,
  owner_user_id uuid not null references auth.users(id) on delete cascade,

  name text not null,
  owner text not null,
  start_date text not null,
  end_date text not null,
  real_start_date text null,
  real_end_date text null,

  components integer not null default 0,
  progress integer not null default 0,
  status text not null,
  description text not null,
  nomenclature jsonb null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Requirements / Functional analysis outputs
create table if not exists public.requirements (
  id text primary key,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  project_id text not null references public.projects(id) on delete cascade,

  feature_id text not null,
  requirement_title text not null,
  requirement_text text not null,
  acceptance_criteria text[] not null default '{}',

  bdd_result jsonb null,
  edited_gherkin text null,
  workspace_snapshot jsonb null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User stories generated from requirements/documentation
create table if not exists public.user_stories (
  id text primary key,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  project_id text not null references public.projects(id) on delete cascade,

  title text not null,
  description text not null,
  module text not null,
  criteria text[] not null default '{}',
  status text not null,

  jira_id text null,
  jira_sync_status text not null default 'pending',

  source_run_id text null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Test cases generated from user stories
create table if not exists public.test_cases (
  id text primary key,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  project_id text not null references public.projects(id) on delete cascade,

  story_id text not null,

  description text not null,
  preconditions text not null,
  steps text not null,
  expected text not null,

  type text not null,
  priority text not null,
  status text not null,
  automation_status text not null default 'pending',

  source_run_id text null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Documentation runs: tracks extracted context + uploaded file names
create table if not exists public.documentation_runs (
  id text primary key,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  project_id text not null references public.projects(id) on delete cascade,

  documentation_files text[] not null default '{}',
  user_story_files text[] not null default '{}',
  code_context_files text[] not null default '{}',
  extracted_context text not null default '',

  created_at timestamptz not null default now()
);

-- Script generation runs (metadata)
create table if not exists public.script_generation_runs (
  id text primary key,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  project_id text not null references public.projects(id) on delete cascade,

  request_id text null,
  selected_frameworks text[] not null default '{}',
  flow_stage text null,

  error text null,
  succeeded boolean not null default false,

  created_at timestamptz not null default now()
);

-- Generated script "files" (Option A stores content in Postgres)
create table if not exists public.script_files (
  id bigserial primary key,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  project_id text not null references public.projects(id) on delete cascade,

  run_id text not null references public.script_generation_runs(id) on delete cascade,

  framework text not null,
  path text not null,
  content text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (run_id, path)
);

-- Archetype ZIP metadata (points to uploaded ZIP objects in Storage)
create table if not exists public.archetype_zips (
  id bigserial primary key,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  project_id text not null references public.projects(id) on delete cascade,

  framework_slot text not null,
  framework_name text not null,

  storage_path text not null,
  file_name text not null,
  uploaded_at timestamptz not null default now(),

  zip_sha256 text null
);

-- ---------------------------------------------------------------------
-- RLS Policies (single-user POC: authenticated user owns all rows)
-- ---------------------------------------------------------------------

alter table public.projects enable row level security;
alter table public.requirements enable row level security;
alter table public.user_stories enable row level security;
alter table public.test_cases enable row level security;
alter table public.documentation_runs enable row level security;
alter table public.script_generation_runs enable row level security;
alter table public.script_files enable row level security;
alter table public.archetype_zips enable row level security;

-- projects
create policy projects_select_own on public.projects
  for select using (owner_user_id = auth.uid());
create policy projects_insert_own on public.projects
  for insert with check (owner_user_id = auth.uid());
create policy projects_update_own on public.projects
  for update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy projects_delete_own on public.projects
  for delete using (owner_user_id = auth.uid());

-- requirements
create policy requirements_select_own on public.requirements
  for select using (owner_user_id = auth.uid());
create policy requirements_insert_own on public.requirements
  for insert with check (owner_user_id = auth.uid());
create policy requirements_update_own on public.requirements
  for update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy requirements_delete_own on public.requirements
  for delete using (owner_user_id = auth.uid());

-- user_stories
create policy user_stories_select_own on public.user_stories
  for select using (owner_user_id = auth.uid());
create policy user_stories_insert_own on public.user_stories
  for insert with check (owner_user_id = auth.uid());
create policy user_stories_update_own on public.user_stories
  for update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy user_stories_delete_own on public.user_stories
  for delete using (owner_user_id = auth.uid());

-- test_cases
create policy test_cases_select_own on public.test_cases
  for select using (owner_user_id = auth.uid());
create policy test_cases_insert_own on public.test_cases
  for insert with check (owner_user_id = auth.uid());
create policy test_cases_update_own on public.test_cases
  for update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy test_cases_delete_own on public.test_cases
  for delete using (owner_user_id = auth.uid());

-- documentation_runs
create policy documentation_runs_select_own on public.documentation_runs
  for select using (owner_user_id = auth.uid());
create policy documentation_runs_insert_own on public.documentation_runs
  for insert with check (owner_user_id = auth.uid());
create policy documentation_runs_update_own on public.documentation_runs
  for update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy documentation_runs_delete_own on public.documentation_runs
  for delete using (owner_user_id = auth.uid());

-- script_generation_runs
create policy script_generation_runs_select_own on public.script_generation_runs
  for select using (owner_user_id = auth.uid());
create policy script_generation_runs_insert_own on public.script_generation_runs
  for insert with check (owner_user_id = auth.uid());
create policy script_generation_runs_update_own on public.script_generation_runs
  for update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy script_generation_runs_delete_own on public.script_generation_runs
  for delete using (owner_user_id = auth.uid());

-- script_files
create policy script_files_select_own on public.script_files
  for select using (owner_user_id = auth.uid());
create policy script_files_insert_own on public.script_files
  for insert with check (owner_user_id = auth.uid());
create policy script_files_update_own on public.script_files
  for update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy script_files_delete_own on public.script_files
  for delete using (owner_user_id = auth.uid());

-- archetype_zips
create policy archetype_zips_select_own on public.archetype_zips
  for select using (owner_user_id = auth.uid());
create policy archetype_zips_insert_own on public.archetype_zips
  for insert with check (owner_user_id = auth.uid());
create policy archetype_zips_update_own on public.archetype_zips
  for update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy archetype_zips_delete_own on public.archetype_zips
  for delete using (owner_user_id = auth.uid());

-- ---------------------------------------------------------------------
-- Storage (Supabase Storage) setup for archetype ZIPs
-- ---------------------------------------------------------------------

-- Buckets
insert into storage.buckets (id, name, public)
values ('archetypes', 'archetypes', false)
on conflict (id) do update set public = false;

insert into storage.buckets (id, name, public)
values ('inputs', 'inputs', false)
on conflict (id) do update set public = false;

-- Note: `storage.objects` RLS policies cannot be applied via `supabase db push` (role is not owner).
-- After push, run `supabase/manual_storage_policies.sql` in the Supabase SQL Editor (Dashboard).


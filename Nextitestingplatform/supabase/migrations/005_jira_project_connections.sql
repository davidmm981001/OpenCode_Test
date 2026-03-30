create table if not exists public.jira_project_connections (
  project_id text primary key references public.projects(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,

  base_url text not null,
  project_key text not null,
  story_issue_type text not null default 'Story',
  default_labels text[] not null default '{}',

  jira_user_email text not null,
  credential_key text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists jira_project_connections_owner_user_id_idx
  on public.jira_project_connections(owner_user_id);

alter table public.jira_project_connections enable row level security;

create policy jira_project_connections_select_own on public.jira_project_connections
  for select using (owner_user_id = auth.uid());

create policy jira_project_connections_insert_own on public.jira_project_connections
  for insert with check (owner_user_id = auth.uid());

create policy jira_project_connections_update_own on public.jira_project_connections
  for update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());

create policy jira_project_connections_delete_own on public.jira_project_connections
  for delete using (owner_user_id = auth.uid());

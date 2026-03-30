create table if not exists public.jira_credentials (
  id bigserial primary key,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  jira_user_email text not null,
  encrypted_token text not null,
  iv text not null,
  algorithm text not null default 'AES-GCM',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists jira_credentials_owner_user_id_idx
  on public.jira_credentials(owner_user_id);

alter table public.jira_project_connections
  add column if not exists credential_id bigint null references public.jira_credentials(id) on delete set null;

alter table public.jira_project_connections
  alter column credential_key drop not null;

create index if not exists jira_project_connections_credential_id_idx
  on public.jira_project_connections(credential_id);

alter table public.jira_credentials enable row level security;

create policy jira_credentials_select_own on public.jira_credentials
  for select using (owner_user_id = auth.uid());

create policy jira_credentials_insert_own on public.jira_credentials
  for insert with check (owner_user_id = auth.uid());

create policy jira_credentials_update_own on public.jira_credentials
  for update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());

create policy jira_credentials_delete_own on public.jira_credentials
  for delete using (owner_user_id = auth.uid());

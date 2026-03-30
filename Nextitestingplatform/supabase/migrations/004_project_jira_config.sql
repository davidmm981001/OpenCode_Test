-- Project-level Jira integration settings
alter table public.projects
  add column if not exists jira_config jsonb null;


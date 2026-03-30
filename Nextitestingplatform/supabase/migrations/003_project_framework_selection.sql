-- Persist framework dropdown selection per project (shared across browsers)
alter table public.projects
  add column if not exists framework_selection jsonb null;


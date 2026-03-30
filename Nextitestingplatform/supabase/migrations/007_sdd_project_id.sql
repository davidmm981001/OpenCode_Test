-- Links NexTI project to app-generation orchestrator Prisma project (optional).
alter table public.projects
  add column if not exists sdd_project_id text null;

comment on column public.projects.sdd_project_id is 'App-generation orchestrator project id (cuid) when linked for embedded generation UI.';

-- Optional structured fields for user stories (actor, flows, screens, rules, technical notes)
alter table public.user_stories
  add column if not exists detail jsonb null;

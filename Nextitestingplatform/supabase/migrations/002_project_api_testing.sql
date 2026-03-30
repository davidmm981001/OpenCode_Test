-- API testing targets (base URL + Swagger/OpenAPI) for script generation
alter table public.projects add column if not exists api_testing jsonb null;

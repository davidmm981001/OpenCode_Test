# SDD Orchestrator

## Run locally

1. Install OpenCode:
   - `curl -fsSL https://opencode.ai/install | bash`
   - or `npm install -g opencode-ai`
2. Copy env files:
   - `cp .env.example .env`
   - `cp backend/.env.example backend/.env`
   - `cp frontend/.env.example frontend/.env`
3. Set `OPENAI_API_KEY` in the monorepo root `.env`.
4. Install deps: `corepack pnpm install`
5. Generate Prisma client: `cd backend && corepack pnpm prisma generate --schema prisma/schema.prisma`
6. Start dev: `corepack pnpm dev`

## Ports

- Frontend: `http://localhost:3002`
- Backend: `http://localhost:8003`

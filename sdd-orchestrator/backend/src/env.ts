import fs from "node:fs";
import path from "node:path";

import dotenv from "dotenv";

const rootEnv = path.resolve(process.cwd(), "..", "..", ".env");
const localEnv = path.resolve(process.cwd(), ".env");

dotenv.config({ path: rootEnv, override: false });
dotenv.config({ path: localEnv, override: true });

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  appPort: Number(process.env.APP_PORT ?? "8003"),
  apiBaseUrl: process.env.APP_BASE_URL ?? "http://localhost:3002",
  ragAppUrl: process.env.RAGAPP_URL ?? "http://localhost:3000",
  managerUrl: process.env.MANAGER_URL ?? "http://localhost:3001",
  databaseUrl: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/sdd_orchestrator?schema=public",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  /** When true, runs `npx -y opencode-ai serve ...` instead of a global `opencode` binary. */
  opencodeUseNpx: ["1", "true", "yes"].includes((process.env.OPENCODE_USE_NPX ?? "").toLowerCase()),
  opencodeNpxPackage: process.env.OPENCODE_NPX_PACKAGE ?? "opencode-ai",
  opencodeCommand: process.env.OPENCODE_COMMAND ?? "opencode",
  opencodeModel: process.env.OPENCODE_MODEL ?? "openai/gpt-5.4-mini",
  opencodeSmallModel: process.env.OPENCODE_SMALL_MODEL ?? "openai/gpt-5.4-mini",
  opencodeServerHost: process.env.OPENCODE_SERVER_HOST ?? "127.0.0.1",
  opencodeServerPortBase: Number(process.env.OPENCODE_SERVER_PORT_BASE ?? "4900"),
  maxConcurrentProcesses: Number(process.env.MAX_CONCURRENT_PROCESSES ?? "5"),
  processTimeoutMinutes: Number(process.env.PROCESS_TIMEOUT_MINUTES ?? "90"),
  rootDir: path.resolve(process.cwd(), ".."),
  backendRoot: process.cwd(),
  /** Comma-separated browser origins allowed to call the SDD API (e.g. NexTI Vite dev server). */
  nextiTestingUrls: (process.env.NEXTI_TESTING_URLS ?? "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
};

export function ensureDirSync(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

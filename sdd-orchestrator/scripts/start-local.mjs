import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const backendDir = path.join(rootDir, "backend");
const frontendDir = path.join(rootDir, "frontend");

function copyIfMissing(from, to) {
  if (!fs.existsSync(to) && fs.existsSync(from)) {
    fs.copyFileSync(from, to);
  }
}

async function ensurePostgres() {
  // Quick check if port 5432 is already open
  try {
    const { default: net } = await import("node:net");
    const socket = net.createConnection({ host: "127.0.0.1", port: 5432 });
    await new Promise((resolve, reject) => {
      socket.once("connect", () => { socket.end(); resolve(); });
      socket.once("error", reject);
      socket.setTimeout(2000, () => { socket.destroy(); reject(new Error("timeout")); });
    });
    return; // Postgres already running
  } catch {
    // Not running, try to start with Docker
  }

  const hasDocker = spawnSync("docker", ["--version"], { stdio: "ignore" }).status === 0;
  if (!hasDocker) {
    console.error("Warning: Postgres not running on 5432 and Docker not available");
    return;
  }

  const running = spawnSync("docker", ["inspect", "-f", "{{.State.Running}}", "sdd-orchestrator-postgres"], {
    stdio: "pipe", encoding: "utf8",
  });

  if (running.stdout?.trim() === "true") return;

  if (running.status === 0) {
    spawnSync("docker", ["start", "sdd-orchestrator-postgres"], { stdio: "inherit" });
  } else {
    spawnSync("docker", [
      "run", "-d", "--name", "sdd-orchestrator-postgres",
      "-e", "POSTGRES_USER=postgres",
      "-e", "POSTGRES_PASSWORD=postgres",
      "-e", "POSTGRES_DB=sdd_orchestrator",
      "-p", "5432:5432",
      "-v", "sdd-orchestrator-postgres-data:/var/lib/postgresql/data",
      "postgres:16-alpine",
    ], { stdio: "inherit" });
  }

  // Wait for postgres (max 30s)
  console.log("Waiting for Postgres...");
  for (let i = 0; i < 30; i++) {
    try {
      const { default: net } = await import("node:net");
      const socket = net.createConnection({ host: "127.0.0.1", port: 5432 });
      await new Promise((resolve, reject) => {
        socket.once("connect", () => { socket.end(); resolve(); });
        socket.once("error", reject);
        socket.setTimeout(1000, () => { socket.destroy(); reject(); });
      });
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

// Use pnpm if available, fallback to npx
function getPackageManager() {
  const pnpm = spawnSync(process.platform === "win32" ? "where" : "which", ["pnpm"], { stdio: "ignore" });
  if (pnpm.status === 0) return "pnpm";
  return "npx"; // Will use npx as fallback
}

async function main() {
  // Copy .env files if missing
  copyIfMissing(path.join(rootDir, ".env.example"), path.join(rootDir, ".env"));
  copyIfMissing(path.join(backendDir, ".env.example"), path.join(backendDir, ".env"));
  copyIfMissing(path.join(frontendDir, ".env.example"), path.join(frontendDir, ".env"));

  // Ensure Postgres is running
  await ensurePostgres();

  console.log("Starting backend...");
  const backend = spawn("npm", ["run", "dev"], { cwd: backendDir, stdio: "inherit", shell: process.platform === "win32" });

  console.log("Starting frontend...");
  const frontend = spawn("npm", ["run", "dev"], { cwd: frontendDir, stdio: "inherit", shell: process.platform === "win32" });

  // Handle shutdown
  const shutdown = (signal) => {
    backend.kill(signal);
    frontend.kill(signal);
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  backend.on("exit", (code) => { if (code) process.exitCode = code; frontend.kill(); });
  frontend.on("exit", (code) => { if (code) process.exitCode = code; backend.kill(); });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

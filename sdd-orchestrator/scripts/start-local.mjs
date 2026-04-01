import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const backendDir = path.join(rootDir, "backend");
const frontendDir = path.join(rootDir, "frontend");
const postgresContainer = "sdd-orchestrator-postgres";
const postgresVolume = "sdd-orchestrator-postgres-data";

function copyIfMissing(from, to) {
  if (!fs.existsSync(to) && fs.existsSync(from)) {
    fs.copyFileSync(from, to);
  }
}

function commandExists(command) {
  if (process.platform === "win32") {
    return spawnSync("where", [command], { stdio: "ignore", shell: true }).status === 0;
  }
  return spawnSync("sh", ["-lc", `command -v ${command} >/dev/null 2>&1`], { stdio: "ignore" }).status === 0;
}

function runSync(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(" ")}`);
  }
}

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: "127.0.0.1", port });
    socket.once("connect", () => {
      socket.end();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
    socket.setTimeout(1200, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function waitForPort(port, timeoutMs = 60000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await isPortOpen(port)) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Port ${port} did not open in time`);
}

async function ensurePostgres() {
  if (await isPortOpen(5432)) return;
  if (!commandExists("docker")) {
    throw new Error("Postgres is not running on 5432 and Docker is not available.");
  }

  const inspect = spawnSync("docker", ["inspect", "-f", "{{.State.Running}}", postgresContainer], {
    cwd: rootDir,
    stdio: "pipe",
    shell: process.platform === "win32",
    encoding: "utf8",
  });

  if (inspect.status === 0 && inspect.stdout.trim() === "true") {
    return;
  }

  if (inspect.status === 0) {
    runSync("docker", ["start", postgresContainer], rootDir);
  } else {
    runSync(
      "docker",
      [
        "run",
        "-d",
        "--name",
        postgresContainer,
        "-e",
        "POSTGRES_USER=postgres",
        "-e",
        "POSTGRES_PASSWORD=postgres",
        "-e",
        "POSTGRES_DB=sdd_orchestrator",
        "-p",
        "5432:5432",
        "-v",
        `${postgresVolume}:/var/lib/postgresql/data`,
        "postgres:16-alpine",
      ],
      rootDir,
    );
  }

  await waitForPort(5432);
}

function spawnForeground(command, args, cwd) {
  return spawn(command, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
}

async function main() {
  copyIfMissing(path.join(rootDir, ".env.example"), path.join(rootDir, ".env"));
  copyIfMissing(path.join(backendDir, ".env.example"), path.join(backendDir, ".env"));
  copyIfMissing(path.join(frontendDir, ".env.example"), path.join(frontendDir, ".env"));

  if (!fs.existsSync(path.join(rootDir, "node_modules"))) {
    const pnpm = process.platform === "win32" ? "corepack.cmd" : "corepack";
    runSync(pnpm, ["pnpm", "install"], rootDir);
  }

  await ensurePostgres();

  const child = spawnForeground(process.execPath, [path.join(scriptDir, "dev.mjs")], rootDir);
  child.on("exit", (code) => {
    process.exitCode = code ?? 0;
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

import fs from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");

function copyIfMissing(from, to) {
  if (!fs.existsSync(to) && fs.existsSync(from)) {
    fs.copyFileSync(from, to);
  }
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

function spawnForeground(command, args, cwd) {
  return spawn(command, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
}

async function main() {
  copyIfMissing(path.join(rootDir, ".env.example"), path.join(rootDir, ".env"));

  if (!fs.existsSync(path.join(rootDir, "node_modules"))) {
    runSync(process.platform === "win32" ? "npm.cmd" : "npm", ["ci"], rootDir);
  }

  const child = spawnForeground(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "dev", "--", "--host", "0.0.0.0"], rootDir);
  child.on("exit", (code) => {
    process.exitCode = code ?? 0;
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

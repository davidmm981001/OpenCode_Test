import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");

function copyIfMissing(from, to) {
  if (!fs.existsSync(to) && fs.existsSync(from)) {
    fs.copyFileSync(from, to);
  }
}

async function main() {
  copyIfMissing(path.join(rootDir, ".env.example"), path.join(rootDir, ".env"));

  const child = spawn("npm", ["run", "dev", "--", "--host", "0.0.0.0"], {
    cwd: rootDir,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  process.on("SIGINT", () => child.kill("SIGINT"));
  process.on("SIGTERM", () => child.kill("SIGTERM"));

  child.on("exit", (code) => {
    process.exitCode = code ?? 0;
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

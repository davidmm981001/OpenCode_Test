import { spawn } from "node:child_process";

const backend = spawn("corepack", ["pnpm", "--dir", "backend", "dev"], { stdio: "inherit", shell: true });
const frontend = spawn("corepack", ["pnpm", "--dir", "frontend", "dev"], { stdio: "inherit", shell: true });

function shutdown(signal) {
  backend.kill(signal);
  frontend.kill(signal);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

backend.on("exit", (code) => {
  if (code) process.exitCode = code;
  frontend.kill();
});

frontend.on("exit", (code) => {
  if (code) process.exitCode = code;
  backend.kill();
});

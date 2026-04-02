import { spawn } from "node:child_process";
import net from "node:net";

import { env } from "../env.js";

export async function getFreePort(start = env.opencodeServerPortBase, blockedPorts = new Set<number>()): Promise<number> {
  for (let port = start; port < start + 1000; port += 1) {
    if (blockedPorts.has(port)) continue;
    const available = await new Promise<boolean>((resolve) => {
      const server = net.createServer();
      server.unref();
      server.on("error", () => resolve(false));
      server.listen({ port, host: env.opencodeServerHost }, () => {
        server.close(() => resolve(true));
      });
    });
    if (available) return port;
  }
  throw new Error("No free port available for opencode server");
}

export function spawnOpenCodeServe(port: number, cwd: string) {
  const extraEnv: Record<string, string> = {};
  if (process.env.OPENCODE_SERVER_PASSWORD) {
    extraEnv.OPENCODE_SERVER_PASSWORD = process.env.OPENCODE_SERVER_PASSWORD;
  }

  const useShell = process.platform === "win32";
  const serveArgs = ["serve", "--port", String(port), "--hostname", env.opencodeServerHost];
  const childEnv = {
    ...process.env,
    OPENAI_API_KEY: env.openaiApiKey,
    ...extraEnv,
  };

  const child = env.opencodeUseNpx
    ? spawn("npx", ["-y", env.opencodeNpxPackage, ...serveArgs], {
        cwd,
        env: childEnv,
        shell: useShell,
        stdio: ["pipe", "pipe", "pipe"],
      })
    : spawn(env.opencodeCommand, serveArgs, {
        cwd,
        env: childEnv,
        shell: useShell,
        stdio: ["pipe", "pipe", "pipe"],
      });

  return child;
}

export async function waitForHealth(baseUrl: string, timeoutMs = 180000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(`${baseUrl}/global/health`);
      if (response.ok) return true;
    } catch {
      // ignore
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("OpenCode server did not start in time");
}

export async function createSession(baseUrl: string, title: string) {
  const response = await fetch(`${baseUrl}/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!response.ok) throw new Error(`Failed to create session: ${response.status}`);
  return (await response.json()) as { id: string };
}

export async function sendPrompt(
  baseUrl: string,
  sessionId: string,
  prompt: string,
  options: { system?: string } = {},
) {
  const response = await fetch(`${baseUrl}/session/${sessionId}/prompt_async`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: { providerID: "openai", modelID: "gpt-5.4-mini" },
      ...(options.system ? { system: options.system } : {}),
      parts: [{ type: "text", text: prompt }],
    }),
  });
  if (!response.ok) throw new Error(`Failed to send prompt: ${response.status}`);
}

export async function getSessionMessages(baseUrl: string, sessionId: string, limit = 200) {
  const response = await fetch(`${baseUrl}/session/${sessionId}/message?limit=${limit}`);
  if (!response.ok) throw new Error(`Failed to read session messages: ${response.status}`);
  return (await response.json()) as Array<{ info?: { role?: string; id?: string }; parts?: Array<{ type?: string; text?: string }> }>;
}

export function parseSseLineBuffer(buffer: string, onEvent: (event: string, data: string) => void) {
  const events = buffer.split("\n\n");
  const rest = events.pop() ?? "";
  for (const eventBlock of events) {
    const lines = eventBlock.split("\n");
    let event = "message";
    const dataLines: string[] = [];
    for (const line of lines) {
      if (line.startsWith("event:")) event = line.slice(6).trim();
      if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
    }
    onEvent(event, dataLines.join("\n"));
  }
  return rest;
}

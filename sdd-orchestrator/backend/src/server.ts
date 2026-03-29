import http from "node:http";

import { WebSocketServer } from "ws";

import { env } from "./env.js";
import { createApp } from "./app.js";
import { cleanupRunningProjectsOnBoot, getRuntimeSnapshot, sendProjectInput, subscribe } from "./lib/process-supervisor.js";
import { getProject } from "./services/projects.js";

await cleanupRunningProjectsOnBoot();

const app = createApp();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", async (socket, request) => {
  const url = new URL(request.url ?? "", `http://${request.headers.host}`);
  const projectId = url.searchParams.get("projectId") ?? "";
  if (!projectId) {
    socket.close(1008, "projectId required");
    return;
  }

  const project = await getProject(projectId);
  if (!project) {
    socket.close(1008, "project not found");
    return;
  }

  const snapshot = getRuntimeSnapshot(projectId);
  if (snapshot) socket.send(JSON.stringify({ type: "snapshot", ...snapshot }));

  let unsubscribe: (() => void) | undefined;
  try {
    unsubscribe = subscribe(projectId, (event) => socket.readyState === socket.OPEN && socket.send(JSON.stringify(event)));
  } catch {
    // no runtime yet; the UI can still connect for idle projects
  }

  socket.on("message", async (raw) => {
    try {
      const payload = JSON.parse(raw.toString("utf8")) as { type?: string; message?: string };
      if (payload.type === "input" && payload.message) {
        await sendProjectInput(projectId, payload.message);
      }
    } catch {
      socket.send(JSON.stringify({ type: "error", message: "Invalid message payload" }));
    }
  });

  socket.on("close", () => {
    unsubscribe?.();
  });
});

server.listen(env.appPort, "0.0.0.0", () => {
  console.log(`SDD Orchestrator backend running on http://localhost:${env.appPort}`);
});

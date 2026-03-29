import path from "node:path";

import cors from "cors";
import express from "express";

import { env } from "./env.js";
import { healthRouter } from "./routes/health.js";
import { projectsRouter } from "./routes/projects.js";

export function createApp() {
  const app = express();
  app.use(express.json({ limit: "5mb" }));
  app.use(
    cors({
      origin: [env.apiBaseUrl, env.ragAppUrl, env.managerUrl, "http://localhost:3002", "http://localhost:3000", "http://localhost:3001"],
    }),
  );

  app.use("/api/health", healthRouter);
  app.use("/api/projects", projectsRouter);

  if (env.nodeEnv === "production") {
    const distDir = path.resolve(env.rootDir, "frontend", "dist");
    app.use(express.static(distDir));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distDir, "index.html"));
    });
  }

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const message = err instanceof Error ? err.message : "Unexpected error";
    res.status(500).json({ message });
  });

  return app;
}

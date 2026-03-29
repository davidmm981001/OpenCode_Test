import { Router } from "express";
import fs from "node:fs";

import { ProjectStatus } from "@prisma/client";

import { projectToJson } from "../lib/serialize.js";
import { stopProjectRuntime } from "../lib/process-supervisor.js";
import { getProjectWorkspacePath } from "../lib/workspace.js";
import { createProject, deleteProject, getProject, listProjects, updateProject } from "../services/projects.js";
import { markProjectComplete, startProjectGeneration } from "../lib/process-supervisor.js";

export const projectsRouter = Router();

projectsRouter.get("/", async (_req, res, next) => {
  try {
    const projects = await listProjects();
    res.json(projects.map(projectToJson));
  } catch (error) {
    next(error);
  }
});

projectsRouter.post("/", async (req, res, next) => {
  try {
    const { name, userStories } = req.body as { name?: string; userStories?: string };
    const cleanName = name?.trim() ?? "";
    const cleanStories = userStories?.trim() ?? "";
    if (!cleanName || !cleanStories) {
      return res.status(400).json({ message: "Name and user stories are required" });
    }
    const project = await createProject(cleanName, cleanStories);
    res.status(201).json(projectToJson(project));
  } catch (error) {
    next(error);
  }
});

projectsRouter.get("/:id", async (req, res, next) => {
  try {
    const project = await getProject(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(projectToJson(project));
  } catch (error) {
    next(error);
  }
});

projectsRouter.patch("/:id", async (req, res, next) => {
  try {
    const patch = req.body as { name?: string; userStories?: string };
    const nextPatch = {
      ...(patch.name !== undefined ? { name: patch.name.trim() } : {}),
      ...(patch.userStories !== undefined ? { userStories: patch.userStories.trim() } : {}),
    };
    if (Object.values(nextPatch).some((value) => value === "")) {
      return res.status(400).json({ message: "Name and user stories cannot be empty" });
    }
    const project = await updateProject(req.params.id, nextPatch);
    res.json(projectToJson(project));
  } catch (error) {
    next(error);
  }
});

projectsRouter.delete("/:id", async (req, res, next) => {
  try {
    const { confirmName } = req.body as { confirmName?: string };
    const project = await getProject(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (confirmName !== project.name) return res.status(400).json({ message: "The confirmation name does not match." });
    await stopProjectRuntime(project.id);
    await deleteProject(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

projectsRouter.post("/:id/generate", async (req, res, next) => {
  try {
    const project = await getProject(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.status === ProjectStatus.running) return res.status(409).json({ message: "Project already running" });
    if (project.status === ProjectStatus.completed) return res.status(409).json({ message: "Project is already completed" });
    const snapshot = await startProjectGeneration(project.id, project.name, project.userStories, getProjectWorkspacePath(project.id));
    const fresh = await getProject(project.id);
    res.json({ project: projectToJson(fresh ?? project), snapshot });
  } catch (error) {
    next(error);
  }
});

projectsRouter.post("/:id/complete", async (req, res, next) => {
  try {
    const project = await getProject(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.status !== ProjectStatus.running) {
      return res.status(409).json({ message: "Project must be running before completion" });
    }
    const result = await markProjectComplete(project.id, project.workspacePath);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

projectsRouter.get("/:id/download", async (req, res, next) => {
  try {
    const project = await getProject(req.params.id);
    if (!project || !project.zipPath || !fs.existsSync(project.zipPath)) {
      return res.status(404).json({ message: "Zip not found" });
    }
    res.download(project.zipPath, `${project.name}.zip`);
  } catch (error) {
    next(error);
  }
});

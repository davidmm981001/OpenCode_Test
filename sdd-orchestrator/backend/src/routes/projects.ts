import { Router } from "express";
import fs from "node:fs";

import { ProjectStatus } from "@prisma/client";

import { projectToJson } from "../lib/serialize.js";
import { canCompleteProject, canStartProjectGeneration } from "../lib/project-runtime-policy.js";
import { getRuntimeSnapshot, markProjectComplete, startProjectGeneration, stopProjectRuntime } from "../lib/process-supervisor.js";
import { countFilesRecursive, getProjectWorkspacePath, listWorkspaceFiles, sizeBytesRecursive } from "../lib/workspace.js";
import { createProject, deleteProject, getProject, listProjects, updateProject } from "../services/projects.js";

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

projectsRouter.get("/:id/status", async (req, res, next) => {
  try {
    const project = await getProject(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    const execution = await getRuntimeSnapshot(project.id);
    res.json({ project: projectToJson(project), execution });
  } catch (error) {
    next(error);
  }
});

projectsRouter.get("/:id/files", async (req, res, next) => {
  try {
    const project = await getProject(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    const files = listWorkspaceFiles(project.workspacePath, 4);
    res.json({
      projectId: project.id,
      files,
      stats: {
        fileCount: countFilesRecursive(project.workspacePath),
        totalBytes: sizeBytesRecursive(project.workspacePath),
      },
    });
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
    if ((error as Error).message === "Running projects cannot be edited") {
      return res.status(409).json({ message: (error as Error).message });
    }
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
    const currentExecution = await getRuntimeSnapshot(project.id);
    if (!canStartProjectGeneration(project.status, currentExecution.phase)) {
      return res.status(409).json({ message: "Project already running" });
    }
    void startProjectGeneration(project.id, project.name, project.userStories, getProjectWorkspacePath(project.id)).catch((error) => {
      console.error("Project generation failed", error);
    });
    const nextExecution = await getRuntimeSnapshot(project.id);
    res.status(202).json({ project: { ...projectToJson(project), status: nextExecution.status }, execution: nextExecution });
  } catch (error) {
    next(error);
  }
});

projectsRouter.post("/:id/stop", async (req, res, next) => {
  try {
    const project = await getProject(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    const currentExecution = await getRuntimeSnapshot(project.id);
    if (currentExecution.phase === "idle" || currentExecution.phase === "completed" || currentExecution.phase === "error") {
      return res.status(409).json({ message: "Project is not running" });
    }
    if (currentExecution.phase === "stopping") {
      return res.status(202).json({ project: projectToJson(project), execution: currentExecution });
    }
    void stopProjectRuntime(project.id).catch((error) => {
      console.error("Project stop failed", error);
    });
    const nextExecution = await getRuntimeSnapshot(project.id);
    res.status(202).json({ project: projectToJson(project), execution: nextExecution });
  } catch (error) {
    next(error);
  }
});

projectsRouter.post("/:id/complete", async (req, res, next) => {
  try {
    const project = await getProject(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    const execution = await getRuntimeSnapshot(project.id);
    const { confirmed } = req.body as { confirmed?: boolean };
    if (confirmed !== true) {
      return res.status(400).json({ message: "Completion confirmation is required" });
    }
    if (!canCompleteProject(project.status, execution.phase)) {
      return res.status(409).json({ message: "Project must be running before completion" });
    }
    void markProjectComplete(project.id, project.workspacePath).catch((error) => {
      console.error("Project completion failed", error);
    });
    const packagingExecution = { ...execution, phase: "packaging", status: ProjectStatus.running, message: "Empaquetando proyecto" };
    res.status(202).json({ project: { ...projectToJson(project), status: packagingExecution.status }, execution: packagingExecution });
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

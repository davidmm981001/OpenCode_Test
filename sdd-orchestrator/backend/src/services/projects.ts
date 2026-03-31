import { ProjectStatus } from "@prisma/client";

import { getPrisma } from "../prisma.js";
import { createOpenCodeConfig, createOpenSpecWorkspace } from "../lib/openSpec.js";
import { countFilesRecursive, getProjectWorkspacePath, getProjectZipPath, removePathIfExists } from "../lib/workspace.js";

export async function listProjects() {
  return getPrisma().project.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getProject(id: string) {
  return getPrisma().project.findUnique({ where: { id } });
}

export async function createProject(name: string, userStories: string) {
  const prisma = getPrisma();
  const project = await prisma.project.create({
    data: {
      name,
      userStories,
      status: ProjectStatus.idle,
      workspacePath: "",
    },
  });

  const workspacePath = getProjectWorkspacePath(project.id);
  await prisma.project.update({ where: { id: project.id }, data: { workspacePath } });
  createOpenSpecWorkspace(workspacePath, project.id, name, userStories);
  createOpenCodeConfig(workspacePath, project.id, name, userStories);

  return prisma.project.findUniqueOrThrow({ where: { id: project.id } });
}

export async function updateProject(id: string, patch: { name?: string; userStories?: string }) {
  const prisma = getPrisma();
  const current = await prisma.project.findUniqueOrThrow({ where: { id } });
  if (current.status === ProjectStatus.running) {
    throw new Error("Running projects cannot be edited");
  }
  const project = await prisma.project.update({ where: { id }, data: patch });
  if (patch.name || patch.userStories) {
    createOpenSpecWorkspace(project.workspacePath, project.id, project.name, project.userStories);
    createOpenCodeConfig(project.workspacePath, project.id, project.name, project.userStories);
  }
  return project;
}

export async function deleteProject(id: string) {
  const prisma = getPrisma();
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return null;
  await prisma.project.delete({ where: { id } });
  removePathIfExists(project.workspacePath);
  removePathIfExists(getProjectZipPath(project.id));
  return project;
}

export async function updateProjectStatus(id: string, status: ProjectStatus, patch: Record<string, unknown> = {}) {
  return getPrisma().project.update({ where: { id }, data: { status, ...patch } });
}

export async function refreshProjectFileCount(id: string) {
  const prisma = getPrisma();
  const project = await prisma.project.findUniqueOrThrow({ where: { id } });
  const fileCount = countFilesRecursive(project.workspacePath);
  return prisma.project.update({ where: { id }, data: { fileCount } });
}

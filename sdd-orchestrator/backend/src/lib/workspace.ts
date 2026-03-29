import fs from "node:fs";
import path from "node:path";

import { ensureDirSync, env } from "../env.js";

export const workspacesRoot = path.resolve(env.rootDir, "projects");
export const completedRoot = path.resolve(env.rootDir, "completed-projects");

export function ensureWorkspaceRoots() {
  ensureDirSync(workspacesRoot);
  ensureDirSync(completedRoot);
}

export function getProjectWorkspacePath(projectId: string) {
  return path.join(workspacesRoot, projectId);
}

export function getProjectZipPath(projectId: string) {
  return path.join(completedRoot, `${projectId}.zip`);
}

export function removePathIfExists(targetPath: string) {
  if (!fs.existsSync(targetPath)) return;
  fs.rmSync(targetPath, { recursive: true, force: true });
}

export function countFilesRecursive(dir: string): number {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) count += countFilesRecursive(full);
    else count += 1;
  }
  return count;
}

export function sizeBytesRecursive(dir: string): number {
  if (!fs.existsSync(dir)) return 0;
  let total = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) total += sizeBytesRecursive(full);
    else total += fs.statSync(full).size;
  }
  return total;
}

export type WorkspaceFileEntry = {
  path: string;
  name: string;
  type: "file" | "directory";
  depth: number;
};

export function listWorkspaceFiles(dir: string, maxDepth = 4, currentDepth = 0, baseDir = dir): WorkspaceFileEntry[] {
  if (!fs.existsSync(dir) || currentDepth > maxDepth) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name);
    const relative = path.relative(baseDir, full) || entry.name;
    const item: WorkspaceFileEntry = {
      path: relative.split(path.sep).join("/"),
      name: entry.name,
      type: entry.isDirectory() ? "directory" : "file",
      depth: currentDepth,
    };
    if (!entry.isDirectory()) return [item];
    return [item, ...listWorkspaceFiles(full, maxDepth, currentDepth + 1, baseDir)];
  });
}

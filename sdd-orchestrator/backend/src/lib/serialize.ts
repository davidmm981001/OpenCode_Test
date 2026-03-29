import { ProjectStatus } from "@prisma/client";

export function projectToJson(project: {
  id: string;
  name: string;
  userStories: string;
  status: ProjectStatus;
  workspacePath: string;
  zipPath: string | null;
  zipSizeBytes: bigint | number | null;
  fileCount: number | null;
  completedAt: Date | null;
  lastError: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...project,
    zipSizeBytes: project.zipSizeBytes == null ? null : Number(project.zipSizeBytes),
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    completedAt: project.completedAt ? project.completedAt.toISOString() : null,
  };
}

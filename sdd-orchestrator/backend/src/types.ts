export type ProjectStatus = "idle" | "running" | "completed" | "error";

export type ProjectRecord = {
  id: string;
  name: string;
  userStories: string;
  status: ProjectStatus;
  workspacePath: string;
  zipPath: string | null;
  zipSizeBytes: number | null;
  fileCount: number | null;
  completedAt: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TerminalEvent =
  | { type: "snapshot"; lines: string[]; projectId: string; status: ProjectStatus; inputEnabled: boolean }
  | { type: "line"; line: string; stream: "stdout" | "stderr" | "system" }
  | { type: "status"; status: ProjectStatus }
  | { type: "input_enabled"; inputEnabled: boolean }
  | { type: "error"; message: string }
  | { type: "completion_ready"; message: string }
  | { type: "completion_confirmed"; zipPath: string; zipSizeBytes: number; fileCount: number };

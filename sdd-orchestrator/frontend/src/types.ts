export type ProjectStatus = "idle" | "running" | "completed" | "error";

export type ExecutionPhase = "idle" | "preparing" | "starting" | "running" | "waiting_input" | "monitoring" | "packaging" | "stopping" | "completed" | "error";

export type Project = {
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

export type ProjectExecutionSnapshot = {
  projectId: string;
  phase: ExecutionPhase;
  status: ProjectStatus;
  lines: string[];
  inputEnabled: boolean;
  sessionId: string | null;
  port: number | null;
  lastError: string | null;
  message: string | null;
  lastOutputAt: number | null;
  usage: {
    inputTokens: number;
    outputTokens: number;
    reasoningTokens: number;
    cacheReadTokens: number;
    cacheWriteTokens: number;
    estimatedCostUsd: number | null;
  };
};

export type ProjectStatusResponse = {
  project: Project;
  execution: ProjectExecutionSnapshot;
};

export type WorkspaceFileEntry = {
  path: string;
  name: string;
  type: "file" | "directory";
  depth: number;
};

export type WorkspaceFilesResponse = {
  projectId: string;
  files: WorkspaceFileEntry[];
  stats: {
    fileCount: number;
    totalBytes: number;
  };
};

export type GenerationCacheArtifactKind = "workspace-files" | "console-transcript-chunks" | "zip-blob";
export type GenerationCacheTab = "stories" | "console" | "result";

export type GenerationCacheMetadata = {
  projectId: string;
  versionId: string;
  tab: GenerationCacheTab;
  completed: boolean;
  status: ProjectStatus;
  phase: ExecutionPhase;
  sessionId: string | null;
  inputEnabled: boolean;
  zipPath: string | null;
  workspaceFileCount: number;
  totalBytes: number | null;
  consoleLineCount: number;
  zipSizeBytes: number | null;
  completedAt: string | null;
  lastError: string | null;
  message: string | null;
  updatedAt: string;
};

export type GenerationCacheSnapshot = {
  metadata: GenerationCacheMetadata;
  workspaceFiles: WorkspaceFileEntry[];
  consoleTranscriptChunks: string[];
  zipBlob: Blob | null;
};

export type TerminalPayload =
  | { type: "snapshot"; projectId: string; phase: ExecutionPhase; status: ProjectStatus; lines: string[]; inputEnabled: boolean; sessionId: string | null; port: number | null; lastError: string | null; message: string | null; lastOutputAt: number | null; usage: ProjectExecutionSnapshot["usage"] }
  | { type: "line"; line: string; stream: "stdout" | "stderr" | "system" }
  | { type: "status"; status: ProjectStatus; phase: ExecutionPhase; message?: string | null }
  | { type: "phase"; phase: ExecutionPhase; message?: string | null }
  | { type: "input_enabled"; inputEnabled: boolean }
  | { type: "error"; message: string }
  | { type: "completion_ready"; message: string }
  | { type: "completion_confirmed"; zipPath: string; zipSizeBytes: number; fileCount: number };

import type {
  GenerationCacheMetadata,
  GenerationCacheSnapshot,
  ProjectExecutionSnapshot,
  WorkspaceFileEntry,
} from "../types";
import {
  clearGenerationCacheArtifacts,
  deleteGenerationCacheArtifact,
  getGenerationCacheArtifact,
  putGenerationCacheArtifact,
} from "./indexeddb";

const METADATA_STORAGE_KEY = "sdd-orchestrator:generation-cache:metadata";

type GenerationCacheIndex = Record<string, GenerationCacheMetadata>;

export function buildGenerationCacheKey(projectId: string, versionId: string) {
  return `${projectId.trim()}::${versionId.trim()}`;
}

export function resolveGenerationCacheVersion(userStories: string): string | null {
  const match = userStories.match(/<!--\s*nexti-sdd-meta\s+([^>]+)\s*-->/i);
  if (!match) return null;

  try {
    const parsed = JSON.parse(match[1].trim()) as { sourceRunId?: string | null };
    return parsed.sourceRunId?.trim() || null;
  } catch {
    return null;
  }
}

function readMetadataIndex(): GenerationCacheIndex {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(METADATA_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as GenerationCacheIndex;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeMetadataIndex(index: GenerationCacheIndex) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(METADATA_STORAGE_KEY, JSON.stringify(index));
}

function normalizeMetadata(metadata: GenerationCacheMetadata): GenerationCacheMetadata {
  return {
    ...metadata,
    projectId: metadata.projectId.trim(),
    versionId: metadata.versionId.trim(),
    zipPath: metadata.zipPath?.trim() || null,
    sessionId: metadata.sessionId?.trim() || null,
    lastError: metadata.lastError?.trim() || null,
    message: metadata.message?.trim() || null,
    completedAt: metadata.completedAt?.trim() || null,
  };
}

export function createGenerationCacheMetadata(metadata: GenerationCacheMetadata): GenerationCacheMetadata {
  return normalizeMetadata(metadata);
}

export async function saveGenerationCacheSnapshot(snapshot: GenerationCacheSnapshot): Promise<void> {
  const metadata = normalizeMetadata(snapshot.metadata);
  const key = buildGenerationCacheKey(metadata.projectId, metadata.versionId);
  const index = readMetadataIndex();
  index[key] = metadata;
  writeMetadataIndex(index);

  await Promise.all([
    putGenerationCacheArtifact({
      projectId: metadata.projectId,
      versionId: metadata.versionId,
      kind: "workspace-files",
      value: snapshot.workspaceFiles,
    }),
    putGenerationCacheArtifact({
      projectId: metadata.projectId,
      versionId: metadata.versionId,
      kind: "console-transcript-chunks",
      value: snapshot.consoleTranscriptChunks,
    }),
    snapshot.zipBlob
      ? putGenerationCacheArtifact({
          projectId: metadata.projectId,
          versionId: metadata.versionId,
          kind: "zip-blob",
          value: snapshot.zipBlob,
        })
      : deleteGenerationCacheArtifact(metadata.projectId, metadata.versionId, "zip-blob"),
  ]);
}

export async function loadGenerationCacheSnapshot(
  projectId: string,
  versionId: string,
): Promise<GenerationCacheSnapshot | null> {
  const key = buildGenerationCacheKey(projectId, versionId);
  const metadata = readMetadataIndex()[key];
  if (!metadata) return null;

  const [workspaceFiles, consoleTranscriptChunks, zipBlob] = await Promise.all([
    getGenerationCacheArtifact<WorkspaceFileEntry[]>(projectId, versionId, "workspace-files"),
    getGenerationCacheArtifact<string[]>(projectId, versionId, "console-transcript-chunks"),
    getGenerationCacheArtifact<Blob>(projectId, versionId, "zip-blob"),
  ]);

  return {
    metadata,
    workspaceFiles: workspaceFiles ?? [],
    consoleTranscriptChunks: consoleTranscriptChunks ?? [],
    zipBlob: zipBlob ?? null,
  };
}

export async function clearGenerationCache(projectId: string, versionId: string): Promise<void> {
  const key = buildGenerationCacheKey(projectId, versionId);
  const index = readMetadataIndex();
  if (index[key]) {
    delete index[key];
    writeMetadataIndex(index);
  }

  await clearGenerationCacheArtifacts(projectId, versionId);
}

export async function clearGenerationCacheProject(projectId: string): Promise<void> {
  const index = readMetadataIndex();
  const entries = Object.values(index).filter((entry) => entry.projectId === projectId);

  if (entries.length === 0) return;

  for (const entry of entries) {
    delete index[buildGenerationCacheKey(entry.projectId, entry.versionId)];
  }
  writeMetadataIndex(index);

  await Promise.all(entries.map((entry) => clearGenerationCacheArtifacts(entry.projectId, entry.versionId)));
}

export function listGenerationCacheMetadata(projectId?: string): GenerationCacheMetadata[] {
  const index = readMetadataIndex();
  const values = Object.values(index);
  return projectId ? values.filter((entry) => entry.projectId === projectId) : values;
}

export function getLatestGenerationCacheMetadata(projectId: string): GenerationCacheMetadata | null {
  return (
    listGenerationCacheMetadata(projectId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] ?? null
  );
}

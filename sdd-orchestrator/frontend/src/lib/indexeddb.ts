import type { GenerationCacheArtifactKind } from "../types";

const DB_NAME = "sdd-orchestrator:generation-cache";
const DB_VERSION = 1;
const STORE_NAME = "artifacts";

const ARTIFACT_KINDS: GenerationCacheArtifactKind[] = [
  "workspace-files",
  "console-transcript-chunks",
  "zip-blob",
];

type GenerationCacheArtifactRecord<T = unknown> = {
  id: string;
  projectId: string;
  versionId: string;
  kind: GenerationCacheArtifactKind;
  value: T;
  updatedAt: string;
};

function isBrowser() {
  return typeof indexedDB !== "undefined";
}

function artifactId(projectId: string, versionId: string, kind: GenerationCacheArtifactKind) {
  return `${projectId.trim()}::${versionId.trim()}::${kind}`;
}

function openGenerationCacheDb(): Promise<IDBDatabase> {
  if (!isBrowser()) {
    return Promise.reject(new Error("IndexedDB is not available in this environment."));
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error ?? new Error("Failed to open generation cache database."));
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

async function withStore<T>(mode: IDBTransactionMode, handler: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openGenerationCacheDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    const request = handler(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed."));
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB transaction failed."));
    tx.oncomplete = () => db.close();
  });
}

export function buildGenerationCacheArtifactId(
  projectId: string,
  versionId: string,
  kind: GenerationCacheArtifactKind,
) {
  return artifactId(projectId, versionId, kind);
}

export async function putGenerationCacheArtifact<T>(record: {
  projectId: string;
  versionId: string;
  kind: GenerationCacheArtifactKind;
  value: T;
}): Promise<void> {
  const payload: GenerationCacheArtifactRecord<T> = {
    id: artifactId(record.projectId, record.versionId, record.kind),
    projectId: record.projectId,
    versionId: record.versionId,
    kind: record.kind,
    value: record.value,
    updatedAt: new Date().toISOString(),
  };

  await withStore("readwrite", (store) => store.put(payload));
}

export async function getGenerationCacheArtifact<T>(
  projectId: string,
  versionId: string,
  kind: GenerationCacheArtifactKind,
): Promise<T | null> {
  const record = await withStore<GenerationCacheArtifactRecord<T> | undefined>("readonly", (store) =>
    store.get(artifactId(projectId, versionId, kind)),
  );
  return record?.value ?? null;
}

export async function deleteGenerationCacheArtifact(
  projectId: string,
  versionId: string,
  kind: GenerationCacheArtifactKind,
): Promise<void> {
  await withStore("readwrite", (store) => store.delete(artifactId(projectId, versionId, kind)));
}

export async function clearGenerationCacheArtifacts(projectId: string, versionId: string): Promise<void> {
  await Promise.all(ARTIFACT_KINDS.map((kind) => deleteGenerationCacheArtifact(projectId, versionId, kind)));
}

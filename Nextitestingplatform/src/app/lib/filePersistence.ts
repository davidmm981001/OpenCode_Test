const DB_NAME = 'nexti_uploaded_files_v1';
const STORE_NAME = 'files';
const DB_VERSION = 1;

export interface PersistedFileEntry {
  name: string;
  type: string;
  lastModified: number;
  data: ArrayBuffer;
}

export type FileCategory = 'reqDocs' | 'storyDocs' | 'codeDocs' | 'projectZips';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not available'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    const r = fn(store);
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
    tx.oncomplete = () => db.close();
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

function storageKey(projectId: string, category: FileCategory): string {
  return `${projectId}::${category}`;
}

export async function saveFiles(
  projectId: string,
  category: FileCategory,
  files: File[],
): Promise<void> {
  try {
    const entries: PersistedFileEntry[] = await Promise.all(
      files.map(async (f) => ({
        name: f.name,
        type: f.type,
        lastModified: f.lastModified,
        data: await f.arrayBuffer(),
      })),
    );
    await withStore('readwrite', (store) => store.put(entries, storageKey(projectId, category)));
  } catch {
    // Graceful degradation — IndexedDB unavailable or full
  }
}

export async function loadFiles(
  projectId: string,
  category: FileCategory,
): Promise<File[]> {
  try {
    const entries = await withStore('readonly', (store) =>
      store.get(storageKey(projectId, category)),
    );
    if (!Array.isArray(entries)) return [];
    return entries.map(
      (e: PersistedFileEntry) => new File([e.data], e.name, { type: e.type, lastModified: e.lastModified }),
    );
  } catch {
    return [];
  }
}

export async function clearFiles(projectId: string, category: FileCategory): Promise<void> {
  try {
    await withStore('readwrite', (store) => store.delete(storageKey(projectId, category)));
  } catch {
    // Ignore
  }
}

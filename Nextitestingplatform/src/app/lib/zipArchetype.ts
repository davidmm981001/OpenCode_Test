import JSZip from 'jszip';

export type ZipFileEntry = {
  content: Uint8Array | string;
  isText: boolean;
};

export type ZipFileMap = Map<string, ZipFileEntry>;

export type GeneratedFileLike = {
  path: string;
  content: string;
};

export type ScriptDisplayFile = {
  name: string;
  path: string;
  content: string;
};

export type ScriptDisplayTreeNode = {
  name: string;
  path: string;
  folders: ScriptDisplayTreeNode[];
  files: ScriptDisplayFile[];
};

function normalizeZipPath(p: string): string {
  // JSZip uses forward slashes; ensure no leading slash.
  return p.replace(/\\/g, '/').replace(/^\/+/, '');
}

function splitPathParts(path: string): string[] {
  return path.split('/').filter(Boolean);
}

function guessIfText(path: string): boolean {
  const lower = path.toLowerCase();
  return (
    lower.endsWith('.txt') ||
    lower.endsWith('.md') ||
    lower.endsWith('.js') ||
    lower.endsWith('.ts') ||
    lower.endsWith('.tsx') ||
    lower.endsWith('.json') ||
    lower.endsWith('.yaml') ||
    lower.endsWith('.yml') ||
    lower.endsWith('.xml') ||
    lower.endsWith('.feature') ||
    lower.endsWith('.gherkin') ||
    lower.endsWith('.html') ||
    lower.endsWith('.css') ||
    lower.endsWith('.java') ||
    lower.endsWith('.cs') ||
    lower.endsWith('.py') ||
    lower.endsWith('.rb') ||
    lower.endsWith('.go') ||
    lower.endsWith('.sql') ||
    lower.endsWith('.esql')
  );
}

export async function loadZipToFileMap(zipFile: File): Promise<ZipFileMap> {
  const buffer = await zipFile.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);

  const fileMap: ZipFileMap = new Map();

  const entries = Object.entries(zip.files);
  for (const [path, entry] of entries) {
    if (entry.dir) continue;
    const normalized = normalizeZipPath(path);
    if (normalized.startsWith('__MACOSX/') || normalized.includes('.DS_Store') || normalized.split('/').some(p => p.startsWith('._'))) continue;
    const isText = guessIfText(normalized);

    if (isText) {
      const text = await entry.async('string');
      fileMap.set(normalized, { content: text, isText: true });
    } else {
      const bytes = await entry.async('uint8array');
      fileMap.set(normalized, { content: bytes, isText: false });
    }
  }

  return fileMap;
}

/** Extract all paths (files + parent dirs) from archetype for sending to n8n. */
export function extractArchetypePaths(fileMap: ZipFileMap): string[] {
  const paths = new Set<string>();
  for (const path of fileMap.keys()) {
    const normalized = path.replace(/\\/g, '/').replace(/^\/+/, '');
    paths.add(normalized);
    const parts = normalized.split('/').filter(Boolean);
    for (let i = 1; i < parts.length; i++) {
      paths.add(parts.slice(0, i).join('/'));
    }
  }
  return Array.from(paths).sort();
}

/** Find archetype folder that should contain generated files of this type (e.g. features/, tests/, e2e/). */
function findArchetypeTargetFolderForFile(
  archetypeFileMap: ZipFileMap,
  generatedPath: string,
): string | null {
  const normalized = normalizeZipPath(generatedPath);
  const basename = splitPathParts(normalized).pop() ?? '';
  const ext = basename.includes('.') ? basename.split('.').pop()?.toLowerCase() ?? '' : '';

  const extToFolders: Record<string, string[]> = {
    feature: ['features', 'feature'],
    gherkin: ['features', 'feature'],
    ts: ['e2e', 'tests', 'spec', 'specs'],
    js: ['e2e', 'tests', 'spec', 'specs'],
    java: ['tests', 'test', 'java', 'screenplay', 'stepdefinitions', 'steps'],
    jmx: ['tests', 'jmeter', 'scripts'],
  };
  const preferred = extToFolders[ext] ?? ['features', 'e2e', 'tests', 'spec', 'specs', 'test'];

  for (const folderName of preferred) {
    for (const path of archetypeFileMap.keys()) {
      const pathNorm = normalizeZipPath(path);
      const pathLower = pathNorm.toLowerCase();
      if (!pathLower.includes(`/${folderName}/`)) continue;
      const sameExt =
        pathLower.endsWith(`.${ext}`) ||
        (ext === 'feature' && (pathLower.endsWith('.feature') || pathLower.endsWith('.gherkin')));
      if (!sameExt && ext) continue;
      const parts = splitPathParts(pathNorm);
      const folderIdx = parts.findIndex(p => p.toLowerCase() === folderName);
      if (folderIdx < 0) continue;
      const targetDir = parts.slice(0, folderIdx + 1).join('/');
      return targetDir;
    }
  }
  return null;
}

/**
 * Resolve generated file path into archetype structure.
 * If the generated path is already inside archetype (matches a known dir), use it.
 * Otherwise place at archetype's target folder for this file type.
 */
function resolveGeneratedPathToArchetype(
  archetypeFileMap: ZipFileMap,
  generatedPath: string,
  archetypeDirs: Set<string>,
): string {
  const normalized = normalizeZipPath(generatedPath);
  const parts = splitPathParts(normalized);
  const dir = parts.slice(0, -1).join('/');
  const basename = parts[parts.length - 1] ?? 'file';

  if (dir === '' || archetypeDirs.has(dir)) return normalized;

  const targetDir = findArchetypeTargetFolderForFile(archetypeFileMap, generatedPath);
  if (targetDir) {
    return normalizeZipPath(`${targetDir}/${basename}`);
  }
  return normalized;
}

/** Return generated files with paths resolved to archetype structure (for display/merge). */
export function resolveGeneratedPathsForArchetype(
  archetypeFileMap: ZipFileMap,
  generatedFiles: GeneratedFileLike[],
): GeneratedFileLike[] {
  const archetypeDirs = new Set<string>();
  for (const path of archetypeFileMap.keys()) {
    const norm = normalizeZipPath(path);
    const parts = splitPathParts(norm);
    for (let i = 1; i < parts.length; i++) {
      archetypeDirs.add(parts.slice(0, i).join('/'));
    }
  }
  return generatedFiles.map(f => ({
    path: resolveGeneratedPathToArchetype(archetypeFileMap, f.path, archetypeDirs),
    content: f.content,
  }));
}

export function mergeGeneratedFilesIntoArchetype(
  archetypeFileMap: ZipFileMap,
  generatedFiles: GeneratedFileLike[],
): ZipFileMap {
  const merged: ZipFileMap = new Map(archetypeFileMap);
  const resolved = resolveGeneratedPathsForArchetype(archetypeFileMap, generatedFiles);
  for (const f of resolved) {
    merged.set(normalizeZipPath(f.path), { content: f.content, isText: true });
  }
  return merged;
}

export async function createZipFromFileMap(fileMap: ZipFileMap): Promise<Blob> {
  const zip = new JSZip();

  for (const [path, entry] of fileMap.entries()) {
    if (entry.isText) {
      zip.file(path, entry.content as string);
    } else {
      zip.file(path, entry.content as Uint8Array, { binary: true });
    }
  }

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

/** ZIP whose entries use the given relative paths (archetype-style folders preserved on extract). */
export async function createZipFromTextFilesAtPaths(
  files: Array<{ path: string; content: string }>,
): Promise<Blob> {
  const map: ZipFileMap = new Map();
  for (const f of files) {
    const p = normalizeZipPath(f.path);
    map.set(p, { content: f.content, isText: true });
  }
  return createZipFromFileMap(map);
}

export function flattenScriptDisplayTreeLeaves(node: ScriptDisplayTreeNode): ScriptDisplayFile[] {
  const out = [...node.files];
  for (const folder of node.folders) {
    out.push(...flattenScriptDisplayTreeLeaves(folder));
  }
  return out;
}

function sortTree(node: ScriptDisplayTreeNode): void {
  node.folders.sort((a, b) => a.name.localeCompare(b.name));
  node.files.sort((a, b) => a.name.localeCompare(b.name));
  node.folders.forEach(sortTree);
}

/**
 * Tree of generated scripts only: folders are ancestors of generated paths (minimal tree).
 * Does not list empty archetype folders. `archetypeFileMap` is kept for API compatibility.
 */
export function buildArchetypeStructuredScriptTree(
  _archetypeFileMap: ZipFileMap | null,
  generatedFiles: GeneratedFileLike[],
  _fallbackRoot = 'generated',
): ScriptDisplayTreeNode {
  const root: ScriptDisplayTreeNode = {
    name: '',
    path: '',
    folders: [],
    files: [],
  };
  const nodeByPath = new Map<string, ScriptDisplayTreeNode>([['', root]]);

  const ensureFolder = (folderPath: string): ScriptDisplayTreeNode => {
    const normalized = normalizeZipPath(folderPath);
    if (nodeByPath.has(normalized)) return nodeByPath.get(normalized)!;
    const parts = splitPathParts(normalized);
    const folderName = parts[parts.length - 1] ?? normalized;
    const parentPath = parts.slice(0, -1).join('/');
    const parent = ensureFolder(parentPath);
    const node: ScriptDisplayTreeNode = {
      name: folderName,
      path: normalized,
      folders: [],
      files: [],
    };
    parent.folders.push(node);
    nodeByPath.set(normalized, node);
    return node;
  };

  for (const f of generatedFiles) {
    const normalized = normalizeZipPath(f.path);
    const displayParts = splitPathParts(normalized);
    const fileName = displayParts[displayParts.length - 1] ?? 'file';
    const displayDir = displayParts.slice(0, -1).join('/');
    const parent = ensureFolder(displayDir);
    parent.files.push({
      name: fileName,
      path: normalized,
      content: f.content,
    });
  }

  sortTree(root);
  return root;
}


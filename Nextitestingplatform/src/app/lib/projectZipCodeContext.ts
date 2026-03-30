import JSZip from 'jszip';
import type { CodeContextItem } from '../types/generation';

const EXT_TO_LANGUAGE: Record<string, string> = {
  '.cs': 'csharp',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.py': 'python',
  '.java': 'java',
  '.go': 'go',
  '.rb': 'ruby',
  '.php': 'php',
  '.swift': 'swift',
  '.kt': 'kotlin',
  '.rs': 'rust',
  '.c': 'c',
  '.cpp': 'cpp',
  '.h': 'c',
  '.hpp': 'cpp',
  '.sql': 'sql',
  '.vue': 'vue',
  '.svelte': 'svelte',
  '.cob': 'cobol',
  '.cbl': 'cobol',
  '.esql': 'plaintext',
  '.xml': 'xml',
  '.json': 'json',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.md': 'markdown',
  '.txt': 'plaintext',
};

const IGNORE_SEGMENTS = new Set([
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'coverage',
  'target',
  'bin',
  'obj',
  '.idea',
  '.vscode',
  '__pycache__',
]);

const MAX_FILES = 300;
const MAX_FILE_BYTES = 200_000;
const MAX_TOTAL_BYTES = 8_000_000;

function normalizePath(path: string): string {
  return path.replace(/\\/g, '/').replace(/^\/+/, '');
}

function getLanguage(fileName: string): string {
  const i = fileName.lastIndexOf('.');
  if (i < 0) return 'plaintext';
  return EXT_TO_LANGUAGE[fileName.slice(i).toLowerCase()] ?? 'plaintext';
}

function shouldInclude(path: string): boolean {
  const normalized = normalizePath(path);
  if (!normalized || normalized.endsWith('/')) return false;
  if (normalized.startsWith('__MACOSX/') || normalized.includes('.DS_Store')) return false;
  const parts = normalized.split('/');
  if (parts.some((p) => IGNORE_SEGMENTS.has(p) || p.startsWith('._'))) return false;
  const extIdx = normalized.lastIndexOf('.');
  if (extIdx < 0) return false;
  const ext = normalized.slice(extIdx).toLowerCase();
  return ext in EXT_TO_LANGUAGE;
}

export async function readProjectZipsToCodeContext(zips: File[]): Promise<CodeContextItem[]> {
  const out: CodeContextItem[] = [];
  let total = 0;

  for (const zipFile of zips) {
    const zip = await JSZip.loadAsync(await zipFile.arrayBuffer());
    const entries = Object.values(zip.files).filter((e) => !e.dir && shouldInclude(e.name));
    for (const entry of entries) {
      if (out.length >= MAX_FILES) break;
      const normalized = normalizePath(entry.name);
      const bytes = await entry.async('uint8array');
      if (bytes.byteLength > MAX_FILE_BYTES) continue;
      if (total + bytes.byteLength > MAX_TOTAL_BYTES) break;
      const content = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
      total += bytes.byteLength;
      out.push({
        fileName: normalized,
        language: getLanguage(normalized),
        content,
      });
    }
    if (out.length >= MAX_FILES || total >= MAX_TOTAL_BYTES) break;
  }

  return out;
}


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
  '.bms': 'mapa bms',
  '.esql': 'plaintext',
};

function getLanguage(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot === -1) return 'plaintext';
  const ext = fileName.slice(lastDot).toLowerCase();
  return EXT_TO_LANGUAGE[ext] ?? 'plaintext';
}

export async function readCodeFiles(
  files: File[],
  languageOverrides: Record<string, string> = {},
): Promise<CodeContextItem[]> {
  const items: CodeContextItem[] = [];

  for (const file of files) {
    const fileName = file.name;
    const content = await file.text();
    const language = languageOverrides[fileName] ?? getLanguage(fileName);
    items.push({ fileName, language, content });
  }

  return items;
}

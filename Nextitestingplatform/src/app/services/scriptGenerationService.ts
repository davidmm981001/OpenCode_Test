import type {
  FrameworkGeneratedFile,
  FrameworkGenerationMessage,
  GenerateScriptsPayload,
  GenerateScriptsResponse,
} from '../types/generation';

const SCRIPTS_WEBHOOK_URL = (
  import.meta as unknown as { env?: { VITE_N8N_SCRIPTS_WEBHOOK_URL?: string } }
).env?.VITE_N8N_SCRIPTS_WEBHOOK_URL;

const FAILED_FETCH_HINT = [
  'Use production URL in .env: https://n8n.nextisolutions.com/webhook/bdd-to-tests',
  'BDD flow URL in .env: https://n8n.nextisolutions.com/webhook/test-case-generation',
  'In n8n: activate the workflow (toggle On) so the webhook listens for requests.',
  'If using webhook-test: in n8n click "Listen for test event" on Webhook node.',
  'If using localhost, ensure n8n allows CORS for your app origin.',
].join('\n');

export interface ScriptFile {
  framework: string;
  path: string;
  content: string;
}

export class ScriptGenerationServiceError extends Error {
  constructor(
    message: string,
    public readonly isOffline: boolean = false,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = 'ScriptGenerationServiceError';
  }
}

export async function generateScripts(
  payload: GenerateScriptsPayload,
): Promise<GenerateScriptsResponse> {
  if (!SCRIPTS_WEBHOOK_URL?.trim()) {
    throw new ScriptGenerationServiceError(
      'VITE_N8N_SCRIPTS_WEBHOOK_URL is not set. Add it to your .env file.',
      false,
    );
  }

  let res: Response;
  try {
    res = await fetch(SCRIPTS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (
      message === 'Failed to fetch' ||
      message.includes('NetworkError') ||
      message.includes('Load failed')
    ) {
      throw new ScriptGenerationServiceError(
        `Network error (could not reach n8n scripts webhook).\n\n${FAILED_FETCH_HINT}`,
        true,
      );
    }
    throw new ScriptGenerationServiceError(message, true);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new ScriptGenerationServiceError(
      `n8n scripts workflow failed (${res.status}): ${text || res.statusText}`,
      false,
      res.status,
    );
  }

  return (await res.json()) as GenerateScriptsResponse;
}

export function mapScriptsToFiles(
  response: GenerateScriptsResponse,
  frameworks: string[],
): ScriptFile[] {
  return response.frameworkFiles
    .filter(f => frameworks.includes(f.framework))
    .map(f => ({
      framework: f.framework,
      path: f.path,
      content: f.content,
    }));
}

/**
 * Strips a trailing `-part123` segment before the file extension so merging chunks does not
 * produce names like `auth-login-part1-part6.feature` when the model already used `-part1`.
 */
function stripTrailingPartSuffixFromFilename(filename: string): string {
  const dot = filename.lastIndexOf('.');
  if (dot <= 0) {
    return filename.replace(/-part\d+$/i, '');
  }
  const base = filename.slice(0, dot);
  const ext = filename.slice(dot);
  const cleaned = base.replace(/-part\d+$/i, '');
  return cleaned + ext;
}

function addChunkSuffixToPath(path: string, chunkIndex: number): string {
  const lastSlash = path.lastIndexOf('/');
  const name = lastSlash >= 0 ? path.slice(lastSlash + 1) : path;
  const dir = lastSlash >= 0 ? path.slice(0, lastSlash + 1) : '';
  const normalizedName = stripTrailingPartSuffixFromFilename(name);
  const dot = normalizedName.lastIndexOf('.');
  const suffix = `-part${chunkIndex + 1}`;
  if (dot <= 0) return `${dir}${normalizedName}${suffix}`;
  return `${dir}${normalizedName.slice(0, dot)}${suffix}${normalizedName.slice(dot)}`;
}

/**
 * Combines multiple n8n responses (one per Gherkin chunk). Suffixes file paths with
 * `-partN` when merging so Playwright/Karate/k6 outputs from each batch do not overwrite.
 */
export function mergeGenerateScriptsResponses(
  responses: GenerateScriptsResponse[],
): GenerateScriptsResponse {
  if (responses.length === 0) {
    return { frameworkFiles: [], frameworkMessages: [] };
  }
  if (responses.length === 1) {
    return {
      frameworkFiles: responses[0].frameworkFiles,
      frameworkMessages: responses[0].frameworkMessages ?? [],
    };
  }

  const usedPaths = new Set<string>();
  const frameworkFiles: FrameworkGeneratedFile[] = [];
  const frameworkMessages: FrameworkGenerationMessage[] = [];

  const ensureUniquePath = (path: string): string => {
    let p = path;
    let n = 2;
    while (usedPaths.has(p)) {
      p = path.replace(/(\.[^./]+)$/, `-dup${n}$1`);
      n += 1;
    }
    usedPaths.add(p);
    return p;
  };

  responses.forEach((res, chunkIdx) => {
    for (const f of res.frameworkFiles) {
      const suffixed = addChunkSuffixToPath(f.path, chunkIdx);
      frameworkFiles.push({
        ...f,
        path: ensureUniquePath(suffixed),
      });
    }
    if (res.frameworkMessages?.length) {
      frameworkMessages.push(...res.frameworkMessages);
    }
  });

  const fw0 = responses[0].frameworkFiles[0]?.framework ?? 'Karate';
  frameworkMessages.unshift({
    framework: fw0,
    level: 'info',
    message: `Salida combinada de ${responses.length} lotes (Gherkin grande). Cada lote cubre un subconjunto de escenarios; rutas con -part1, -part2, etc.`,
  });

  return { frameworkFiles, frameworkMessages };
}

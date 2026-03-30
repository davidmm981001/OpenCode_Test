export interface OpenApiEndpointPreview {
  method: string;
  path: string;
  summary?: string;
  operationId?: string;
}

export interface OpenApiResourceResult {
  sourceUrl: string;
  title?: string;
  version?: string;
  serverUrls: string[];
  endpoints: OpenApiEndpointPreview[];
  summaryText: string;
}

type JsonLike = Record<string, unknown>;

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace'] as const;

function asObject(v: unknown): JsonLike | null {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as JsonLike) : null;
}

function toStr(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  return t || undefined;
}

function parseOpenApiDocument(doc: JsonLike, sourceUrl: string): OpenApiResourceResult {
  const info = asObject(doc.info);
  const title = toStr(info?.title);
  const version = toStr(info?.version);

  const servers = Array.isArray(doc.servers) ? doc.servers : [];
  const serverUrls = servers
    .map((s) => asObject(s))
    .map((s) => toStr(s?.url))
    .filter((u): u is string => !!u)
    .slice(0, 12);

  const paths = asObject(doc.paths) ?? {};
  const endpoints: OpenApiEndpointPreview[] = [];
  for (const [path, rawOps] of Object.entries(paths)) {
    const ops = asObject(rawOps);
    if (!ops) continue;
    for (const m of HTTP_METHODS) {
      const op = asObject(ops[m]);
      if (!op) continue;
      endpoints.push({
        method: m.toUpperCase(),
        path,
        summary: toStr(op.summary),
        operationId: toStr(op.operationId),
      });
    }
  }

  const endpointPreview = endpoints
    .slice(0, 60)
    .map((e) => `- ${e.method} ${e.path}${e.summary ? ` — ${e.summary}` : ''}`)
    .join('\n');

  const summaryText = [
    '### API Resource (OpenAPI)',
    `Source: ${sourceUrl}`,
    title ? `Title: ${title}` : '',
    version ? `Version: ${version}` : '',
    serverUrls.length ? `Servers: ${serverUrls.join(', ')}` : '',
    `Total operations: ${endpoints.length}`,
    'Operations preview:',
    endpointPreview || '- (No operations found under paths)',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    sourceUrl,
    title,
    version,
    serverUrls,
    endpoints,
    summaryText,
  };
}

export async function fetchOpenApiResource(swaggerUrl: string): Promise<OpenApiResourceResult> {
  const url = swaggerUrl.trim();
  if (!url) {
    throw new Error('Swagger/OpenAPI URL is empty.');
  }
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error('Swagger/OpenAPI URL is invalid.');
  }
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('Swagger/OpenAPI URL must be http or https.');
  }

  const res = await fetch(parsedUrl.toString(), {
    method: 'GET',
    headers: { Accept: 'application/json, application/yaml, text/yaml, text/plain, */*' },
  });
  if (!res.ok) {
    throw new Error(`Swagger/OpenAPI fetch failed (${res.status}).`);
  }

  const raw = await res.text();
  let doc: unknown;
  try {
    doc = JSON.parse(raw);
  } catch {
    throw new Error('Swagger/OpenAPI is not valid JSON. YAML parsing is not enabled yet.');
  }

  const obj = asObject(doc);
  if (!obj) {
    throw new Error('Swagger/OpenAPI document format is invalid.');
  }
  return parseOpenApiDocument(obj, parsedUrl.toString());
}


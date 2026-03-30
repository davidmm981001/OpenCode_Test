import type { CodeContextItem } from '../types/generation';
import type { ApiResource } from '../types/generation';
import type { UserStoryDetail } from '../types/usTcFlow';

const US_WEBHOOK_URL = (
  import.meta as unknown as { env?: { VITE_N8N_US_WEBHOOK_URL?: string; VITE_N8N_WEBHOOK_URL?: string } }
).env?.VITE_N8N_US_WEBHOOK_URL ?? (
  import.meta as unknown as { env?: { VITE_N8N_US_WEBHOOK_URL?: string; VITE_N8N_WEBHOOK_URL?: string } }
).env?.VITE_N8N_WEBHOOK_URL;

export interface UserStoryGenerationPayload {
  contractVersion: 'v1';
  requestId: string;
  projectId: string;
  projectName: string;
  documentationText: string;
  baseStoriesText: string;
  codeContext: CodeContextItem[];
  apiResources?: ApiResource[];
}

export interface GeneratedUserStoryModule {
  name: string;
  order: number;
  summary: string;
}

export interface GeneratedUserStory {
  title: string;
  description: string;
  module: string;
  criteria: string[];
  status: 'generated' | 'pending' | 'review';
  detail?: UserStoryDetail;
}

export interface UserStoryGenerationResponse {
  runId: string;
  stories: GeneratedUserStory[];
  modules: GeneratedUserStoryModule[];
}

export class UserStoryGenerationServiceError extends Error {
  constructor(message: string, public readonly isOffline: boolean = false) {
    super(message);
    this.name = 'UserStoryGenerationServiceError';
  }
}

function normalizeDetailFromRaw(obj: Record<string, unknown>): UserStoryDetail | undefined {
  const nested = obj.detail;
  const src =
    nested && typeof nested === 'object' && !Array.isArray(nested)
      ? (nested as Record<string, unknown>)
      : obj;
  const actor = String(src.actor ?? '').trim();
  const functionalFlow = String(src.functionalFlow ?? '').trim();
  let screensInvolved = String(src.screensInvolved ?? '').trim();
  if (!screensInvolved) screensInvolved = 'N/A';
  const businessRules = String(src.businessRules ?? '').trim();
  const technicalNotes = String(src.technicalNotes ?? '').trim();
  if (!actor && !functionalFlow && screensInvolved === 'N/A' && !businessRules && !technicalNotes) {
    return undefined;
  }
  return {
    actor,
    functionalFlow,
    screensInvolved,
    businessRules,
    technicalNotes,
  };
}

function normalizeModules(raw: unknown): GeneratedUserStoryModule[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((m) => m && typeof m === 'object')
    .map((m, i) => {
      const row = m as Record<string, unknown>;
      const name = String(row.name ?? '').trim();
      const order = Number(row.order);
      const summary = String(row.summary ?? '').trim();
      return {
        name: name || `Módulo ${i + 1}`,
        order: Number.isFinite(order) ? order : i + 1,
        summary,
      };
    })
    .filter((m) => m.name.length > 0);
}

function normalizeStory(raw: unknown): GeneratedUserStory | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const title = String(obj.title ?? '').trim();
  if (!title) return null;
  const criteria = Array.isArray(obj.criteria)
    ? obj.criteria.map((c) => String(c).trim()).filter(Boolean)
    : [];
  const statusRaw = String(obj.status ?? 'generated').toLowerCase();
  const status: GeneratedUserStory['status'] =
    statusRaw === 'review' ? 'review' : statusRaw === 'pending' ? 'pending' : 'generated';
  const detail = normalizeDetailFromRaw(obj);
  return {
    title,
    description: String(obj.description ?? '').trim(),
    module: String(obj.module ?? '').trim() || 'General',
    criteria,
    status,
    ...(detail ? { detail } : {}),
  };
}

export async function generateUserStories(
  payload: UserStoryGenerationPayload,
): Promise<UserStoryGenerationResponse> {
  if (!US_WEBHOOK_URL?.trim()) {
    throw new UserStoryGenerationServiceError(
      'VITE_N8N_US_WEBHOOK_URL is not set (or fallback VITE_N8N_WEBHOOK_URL).',
    );
  }

  let res: Response;
  try {
    res = await fetch(US_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    throw new UserStoryGenerationServiceError(message, true);
  }

  if (!res.ok) {
    const body = await res.text();
    throw new UserStoryGenerationServiceError(
      `User stories workflow failed (${res.status}): ${body || res.statusText}`,
      false,
    );
  }

  const data = (await res.json()) as Record<string, unknown>;
  const rawStories = Array.isArray(data.stories)
    ? data.stories
    : Array.isArray(data.userStories)
      ? data.userStories
      : [];
  const stories = rawStories.map(normalizeStory).filter((s): s is GeneratedUserStory => !!s);

  let modules = normalizeModules(data.modules);
  if (modules.length === 0) {
    const seen = new Map<string, number>();
    for (const s of stories) {
      const name = s.module || 'General';
      if (!seen.has(name)) seen.set(name, seen.size + 1);
    }
    modules = [...seen.keys()].map((name, i) => ({
      name,
      order: i + 1,
      summary: '',
    }));
  }

  return {
    runId: String(data.runId ?? `RUN-${Date.now()}`),
    stories,
    modules,
  };
}

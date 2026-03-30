import type { UserStory } from '../types/usTcFlow';

const TC_WEBHOOK_URL = (
  import.meta as unknown as { env?: { VITE_N8N_TC_WEBHOOK_URL?: string } }
).env?.VITE_N8N_TC_WEBHOOK_URL;

export interface GenerateTestCasesPayload {
  contractVersion: 'v1';
  requestId: string;
  projectId: string;
  userStories: Array<{
    id: string;
    title: string;
    description: string;
    module: string;
    criteria: string[];
  }>;
}

export interface GeneratedTestCase {
  storyId: string;
  description: string;
  preconditions: string;
  steps: string;
  expected: string;
  type: 'functional' | 'negative' | 'edge' | 'integration' | 'performance' | 'security';
  priority: 'high' | 'medium' | 'low';
  status: 'generated' | 'pending' | 'review';
}

export interface GenerateTestCasesResponse {
  runId: string;
  testCases: GeneratedTestCase[];
}

export async function generateTestCases(
  payload: GenerateTestCasesPayload,
): Promise<GenerateTestCasesResponse> {
  if (!TC_WEBHOOK_URL?.trim()) {
    throw new Error('VITE_N8N_TC_WEBHOOK_URL is not set.');
  }
  const res = await fetch(TC_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Test cases workflow failed (${res.status})`);
  }
  const data = (await res.json()) as Record<string, unknown>;
  const testCases = Array.isArray(data.testCases) ? data.testCases : [];
  return {
    runId: String(data.runId ?? `RUN-${Date.now()}`),
    testCases: testCases.map((tc) => {
      const raw = tc as Record<string, unknown>;
      return {
        storyId: String(raw.storyId ?? ''),
        description: String(raw.description ?? ''),
        preconditions: String(raw.preconditions ?? ''),
        steps: String(raw.steps ?? ''),
        expected: String(raw.expected ?? ''),
        type: (String(raw.type ?? 'functional').toLowerCase() as GeneratedTestCase['type']),
        priority: (String(raw.priority ?? 'medium').toLowerCase() as GeneratedTestCase['priority']),
        status: (String(raw.status ?? 'generated').toLowerCase() as GeneratedTestCase['status']),
      };
    }),
  };
}

function appendDetailForTcPrompt(description: string, detail: UserStory['detail']): string {
  if (!detail) return description;
  const parts: string[] = [];
  if (detail.actor.trim()) parts.push(`Actor: ${detail.actor.trim()}`);
  if (detail.functionalFlow.trim()) parts.push(`Flujo funcional:\n${detail.functionalFlow.trim()}`);
  if (detail.screensInvolved.trim()) parts.push(`Pantallas: ${detail.screensInvolved.trim()}`);
  if (detail.businessRules.trim()) parts.push(`Reglas de negocio:\n${detail.businessRules.trim()}`);
  if (detail.technicalNotes.trim()) parts.push(`Notas técnicas:\n${detail.technicalNotes.trim()}`);
  if (parts.length === 0) return description;
  const block = `\n\n--- Detalle estructurado ---\n${parts.join('\n\n')}`;
  return `${description.trim()}${block}`;
}

export function toTcStoryPayload(stories: UserStory[]) {
  return stories.map((story) => ({
    id: story.id,
    title: story.title,
    description: appendDetailForTcPrompt(story.description, story.detail),
    module: story.module,
    criteria: story.criteria,
  }));
}

import type { UserStory } from '../types/usTcFlow';
import { getSupabaseClient } from '../lib/supabaseClient';

export interface JiraSyncConfig {
  baseUrl: string;
  projectKey: string;
  storyIssueType: string;
  defaultLabels?: string[];
  jiraUserEmail?: string;
  credentialId?: number;
}

export interface JiraStorySyncInput {
  storyId: string;
  title: string;
  description: string;
  module: string;
  criteria: string[];
}

export interface JiraSyncResponse {
  synced: Array<{ storyId: string; jiraKey: string }>;
  failed: Array<{ storyId: string; error: string }>;
}

export interface JiraConnectionTestResponse {
  ok: boolean;
  message: string;
}

export interface JiraCredentialUpsertResponse {
  ok: boolean;
  credentialId?: number;
}

export class JiraSyncServiceError extends Error {
  constructor(message: string, public readonly statusCode?: number) {
    super(message);
    this.name = 'JiraSyncServiceError';
  }
}

export function mapUserStoriesToJiraInput(stories: UserStory[]): JiraStorySyncInput[] {
  return stories.map((s) => ({
    storyId: s.id,
    title: s.title,
    description: s.description,
    module: s.module,
    criteria: s.criteria,
  }));
}

export async function syncStoriesToJira(params: {
  requestId: string;
  projectId: string;
  stories: JiraStorySyncInput[];
}): Promise<JiraSyncResponse> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke('jira-sync', {
    body: {
      requestId: params.requestId,
      projectId: params.projectId,
      storyIds: params.stories.map((s) => s.storyId),
    },
  });

  if (error) {
    throw new JiraSyncServiceError(
      `Jira sync failed: ${error.message || 'Edge Function call failed'}`,
    );
  }

  const response = (data ?? {}) as Partial<JiraSyncResponse> & { error?: string };
  if (response.error) {
    throw new JiraSyncServiceError(response.error);
  }

  return {
    synced: Array.isArray(response.synced)
      ? response.synced
          .filter((x) => x && typeof x === 'object')
          .map((x) => ({
            storyId: String((x as Record<string, unknown>).storyId ?? ''),
            jiraKey: String((x as Record<string, unknown>).jiraKey ?? ''),
          }))
          .filter((x) => x.storyId && x.jiraKey)
      : [],
    failed: Array.isArray(response.failed)
      ? response.failed
          .filter((x) => x && typeof x === 'object')
          .map((x) => ({
            storyId: String((x as Record<string, unknown>).storyId ?? ''),
            error: String((x as Record<string, unknown>).error ?? 'Unknown Jira sync error'),
          }))
          .filter((x) => x.storyId)
      : [],
  };
}

export async function testJiraConnection(projectId: string): Promise<JiraConnectionTestResponse> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke('jira-sync', {
    body: {
      mode: 'test',
      projectId,
    },
  });

  if (error) {
    throw new JiraSyncServiceError(
      `Jira connection test failed: ${error.message || 'Edge Function call failed'}`,
    );
  }

  const response = (data ?? {}) as Partial<JiraConnectionTestResponse> & { error?: string };
  if (response.error) {
    throw new JiraSyncServiceError(response.error);
  }

  return {
    ok: Boolean(response.ok),
    message: String(response.message ?? 'Connection test completed.'),
  };
}

export async function upsertJiraCredential(params: {
  projectId: string;
  jiraUserEmail: string;
  jiraToken: string;
}): Promise<JiraCredentialUpsertResponse> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke('jira-credential-upsert', {
    body: {
      projectId: params.projectId,
      jiraUserEmail: params.jiraUserEmail,
      jiraToken: params.jiraToken,
    },
  });

  if (error) {
    throw new JiraSyncServiceError(
      `Jira credential save failed: ${error.message || 'Edge Function call failed'}`,
    );
  }

  const response = (data ?? {}) as Partial<JiraCredentialUpsertResponse> & { error?: string };
  if (response.error) {
    throw new JiraSyncServiceError(response.error);
  }
  return {
    ok: Boolean(response.ok),
    credentialId:
      typeof response.credentialId === 'number' && Number.isFinite(response.credentialId)
        ? Math.trunc(response.credentialId)
        : undefined,
  };
}


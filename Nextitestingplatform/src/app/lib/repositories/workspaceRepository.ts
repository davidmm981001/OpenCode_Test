import { getSupabaseClient } from '../supabaseClient';
import type { Project } from '../../data/mockData';
import type { Requirement } from '../../types/requirements';
import type { DocumentationRun, TestCase } from '../../types/usTcFlow';
import type { UserStory } from '../../types/usTcFlow';
import type { ScriptFile } from '../../services/scriptGenerationService';

// Minimal mapping layer between DB snake_case columns and current TS camelCase types.

function mapProjectRow(row: any): Project {
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    owner: String(row.owner ?? ''),
    startDate: String(row.start_date ?? ''),
    endDate: String(row.end_date ?? ''),
    realStartDate: row.real_start_date != null ? String(row.real_start_date) : undefined,
    realEndDate: row.real_end_date != null ? String(row.real_end_date) : undefined,
    components: Number(row.components ?? 0),
    progress: Number(row.progress ?? 0),
    status: row.status as Project['status'],
    description: String(row.description ?? ''),
    nomenclature: row.nomenclature ?? undefined,
    apiResources: Array.isArray(row.api_testing) ? mapApiResources(row.api_testing) : undefined,
    frameworkSelection:
      row.framework_selection && typeof row.framework_selection === 'object'
        ? mapFrameworkSelection(row.framework_selection)
        : undefined,
    jiraConfig:
      row.jira_config && typeof row.jira_config === 'object'
        ? mapJiraConfig(row.jira_config)
        : undefined,
    sddProjectId:
      row.sdd_project_id != null && String(row.sdd_project_id).trim()
        ? String(row.sdd_project_id).trim()
        : undefined,
  };
}

function mapApiResources(raw: unknown[]): Project['apiResources'] {
  const items = raw
    .filter((x) => x && typeof x === 'object')
    .map((x, idx) => {
      const obj = x as Record<string, unknown>;
      const id = typeof obj.id === 'string' && obj.id.trim() ? obj.id.trim() : `api-${idx + 1}`;
      const name = typeof obj.name === 'string' && obj.name.trim() ? obj.name.trim() : `API ${idx + 1}`;
      const baseUrl = typeof obj.baseUrl === 'string' ? obj.baseUrl.trim() : '';
      const swaggerUrl = typeof obj.swaggerUrl === 'string' ? obj.swaggerUrl.trim() : '';
      return {
        id,
        name,
        ...(baseUrl ? { baseUrl } : {}),
        ...(swaggerUrl ? { swaggerUrl } : {}),
      };
    })
    .filter((x) => x.baseUrl || x.swaggerUrl);
  return items.length ? items : undefined;
}

function mapFrameworkSelection(raw: Record<string, unknown>): Project['frameworkSelection'] {
  const normalize = (v: unknown): string | null | undefined => {
    if (v === null) return null;
    if (typeof v !== 'string') return undefined;
    const t = v.trim();
    return t ? t : null;
  };
  const api = normalize(raw.api);
  const web = normalize(raw.web);
  const performance = normalize(raw.performance);
  if (api === undefined && web === undefined && performance === undefined) return undefined;
  return {
    api: api !== undefined ? api : null,
    web: web !== undefined ? web : null,
    performance: performance !== undefined ? performance : null,
  };
}

function mapJiraConfig(raw: Record<string, unknown>): Project['jiraConfig'] {
  const baseUrl = typeof raw.baseUrl === 'string' ? raw.baseUrl.trim() : '';
  const projectKey = typeof raw.projectKey === 'string' ? raw.projectKey.trim() : '';
  const storyIssueType = typeof raw.storyIssueType === 'string' ? raw.storyIssueType.trim() : '';
  const jiraUserEmail = typeof raw.jiraUserEmail === 'string' ? raw.jiraUserEmail.trim() : '';
  const credentialId =
    typeof raw.credentialId === 'number' && Number.isFinite(raw.credentialId)
      ? Math.trunc(raw.credentialId)
      : undefined;
  const defaultLabels = Array.isArray(raw.defaultLabels)
    ? raw.defaultLabels.map((x) => String(x).trim()).filter(Boolean)
    : undefined;
  if (!baseUrl || !projectKey || !storyIssueType) return undefined;
  return {
    baseUrl,
    projectKey,
    storyIssueType,
    ...(defaultLabels && defaultLabels.length > 0 ? { defaultLabels } : {}),
    ...(jiraUserEmail ? { jiraUserEmail } : {}),
    ...(credentialId !== undefined ? { credentialId } : {}),
  };
}

function mapRequirementRow(row: any): Requirement {
  return {
    id: String(row.id),
    projectId: String(row.project_id),
    featureId: String(row.feature_id ?? ''),
    requirementTitle: String(row.requirement_title ?? ''),
    requirementText: String(row.requirement_text ?? ''),
    acceptanceCriteria: Array.isArray(row.acceptance_criteria) ? row.acceptance_criteria.map(String) : [],
    bddResult: row.bdd_result ?? null,
    editedGherkin: row.edited_gherkin ?? null,
    workspaceSnapshot: row.workspace_snapshot ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapUserStoryDetail(rowDetail: unknown): UserStory['detail'] {
  if (!rowDetail || typeof rowDetail !== 'object' || Array.isArray(rowDetail)) return undefined;
  const d = rowDetail as Record<string, unknown>;
  const actor = String(d.actor ?? '').trim();
  const functionalFlow = String(d.functionalFlow ?? '').trim();
  const screensInvolved = String(d.screensInvolved ?? '').trim();
  const businessRules = String(d.businessRules ?? '').trim();
  const technicalNotes = String(d.technicalNotes ?? '').trim();
  if (!actor && !functionalFlow && !screensInvolved && !businessRules && !technicalNotes) return undefined;
  return {
    actor,
    functionalFlow,
    screensInvolved: screensInvolved || 'N/A',
    businessRules,
    technicalNotes,
  };
}

function mapUserStoryRow(row: any): UserStory {
  return {
    id: String(row.id),
    projectId: String(row.project_id),
    title: String(row.title ?? ''),
    description: String(row.description ?? ''),
    module: String(row.module ?? ''),
    criteria: Array.isArray(row.criteria) ? row.criteria.map(String) : [],
    status: row.status,
    detail: mapUserStoryDetail(row.detail),
    jiraId: row.jira_id ?? null,
    jiraSyncStatus: row.jira_sync_status,
    sourceRunId: row.source_run_id ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapTestCaseRow(row: any): TestCase {
  return {
    id: String(row.id),
    projectId: String(row.project_id),
    storyId: String(row.story_id ?? ''),
    description: String(row.description ?? ''),
    preconditions: String(row.preconditions ?? ''),
    steps: String(row.steps ?? ''),
    expected: String(row.expected ?? ''),
    type: row.type,
    priority: row.priority,
    status: row.status,
    automationStatus: row.automation_status,
    sourceRunId: row.source_run_id ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapDocumentationRunRow(row: any): DocumentationRun {
  return {
    id: String(row.id),
    projectId: String(row.project_id),
    documentationFiles: Array.isArray(row.documentation_files) ? row.documentation_files.map(String) : [],
    userStoryFiles: Array.isArray(row.user_story_files) ? row.user_story_files.map(String) : [],
    codeContextFiles: Array.isArray(row.code_context_files) ? row.code_context_files.map(String) : [],
    extractedContext: String(row.extracted_context ?? ''),
    createdAt: String(row.created_at),
  };
}

export async function listProjects(ownerUserId: string): Promise<Project[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('projects')
    .select(
      [
        'id',
        'name',
        'owner',
        'start_date',
        'end_date',
        'real_start_date',
        'real_end_date',
        'components',
        'progress',
        'status',
        'description',
        'nomenclature',
        'api_testing',
        'framework_selection',
        'jira_config',
      ].join(','),
    )
    .eq('owner_user_id', ownerUserId)
    .order('start_date', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapProjectRow);
}

export async function listRequirements(ownerUserId: string): Promise<Requirement[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('requirements')
    .select(
      [
        'id',
        'project_id',
        'feature_id',
        'requirement_title',
        'requirement_text',
        'acceptance_criteria',
        'bdd_result',
        'edited_gherkin',
        'workspace_snapshot',
        'created_at',
        'updated_at',
      ].join(','),
    )
    .eq('owner_user_id', ownerUserId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapRequirementRow);
}

export async function listUserStories(ownerUserId: string): Promise<UserStory[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('user_stories')
    .select(
      [
        'id',
        'project_id',
        'title',
        'description',
        'module',
        'criteria',
        'status',
        'detail',
        'jira_id',
        'jira_sync_status',
        'source_run_id',
        'created_at',
        'updated_at',
      ].join(','),
    )
    .eq('owner_user_id', ownerUserId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapUserStoryRow);
}

export async function listTestCases(ownerUserId: string): Promise<TestCase[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('test_cases')
    .select(
      [
        'id',
        'project_id',
        'story_id',
        'description',
        'preconditions',
        'steps',
        'expected',
        'type',
        'priority',
        'status',
        'automation_status',
        'source_run_id',
        'created_at',
        'updated_at',
      ].join(','),
    )
    .eq('owner_user_id', ownerUserId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapTestCaseRow);
}

export async function listDocumentationRuns(ownerUserId: string): Promise<DocumentationRun[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('documentation_runs')
    .select(
      [
        'id',
        'project_id',
        'documentation_files',
        'user_story_files',
        'code_context_files',
        'extracted_context',
        'created_at',
      ].join(','),
    )
    .eq('owner_user_id', ownerUserId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapDocumentationRunRow);
}

export async function upsertProject(ownerUserId: string, project: Project): Promise<void> {
  const supabase = getSupabaseClient();
  const payload = {
    id: project.id,
    owner_user_id: ownerUserId,
    name: project.name,
    owner: project.owner,
    start_date: project.startDate,
    end_date: project.endDate,
    real_start_date: project.realStartDate ?? null,
    real_end_date: project.realEndDate ?? null,
    components: project.components,
    progress: project.progress,
    status: project.status,
    description: project.description,
    nomenclature: project.nomenclature ?? null,
    api_testing: Array.isArray(project.apiResources)
      ? project.apiResources
          .map((r, idx) => {
            const id = String(r.id ?? '').trim() || `api-${idx + 1}`;
            const name = String(r.name ?? '').trim() || `API ${idx + 1}`;
            const baseUrl = String(r.baseUrl ?? '').trim();
            const swaggerUrl = String(r.swaggerUrl ?? '').trim();
            if (!baseUrl && !swaggerUrl) return null;
            return {
              id,
              name,
              ...(baseUrl ? { baseUrl } : {}),
              ...(swaggerUrl ? { swaggerUrl } : {}),
            };
          })
          .filter(Boolean)
      : null,
    framework_selection: project.frameworkSelection ?? null,
    jira_config:
      project.jiraConfig &&
      project.jiraConfig.baseUrl.trim() &&
      project.jiraConfig.projectKey.trim() &&
      project.jiraConfig.storyIssueType.trim()
        ? {
            baseUrl: project.jiraConfig.baseUrl.trim(),
            projectKey: project.jiraConfig.projectKey.trim(),
            storyIssueType: project.jiraConfig.storyIssueType.trim(),
            ...(project.jiraConfig.jiraUserEmail?.trim()
              ? { jiraUserEmail: project.jiraConfig.jiraUserEmail.trim() }
              : {}),
            ...(typeof project.jiraConfig.credentialId === 'number'
              ? { credentialId: Math.trunc(project.jiraConfig.credentialId) }
              : {}),
            ...(project.jiraConfig.defaultLabels?.length
              ? {
                  defaultLabels: project.jiraConfig.defaultLabels
                    .map((x) => String(x).trim())
                    .filter(Boolean),
                }
              : {}),
          }
            : null,
    sdd_project_id: project.sddProjectId?.trim() || null,
  };

  const { error } = await supabase.from('projects').upsert(payload, { onConflict: 'id' });
  if (error) throw error;
}

export async function upsertProjectJiraConnection(
  ownerUserId: string,
  projectId: string,
  jiraConfig: Project['jiraConfig'] | undefined,
): Promise<void> {
  const supabase = getSupabaseClient();
  const baseUrl = jiraConfig?.baseUrl?.trim() ?? '';
  const projectKey = jiraConfig?.projectKey?.trim() ?? '';
  const storyIssueType = jiraConfig?.storyIssueType?.trim() ?? '';
  const jiraUserEmail = jiraConfig?.jiraUserEmail?.trim() ?? '';
  const credentialId =
    typeof jiraConfig?.credentialId === 'number' && Number.isFinite(jiraConfig.credentialId)
      ? Math.trunc(jiraConfig.credentialId)
      : null;
  const defaultLabels = jiraConfig?.defaultLabels?.map((x) => String(x).trim()).filter(Boolean) ?? [];

  if (!baseUrl || !projectKey || !storyIssueType || !jiraUserEmail) {
    const { error } = await supabase
      .from('jira_project_connections')
      .delete()
      .eq('project_id', projectId)
      .eq('owner_user_id', ownerUserId);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from('jira_project_connections').upsert(
    {
      project_id: projectId,
      owner_user_id: ownerUserId,
      base_url: baseUrl,
      project_key: projectKey.toUpperCase(),
      story_issue_type: storyIssueType,
      default_labels: defaultLabels,
      jira_user_email: jiraUserEmail,
      credential_id: credentialId,
      credential_key: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'project_id' },
  );
  if (error) throw error;
}

export async function insertRequirement(ownerUserId: string, requirement: Requirement): Promise<void> {
  const supabase = getSupabaseClient();
  const payload = {
    id: requirement.id,
    owner_user_id: ownerUserId,
    project_id: requirement.projectId,
    feature_id: requirement.featureId,
    requirement_title: requirement.requirementTitle,
    requirement_text: requirement.requirementText,
    acceptance_criteria: requirement.acceptanceCriteria,
    bdd_result: requirement.bddResult,
    edited_gherkin: requirement.editedGherkin,
    workspace_snapshot: requirement.workspaceSnapshot,
    created_at: requirement.createdAt,
    updated_at: requirement.updatedAt,
  };

  const { error } = await supabase.from('requirements').upsert(payload, { onConflict: 'id' });
  if (error) throw error;
}

export async function updateRequirement(ownerUserId: string, id: string, updates: Partial<Requirement>): Promise<void> {
  const supabase = getSupabaseClient();

  const payload: Record<string, unknown> = {};
  if (updates.featureId !== undefined) payload.feature_id = updates.featureId;
  if (updates.requirementTitle !== undefined) payload.requirement_title = updates.requirementTitle;
  if (updates.requirementText !== undefined) payload.requirement_text = updates.requirementText;
  if (updates.acceptanceCriteria !== undefined) payload.acceptance_criteria = updates.acceptanceCriteria;
  if (updates.bddResult !== undefined) payload.bdd_result = updates.bddResult;
  if (updates.editedGherkin !== undefined) payload.edited_gherkin = updates.editedGherkin;
  if (updates.workspaceSnapshot !== undefined) payload.workspace_snapshot = updates.workspaceSnapshot;

  if (Object.keys(payload).length === 0) return;

  payload.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('requirements')
    .update(payload)
    .eq('id', id)
    .eq('owner_user_id', ownerUserId);

  if (error) throw error;
}

export async function deleteRequirement(ownerUserId: string, id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('requirements')
    .delete()
    .eq('id', id)
    .eq('owner_user_id', ownerUserId);
  if (error) throw error;
}

export async function insertUserStories(ownerUserId: string, stories: UserStory[]): Promise<void> {
  const supabase = getSupabaseClient();
  const payload = stories.map((s) => ({
    id: s.id,
    owner_user_id: ownerUserId,
    project_id: s.projectId,
    title: s.title,
    description: s.description,
    module: s.module,
    criteria: s.criteria,
    status: s.status,
    detail: s.detail ?? null,
    jira_id: s.jiraId,
    jira_sync_status: s.jiraSyncStatus,
    source_run_id: s.sourceRunId,
    created_at: s.createdAt,
    updated_at: s.updatedAt,
  }));

  const { error } = await supabase.from('user_stories').upsert(payload, { onConflict: 'id' });
  if (error) throw error;
}

export async function updateUserStory(ownerUserId: string, id: string, updates: Partial<UserStory>): Promise<void> {
  const supabase = getSupabaseClient();
  const payload: Record<string, unknown> = {};

  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.module !== undefined) payload.module = updates.module;
  if (updates.criteria !== undefined) payload.criteria = updates.criteria;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.detail !== undefined) payload.detail = updates.detail ?? null;
  if (updates.jiraId !== undefined) payload.jira_id = updates.jiraId;
  if (updates.jiraSyncStatus !== undefined) payload.jira_sync_status = updates.jiraSyncStatus;
  if (updates.sourceRunId !== undefined) payload.source_run_id = updates.sourceRunId;

  if (Object.keys(payload).length === 0) return;
  payload.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('user_stories')
    .update(payload)
    .eq('id', id)
    .eq('owner_user_id', ownerUserId);
  if (error) throw error;
}

export async function syncUserStoriesToJira(ownerUserId: string, ids: string[], jiraId: (id: string) => string): Promise<void> {
  const supabase = getSupabaseClient();
  // Single-user POC: update rows one by one to avoid complex SQL.
  for (const id of ids) {
    const { error } = await supabase
      .from('user_stories')
      .update({
        jira_id: jiraId(id),
        jira_sync_status: 'synced',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('owner_user_id', ownerUserId);
    if (error) throw error;
  }
}

export async function deleteUserStory(ownerUserId: string, id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('user_stories')
    .delete()
    .eq('id', id)
    .eq('owner_user_id', ownerUserId);
  if (error) throw error;
}

export async function deleteUserStoriesByProject(ownerUserId: string, projectId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('user_stories')
    .delete()
    .eq('project_id', projectId)
    .eq('owner_user_id', ownerUserId);
  if (error) throw error;
}

export async function insertTestCases(ownerUserId: string, cases: TestCase[]): Promise<void> {
  const supabase = getSupabaseClient();
  const payload = cases.map((tc) => ({
    id: tc.id,
    owner_user_id: ownerUserId,
    project_id: tc.projectId,
    story_id: tc.storyId,
    description: tc.description,
    preconditions: tc.preconditions,
    steps: tc.steps,
    expected: tc.expected,
    type: tc.type,
    priority: tc.priority,
    status: tc.status,
    automation_status: tc.automationStatus,
    source_run_id: tc.sourceRunId,
    created_at: tc.createdAt,
    updated_at: tc.updatedAt,
  }));

  const { error } = await supabase.from('test_cases').upsert(payload, { onConflict: 'id' });
  if (error) throw error;
}

export async function updateTestCase(ownerUserId: string, id: string, updates: Partial<TestCase>): Promise<void> {
  const supabase = getSupabaseClient();
  const payload: Record<string, unknown> = {};

  if (updates.storyId !== undefined) payload.story_id = updates.storyId;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.preconditions !== undefined) payload.preconditions = updates.preconditions;
  if (updates.steps !== undefined) payload.steps = updates.steps;
  if (updates.expected !== undefined) payload.expected = updates.expected;
  if (updates.type !== undefined) payload.type = updates.type;
  if (updates.priority !== undefined) payload.priority = updates.priority;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.automationStatus !== undefined) payload.automation_status = updates.automationStatus;
  if (updates.sourceRunId !== undefined) payload.source_run_id = updates.sourceRunId;

  if (Object.keys(payload).length === 0) return;
  payload.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('test_cases')
    .update(payload)
    .eq('id', id)
    .eq('owner_user_id', ownerUserId);
  if (error) throw error;
}

export async function upsertDocumentationRun(ownerUserId: string, run: DocumentationRun): Promise<void> {
  const supabase = getSupabaseClient();
  const payload = {
    id: run.id,
    owner_user_id: ownerUserId,
    project_id: run.projectId,
    documentation_files: run.documentationFiles,
    user_story_files: run.userStoryFiles,
    code_context_files: run.codeContextFiles,
    extracted_context: run.extractedContext,
    created_at: run.createdAt,
  };

  const { error } = await supabase.from('documentation_runs').upsert(payload, { onConflict: 'id' });
  if (error) throw error;
}

export async function upsertScriptGenerationRun(
  ownerUserId: string,
  run: {
    id: string;
    projectId: string;
    requestId?: string | null;
    selectedFrameworks: string[];
    flowStage?: string | null;
    succeeded: boolean;
    error?: string | null;
  },
): Promise<void> {
  const supabase = getSupabaseClient();
  const payload = {
    id: run.id,
    owner_user_id: ownerUserId,
    project_id: run.projectId,
    request_id: run.requestId ?? null,
    selected_frameworks: run.selectedFrameworks,
    flow_stage: run.flowStage ?? null,
    error: run.error ?? null,
    succeeded: run.succeeded,
  };

  const { error } = await supabase.from('script_generation_runs').upsert(payload, { onConflict: 'id' });
  if (error) throw error;
}

export async function upsertScriptFiles(
  ownerUserId: string,
  params: {
    projectId: string;
    runId: string;
    files: ScriptFile[];
  },
): Promise<void> {
  const supabase = getSupabaseClient();

  const payload = params.files.map(f => ({
    owner_user_id: ownerUserId,
    project_id: params.projectId,
    run_id: params.runId,
    framework: f.framework,
    path: f.path,
    content: f.content,
  }));

  const { error } = await supabase.from('script_files').upsert(payload, {
    onConflict: 'run_id,path',
  });
  if (error) throw error;
}

export async function getLatestScriptGenerationRunId(ownerUserId: string, projectId: string): Promise<string | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('script_generation_runs')
    .select('id')
    .eq('owner_user_id', ownerUserId)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.id ?? null;
}

export async function listScriptFilesByRunId(
  ownerUserId: string,
  runId: string,
): Promise<ScriptFile[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('script_files')
    .select('framework, path, content')
    .eq('owner_user_id', ownerUserId)
    .eq('run_id', runId)
    .order('path', { ascending: true });

  if (error) throw error;

  return (data ?? []).map(row => ({
    framework: String(row.framework ?? ''),
    path: String(row.path ?? ''),
    content: String(row.content ?? ''),
  }));
}


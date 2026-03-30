export type UserStoryStatus = 'generated' | 'pending' | 'review';
export type JiraSyncStatus = 'synced' | 'pending' | 'failed';

/** Extended fields aligned with detailed US generation (COBOL/ASPX-style prompts). */
export interface UserStoryDetail {
  actor: string;
  functionalFlow: string;
  screensInvolved: string;
  businessRules: string;
  technicalNotes: string;
}

export interface UserStory {
  id: string;
  projectId: string;
  title: string;
  description: string;
  module: string;
  criteria: string[];
  status: UserStoryStatus;
  /** Optional structured detail from n8n / manual edit. */
  detail?: UserStoryDetail;
  jiraId: string | null;
  jiraSyncStatus: JiraSyncStatus;
  sourceRunId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TestCaseStatus = 'generated' | 'pending' | 'review';
export type TestCasePriority = 'high' | 'medium' | 'low';
export type TestCaseType =
  | 'functional'
  | 'negative'
  | 'edge'
  | 'integration'
  | 'performance'
  | 'security';

export interface TestCase {
  id: string;
  projectId: string;
  storyId: string;
  description: string;
  preconditions: string;
  steps: string;
  expected: string;
  type: TestCaseType;
  priority: TestCasePriority;
  status: TestCaseStatus;
  automationStatus: 'pending' | 'ready';
  sourceRunId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentationRun {
  id: string;
  projectId: string;
  documentationFiles: string[];
  userStoryFiles: string[];
  codeContextFiles: string[];
  extractedContext: string;
  createdAt: string;
}

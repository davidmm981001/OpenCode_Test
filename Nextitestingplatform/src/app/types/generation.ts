export interface CodeContextItem {
  fileName: string;
  language: string;
  content: string;
}

/** Values from workspace UI; forwarded to n8n for BDD + script flows. */
export type CreativityLevel = 'Conservador' | 'Equilibrado' | 'Creativo';

export interface AIRoleContext {
  name: string;
  description: string;
}

export interface UiGenerationContext {
  aiRoles: AIRoleContext[];
  scriptingLanguage: string;
  maxScenarios: number;
  minPositiveCases: number;
  minNegativeCases: number;
  istqbPrompt: string;
}

export interface BDDGeneratePayload {
  featureId: string;
  requirementTitle: string;
  requirementText: string;
  acceptanceCriteria: string[];
  codeContext: CodeContextItem[];
  /** Expert personas selected in the UI with current editable descriptions. */
  aiRoles?: AIRoleContext[];
  /** Target stack / script language from the catalog (e.g. TypeScript, C#). */
  scriptingLanguage?: string;
  /** Hard cap on scenarios the model should output. */
  maxScenarios?: number;
  /** Minimum amount of positive test cases expected in generated scenarios. */
  minPositiveCases?: number;
  /** Minimum amount of negative test cases expected in generated scenarios. */
  minNegativeCases?: number;
  /** Extra instruction prompt (ISTQB guidance from UI). */
  istqbPrompt?: string;
}

export interface BDDScenario {
  name: string;
  source?: string[];
  type?:
    | 'happy_path'
    | 'negative'
    | 'boundary'
    | 'validation'
    | 'permission'
    | 'state_transition';
  given?: string[];
  when?: string[];
  then?: string[];
  requirement_refs?: string[];
  code_refs?: string[];
  examples?: Record<string, string>[];
}

export interface BDDCoverageSummary {
  happy_path: number;
  validation: number;
  negative: number;
  boundary: number;
  permission: number;
  state_transition: number;
}

export interface TestHints {
  api?: {
    endpoints?: Array<{
      method?: string;
      path?: string;
      purpose?: string;
      source?: string;
    }>;
    scenario_expectations?: Array<{
      scenario_name?: string;
      expected_status?: number | string;
      expected_message?: string;
      notes?: string;
    }>;
  };
  validation?: {
    rules?: Array<{
      field?: string;
      constraints?: string[];
      source?: string;
    }>;
  };
  state?: {
    transitions?: Array<{
      scenario_name?: string;
      from_state?: string;
      to_state?: string;
      trigger?: string;
      source?: string;
    }>;
  };
}

/** Latest workspace inputs + BDD hints; passed to script generation n8n flow. */
export interface BddWorkspaceSnapshot extends UiGenerationContext {
  requirementText: string;
  codeContext: CodeContextItem[];
  testHints: TestHints | null;
}

export interface BDDGenerateResponse {
  requirement_id: string;
  feature_title: string;
  gherkin: string;
  scenarios: BDDScenario[];
  mismatches: string[];
  ambiguities: string[];
  coverage_summary: BDDCoverageSummary;
  test_hints?: TestHints;
  raw_structured_output?: {
    requirement_id: string;
    feature_title: string;
    background: string[];
    scenarios: BDDScenario[];
    mismatches: string[];
    ambiguities: string[];
    coverage_summary: BDDCoverageSummary;
  };
}

export interface GeneratedFile {
  path: string;
  content: string;
}

export interface FrameworkCategorySelection {
  api: string | null;
  web: string | null;
  performance: string | null;
}

/** Targets for API test generation (Karate, REST clients, etc.). */
export interface ApiTestingConfig {
  /** Base URL of the API under test (e.g. https://api.example.com/v1). */
  baseUrl?: string;
  /** URL of the OpenAPI/Swagger document (JSON or YAML). */
  swaggerUrl?: string;
  /** Parsed OpenAPI headline + servers + endpoint counts/preview for n8n context. */
  openApiSummary?: string;
  /** Flattened endpoint preview from parsed OpenAPI. */
  openApiEndpoints?: Array<{
    method: string;
    path: string;
    summary?: string;
    operationId?: string;
  }>;
}

export interface ApiResource {
  id: string;
  name: string;
  baseUrl?: string;
  swaggerUrl?: string;
  openApiSummary?: string;
  openApiEndpoints?: Array<{
    method: string;
    path: string;
    summary?: string;
    operationId?: string;
  }>;
}

export interface FrameworkGeneratedFile extends GeneratedFile {
  framework: string;
}

export interface FrameworkGenerationMessage {
  framework: string;
  level: 'info' | 'warning' | 'error';
  message: string;
}

export interface GenerateScriptsPayload {
  contractVersion?: 'v1';
  requestId?: string;
  flowStage?: 'automation';
  projectId?: string;
  gherkin: string;
  feature_title: string;
  codeContext?: CodeContextItem[];
  requirementText?: string;
  test_hints?: TestHints;
  aiRoles?: AIRoleContext[];
  scriptingLanguage?: string;
  maxScenarios?: number;
  minPositiveCases?: number;
  minNegativeCases?: number;
  istqbPrompt?: string;
  selectedFrameworkByCategory?: FrameworkCategorySelection;
  selectedFrameworks?: string[];
  /** Per-framework archetype folder structure (paths from uploaded ZIP). LLM must use these for `path` values. */
  archetypePathsByFramework?: Record<string, string[]>;
  /** Project-level API resources for generation context. */
  apiResources?: ApiResource[];
}

export interface GenerateScriptsResponse {
  frameworkFiles: FrameworkGeneratedFile[];
  frameworkMessages?: FrameworkGenerationMessage[];
}

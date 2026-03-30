import type { BddWorkspaceSnapshot, BDDGenerateResponse } from './generation';

export interface Requirement {
  id: string;
  projectId: string;

  // Inputs (Requirement layer)
  featureId: string;
  requirementTitle: string;
  requirementText: string;
  acceptanceCriteria: string[];

  // Outputs from Functional Analysis (BDD generation)
  bddResult: BDDGenerateResponse | null;
  editedGherkin: string | null;

  // Workspace context used by Scripts generation
  workspaceSnapshot: BddWorkspaceSnapshot | null;

  createdAt: string;
  updatedAt: string;
}


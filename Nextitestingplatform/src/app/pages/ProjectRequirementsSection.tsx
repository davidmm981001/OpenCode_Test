import React from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { useApp } from '../context/AppContext';
import { RequirementsListView } from './workspace/RequirementsListView';
import { RequirementDetailView } from './workspace/RequirementDetailView';
import type { ZipFileMap } from '../lib/zipArchetype';

const EMPTY_ARCHETYPE_MAPS: Record<string, ZipFileMap | null> = {};

type RequirementInternalTab = 'resumen' | 'functional-analysis' | 'scripts-de-prueba';
type SectionSegment = 'documentation' | 'stories' | 'testcases' | 'automation';

export function ProjectRequirementsSection({
  projectTabSegment,
  requirementInitialInternalTab,
}: {
  projectTabSegment: SectionSegment;
  requirementInitialInternalTab: RequirementInternalTab;
}) {
  const { projectId, requirementId } = useParams<{ projectId: string; requirementId?: string }>();
  const navigate = useNavigate();
  const { projects, requirements, projectArchetypes } = useApp();

  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return <Navigate to="/projects" replace />;
  }

  const projectRequirements = requirements.filter((r) => r.projectId === project.id);
  const selectedRequirement = requirementId
    ? projectRequirements.find((r) => r.id === requirementId) ?? null
    : null;

  if (requirementId && !selectedRequirement) {
    return <Navigate to={`/projects/${project.id}/${projectTabSegment}`} replace />;
  }

  if (!selectedRequirement) {
    return (
      <RequirementsListView
        project={project}
        selectedRequirementId={null}
        onSelectRequirement={(id) => navigate(`/projects/${project.id}/${projectTabSegment}/${id}`)}
      />
    );
  }

  return (
    <RequirementDetailView
      project={project}
      requirement={selectedRequirement}
      initialTab={requirementInitialInternalTab}
      onBackToList={() => navigate(`/projects/${project.id}/${projectTabSegment}`)}
      archetypeFileMapByFramework={projectArchetypes[project.id] ?? EMPTY_ARCHETYPE_MAPS}
    />
  );
}

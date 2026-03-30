import React from 'react';
import { Navigate, useParams } from 'react-router';
import { useApp } from '../context/AppContext';
import { OverviewTab } from './workspace/OverviewTab';

export default function ProjectOverviewPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects } = useApp();
  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return <Navigate to="/projects" replace />;
  }

  return <OverviewTab project={project} />;
}

import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { AppLayout } from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import ProjectsList from './pages/ProjectsList';
import ProjectWorkspaceTabsLayout from './pages/ProjectWorkspaceTabsLayout';
import ProjectOverviewPage from './pages/ProjectOverviewPage';
import ProjectJiraPlaceholderPage from './pages/ProjectJiraPlaceholderPage';
import { ProjectRequirementsSection } from './pages/ProjectRequirementsSection';
import ProjectDocumentationTabPage from './pages/ProjectDocumentationTabPage';
import ProjectStoriesTabPage from './pages/ProjectStoriesTabPage';
import ProjectTestCasesTabPage from './pages/ProjectTestCasesTabPage';
import ProjectAutomationTabPage from './pages/ProjectAutomationTabPage';
import ProjectSddTabPage from './pages/ProjectSddTabPage';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import { useApp } from './context/AppContext';

function ProtectedLayout() {
  const { isAuthenticated } = useApp();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <AppLayout />;
}

function LoginGuard() {
  const { isAuthenticated } = useApp();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Login />;
}

export const router = createBrowserRouter([
  { path: '/login', Component: LoginGuard },
  {
    path: '/',
    Component: ProtectedLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'projects', Component: ProjectsList },
      {
        path: 'projects/:projectId',
        Component: ProjectWorkspaceTabsLayout,
        children: [
          { index: true, Component: ProjectOverviewPage },
          {
            path: 'documentation',
            Component: ProjectDocumentationTabPage,
          },
          {
            path: 'documentation/:requirementId',
            Component: () => (
              <ProjectRequirementsSection
                projectTabSegment="documentation"
                requirementInitialInternalTab="functional-analysis"
              />
            ),
          },
          {
            path: 'stories',
            Component: ProjectStoriesTabPage,
          },
          {
            path: 'stories/:requirementId',
            Component: ProjectStoriesTabPage,
          },
          {
            path: 'sdd',
            Component: ProjectSddTabPage,
          },
          {
            path: 'testcases',
            Component: ProjectTestCasesTabPage,
          },
          {
            path: 'testcases/:requirementId',
            Component: ProjectTestCasesTabPage,
          },
          {
            path: 'automation',
            Component: ProjectAutomationTabPage,
          },
          {
            path: 'automation/:requirementId',
            Component: ProjectAutomationTabPage,
          },
          { path: 'jira', Component: ProjectJiraPlaceholderPage },
        ],
      },
      { path: '*', Component: NotFound },
    ],
  },
]);
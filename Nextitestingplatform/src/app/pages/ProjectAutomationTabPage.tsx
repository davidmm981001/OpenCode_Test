import React, { useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router';
import { FileCode2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ScriptsDePruebaTab } from './workspace/ScriptsDePruebaTab';
import type { ZipFileMap } from '../lib/zipArchetype';

const EMPTY_ARCHETYPE_MAPS: Record<string, ZipFileMap | null> = {};

type TcRow = {
  id: string;
  storyId: string;
  description: string;
  preconditions: string;
  steps: string;
  expected: string;
};

/**
 * Builds **English** Gherkin from structured test cases so n8n script generation
 * (Karate, Playwright, etc.) receives parseable keywords: Feature, Scenario, Given, When, Then.
 * Spanish keywords break Karate/Cucumber parsers; keep content language in step text as needed.
 */
function testCasesToGherkin(projectName: string, testCases: TcRow[]): string | null {
  if (testCases.length === 0) return null;

  const scenarios = testCases.map((tc, idx) => {
    const title = tc.description.trim() || `Case ${idx + 1}`;
    const pre = tc.preconditions.trim();
    const stepLines = tc.steps
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => l.replace(/^\d+[\).\s-]*/, '').trim())
      .filter(Boolean);

    const givenBlock =
      pre.length > 0
        ? [`  Given ${pre.replace(/\s+/g, ' ').trim()}`]
        : [];

    const whenAnd =
      stepLines.length > 0
        ? stepLines.map((line, i) => `  ${i === 0 ? 'When' : 'And'} ${line}`)
        : ['  When the user executes the flow described in the test case'];

    const thenLine = `  Then ${(tc.expected || 'the expected outcome is achieved.').trim()}`;

    const trace = `# TC id: ${tc.id} · Story: ${tc.storyId}`;
    return [trace, `Scenario: ${title}`, ...givenBlock, ...whenAnd, thenLine].join('\n');
  });

  const header = `Feature: ${projectName} — Test cases (automation)\n`;
  return `${header}\n${scenarios.join('\n\n')}`;
}

export default function ProjectAutomationTabPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, testCases, projectArchetypes } = useApp();
  const project = projects.find((p) => p.id === projectId);

  const projectTestCases = useMemo(
    () => testCases.filter((tc) => tc.projectId === projectId),
    [testCases, projectId],
  );

  const gherkinOutput = useMemo(
    () =>
      testCasesToGherkin(project?.name ?? 'Proyecto', projectTestCases),
    [project?.name, projectTestCases],
  );

  if (!project) return <Navigate to="/projects" replace />;

  return (
    <div className="flex flex-col gap-4">
      <div
        className="mx-4 mt-4 rounded-lg bg-white p-4 sm:p-5"
        style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <div className="flex items-start gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
            style={{ backgroundColor: '#e8eaf2' }}
          >
            <FileCode2 size={18} style={{ color: '#202950' }} />
          </div>
          <div className="min-w-0 space-y-1">
            <h2 className="text-sm font-semibold text-foreground">Automatización</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Los scripts se generan a partir del Gherkin sintetizado desde{' '}
              <strong>{projectTestCases.length}</strong> caso(s) de prueba del proyecto. La selección de frameworks y
              los ZIP de arquetipo se configuran en la lista de proyectos; aquí verá el estado (solo lectura) y si cada
              arquetipo está cargado o pendiente de subir.
            </p>
            {projectTestCases.length === 0 ? (
              <p className="text-xs pt-1">
                <Link
                  to={`/projects/${project.id}/stories`}
                  className="font-medium text-[#202950] underline underline-offset-2"
                >
                  Ir a Historias
                </Link>{' '}
                para definir historias y generar casos de prueba desde allí.
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <ScriptsDePruebaTab
        scriptSource="automation"
        gherkinOutput={gherkinOutput}
        project={project}
        workspaceSnapshot={null}
        archetypeFileMapByFramework={projectArchetypes[project.id] ?? EMPTY_ARCHETYPE_MAPS}
      />
    </div>
  );
}

import React, { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router';
import {
  Bot,
  ChevronDown,
  ClipboardList,
  FlaskConical,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { cn } from '../components/ui/utils';
import { generateTestCases, toTcStoryPayload } from '../services/testCaseGenerationService';
import type {
  TestCasePriority,
  TestCaseStatus,
  TestCaseType,
  TestCase,
} from '../types/usTcFlow';

const cardSurface =
  'bg-white rounded-xl border border-[rgba(0,0,0,0.06)] shadow-[0_1px_3px_rgba(0,0,0,0.04)]';

const PRIORITY_LABEL: Record<TestCasePriority, string> = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
};

const TYPE_LABEL: Record<TestCaseType, string> = {
  functional: 'Funcional',
  negative: 'Negativo',
  edge: 'Límite',
  integration: 'Integración',
  performance: 'Rendimiento',
  security: 'Seguridad',
};

const STATUS_LABEL: Record<TestCaseStatus, string> = {
  generated: 'Generado',
  pending: 'Pendiente',
  review: 'En revisión',
};

const AUTOMATION_LABEL: Record<TestCase['automationStatus'], string> = {
  pending: 'Auto pendiente',
  ready: 'Listo p. automatizar',
};

function priorityBadgeClass(p: TestCasePriority) {
  switch (p) {
    case 'high':
      return 'border-rose-200 bg-rose-50 text-rose-900';
    case 'medium':
      return 'border-amber-200 bg-amber-50 text-amber-900';
    default:
      return 'border-[rgba(0,0,0,0.1)] bg-[#f8f9fb] text-muted-foreground';
  }
}

export default function ProjectTestCasesTabPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, userStories, testCases, addTestCases, updateTestCase } = useApp();
  const [selectedStoryIds, setSelectedStoryIds] = useState<string[]>([]);
  const [openTcId, setOpenTcId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const project = projects.find((p) => p.id === projectId);
  const stories = useMemo(
    () => userStories.filter((story) => story.projectId === projectId),
    [userStories, projectId],
  );
  const projectTestCases = useMemo(
    () => testCases.filter((tc) => tc.projectId === projectId),
    [testCases, projectId],
  );

  /** Test cases grouped by user story for traceability (order follows Historias, then orphans). */
  const testCasesGroupedByStory = useMemo(() => {
    const byStory = new Map<string, TestCase[]>();
    for (const tc of projectTestCases) {
      const list = byStory.get(tc.storyId) ?? [];
      list.push(tc);
      byStory.set(tc.storyId, list);
    }
    const orderedStoryIds: string[] = [];
    for (const s of stories) {
      if (byStory.has(s.id)) orderedStoryIds.push(s.id);
    }
    for (const id of byStory.keys()) {
      if (!orderedStoryIds.includes(id)) orderedStoryIds.push(id);
    }
    return orderedStoryIds.map((storyId) => ({
      storyId,
      story: stories.find((s) => s.id === storyId),
      cases: byStory.get(storyId) ?? [],
    }));
  }, [projectTestCases, stories]);

  const automationReadyCount = useMemo(
    () => projectTestCases.filter((tc) => tc.automationStatus === 'ready').length,
    [projectTestCases],
  );

  if (!project) return <Navigate to="/projects" replace />;

  const selectedStories = stories.filter((story) => selectedStoryIds.includes(story.id));

  const handleGenerate = async () => {
    setError(null);
    if (selectedStories.length === 0) {
      setError('Seleccione al menos una historia.');
      return;
    }
    setGenerating(true);
    try {
      const response = await generateTestCases({
        contractVersion: 'v1',
        requestId: crypto.randomUUID(),
        projectId: project.id,
        userStories: toTcStoryPayload(selectedStories),
      });
      addTestCases(
        project.id,
        response.testCases.map((tc) => ({
          storyId: tc.storyId,
          description: tc.description,
          preconditions: tc.preconditions,
          steps: tc.steps,
          expected: tc.expected,
          type: tc.type,
          priority: tc.priority,
          status: tc.status,
        })),
        response.runId,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron generar casos de prueba.');
    } finally {
      setGenerating(false);
    }
  };

  const selectAllStories = () => setSelectedStoryIds(stories.map((s) => s.id));
  const clearStorySelection = () => setSelectedStoryIds([]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div className={cn(cardSurface, 'p-5')}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex min-w-0 flex-1 gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#e8eaf2] text-[#202950]">
              <Sparkles className="size-5" strokeWidth={2} aria-hidden />
            </div>
            <div className="min-w-0 space-y-1">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">Generar casos de prueba</h2>
              <p className="text-sm text-muted-foreground">
                Elija una o más historias de usuario; el flujo n8n generará casos de prueba estructurados para este
                proyecto.
              </p>
            </div>
          </div>
        </div>

        {stories.length === 0 ? (
          <div className="mt-5 rounded-lg border border-dashed border-[rgba(0,0,0,0.12)] bg-[#fafbfc] px-4 py-8 text-center">
            <FlaskConical className="mx-auto mb-3 size-10 text-muted-foreground opacity-80" strokeWidth={1.25} />
            <p className="text-sm font-medium text-foreground">No hay historias en este proyecto</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Cree historias desde Documentación o la pestaña Historias antes de generar casos.
            </p>
            <Button asChild className="mt-4" variant="default">
              <Link to={`/projects/${projectId}/stories`}>Ir a Historias</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground">Historias incluidas</span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-[#202950]"
                  onClick={selectAllStories}
                >
                  Seleccionar todas
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={clearStorySelection}
                  disabled={selectedStoryIds.length === 0}
                >
                  Limpiar
                </Button>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {stories.map((story) => {
                const selected = selectedStoryIds.includes(story.id);
                return (
                  <button
                    key={story.id}
                    type="button"
                    className={cn(
                      'max-w-full rounded-full border px-3 py-1.5 text-left text-xs transition-colors',
                      selected
                        ? 'border-[#202950] bg-[#e8eaf2] text-[#202950] font-medium'
                        : 'border-[rgba(0,0,0,0.12)] bg-white text-muted-foreground hover:border-[rgba(0,0,0,0.2)]',
                    )}
                    onClick={() =>
                      setSelectedStoryIds((prev) =>
                        prev.includes(story.id) ? prev.filter((x) => x !== story.id) : [...prev, story.id],
                      )
                    }
                  >
                    <span className="line-clamp-2">{story.title}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button
                onClick={() => void handleGenerate()}
                disabled={generating || stories.length === 0}
                className="bg-[#202950] hover:bg-[#202950]/90"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                    Generando…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 size-4" aria-hidden />
                    Generar casos de prueba
                  </>
                )}
              </Button>
              {selectedStoryIds.length > 0 && (
                <span className="text-xs text-muted-foreground">{selectedStoryIds.length} seleccionada(s)</span>
              )}
            </div>
            {error && (
              <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                {error}
              </div>
            )}
          </>
        )}
      </div>

      <div className={cn(cardSurface, 'overflow-hidden')}>
        <div className="border-b border-[rgba(0,0,0,0.06)] px-5 py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-foreground">Casos de prueba</h3>
              <p className="text-sm text-muted-foreground">
                {projectTestCases.length === 0
                  ? 'Los casos generados aparecerán aquí.'
                  : `${projectTestCases.length} caso(s) en este proyecto.`}
              </p>
            </div>
            {projectTestCases.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-[rgba(0,0,0,0.08)] bg-[#f8f9fb] px-2.5 py-1 text-xs text-foreground">
                  <ClipboardList className="size-3.5 text-muted-foreground" aria-hidden />
                  {projectTestCases.length} total
                </span>
                {automationReadyCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs text-emerald-900">
                    <Bot className="size-3.5" aria-hidden />
                    {automationReadyCount} listo(s) p. automatización
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {projectTestCases.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[rgba(0,0,0,0.1)] bg-[#fafbfc] px-6 py-12 text-center">
              <ClipboardList className="mb-3 size-9 text-muted-foreground opacity-70" strokeWidth={1.25} />
              <p className="text-sm font-medium text-foreground">Aún no hay casos de prueba</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Seleccione historias arriba y ejecute la generación para poblar esta lista.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {testCasesGroupedByStory.map(({ storyId, story, cases }) => (
                <section key={storyId} className="space-y-3">
                  <div className="rounded-lg border border-[rgba(0,0,0,0.06)] bg-[#f8f9fb] px-4 py-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-semibold text-foreground">
                            {story?.title ?? 'Historia no encontrada'}
                          </h4>
                          <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
                            {storyId}
                          </Badge>
                          {story?.jiraId ? (
                            <Badge variant="outline" className="text-[10px] text-emerald-800 border-emerald-200 bg-emerald-50">
                              Jira: {story.jiraId}
                            </Badge>
                          ) : null}
                        </div>
                        {story?.module ? (
                          <p className="text-xs text-muted-foreground">
                            Módulo: <span className="text-foreground/80">{story.module}</span>
                          </p>
                        ) : null}
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {cases.length} caso{cases.length === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {cases.map((tc) => {
                const open = openTcId === tc.id;
                return (
                  <Card
                    key={tc.id}
                    className="overflow-hidden rounded-xl border-[rgba(0,0,0,0.06)] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                  >
                    <CardHeader className="p-0">
                      <button
                        type="button"
                        aria-expanded={open}
                        className={cn(
                          'flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors',
                          'hover:bg-[#fafbfc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        )}
                        onClick={() => setOpenTcId(open ? null : tc.id)}
                      >
                        <div
                          className={cn(
                            'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg',
                            open ? 'bg-[#202950] text-white' : 'bg-[#e8eaf2] text-[#202950]',
                          )}
                          aria-hidden
                        >
                          <ClipboardList className="size-4" strokeWidth={2} />
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <CardTitle className="text-sm font-semibold leading-snug text-foreground line-clamp-2">
                              {tc.description || 'Sin descripción'}
                            </CardTitle>
                            <Badge
                              variant="outline"
                              className={cn('text-[10px] font-medium uppercase tracking-wide', priorityBadgeClass(tc.priority))}
                            >
                              {PRIORITY_LABEL[tc.priority]}
                            </Badge>
                          </div>
                          <CardDescription className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                            <span className="font-mono text-[11px] text-muted-foreground">{tc.id}</span>
                          </CardDescription>
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            <Badge variant="outline" className="font-normal text-[10px] text-muted-foreground">
                              {TYPE_LABEL[tc.type]}
                            </Badge>
                            <Badge variant="outline" className="font-normal text-[10px] text-muted-foreground">
                              {STATUS_LABEL[tc.status]}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={cn(
                                'font-normal text-[10px]',
                                tc.automationStatus === 'ready'
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                                  : 'text-muted-foreground',
                              )}
                            >
                              {AUTOMATION_LABEL[tc.automationStatus]}
                            </Badge>
                          </div>
                        </div>
                        <ChevronDown
                          className={cn(
                            'size-5 shrink-0 text-muted-foreground transition-transform duration-200',
                            open && 'rotate-180',
                          )}
                          aria-hidden
                        />
                      </button>
                    </CardHeader>

                    {open && (
                      <CardContent className="space-y-4 border-t border-[rgba(0,0,0,0.06)] bg-[#fafbfc]/80 px-4 pb-5 pt-4 sm:px-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor={`tc-desc-${tc.id}`}>Descripción</Label>
                            <Textarea
                              id={`tc-desc-${tc.id}`}
                              value={tc.description}
                              onChange={(e) => updateTestCase(tc.id, { description: e.target.value })}
                              rows={3}
                              className="min-h-[72px] resize-y bg-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`tc-pre-${tc.id}`}>Precondiciones</Label>
                            <Textarea
                              id={`tc-pre-${tc.id}`}
                              value={tc.preconditions}
                              onChange={(e) => updateTestCase(tc.id, { preconditions: e.target.value })}
                              rows={3}
                              className="resize-y bg-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`tc-steps-${tc.id}`}>Pasos</Label>
                            <Textarea
                              id={`tc-steps-${tc.id}`}
                              value={tc.steps}
                              onChange={(e) => updateTestCase(tc.id, { steps: e.target.value })}
                              rows={3}
                              className="resize-y bg-white"
                            />
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor={`tc-exp-${tc.id}`}>Resultado esperado</Label>
                            <Textarea
                              id={`tc-exp-${tc.id}`}
                              value={tc.expected}
                              onChange={(e) => updateTestCase(tc.id, { expected: e.target.value })}
                              rows={3}
                              className="resize-y bg-white"
                            />
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          <div className="space-y-2">
                            <Label>Prioridad</Label>
                            <Select
                              value={tc.priority}
                              onValueChange={(v) => updateTestCase(tc.id, { priority: v as TestCasePriority })}
                            >
                              <SelectTrigger className="bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {(Object.keys(PRIORITY_LABEL) as TestCasePriority[]).map((k) => (
                                  <SelectItem key={k} value={k}>
                                    {PRIORITY_LABEL[k]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Tipo</Label>
                            <Select
                              value={tc.type}
                              onValueChange={(v) => updateTestCase(tc.id, { type: v as TestCaseType })}
                            >
                              <SelectTrigger className="bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {(Object.keys(TYPE_LABEL) as TestCaseType[]).map((k) => (
                                  <SelectItem key={k} value={k}>
                                    {TYPE_LABEL[k]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Estado</Label>
                            <Select
                              value={tc.status}
                              onValueChange={(v) => updateTestCase(tc.id, { status: v as TestCaseStatus })}
                            >
                              <SelectTrigger className="bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {(Object.keys(STATUS_LABEL) as TestCaseStatus[]).map((k) => (
                                  <SelectItem key={k} value={k}>
                                    {STATUS_LABEL[k]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Automatización</Label>
                            <Select
                              value={tc.automationStatus}
                              onValueChange={(v) =>
                                updateTestCase(tc.id, { automationStatus: v as TestCase['automationStatus'] })
                              }
                            >
                              <SelectTrigger className="bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">{AUTOMATION_LABEL.pending}</SelectItem>
                                <SelectItem value="ready">{AUTOMATION_LABEL.ready}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

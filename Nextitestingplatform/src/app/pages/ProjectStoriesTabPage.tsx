import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';
import { BookOpen, ChevronDown, Layers, ListChecks, Pencil, Plus, Save, Sparkles, Trash2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { cn } from '../components/ui/utils';
import { buildSddUserStoriesBlob } from '../lib/sddUserStoriesBlob';
import { isSddApiConfigured, sddCreateProject } from '../services/sddOrchestratorService';
import type { UserStory, UserStoryDetail, UserStoryStatus } from '../types/usTcFlow';

const cardSurface =
  'bg-white rounded-xl border border-[rgba(0,0,0,0.06)] shadow-[0_1px_3px_rgba(0,0,0,0.04)]';

const STATUS_LABEL: Record<UserStoryStatus, string> = {
  generated: 'Generada',
  pending: 'Pendiente',
  review: 'En revisión',
};

function storyStatusBadgeClass(status: UserStoryStatus) {
  switch (status) {
    case 'generated':
      return 'border-emerald-200 bg-emerald-50 text-emerald-800';
    case 'review':
      return 'border-amber-200 bg-amber-50 text-amber-900';
    default:
      return 'border-[rgba(0,0,0,0.1)] bg-muted/50 text-muted-foreground';
  }
}

const EMPTY_DETAIL: UserStoryDetail = {
  actor: '',
  functionalFlow: '',
  screensInvolved: '',
  businessRules: '',
  technicalNotes: '',
};

type StoryEditDraft = Pick<UserStory, 'title' | 'description' | 'module' | 'criteria'> & {
  storyId: string;
  detail: UserStoryDetail;
};

function detailFromStory(story: UserStory): UserStoryDetail {
  return story.detail ? { ...story.detail } : { ...EMPTY_DETAIL };
}

function storyDraftFromPersisted(story: UserStory): StoryEditDraft {
  return {
    storyId: story.id,
    title: story.title,
    description: story.description,
    module: story.module,
    criteria: story.criteria.length ? [...story.criteria] : [''],
    detail: detailFromStory(story),
  };
}

function compactDetailForSave(d: UserStoryDetail): UserStory['detail'] {
  const actor = d.actor.trim();
  const functionalFlow = d.functionalFlow.trim();
  let screensInvolved = d.screensInvolved.trim();
  if (!screensInvolved) screensInvolved = 'N/A';
  const businessRules = d.businessRules.trim();
  const technicalNotes = d.technicalNotes.trim();
  if (!actor && !functionalFlow && screensInvolved === 'N/A' && !businessRules && !technicalNotes) {
    return undefined;
  }
  return { actor, functionalFlow, screensInvolved, businessRules, technicalNotes };
}

function detailMatchesPersisted(draftDetail: UserStoryDetail, story: UserStory): boolean {
  const persisted = detailFromStory(story);
  return (
    draftDetail.actor === persisted.actor &&
    draftDetail.functionalFlow === persisted.functionalFlow &&
    draftDetail.screensInvolved === persisted.screensInvolved &&
    draftDetail.businessRules === persisted.businessRules &&
    draftDetail.technicalNotes === persisted.technicalNotes
  );
}

function isDraftDirty(draft: StoryEditDraft, story: UserStory): boolean {
  if (draft.title !== story.title) return true;
  if (draft.description !== story.description) return true;
  if (draft.module !== story.module) return true;
  if (draft.criteria.length !== story.criteria.length) return true;
  if (draft.criteria.some((c, i) => c !== story.criteria[i])) return true;
  return !detailMatchesPersisted(draft.detail, story);
}

export default function ProjectStoriesTabPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const {
    projects,
    userStories,
    addUserStories,
    updateProject,
    updateUserStory,
    deleteUserStory,
    deleteUserStoriesByProject,
  } = useApp();
  const project = projects.find((p) => p.id === projectId);
  const [openStoryId, setOpenStoryId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<StoryEditDraft | null>(null);
  const [sddPrepareBusy, setSddPrepareBusy] = useState(false);
  const [sddPrepareError, setSddPrepareError] = useState<string | null>(null);

  const stories = useMemo(
    () => userStories.filter((story) => story.projectId === projectId),
    [userStories, projectId],
  );

  const storiesByModule = useMemo(() => {
    const map = new Map<string, UserStory[]>();
    for (const s of stories) {
      const key = (s.module || '').trim() || 'General';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    const keys = [...map.keys()].sort((a, b) => {
      if (a === 'General') return 1;
      if (b === 'General') return -1;
      return a.localeCompare(b, 'es', { sensitivity: 'base' });
    });
    return keys.map((moduleName) => ({ moduleName, stories: map.get(moduleName)! }));
  }, [stories]);

  useEffect(() => {
    if (!openStoryId || !projectId) {
      setEditDraft(null);
      return;
    }
    const s = userStories.find((st) => st.id === openStoryId && st.projectId === projectId);
    if (!s) {
      setEditDraft(null);
      return;
    }
    const next = storyDraftFromPersisted(s);
    setEditDraft((prev) => (prev?.storyId === openStoryId ? prev : next));
  }, [openStoryId, projectId, userStories]);

  const storiesBlobForSdd = useMemo(() => buildSddUserStoriesBlob(stories), [stories]);
  const sddApiConfigured = isSddApiConfigured();

  function handleAddStory() {
    if (!projectId) return;
    const created = addUserStories(projectId, [
      {
        title: 'Nueva historia de usuario',
        description: '',
        module: '',
        criteria: [''],
        status: 'pending',
      },
    ]);
    const first = created[0];
    if (first) setOpenStoryId(first.id);
  }

  function patchStoryDraft(
    story: UserStory,
    patch: Partial<Pick<StoryEditDraft, 'title' | 'description' | 'module' | 'criteria' | 'detail'>>,
  ) {
    setEditDraft((prev) => {
      const base = prev?.storyId === story.id ? prev : storyDraftFromPersisted(story);
      return { ...base, ...patch };
    });
  }

  function discardStoryDraft(story: UserStory) {
    setEditDraft(storyDraftFromPersisted(story));
  }

  function saveStoryDraft(story: UserStory) {
    if (!editDraft || editDraft.storyId !== story.id) return;
    updateUserStory(story.id, {
      title: editDraft.title,
      description: editDraft.description,
      module: editDraft.module,
      criteria: [...editDraft.criteria],
      detail: compactDetailForSave(editDraft.detail),
    });
  }

  function handleToggleStoryRow(story: UserStory) {
    const isOpen = openStoryId === story.id;
    if (isOpen) {
      if (editDraft?.storyId === story.id && isDraftDirty(editDraft, story)) {
        if (
          !window.confirm(
            'Si cierra esta historia ahora, se perderán los cambios que aún no ha guardado. ¿Desea cerrar de todas formas?',
          )
        )
          return;
      }
      setOpenStoryId(null);
      return;
    }
    if (openStoryId !== null) {
      const prev = userStories.find((s) => s.id === openStoryId && s.projectId === projectId);
      if (prev && editDraft?.storyId === prev.id && isDraftDirty(editDraft, prev)) {
        if (
          !window.confirm(
            'La historia que tiene abierta tiene cambios sin guardar. Si abre otra, esos cambios se perderán. ¿Desea continuar?',
          )
        )
          return;
      }
    }
    setOpenStoryId(story.id);
  }

  function handleOpenStoryForEdit(story: UserStory) {
    if (openStoryId === story.id) return;
    if (openStoryId !== null) {
      const prev = userStories.find((s) => s.id === openStoryId && s.projectId === projectId);
      if (prev && editDraft?.storyId === prev.id && isDraftDirty(editDraft, prev)) {
        if (
          !window.confirm(
            'Tiene cambios sin guardar en la historia actual. Si abre esta otra, perderá esos cambios. ¿Desea continuar?',
          )
        )
          return;
      }
    }
    setOpenStoryId(story.id);
  }

  async function handlePrepareSddGeneration() {
    if (!project || stories.length === 0 || !sddApiConfigured) return;
    setSddPrepareBusy(true);
    setSddPrepareError(null);
    try {
      const { id } = await sddCreateProject(project.name, storiesBlobForSdd);
      updateProject(project.id, { sddProjectId: id });
      navigate(`/projects/${projectId}/sdd`);
    } catch (e) {
      setSddPrepareError(e instanceof Error ? e.message : 'No se pudo preparar la generación de la aplicación.');
    } finally {
      setSddPrepareBusy(false);
    }
  }

  if (!project) {
    return <Navigate to="/projects" replace />;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div className={cn(cardSurface, 'p-5')}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground tracking-tight">Historias de usuario</h2>
            <p className="text-sm text-muted-foreground">
              Cree historias manualmente o edítelas al expandir cada tarjeta. También puede generarlas desde Documentación.
            </p>
            {stories.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-[rgba(0,0,0,0.08)] bg-[#f8f9fb] px-2.5 py-1 text-xs text-foreground">
                  <ListChecks className="size-3.5 text-muted-foreground" aria-hidden />
                  {stories.length} {stories.length === 1 ? 'historia' : 'historias'}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button type="button" className="gap-2 bg-[#58B888] hover:bg-[#4a9f76] text-white" onClick={handleAddStory}>
              <Plus className="size-4" />
              Nueva historia
            </Button>
            <Button
              variant="outline"
              className="border-rose-300/80 text-rose-700 hover:bg-rose-50"
              onClick={() => {
                if (stories.length === 0) return;
                if (
                  !window.confirm(
                    `¿Quiere eliminar las ${stories.length} historias de este proyecto? Esta acción no se puede deshacer.`,
                  )
                )
                  return;
                setOpenStoryId(null);
                deleteUserStoriesByProject(project.id);
              }}
              disabled={stories.length === 0}
            >
              <Trash2 className="size-4 mr-1.5" />
              Eliminar todas
            </Button>
          </div>
        </div>
      </div>

      {stories.length > 0 && (
        <div
          className={cn(
            cardSurface,
            'p-5 border border-[rgba(88,184,136,0.35)] bg-gradient-to-br from-white to-emerald-50/40',
          )}
        >
          {project.sddProjectId ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Generación de aplicación lista</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Abra la pestaña correspondiente para sincronizar historias y ejecutar el proceso de generación.
                </p>
              </div>
              <Button asChild className="shrink-0 gap-2 bg-[#202950] hover:bg-[#2a3560]">
                <Link to={`/projects/${projectId}/sdd`}>
                  <Sparkles className="size-4" />
                  Ir a generación de aplicación
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Generación de aplicación</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
                  Cree el proyecto de generación con estas historias y desbloquee la pestaña <strong>Generación de aplicación</strong>{' '}
                  para la consola, los archivos generados y la descarga del paquete.
                </p>
              </div>
              {!sddApiConfigured && (
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                  Configure la URL del API de generación:{' '}
                  <code className="text-[11px]">VITE_SDD_ORCHESTRATOR_API_URL</code> en{' '}
                  <code className="text-[11px]">.env</code> (p. ej. <code className="text-[11px]">http://localhost:8003</code>)
                  y reinicie Vite.
                </p>
              )}
              {sddPrepareError && (
                <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                  {sddPrepareError}
                </div>
              )}
              <Button
                type="button"
                className="gap-2 bg-[#58B888] hover:bg-[#4a9f76] text-white"
                disabled={!sddApiConfigured || sddPrepareBusy}
                onClick={() => void handlePrepareSddGeneration()}
              >
                <Sparkles className="size-4" />
                {sddPrepareBusy ? 'Preparando…' : 'Preparar generación de aplicación'}
              </Button>
            </div>
          )}
        </div>
      )}

      {stories.length === 0 ? (
        <div
          className={cn(
            cardSurface,
            'flex flex-col items-center justify-center px-8 py-14 text-center',
          )}
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8eaf2] text-[#202950]">
            <BookOpen className="size-7" strokeWidth={1.5} aria-hidden />
          </div>
          <h3 className="text-base font-semibold text-foreground">Aún no hay historias</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Agregue una historia manualmente o genérela desde la pestaña Documentación.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button type="button" className="gap-2 bg-[#58B888] hover:bg-[#4a9f76] text-white" onClick={handleAddStory}>
              <Plus className="size-4" />
              Agregar historia
            </Button>
            <Button asChild variant="outline">
              <Link to={`/projects/${projectId}/documentation`}>Ir a Documentación</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {storiesByModule.map(({ moduleName, stories: moduleStories }, modIdx) => (
            <Collapsible key={moduleName} defaultOpen={modIdx === 0} className="group">
              <div
                className={cn(
                  cardSurface,
                  'overflow-hidden border-[rgba(0,0,0,0.06)]',
                )}
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[#fafbfc] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <Layers className="size-4 shrink-0 text-[#202950]" aria-hidden />
                    <span className="text-sm font-semibold text-foreground truncate">{moduleName}</span>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {moduleStories.length}{' '}
                      {moduleStories.length === 1 ? 'historia' : 'historias'}
                    </Badge>
                  </div>
                  <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-3 border-t border-[rgba(0,0,0,0.06)] px-3 pb-3 pt-3 sm:px-4">
                    {moduleStories.map((story) => {
                      const open = openStoryId === story.id;
                      const draft =
                        editDraft?.storyId === story.id ? editDraft : storyDraftFromPersisted(story);
                      const dirty = isDraftDirty(draft, story);
                      return (
                        <Card
                          key={story.id}
                          className="overflow-hidden rounded-xl border-[rgba(0,0,0,0.06)] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                        >
                          <CardHeader className="p-0">
                            <div
                              className={cn(
                                'flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors',
                                'hover:bg-[#fafbfc]',
                              )}
                            >
                              <button
                                type="button"
                                aria-expanded={open}
                                className={cn(
                                  'flex min-w-0 flex-1 items-start gap-3 text-left',
                                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md',
                                )}
                                onClick={() => handleToggleStoryRow(story)}
                              >
                                <div
                                  className={cn(
                                    'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg',
                                    open ? 'bg-[#202950] text-white' : 'bg-[#e8eaf2] text-[#202950]',
                                  )}
                                  aria-hidden
                                >
                                  <Layers className="size-4" strokeWidth={2} />
                                </div>
                                <div className="min-w-0 flex-1 space-y-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <CardTitle className="text-sm font-semibold leading-snug text-foreground line-clamp-2">
                                      {story.title}
                                    </CardTitle>
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        'text-[10px] font-medium uppercase tracking-wide',
                                        storyStatusBadgeClass(story.status),
                                      )}
                                    >
                                      {STATUS_LABEL[story.status]}
                                    </Badge>
                                  </div>
                                  <CardDescription className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                                    <span>
                                      {story.criteria.length}{' '}
                                      {story.criteria.length === 1 ? 'criterio' : 'criterios'}
                                    </span>
                                    {story.detail?.actor ? (
                                      <>
                                        <span className="text-muted-foreground">·</span>
                                        <span className="text-muted-foreground truncate max-w-[12rem] sm:max-w-md">
                                          Actor: {story.detail.actor}
                                        </span>
                                      </>
                                    ) : null}
                                  </CardDescription>
                                </div>
                                <ChevronDown
                                  className={cn(
                                    'size-5 shrink-0 text-muted-foreground transition-transform duration-200',
                                    open && 'rotate-180',
                                  )}
                                  aria-hidden
                                />
                              </button>
                              <div className="flex shrink-0 items-center gap-1 pt-0.5">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2 text-muted-foreground hover:text-[#202950]"
                                  aria-label="Editar historia"
                                  title="Editar historia"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenStoryForEdit(story);
                                  }}
                                >
                                  <Pencil className="size-4" />
                                  <span className="ml-1 text-xs hidden sm:inline">Editar</span>
                                </Button>
                              </div>
                            </div>
                          </CardHeader>

                          {open && (
                            <CardContent className="space-y-4 border-t border-[rgba(0,0,0,0.06)] bg-[#fafbfc]/80 px-4 pb-5 pt-4 sm:px-5">
                              {dirty && (
                                <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                                  Hay cambios que aún no se han guardado.
                                </p>
                              )}
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2 sm:col-span-2">
                                  <Label htmlFor={`story-title-${story.id}`}>Título</Label>
                                  <Input
                                    id={`story-title-${story.id}`}
                                    value={draft.title}
                                    onChange={(e) => patchStoryDraft(story, { title: e.target.value })}
                                    className="bg-white"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`story-module-${story.id}`}>Módulo</Label>
                                  <Input
                                    id={`story-module-${story.id}`}
                                    value={draft.module}
                                    onChange={(e) => patchStoryDraft(story, { module: e.target.value })}
                                    placeholder="Ej. Autenticación"
                                    className="bg-white"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`story-desc-${story.id}`}>Descripción</Label>
                                <Textarea
                                  id={`story-desc-${story.id}`}
                                  rows={4}
                                  value={draft.description}
                                  onChange={(e) => patchStoryDraft(story, { description: e.target.value })}
                                  className="min-h-[100px] resize-y bg-white"
                                />
                              </div>
                              <div className="space-y-3 rounded-lg border border-[rgba(0,0,0,0.08)] bg-white p-3 sm:p-4">
                                <p className="text-xs font-semibold text-foreground">Detalle estructurado</p>
                                <div className="grid gap-3 sm:grid-cols-2">
                                  <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor={`story-actor-${story.id}`}>Actor</Label>
                                    <Input
                                      id={`story-actor-${story.id}`}
                                      value={draft.detail.actor}
                                      onChange={(e) =>
                                        patchStoryDraft(story, {
                                          detail: { ...draft.detail, actor: e.target.value },
                                        })
                                      }
                                      className="bg-white"
                                    />
                                  </div>
                                  <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor={`story-flow-${story.id}`}>Flujo funcional</Label>
                                    <Textarea
                                      id={`story-flow-${story.id}`}
                                      rows={3}
                                      value={draft.detail.functionalFlow}
                                      onChange={(e) =>
                                        patchStoryDraft(story, {
                                          detail: { ...draft.detail, functionalFlow: e.target.value },
                                        })
                                      }
                                      className="resize-y bg-white min-h-[72px]"
                                    />
                                  </div>
                                  <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor={`story-screens-${story.id}`}>Pantallas / superficies</Label>
                                    <Input
                                      id={`story-screens-${story.id}`}
                                      value={draft.detail.screensInvolved}
                                      onChange={(e) =>
                                        patchStoryDraft(story, {
                                          detail: { ...draft.detail, screensInvolved: e.target.value },
                                        })
                                      }
                                      placeholder="N/A si no aplica"
                                      className="bg-white"
                                    />
                                  </div>
                                  <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor={`story-rules-${story.id}`}>Reglas de negocio</Label>
                                    <Textarea
                                      id={`story-rules-${story.id}`}
                                      rows={3}
                                      value={draft.detail.businessRules}
                                      onChange={(e) =>
                                        patchStoryDraft(story, {
                                          detail: { ...draft.detail, businessRules: e.target.value },
                                        })
                                      }
                                      className="resize-y bg-white min-h-[72px]"
                                    />
                                  </div>
                                  <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor={`story-tech-${story.id}`}>Notas técnicas</Label>
                                    <Textarea
                                      id={`story-tech-${story.id}`}
                                      rows={3}
                                      value={draft.detail.technicalNotes}
                                      onChange={(e) =>
                                        patchStoryDraft(story, {
                                          detail: { ...draft.detail, technicalNotes: e.target.value },
                                        })
                                      }
                                      className="resize-y bg-white min-h-[72px]"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <Label className="text-foreground">Criterios de aceptación</Label>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs"
                                    onClick={() =>
                                      patchStoryDraft(story, { criteria: [...draft.criteria, ''] })
                                    }
                                  >
                                    <Plus className="size-3.5 mr-1" />
                                    Agregar criterio
                                  </Button>
                                </div>
                                <div className="space-y-2">
                                  {draft.criteria.map((criterion, idx) => (
                                    <div key={`${story.id}-criterion-${idx}`} className="flex gap-2">
                                      <span
                                        className="flex size-8 shrink-0 items-center justify-center rounded-md border border-[rgba(0,0,0,0.08)] bg-white text-xs font-medium text-muted-foreground"
                                        aria-hidden
                                      >
                                        {idx + 1}
                                      </span>
                                      <Input
                                        value={criterion}
                                        onChange={(e) => {
                                          const next = [...draft.criteria];
                                          next[idx] = e.target.value;
                                          patchStoryDraft(story, { criteria: next });
                                        }}
                                        className="bg-white min-w-0 flex-1"
                                        placeholder={`Criterio ${idx + 1}`}
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 shrink-0 text-muted-foreground hover:text-rose-600"
                                        title="Quitar criterio"
                                        disabled={draft.criteria.length <= 1}
                                        onClick={() => {
                                          if (draft.criteria.length <= 1) return;
                                          const next = draft.criteria.filter((_, i) => i !== idx);
                                          patchStoryDraft(story, { criteria: next.length ? next : [''] });
                                        }}
                                      >
                                        <X className="size-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[rgba(0,0,0,0.06)] pt-4">
                                <Button
                                  type="button"
                                  variant="outline"
                                  disabled={!dirty}
                                  onClick={() => discardStoryDraft(story)}
                                >
                                  Descartar
                                </Button>
                                <Button
                                  type="button"
                                  className="gap-2 bg-[#58B888] hover:bg-[#4a9f76] text-white"
                                  disabled={!dirty}
                                  onClick={() => saveStoryDraft(story)}
                                >
                                  <Save className="size-4" />
                                  Guardar cambios
                                </Button>
                                <Button
                                  variant="outline"
                                  className="border-rose-300/80 text-rose-700 hover:bg-rose-50"
                                  onClick={() => {
                                    if (
                                      !window.confirm(
                                        '¿Eliminar esta historia? No podrá recuperarla después.',
                                      )
                                    )
                                      return;
                                    if (story.id === openStoryId) setOpenStoryId(null);
                                    deleteUserStory(story.id);
                                  }}
                                >
                                  Eliminar
                                </Button>
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>
      )}
    </div>
  );
}

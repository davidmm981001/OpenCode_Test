import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Download,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  FileCode2,
  FileText,
  Loader2,
  Folder,
  FolderOpen,
  AlertTriangle,
  WifiOff,
  Upload,
  CheckCircle2,
  CircleDashed,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getSupabaseClient } from '../../lib/supabaseClient';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import {
  generateScripts,
  mapScriptsToFiles,
  mergeGenerateScriptsResponses,
  ScriptGenerationServiceError,
  type ScriptFile,
} from '../../services/scriptGenerationService';
import { chunkGherkinForScriptGeneration } from '../../lib/gherkinChunking';
import type { Project } from '../../data/mockData';
import type {
  BddWorkspaceSnapshot,
  FrameworkCategorySelection,
  GenerateScriptsResponse,
} from '../../types/generation';
import {
  createZipFromFileMap,
  createZipFromTextFilesAtPaths,
  buildArchetypeStructuredScriptTree,
  extractArchetypePaths,
  flattenScriptDisplayTreeLeaves,
  mergeGeneratedFilesIntoArchetype,
  resolveGeneratedPathsForArchetype,
  type ScriptDisplayTreeNode,
  type ZipFileMap,
} from '../../lib/zipArchetype';
import { fetchOpenApiResource } from '../../lib/openApiResource';
import {
  getLatestScriptGenerationRunId,
  listScriptFilesByRunId,
  upsertScriptFiles,
  upsertScriptGenerationRun,
} from '../../lib/repositories/workspaceRepository';
import {
  PROJECT_FRAMEWORK_CATEGORIES as FRAMEWORK_CATEGORIES,
  resolveFrameworkSelectionForProject,
  slotIdFor,
  type FrameworkCategoryId,
} from '../../lib/projectFrameworkArchetypeSelection';

type FrameworkCategoryDef = (typeof FRAMEWORK_CATEGORIES)[number];

const ALL_FRAMEWORKS = Array.from(
  new Set(FRAMEWORK_CATEGORIES.flatMap(c => c.frameworks)),
);
type CategoryId = FrameworkCategoryId;
type CategorySelection = Record<CategoryId, string | null>;

// ─── FrameworkCategoryMultiSelect ──────────────────────────────────────────

function FrameworkCategoryMultiSelect({
  selectedByCategory,
  onChange,
  categories = FRAMEWORK_CATEGORIES,
}: {
  selectedByCategory: CategorySelection;
  onChange: (next: CategorySelection) => void;
  /** When set (e.g. Automation tab), only these categories are shown (N/A categories omitted). */
  categories?: FrameworkCategoryDef[];
}) {
  const toggle = (categoryId: CategoryId, name: string) => {
    const current = selectedByCategory[categoryId];
    onChange({
      ...selectedByCategory,
      [categoryId]: current === name ? null : name,
    });
  };

  const OptionCard = ({ categoryId, name }: { categoryId: CategoryId; name: string }) => {
    const isOn = selectedByCategory[categoryId] === name;
    return (
      <div
        key={name}
        role="button"
        tabIndex={0}
        aria-pressed={isOn}
        onClick={() => toggle(categoryId, name)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle(categoryId, name);
          }
        }}
        className="flex min-w-[200px] cursor-pointer items-center justify-between gap-6 rounded-lg px-4 py-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{
          border: isOn ? '1.5px solid #202950' : '1px solid rgba(0,0,0,0.12)',
          backgroundColor: isOn ? '#e8eaf2' : '#fafbfc',
          boxShadow: isOn ? '0 0 0 1px rgba(32,41,80,0.08)' : 'none',
          opacity: isOn ? 1 : 1,
        }}
      >
        <span
          className="text-sm font-medium"
          style={{ color: isOn ? '#202950' : '#374151' }}
        >
          {name}
        </span>
        <div
          className="shrink-0"
          onClick={e => e.stopPropagation()}
        >
          <Checkbox
            checked={isOn}
            onCheckedChange={() => toggle(categoryId, name)}
            aria-label={`Seleccionar ${name}`}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {categories.map(cat => (
        <div key={cat.id}>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/90 mb-2">
            {cat.label}
          </div>
          <div className="flex w-fit max-w-full flex-row gap-3 flex-wrap">
            {cat.frameworks.map(fw => (
              <OptionCard key={fw} categoryId={cat.id} name={fw} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── AutomationFrameworkReadonlyPanel (informative; edit in Projects) ───────

function AutomationFrameworkReadonlyPanel({
  categories,
  selection,
  archetypeFileMapByFramework,
}: {
  categories: FrameworkCategoryDef[];
  selection: CategorySelection;
  archetypeFileMapByFramework: Record<string, ZipFileMap | null>;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground leading-relaxed">
        La selección de frameworks y los ZIP de arquetipo se definen en la lista de proyectos. Esta sección es solo
        informativa.
      </p>
      <Link
        to="/projects"
        className="inline-flex text-xs font-medium text-[#202950] underline underline-offset-2"
      >
        Ir a proyectos para configurar frameworks y arquetipos
      </Link>
      <div className="space-y-2.5 pt-1">
        {categories.map(cat => {
          const fw = selection[cat.id];
          const slotId = fw ? slotIdFor(cat.id, fw) : null;
          const map = slotId ? archetypeFileMapByFramework[slotId] : undefined;
          const hasArchetype = map != null && map.size > 0;
          return (
            <div
              key={cat.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-2.5"
              style={{ border: '1px solid rgba(0,0,0,0.08)', backgroundColor: '#fafbfc' }}
            >
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/90">
                  {cat.label}
                </div>
                <div className="text-sm font-medium text-foreground mt-0.5">
                  {fw ?? '—'}
                </div>
              </div>
              <div
                className="flex shrink-0 items-center gap-1.5 text-xs font-medium"
                title={hasArchetype ? 'Arquetipo ZIP cargado para este slot' : 'Falta subir el ZIP de arquetipo en proyectos'}
              >
                {hasArchetype ? (
                  <>
                    <CheckCircle2 size={15} className="text-emerald-600" aria-hidden />
                    <span className="text-emerald-800">Arquetipo listo</span>
                  </>
                ) : (
                  <>
                    <CircleDashed size={15} className="text-amber-600" aria-hidden />
                    <span className="text-amber-900/90">Arquetipo pendiente</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── CodePreviewBlock ────────────────────────────────────────────────────────

function CodePreviewBlock({ content }: { content: string }) {
  return (
    <div
      className="p-4 text-xs font-mono overflow-x-auto leading-relaxed rounded-b-lg"
      style={{
        backgroundColor: '#f8f9fb',
        border: '1px solid rgba(0,0,0,0.06)',
        borderTop: 'none',
        maxHeight: 'min(50vh, 320px)',
        overflowY: 'auto',
      }}
    >
      {content.split('\n').map((line, idx) => {
        const t = line.trim();
        const isTag = t.startsWith('@');
        return (
          <div
            key={idx}
            style={{
              color: isTag ? '#a21caf' : '#374151',
              lineHeight: 1.75,
              fontWeight: isTag ? 600 : 400,
            }}
          >
            {line || '\u00A0'}
          </div>
        );
      })}
    </div>
  );
}

// ─── ArchivoScriptCard ───────────────────────────────────────────────────────

function ArchivoScriptCard({
  file,
  compactPath = false,
}: {
  file: ScriptFile;
  compactPath?: boolean;
}) {
  const [showPreview, setShowPreview] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const leafName = file.path.split('/').pop() ?? 'archivo';
  const parentDir = file.path.includes('/')
    ? file.path.slice(0, file.path.lastIndexOf('/'))
    : '';

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await createZipFromTextFilesAtPaths([
        { path: file.path, content: file.content },
      ]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const leaf = file.path.split('/').pop() ?? 'archivo';
      const withoutExt = leaf.replace(/(\.[^.]+)$/, '');
      a.download = `${withoutExt || leaf}_estructura.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: flat file if ZIP fails
      const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.path.split('/').pop() ?? 'file';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className={compactPath ? 'overflow-hidden bg-background' : 'rounded-lg overflow-hidden'}
      style={
        compactPath
          ? undefined
          : { border: '1px solid rgba(0,0,0,0.08)', backgroundColor: '#fff' }
      }
    >
      <div
        className={`flex items-center justify-between gap-3 ${compactPath ? 'px-3 py-2.5' : 'px-4 py-3'}`}
        style={{ borderBottom: showPreview ? '1px solid rgba(0,0,0,0.06)' : 'none' }}
      >
        <div className="flex items-start gap-2.5 min-w-0">
          {compactPath ? (
            <FileText size={15} className="text-emerald-700/85 dark:text-emerald-500/90 shrink-0 mt-0.5" />
          ) : (
            <FileCode2 size={14} className="text-muted-foreground flex-shrink-0 mt-0.5" />
          )}
          <div className="min-w-0 flex-1">
            {compactPath ? (
              <>
                <div className="text-sm font-semibold text-foreground truncate" title={leafName}>
                  {leafName}
                </div>
                {parentDir ? (
                  <div
                    className="text-[11px] font-mono text-muted-foreground truncate mt-0.5"
                    title={file.path}
                  >
                    {parentDir}
                  </div>
                ) : null}
              </>
            ) : (
              <span className="text-sm font-medium text-foreground truncate">{file.path}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => setShowPreview(p => !p)}
            className="text-xs px-2.5 py-1 rounded-md transition-colors"
            style={{
              color: showPreview ? '#202950' : '#6b7280',
              backgroundColor: showPreview ? '#e8eaf2' : 'rgba(0,0,0,0.04)',
              border: '1px solid rgba(0,0,0,0.07)',
            }}
          >
            {showPreview ? <ChevronUp size={11} className="inline mr-1" /> : <ChevronDown size={11} className="inline mr-1" />}
            {showPreview ? 'Ocultar preview' : 'Ver preview'}
          </button>
          <button
            type="button"
            disabled={downloading}
            onClick={() => void handleDownload()}
            className="text-xs px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 disabled:opacity-60"
            style={{
              color: '#fff',
              backgroundColor: '#58B888',
              border: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            {downloading ? <Loader2 size={11} className="animate-spin" /> : <Download size={11} />}{' '}
            {downloading ? '…' : 'Descargar'}
          </button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {showPreview && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <CodePreviewBlock content={file.content} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ScriptTreeView({
  framework,
  node,
  depth = 0,
}: {
  framework: string;
  node: ScriptDisplayTreeNode;
  depth?: number;
}) {
  const indent = depth * 14;

  return (
    <div className="space-y-1.5">
      {node.folders.map(folder => (
        <details
          key={folder.path}
          className="group rounded-lg border border-border/60 bg-card/40 overflow-hidden shadow-sm"
          style={{ marginLeft: indent }}
        >
          <summary className="list-none cursor-pointer select-none flex items-center gap-2 px-3 py-2.5 hover:bg-muted/50 transition-colors [&::-webkit-details-marker]:hidden">
            <ChevronRight
              size={16}
              className="shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-90"
              aria-hidden
            />
            <Folder
              size={15}
              className="shrink-0 text-amber-600/90 dark:text-amber-500/90"
              aria-hidden
            />
            <span className="text-sm font-medium text-foreground truncate">{folder.name}</span>
            <span className="text-[11px] text-muted-foreground ml-auto shrink-0 tabular-nums">
              {folder.files.length + folder.folders.reduce((n, c) => n + countTreeFiles(c), 0)} archivo(s)
            </span>
          </summary>
          <div className="px-2 pb-2 pt-1 border-t border-border/40 bg-muted/15">
            <ScriptTreeView framework={framework} node={folder} depth={depth + 1} />
          </div>
        </details>
      ))}

      {node.files.map((file, idx) => (
        <div
          key={`${file.path}-${idx}`}
          className="rounded-lg border border-border/50 bg-background overflow-hidden"
          style={{ marginLeft: indent }}
        >
          <ArchivoScriptCard
            file={{
              framework,
              path: file.path,
              content: file.content,
            }}
            compactPath
          />
        </div>
      ))}
    </div>
  );
}

function countTreeFiles(n: ScriptDisplayTreeNode): number {
  return n.files.length + n.folders.reduce((acc, c) => acc + countTreeFiles(c), 0);
}

// ─── ScriptsDePruebaTab ──────────────────────────────────────────────────────

export function ScriptsDePruebaTab({
  gherkinOutput,
  project,
  workspaceSnapshot,
  archetypeFileMapByFramework,
  scriptSource = 'workspace',
}: {
  gherkinOutput: string | null;
  project: Project;
  workspaceSnapshot?: BddWorkspaceSnapshot | null;
  archetypeFileMapByFramework: Record<string, ZipFileMap | null>;
  /** workspace = BDD from requirement analysis; automation = Gherkin built from generated test cases */
  scriptSource?: 'workspace' | 'automation';
}) {
  const {
    projectArchetypes,
    getProjectFrameworkSelection,
    setProjectFrameworkSelection,
    testCases,
    updateTestCase,
  } = useApp();
  const mapsForProject = projectArchetypes[project.id];
  const persistedSelection = getProjectFrameworkSelection(project.id);

  const archetypeConfigFingerprint = useMemo(() => {
    if (!mapsForProject) return '';
    return Object.entries(mapsForProject)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v == null ? 0 : v.size}`)
      .join('|');
  }, [mapsForProject]);

  const [selectedFrameworkByCategory, setSelectedFrameworkByCategory] = useState<CategorySelection>(() =>
    resolveFrameworkSelectionForProject(undefined, {}),
  );

  useEffect(() => {
    setSelectedFrameworkByCategory(
      resolveFrameworkSelectionForProject(persistedSelection, mapsForProject ?? {}),
    );
  }, [project.id, archetypeConfigFingerprint, persistedSelection, mapsForProject]);

  const supabaseEnabled = Boolean(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
  );

  const handleFrameworkSelectionChange = (next: CategorySelection) => {
    setSelectedFrameworkByCategory(next);
    setProjectFrameworkSelection(project.id, next);
  };
  const [generatedScripts, setGeneratedScripts] = useState<ScriptFile[] | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<{ message: string; isOffline: boolean } | null>(null);

  // Restore the latest generated scripts for this project from Supabase.
  useEffect(() => {
    if (!supabaseEnabled) return;

    const load = async () => {
      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getUser();
      const ownerUserId = data.user?.id ?? null;
      if (!ownerUserId) return;

      const latestRunId = await getLatestScriptGenerationRunId(ownerUserId, project.id);
      if (!latestRunId) {
        setGeneratedScripts(null);
        return;
      }

      const files = await listScriptFilesByRunId(ownerUserId, latestRunId);
      setGeneratedScripts(files);
    };

    void load().catch(err => {
      console.error('Failed to load generated scripts:', err);
    });
  }, [project.id, supabaseEnabled]);

  const [zipDownloading, setZipDownloading] = useState(false);
  const [zipDownloadError, setZipDownloadError] = useState<string | null>(null);
  const [batchStatus, setBatchStatus] = useState<string | null>(null);

  /** Automation tab: hide categories the user marked N/A in project settings (`null` in persisted selection). */
  const visibleFrameworkCategories = useMemo(() => {
    if (scriptSource !== 'automation') return FRAMEWORK_CATEGORIES;
    const raw = persistedSelection ?? project.frameworkSelection;
    if (!raw) return FRAMEWORK_CATEGORIES;
    return FRAMEWORK_CATEGORIES.filter(cat => raw[cat.id] !== null);
  }, [scriptSource, persistedSelection, project.frameworkSelection]);

  const slotCategories =
    scriptSource === 'automation' ? visibleFrameworkCategories : FRAMEWORK_CATEGORIES;

  const showApiResourceInfo =
    slotCategories.some(c => c.id === 'api') &&
    ['Karate', 'Playwright'].includes(selectedFrameworkByCategory.api ?? '');
  const projectApiResources = useMemo(
    () =>
      (project.apiResources ?? [])
        .map((r, idx) => ({
          id: r.id || `api-${idx + 1}`,
          name: r.name?.trim() || `API ${idx + 1}`,
          baseUrl: r.baseUrl?.trim() ?? '',
          swaggerUrl: r.swaggerUrl?.trim() ?? '',
        }))
        .filter((r) => r.baseUrl || r.swaggerUrl),
    [project.apiResources],
  );
  const selectedFrameworks = Array.from(
    new Set(
      Object.values(selectedFrameworkByCategory).filter(
        (v): v is string => !!v,
      ),
    ),
  );

  const handleGenerate = async () => {
    if (!gherkinOutput) return;
    if (selectedFrameworks.length === 0) {
      setError({
        message:
          'Seleccione al menos un framework en las categorias API/Web/Performance para generar scripts.',
        isOffline: false,
      });
      return;
    }
    setGenerating(true);
    setGeneratedScripts(null);
    setError(null);
    try {
      const archetypePathsByFramework: Record<string, string[]> = {};
      for (const fw of selectedFrameworks) {
        const map = (() => {
          const slotId = slotCategories
            .map(cat => (selectedFrameworkByCategory[cat.id] === fw ? `${cat.id}:${fw}` : null))
            .find((v): v is string => !!v);
          return slotId ? archetypeFileMapByFramework[slotId] ?? null : null;
        })();
        if (map && map.size > 0) {
          archetypePathsByFramework[fw] = extractArchetypePaths(map);
        }
      }

      const chunks = chunkGherkinForScriptGeneration(gherkinOutput);
      const parsedApiResources: Array<{
        id: string;
        name: string;
        baseUrl?: string;
        swaggerUrl?: string;
        openApiSummary?: string;
        openApiEndpoints?: Array<{ method: string; path: string; summary?: string; operationId?: string }>;
      }> = [];
      for (const r of projectApiResources) {
        if (!r.swaggerUrl) {
          parsedApiResources.push(r);
          continue;
        }
        try {
          const openApi = await fetchOpenApiResource(r.swaggerUrl);
          parsedApiResources.push({
            ...r,
            openApiSummary: openApi.summaryText,
            openApiEndpoints: openApi.endpoints.slice(0, 200),
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          throw new Error(`No se pudo leer Swagger/OpenAPI para "${r.name}": ${msg}`);
        }
      }
      const basePayload = {
        contractVersion: 'v1' as const,
        flowStage: 'automation' as const,
        projectId: project.id,
        feature_title: project.name || 'Generated Feature',
        selectedFrameworkByCategory: selectedFrameworkByCategory as FrameworkCategorySelection,
        selectedFrameworks,
        ...(Object.keys(archetypePathsByFramework).length > 0 && { archetypePathsByFramework }),
        ...(parsedApiResources.length > 0 && {
          apiResources: parsedApiResources,
        }),
        ...(workspaceSnapshot && {
          aiRoles: workspaceSnapshot.aiRoles,
          scriptingLanguage: workspaceSnapshot.scriptingLanguage,
          maxScenarios: workspaceSnapshot.maxScenarios,
          minPositiveCases: workspaceSnapshot.minPositiveCases,
          minNegativeCases: workspaceSnapshot.minNegativeCases,
          istqbPrompt: workspaceSnapshot.istqbPrompt,
          requirementText: workspaceSnapshot.requirementText || undefined,
          codeContext: workspaceSnapshot.codeContext.length ? workspaceSnapshot.codeContext : undefined,
          test_hints: workspaceSnapshot.testHints ?? undefined,
        }),
      };

      const responses: GenerateScriptsResponse[] = [];
      for (let i = 0; i < chunks.length; i++) {
        setBatchStatus(
          chunks.length > 1
            ? `Generando lote ${i + 1} de ${chunks.length} (cada lote = varios escenarios; el Gherkin completo se cubre al final)…`
            : null,
        );
        const response = await generateScripts({
          ...basePayload,
          requestId: crypto.randomUUID(),
          gherkin: chunks[i],
        });
        responses.push(response);
      }

      const merged =
        responses.length === 1 ? responses[0] : mergeGenerateScriptsResponses(responses);
      const generatedFiles = mapScriptsToFiles(merged, selectedFrameworks);
      setGeneratedScripts(generatedFiles);

      // Persist generated scripts so refresh restores the scripts list (Option A).
      if (supabaseEnabled) {
        try {
          const supabase = getSupabaseClient();
          const { data } = await supabase.auth.getUser();
          const ownerUserId = data.user?.id ?? null;
          if (ownerUserId) {
            const runId = crypto.randomUUID();
            await upsertScriptGenerationRun(ownerUserId, {
              id: runId,
              projectId: project.id,
              requestId: crypto.randomUUID(),
              selectedFrameworks,
              flowStage: 'automation',
              succeeded: true,
              error: null,
            });

            await upsertScriptFiles(ownerUserId, {
              projectId: project.id,
              runId,
              files: generatedFiles,
            });
          }
        } catch (err) {
          // Scripts UI can still work even if persistence fails.
          console.error('Failed to persist generated scripts:', err);
        }
      }

      // Mark project test cases as "ready" after successful script generation.
      const projectTestCases = testCases.filter(tc => tc.projectId === project.id);
      for (const tc of projectTestCases) {
        if (tc.automationStatus !== 'ready') {
          updateTestCase(tc.id, { automationStatus: 'ready' });
        }
      }
    } catch (err) {
      if (err instanceof ScriptGenerationServiceError) {
        setError({ message: err.message, isOffline: err.isOffline });
      } else {
        setError({ message: 'Error inesperado al generar scripts.', isOffline: false });
      }
    } finally {
      setGenerating(false);
      setBatchStatus(null);
    }
  };

  const getArchetypeFileMapForFramework = (framework: string): ZipFileMap | null => {
    const slotId = slotCategories
      .map(cat => (selectedFrameworkByCategory[cat.id] === framework ? `${cat.id}:${framework}` : null))
      .find((v): v is string => !!v);
    if (!slotId) return null;
    return archetypeFileMapByFramework[slotId] ?? null;
  };

  const handleDownloadMergedZip = async (framework: string) => {
    const archetypeFileMap = getArchetypeFileMapForFramework(framework);
    const scriptsForFramework = generatedScripts?.filter(f => f.framework === framework) ?? [];
    if (!archetypeFileMap || scriptsForFramework.length === 0) return;
    setZipDownloading(true);
    setZipDownloadError(null);
    try {
      const merged = mergeGeneratedFilesIntoArchetype(
        archetypeFileMap,
        scriptsForFramework.map(f => ({ path: f.path, content: f.content })),
      );
      const blob = await createZipFromFileMap(merged);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name.replace(/\s+/g, '_')}_${framework}_scripts_merged.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setZipDownloadError(e instanceof Error ? e.message : 'No se pudo generar el ZIP fusionado.');
    } finally {
      setZipDownloading(false);
    }
  };

  const handleDownloadScriptsOnlyZip = async (tree: ScriptDisplayTreeNode, framework: string) => {
    const leaves = flattenScriptDisplayTreeLeaves(tree);
    if (leaves.length === 0) return;
    setZipDownloading(true);
    setZipDownloadError(null);
    try {
      const blob = await createZipFromTextFilesAtPaths(
        leaves.map(f => ({ path: f.path, content: f.content })),
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name.replace(/\s+/g, '_')}_${framework}_scripts_paths.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setZipDownloadError(e instanceof Error ? e.message : 'No se pudo generar el ZIP de scripts.');
    } finally {
      setZipDownloading(false);
    }
  };

  const hasSelectedFrameworks = selectedFrameworks.length > 0;

  const byFramework = generatedScripts
    ? Array.from(new Set(generatedScripts.map(f => f.framework))).map(fw => {
        const archetypeFileMap = getArchetypeFileMapForFramework(fw);
        const rawFiles = generatedScripts
          .filter(f => f.framework === fw)
          .map(f => ({ path: f.path, content: f.content }));
        const filesForTree =
          archetypeFileMap
            ? resolveGeneratedPathsForArchetype(archetypeFileMap, rawFiles)
            : rawFiles;
        return {
          framework: fw,
          files: generatedScripts.filter(f => f.framework === fw),
          tree: buildArchetypeStructuredScriptTree(archetypeFileMap, filesForTree),
        };
      })
    : [];

  return (
    <div className="flex w-full flex-col gap-4 p-4 pb-8">
      {/* Subtabs: only Scripts (Frameworks removed) */}
      <div className="flex items-center gap-0 -mb-px">
        <button
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm transition-colors relative"
          style={{
            color: '#030213',
            fontWeight: 500,
            borderBottom: '2px solid #030213',
            cursor: 'default',
            whiteSpace: 'nowrap',
          }}
        >
          <FileCode2 size={14} /> Scripts
        </button>
      </div>

      {false ? (
        <div className="flex w-full flex-col gap-4">
          <div
            className="rounded-lg bg-white w-full"
            style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#e8eaf2' }}
                >
                  <Upload size={12} style={{ color: '#202950' }} />
                </div>
                <span className="text-sm font-medium text-foreground">
                  Framework archetypes (ZIP) - proyecto
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/80 block mb-2">
                  Frameworks de testing
                </Label>
                <FrameworkCategoryMultiSelect
                  selectedByCategory={selectedFrameworkByCategory}
                  onChange={handleFrameworkSelectionChange}
                  categories={slotCategories}
                />
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Seleccione uno o más frameworks para descargar ZIPs fusionados. Los arquetipos se suben en la configuración del proyecto.
                </p>
              </div>

              <div
                className="rounded-lg p-3"
                style={{ backgroundColor: '#f4f5f7', border: '1px solid rgba(0,0,0,0.08)' }}
              >
                <p className="text-xs text-muted-foreground">
                  Al descargar, el ZIP final se genera fusionando el arquetipo del framework con los scripts generados usando el path del archivo.
                </p>
              </div>

              {selectedFrameworks.length === 0 ? (
                <div className="rounded-lg p-3" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                  <p className="text-sm font-medium text-foreground">Seleccione frameworks</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Para descargar ZIPs fusionados, primero elija qué frameworks usar.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedFrameworks.map(framework => {
                    const archetypeFileMap = getArchetypeFileMapForFramework(framework);
                    const archetypeEntriesCount = archetypeFileMap ? archetypeFileMap.size : 0;
                    const scriptsForFramework =
                      generatedScripts?.filter(f => f.framework === framework) ?? [];

                    return (
                      <div
                        key={framework}
                        className="rounded-lg p-4"
                        style={{ backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.08)' }}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-foreground">{framework}</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              Arquetipo: {archetypeFileMap ? `${archetypeEntriesCount} archivos` : 'no cargado'}
                            </p>
                            {false && (
                              <p className="text-xs text-rose-500 mt-1">
                                Sin soporte de generación en este momento (solo se fusiona cuando haya scripts).
                              </p>
                            )}
                          </div>
                          {scriptsForFramework.length > 0 ? (
                            <p className="text-xs text-muted-foreground mt-1 whitespace-nowrap">
                              Scripts listos: {scriptsForFramework.length} archivo(s)
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground mt-1 whitespace-nowrap">
                              Aún no hay scripts para fusionar
                            </p>
                          )}
                        </div>

                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/80 block mb-2">
                              Arquetipo ZIP
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              {archetypeFileMap ? 'Cargado en la configuración del proyecto' : 'No cargado todavía'}
                            </p>
                          </div>

                          <div className="shrink-0 pt-6">
                            <button
                              type="button"
                              disabled={
                                !archetypeFileMap ||
                                scriptsForFramework.length === 0 ||
                                zipDownloading
                              }
                              onClick={() => void handleDownloadMergedZip(framework)}
                              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{
                                backgroundColor: zipDownloading ? '#9ca3af' : '#58B888',
                                color: '#fff',
                                border: '1px solid rgba(0,0,0,0.06)',
                              }}
                            >
                              {zipDownloading ? (
                                <>
                                  <Loader2 size={16} className="animate-spin" /> Generando ZIP…
                                </>
                              ) : (
                                <>
                                  <Download size={16} /> Descargar ZIP (arquetipo + scripts)
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {zipDownloadError && <p className="text-xs text-rose-500">{zipDownloadError}</p>}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Configuración */}
      <div
        className="rounded-lg bg-white"
        style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#e8eaf2' }}
            >
              <FileCode2 size={12} style={{ color: '#202950' }} />
            </div>
            <span className="text-sm font-medium text-foreground">Configuración</span>
          </div>
        </div>
        <div className="p-4 sm:p-5">
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/80 block mb-2">
                {scriptSource === 'automation' ? 'Frameworks configurados (solo lectura)' : 'Frameworks de testing'}
              </Label>
              {scriptSource === 'automation' && visibleFrameworkCategories.length === 0 ? (
                <div
                  className="rounded-lg p-4 space-y-2"
                  style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}
                >
                  <p className="text-sm font-medium text-foreground">
                    No hay categorías de automatización configuradas
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    En la lista de proyectos, abra la configuración de frameworks y elija al menos una categoría
                    (API, Web o Performance). Las marcadas como «N/A» no aparecen aquí.
                  </p>
                  <Link
                    to="/projects"
                    className="text-xs font-medium text-[#202950] underline underline-offset-2 inline-block"
                  >
                    Ir a proyectos
                  </Link>
                </div>
              ) : scriptSource === 'automation' ? (
                <AutomationFrameworkReadonlyPanel
                  categories={slotCategories}
                  selection={selectedFrameworkByCategory}
                  archetypeFileMapByFramework={archetypeFileMapByFramework}
                />
              ) : (
                <>
                  <FrameworkCategoryMultiSelect
                    selectedByCategory={selectedFrameworkByCategory}
                    onChange={handleFrameworkSelectionChange}
                    categories={slotCategories}
                  />
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Seleccione un framework por categoría. La generación se ejecuta por categoría/framework en n8n.
                  </p>
                </>
              )}
            </div>

            {showApiResourceInfo && (
              <div
                className="rounded-lg p-4 space-y-3"
                style={{ backgroundColor: '#fafbfc', border: '1px solid rgba(0,0,0,0.08)' }}
              >
                <div className="text-sm font-medium text-foreground">
                  Recursos API (desde Documentación)
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Esta generación usa los recursos API configurados en la pestaña Documentación.
                  {projectApiResources.length > 0
                    ? ` APIs configuradas: ${projectApiResources.length}.`
                    : ' No hay APIs configuradas todavía.'}
                </p>
                <Link
                  to={`/projects/${project.id}/documentation`}
                  className="text-xs font-medium text-[#202950] underline underline-offset-2"
                >
                  Configurar recursos API
                </Link>
              </div>
            )}

            {!gherkinOutput && (
              <div className="rounded-lg p-3" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                <p className="text-sm font-medium text-foreground">
                  {scriptSource === 'automation'
                    ? 'No hay casos de prueba para convertir a Gherkin'
                    : 'Aún no se han generado escenarios BDD'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {scriptSource === 'automation' ? (
                    <>
                      Genere o complete las historias de usuario en{' '}
                      <Link
                        to={`/projects/${project.id}/stories`}
                        className="font-medium text-[#202950] underline underline-offset-2"
                      >
                        Historias
                      </Link>{' '}
                      y los casos de prueba asociados; luego vuelva aquí.
                    </>
                  ) : (
                    'Genere primero los escenarios BDD en «Análisis Funcional».'
                  )}
                </p>
              </div>
            )}
            <button
              type="button"
              disabled={
                generating ||
                !hasSelectedFrameworks ||
                !gherkinOutput ||
                (scriptSource === 'automation' && visibleFrameworkCategories.length === 0)
              }
              onClick={handleGenerate}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: generating ? '#9ca3af' : '#58B888',
                color: '#fff',
              }}
            >
            {generating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generando scripts…
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generar scripts
              </>
            )}
            </button>
          </div>
        </div>
      </div>

      {/* Output */}
      <div
        className="rounded-lg bg-white w-full"
        style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <div className="px-4 py-3 space-y-0.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <span className="text-sm font-medium text-foreground">Scripts generados</span>
          <p className="text-xs text-muted-foreground leading-snug">
            Solo se listan archivos generados; las carpetas del arquetipo sin archivos nuevos no se muestran.
          </p>
        </div>
        <div className="p-4">
          {generating && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 size={32} className="animate-spin mb-4" style={{ color: '#58B888' }} />
              <p className="text-sm font-medium text-foreground">Generando scripts…</p>
              <p className="text-xs text-muted-foreground mt-1">
                Creando archivos de prueba a partir del Gherkin
              </p>
              {batchStatus && (
                <p className="text-xs text-[#202950] mt-3 max-w-md mx-auto leading-relaxed">{batchStatus}</p>
              )}
            </div>
          )}

          {!generating && !generatedScripts && !error && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ backgroundColor: '#f0f2f5', border: '1px solid rgba(0,0,0,0.06)' }}
              >
                <FolderOpen size={24} className="text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No hay scripts generados</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Configure los frameworks y pulse «Generar scripts» para crear los archivos de prueba.
              </p>
            </div>
          )}

          {!generating && error && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{
                  backgroundColor: error.isOffline ? '#fffbeb' : '#fff1f2',
                  border: `1px solid ${error.isOffline ? '#fde68a' : '#fecdd3'}`,
                }}
              >
                {error.isOffline
                  ? <WifiOff size={24} style={{ color: '#f59e0b' }} />
                  : <AlertTriangle size={24} style={{ color: '#f43f5e' }} />}
              </div>
              <p className="text-sm font-medium text-foreground">
                {error.isOffline ? 'Servicio n8n no disponible' : 'Error al generar scripts'}
              </p>
              <p className="text-xs text-muted-foreground mt-2 max-w-md">{error.message}</p>
            </div>
          )}

          {!generating && generatedScripts && generatedScripts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-muted-foreground">No se generaron archivos. Seleccione al menos un framework.</p>
            </div>
          )}

          {!generating && byFramework.length > 0 && (
            <div className="space-y-6">
              {byFramework.map(({ framework, tree, files }) => {
                const archetypeFileMap = getArchetypeFileMapForFramework(framework);
                const canMergeZip = !!archetypeFileMap && files.length > 0;
                return (
                  <div key={framework}>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <h3 className="text-sm font-semibold text-foreground">{framework}</h3>
                      <div className="flex flex-wrap items-center gap-2">
                        {canMergeZip ? (
                          <button
                            type="button"
                            disabled={zipDownloading}
                            onClick={() => void handleDownloadMergedZip(framework)}
                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                              color: '#fff',
                              backgroundColor: zipDownloading ? '#9ca3af' : '#58B888',
                              border: '1px solid rgba(0,0,0,0.06)',
                            }}
                          >
                            {zipDownloading ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Download size={12} />
                            )}
                            ZIP arquetipo + scripts
                          </button>
                        ) : files.length > 0 ? (
                          <button
                            type="button"
                            disabled={zipDownloading}
                            onClick={() => void handleDownloadScriptsOnlyZip(tree, framework)}
                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                              color: '#fff',
                              backgroundColor: zipDownloading ? '#9ca3af' : '#58B888',
                              border: '1px solid rgba(0,0,0,0.06)',
                            }}
                          >
                            {zipDownloading ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Download size={12} />
                            )}
                            ZIP con rutas (sin arquetipo)
                          </button>
                        ) : null}
                      </div>
                    </div>
                    {!archetypeFileMap && files.length > 0 && (
                      <p className="text-xs text-muted-foreground mb-2">
                        No hay arquetipo ZIP para este framework: el ZIP incluye solo los scripts con la estructura de
                        rutas mostrada.
                      </p>
                    )}
                    <ScriptTreeView framework={framework} node={tree} />
                  </div>
                );
              })}
            </div>
          )}
          {!generating && zipDownloadError && byFramework.length > 0 && (
            <p className="text-xs text-rose-500 mt-2">{zipDownloadError}</p>
          )}
        </div>
      </div>
      </>
    )}
  </div>
  );
}

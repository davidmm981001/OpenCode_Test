import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { Globe, Loader2, Sparkles, Upload } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { extractDocText } from '../lib/extractDocText';
import { fetchOpenApiResource } from '../lib/openApiResource';
import { readProjectZipsToCodeContext } from '../lib/projectZipCodeContext';
import { readCodeFiles } from '../lib/readCodeFiles';
import { saveFiles, loadFiles, clearFiles, type FileCategory } from '../lib/filePersistence';
import type { ApiResource, CodeContextItem } from '../types/generation';
import { generateUserStories } from '../services/userStoryGenerationService';

function UploadCard({
  title,
  subtitle,
  accept,
  files,
  onAddFiles,
  onRemoveFile,
  onClearFiles,
}: {
  title: string;
  subtitle: string;
  accept: string;
  files: File[];
  onAddFiles: (files: FileList | null) => void;
  onRemoveFile: (index: number) => void;
  onClearFiles: () => void;
}) {
  const inputId = `upload-${title.replace(/\s+/g, '-').toLowerCase()}`;
  const totalSizeMb = (files.reduce((sum, file) => sum + file.size, 0) / (1024 * 1024)).toFixed(2);
  return (
    <div
      className="bg-white rounded-lg p-5"
      style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      <div className="mb-3">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
      </div>
      <label
        htmlFor={inputId}
        className="block rounded-lg p-5 cursor-pointer transition-colors"
        style={{ border: '1.5px dashed rgba(0,0,0,0.15)', backgroundColor: '#fafbfc' }}
      >
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#f0f2f5]">
            <Upload size={18} className="text-muted-foreground" />
          </div>
          <div className="text-sm text-foreground">Arrastrar archivo o hacer clic</div>
          <div className="text-xs text-muted-foreground">{accept.replaceAll(',', ' · ')}</div>
        </div>
      </label>
      <input
        id={inputId}
        className="hidden"
        type="file"
        accept={accept}
        multiple
        onChange={(e) => onAddFiles(e.target.files)}
      />
      {files.length > 0 && (
        <div className="mt-3 rounded-md border border-[rgba(0,0,0,0.08)] overflow-hidden">
          <div className="px-3 py-2 bg-[#f8f9fb] border-b border-[rgba(0,0,0,0.06)] flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {files.length} archivo(s) · {totalSizeMb} MB
            </span>
            <button
              type="button"
              onClick={onClearFiles}
              className="text-xs text-rose-600 hover:underline"
            >
              Limpiar todo
            </button>
          </div>
          <div className="max-h-[164px] overflow-auto">
            {files.map((file, index) => {
              const ext = file.name.includes('.') ? file.name.split('.').pop()?.toUpperCase() : 'FILE';
              const sizeKb = Math.max(1, Math.round(file.size / 1024));
              return (
                <div
                  key={`${file.name}-${index}`}
                  className="px-3 py-2 border-b border-[rgba(0,0,0,0.06)] last:border-b-0 flex items-center gap-2"
                >
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: '#e8eaf2', color: '#202950' }}
                  >
                    {ext}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-foreground truncate">{file.name}</div>
                    <div className="text-[11px] text-muted-foreground">{sizeKb} KB</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveFile(index)}
                    className="text-xs text-rose-600 hover:underline"
                  >
                    Quitar
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjectDocumentationTabPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const {
    projects,
    userStories,
    addUserStories,
    deleteUserStoriesByProject,
    saveDocumentationRun,
    updateProject,
  } = useApp();
  const project = projects.find((p) => p.id === projectId);

  const [reqDocs, setReqDocs] = useState<File[]>([]);
  const [storyDocs, setStoryDocs] = useState<File[]>([]);
  const [codeDocs, setCodeDocs] = useState<File[]>([]);
  const [projectZips, setProjectZips] = useState<File[]>([]);
  const [filesRestored, setFilesRestored] = useState(false);
  const [apiResources, setApiResources] = useState<ApiResource[]>(
    () => project?.apiResources ?? [{ id: crypto.randomUUID(), name: 'API principal', baseUrl: '', swaggerUrl: '' }],
  );
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!project) {
    return <Navigate to="/projects" replace />;
  }

  const existingStoriesCount = userStories.filter((s) => s.projectId === project.id).length;

  useEffect(() => {
    let cancelled = false;
    async function restore() {
      const [req, story, code, zips] = await Promise.all([
        loadFiles(project.id, 'reqDocs'),
        loadFiles(project.id, 'storyDocs'),
        loadFiles(project.id, 'codeDocs'),
        loadFiles(project.id, 'projectZips'),
      ]);
      if (!cancelled) {
        setReqDocs(req);
        setStoryDocs(story);
        setCodeDocs(code);
        setProjectZips(zips);
        setFilesRestored(true);
      }
    }
    void restore();
    return () => { cancelled = true; };
  }, [project.id]);

  useEffect(() => {
    if (!filesRestored) return;
    void saveFiles(project.id, 'reqDocs', reqDocs);
  }, [reqDocs, project.id, filesRestored]);

  useEffect(() => {
    if (!filesRestored) return;
    void saveFiles(project.id, 'storyDocs', storyDocs);
  }, [storyDocs, project.id, filesRestored]);

  useEffect(() => {
    if (!filesRestored) return;
    void saveFiles(project.id, 'codeDocs', codeDocs);
  }, [codeDocs, project.id, filesRestored]);

  useEffect(() => {
    if (!filesRestored) return;
    void saveFiles(project.id, 'projectZips', projectZips);
  }, [projectZips, project.id, filesRestored]);

  const addFileNames =
    (fileSetter: React.Dispatch<React.SetStateAction<File[]>>) =>
    (files: FileList | null) => {
      if (!files) return;
      const arr = Array.from(files);
      fileSetter((prev) => [...prev, ...arr]);
    };

  const buildApiResourceContext = (resources: ApiResource[]) => {
    if (!resources.length) return '';
    const blocks = resources.map((r, idx) =>
      [
        `#### API ${idx + 1}: ${r.name}`,
        r.baseUrl ? `Base URL: ${r.baseUrl}` : '',
        r.swaggerUrl ? `Swagger/OpenAPI: ${r.swaggerUrl}` : '',
        r.openApiSummary ? `\n${r.openApiSummary}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
    );
    return [
      '### Recurso API',
      ...blocks,
      'Usar este recurso como referencia de endpoints, paths y contratos.',
    ]
      .filter(Boolean)
      .join('\n');
  };

  const saveApiResourceOnProject = () => {
    const cleaned = apiResources
      .map((r, idx) => {
        const name = r.name.trim() || `API ${idx + 1}`;
        const baseUrl = r.baseUrl?.trim() ?? '';
        const swaggerUrl = r.swaggerUrl?.trim() ?? '';
        if (!baseUrl && !swaggerUrl) return null;
        return { id: r.id, name, ...(baseUrl ? { baseUrl } : {}), ...(swaggerUrl ? { swaggerUrl } : {}) };
      })
      .filter((r): r is ApiResource => !!r);
    updateProject(project.id, {
      apiResources: cleaned.length ? cleaned : undefined,
    });
  };

  const handleGenerate = async () => {
    if (existingStoriesCount > 0) {
      const replaceExisting = window.confirm(
        `Este proyecto ya tiene ${existingStoriesCount} historia(s) generada(s).\n\n` +
          'Aceptar: reemplazar historias actuales por la nueva generación.\n' +
          'Cancelar: conservar historias actuales y agregar las nuevas.',
      );
      if (replaceExisting) {
        deleteUserStoriesByProject(project.id);
      }
    }

    setError(null);
    setGenerating(true);
    try {
      const reqTexts = (
        await Promise.all(
          reqDocs.map(async (f) => {
            try {
              const text = (await extractDocText(f)).trim();
              return text ? `### Documento RF: ${f.name}\n${text}` : '';
            } catch {
              return '';
            }
          }),
        )
      ).filter(Boolean);

      const storyTexts = (
        await Promise.all(
          storyDocs.map(async (f) => {
            try {
              const text = (await extractDocText(f)).trim();
              return text ? `### Historias base: ${f.name}\n${text}` : '';
            } catch {
              return '';
            }
          }),
        )
      ).filter(Boolean);

      const uploadedCode = await readCodeFiles(codeDocs).catch(() => []);
      const uploadedProjectCode = await readProjectZipsToCodeContext(projectZips).catch(() => []);
      const codeContext: CodeContextItem[] = [...uploadedCode, ...uploadedProjectCode];

      const normalizedResources = apiResources
        .map((r, idx) => ({
          id: r.id,
          name: r.name.trim() || `API ${idx + 1}`,
          baseUrl: r.baseUrl?.trim() ?? '',
          swaggerUrl: r.swaggerUrl?.trim() ?? '',
        }))
        .filter((r) => r.baseUrl || r.swaggerUrl);

      const parsedResources: ApiResource[] = [];
      for (const r of normalizedResources) {
        if (!r.swaggerUrl) {
          parsedResources.push(r);
          continue;
        }
        try {
          const openApi = await fetchOpenApiResource(r.swaggerUrl);
          parsedResources.push({
            ...r,
            openApiSummary: openApi.summaryText,
            openApiEndpoints: openApi.endpoints.slice(0, 200),
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          throw new Error(`No se pudo leer Swagger/OpenAPI para "${r.name}": ${msg}`);
        }
      }

      const apiResourceContext = buildApiResourceContext(parsedResources);

      /** Orients the LLM to infer domain from the doc (any sector), not a fixed industry. */
      const DOC_CONTEXT_PREFIX =
        '[CONTEXTO: texto extraído del documento de requerimientos cargado por el usuario. Infiere sector, actores y reglas solo a partir de este contenido. Genera historias ancladas al texto; evita plantillas genéricas.]\n\n';

      const documentationText = (reqTexts.length > 0 ? `${DOC_CONTEXT_PREFIX}${reqTexts.join('\n\n')}` : '')
        .trim();
      const baseStoriesText = storyTexts.join('\n\n').trim();
      const enrichedDocumentationText = [documentationText, apiResourceContext].filter(Boolean).join('\n\n').trim();
      if (!enrichedDocumentationText && !baseStoriesText && codeContext.length === 0) {
        throw new Error(
          'Debe cargar al menos un documento de requerimientos, historias base, código o configurar un recurso API.',
        );
      }

      const requestId = crypto.randomUUID();
      const response = await generateUserStories({
        contractVersion: 'v1',
        requestId,
        projectId: project.id,
        projectName: project.name,
        documentationText: enrichedDocumentationText,
        baseStoriesText,
        codeContext,
        ...(parsedResources.length
          ? {
              apiResources: parsedResources,
            }
          : {}),
      });

      saveDocumentationRun({
        projectId: project.id,
        documentationFiles: reqDocs.map((f) => f.name),
        userStoryFiles: storyDocs.map((f) => f.name),
        codeContextFiles: [...codeDocs.map((f) => f.name), ...projectZips.map((f) => f.name)],
        extractedContext: [enrichedDocumentationText, baseStoriesText].filter(Boolean).join('\n\n'),
      });

      addUserStories(
        project.id,
        response.stories.map((story) => ({
          title: story.title,
          description: story.description,
          module: story.module,
          criteria: story.criteria,
          status: story.status,
          ...(story.detail ? { detail: story.detail } : {}),
        })),
        response.runId,
      );

      navigate(`/projects/${project.id}/stories`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo generar historias de usuario.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-6 space-y-4 relative">
      {generating && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <Loader2 size={40} className="animate-spin mb-4" style={{ color: '#58B888' }} />
          <p className="text-sm font-medium text-foreground">Generando historias de usuario...</p>
          <p className="text-xs text-muted-foreground mt-1">Esto puede tomar unos segundos</p>
        </div>
      )}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <UploadCard
          title="Requerimientos Funcionales"
          subtitle="Documento de especificación"
          accept=".pdf,.docx,.txt"
          files={reqDocs}
          onAddFiles={addFileNames(setReqDocs)}
          onRemoveFile={(index) => setReqDocs((prev) => prev.filter((_, i) => i !== index))}
          onClearFiles={() => setReqDocs([])}
        />
        <UploadCard
          title="Historias de Usuario (Base)"
          subtitle="Historias raw o export de Jira"
          accept=".pdf,.docx,.txt,.csv,.json"
          files={storyDocs}
          onAddFiles={addFileNames(setStoryDocs)}
          onRemoveFile={(index) => setStoryDocs((prev) => prev.filter((_, i) => i !== index))}
          onClearFiles={() => setStoryDocs([])}
        />
        <UploadCard
          title="Código Fuente"
          subtitle="COBOL, C#, Java, TS, JS u otros archivos de código"
          accept=".cbl,.bms,.cob,.cs,.java,.ts,.tsx,.js,.jsx,.py,.go,.rb,.sql,.esql,.xml,.json,.txt,.md"
          files={codeDocs}
          onAddFiles={addFileNames(setCodeDocs)}
          onRemoveFile={(index) => setCodeDocs((prev) => prev.filter((_, i) => i !== index))}
          onClearFiles={() => setCodeDocs([])}
        />
        <UploadCard
          title="Proyecto Completo (ZIP)"
          subtitle="Suba un ZIP del repositorio para extraer código automáticamente"
          accept=".zip"
          files={projectZips}
          onAddFiles={addFileNames(setProjectZips)}
          onRemoveFile={(index) => setProjectZips((prev) => prev.filter((_, i) => i !== index))}
          onClearFiles={() => setProjectZips([])}
        />
      </div>

      <div
        className="bg-white rounded-lg p-5 space-y-4"
        style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-md flex items-center justify-center bg-[#e8eaf2]">
            <Globe size={16} className="text-[#202950]" />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">Recurso API</div>
            <p className="text-xs text-muted-foreground mt-1">
              Configure una o más APIs (URL base y/o Swagger/OpenAPI) para que la IA las use como recursos técnicos.
            </p>
          </div>
        </div>
        <div className="space-y-3">
          {apiResources.map((r, idx) => (
            <div key={r.id} className="rounded-lg border border-[rgba(0,0,0,0.08)] p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Input
                  placeholder={`Nombre API ${idx + 1}`}
                  value={r.name}
                  onChange={(e) =>
                    setApiResources((prev) =>
                      prev.map((x) => (x.id === r.id ? { ...x, name: e.target.value } : x)),
                    )
                  }
                  className="bg-white h-8"
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="text-rose-600 hover:text-rose-700"
                  onClick={() => setApiResources((prev) => prev.filter((x) => x.id !== r.id))}
                  disabled={apiResources.length === 1}
                >
                  Eliminar
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-foreground">URL Base API</Label>
                  <Input
                    type="url"
                    placeholder="https://api.example.com/v1"
                    value={r.baseUrl ?? ''}
                    onChange={(e) =>
                      setApiResources((prev) =>
                        prev.map((x) => (x.id === r.id ? { ...x, baseUrl: e.target.value } : x)),
                      )
                    }
                    className="bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-foreground">Swagger / OpenAPI URL</Label>
                  <Input
                    type="url"
                    placeholder="https://api.example.com/swagger.json"
                    value={r.swaggerUrl ?? ''}
                    onChange={(e) =>
                      setApiResources((prev) =>
                        prev.map((x) => (x.id === r.id ? { ...x, swaggerUrl: e.target.value } : x)),
                      )
                    }
                    className="bg-white"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            className="text-[#202950]"
            onClick={() =>
              setApiResources((prev) => [
                ...prev,
                { id: crypto.randomUUID(), name: `API ${prev.length + 1}`, baseUrl: '', swaggerUrl: '' },
              ])
            }
          >
            + Agregar API
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-[#202950]/25 text-[#202950] hover:bg-[#e8eaf2]"
            onClick={saveApiResourceOnProject}
          >
            Guardar recurso API
          </Button>
        </div>
      </div>

      <div
        className="rounded-lg p-5"
        style={{
          border: '1px solid rgba(88,184,136,0.4)',
          background: 'linear-gradient(135deg, rgba(88,184,136,0.09), rgba(32,41,80,0.04))',
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-md flex items-center justify-center bg-[#e8faf0]">
            <Sparkles size={16} style={{ color: '#58B888' }} />
          </div>
          <div className="text-sm font-semibold text-foreground">Generación de Historias con IA</div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
          Con la documentación cargada (RF, código COBOL/ESQL e historias base), la IA analizará el
          contexto para generar historias de usuario con criterios de aceptación detallados.
        </p>
        <Button
          onClick={() => void handleGenerate()}
          disabled={generating}
          className={existingStoriesCount > 0 ? 'bg-[#202950] hover:bg-[#2a3560] text-white' : ''}
        >
          {generating
            ? 'Preparando contexto...'
            : existingStoriesCount > 0
              ? 'Generar Historias de Usuario nuevamente'
              : 'Generar Historias de Usuario'}
        </Button>
        {error && <div className="mt-3 text-xs text-rose-600">{error}</div>}
      </div>
    </div>
  );
}

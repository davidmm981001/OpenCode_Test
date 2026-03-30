import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router';
import { RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { buildSddUserStoriesBlob } from '../lib/sddUserStoriesBlob';
import { isSddApiConfigured, sddPatchProject } from '../services/sddOrchestratorService';

function getSddEmbedBase(): string {
  return import.meta.env.VITE_SDD_ORCHESTRATOR_URL?.replace(/\/$/, '') ?? '';
}

export default function ProjectSddTabPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, userStories } = useApp();
  const project = projects.find((p) => p.id === projectId);

  const [syncNonce, setSyncNonce] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const storiesForProject = useMemo(
    () => userStories.filter((s) => s.projectId === projectId),
    [userStories, projectId],
  );

  const storiesBlob = useMemo(() => buildSddUserStoriesBlob(storiesForProject), [storiesForProject]);

  const embedBase = getSddEmbedBase();
  const apiOk = isSddApiConfigured();

  const syncToSdd = useCallback(async () => {
    if (!project?.sddProjectId || !apiOk) return;
    setSyncing(true);
    setSyncError(null);
    try {
      await sddPatchProject(project.sddProjectId, { userStories: storiesBlob });
      setSyncNonce((n) => n + 1);
    } catch (e) {
      setSyncError(e instanceof Error ? e.message : 'Error al sincronizar historias con el servicio de generación.');
    } finally {
      setSyncing(false);
    }
  }, [project?.sddProjectId, storiesBlob, apiOk]);

  useEffect(() => {
    if (!project?.sddProjectId || !apiOk || !embedBase) return;
    void syncToSdd();
    // Sync when the tab is opened or the orchestrator project id is linked, not on every story edit (use the button).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id, project?.sddProjectId, apiOk, embedBase]);

  if (!project) {
    return <Navigate to="/projects" replace />;
  }

  if (!embedBase) {
    return (
      <div className="p-6 max-w-xl mx-auto space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Generación de aplicación</h2>
        <p className="text-sm text-muted-foreground">
          Configure <code className="text-xs bg-muted px-1 rounded">VITE_SDD_ORCHESTRATOR_URL</code> en{' '}
          <code className="text-xs bg-muted px-1 rounded">.env</code> (URL del frontend incrustado de generación, p. ej.{' '}
          <code className="text-xs">http://localhost:3002</code>).
        </p>
      </div>
    );
  }

  if (!apiOk) {
    return (
      <div className="p-6 max-w-xl mx-auto space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Generación de aplicación</h2>
        <p className="text-sm text-muted-foreground">
          Para sincronizar historias con el servicio de generación, configure{' '}
          <code className="text-xs bg-muted px-1 rounded">VITE_SDD_ORCHESTRATOR_API_URL</code> (API del orquestador, p. ej.{' '}
          <code className="text-xs">http://localhost:8003</code>) y permita CORS desde este origen en ese backend.
        </p>
      </div>
    );
  }

  if (!project.sddProjectId) {
    return <Navigate to={`/projects/${projectId}/stories`} replace />;
  }

  const iframeSrc = `${embedBase}/?embed=1&sddProjectId=${encodeURIComponent(project.sddProjectId)}&v=${syncNonce}`;

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#f5f6fa]">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-border bg-white">
        <p className="text-sm text-muted-foreground">
          Historias de este proyecto ({storiesForProject.length}) sincronizadas con el servicio de generación antes de ejecutar.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => void syncToSdd()} disabled={syncing}>
            <RefreshCw className={`size-4 mr-1.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sincronizando…' : 'Sincronizar historias'}
          </Button>
        </div>
      </div>
      {syncError && (
        <div className="shrink-0 mx-4 mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {syncError}
        </div>
      )}
      <div className="flex-1 min-h-[min(720px,calc(100vh-200px))] p-2 sm:p-4">
        <iframe title="Generación de aplicación" src={iframeSrc} className="w-full h-full min-h-[560px] rounded-lg border border-border bg-white shadow-sm" />
      </div>
    </div>
  );
}

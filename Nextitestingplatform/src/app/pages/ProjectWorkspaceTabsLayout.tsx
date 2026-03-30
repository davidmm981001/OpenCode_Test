import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Link, Navigate, Outlet, useLocation, useNavigate, useParams } from 'react-router';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { useApp } from '../context/AppContext';
import { ProjectStatus } from '../data/mockData';

const STATUS_STYLES: Record<ProjectStatus, { bg: string; text: string; dot: string }> = {
  'Activo': { bg: '#ecfdf5', text: '#065f46', dot: '#10b981' },
  'Planificación': { bg: '#eff6ff', text: '#1d4ed8', dot: '#3b82f6' },
  'Completado': { bg: '#f3f4f6', text: '#374151', dot: '#9ca3af' },
  'En Espera': { bg: '#fffbeb', text: '#92400e', dot: '#f59e0b' },
  'En Riesgo': { bg: '#fff1f2', text: '#9f1239', dot: '#f43f5e' },
};

function OwnerInitials({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const colors = ['#202950', '#8b5cf6', '#58B888', '#f59e0b', '#f43f5e', '#06b6d4'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center text-white"
      style={{ backgroundColor: color, fontSize: '10px', fontWeight: 600 }}
    >
      {initials}
    </div>
  );
}

type ProjectTabId = 'overview' | 'documentation' | 'stories' | 'sdd';

/** Segmented control: inactive on gray track, active as white pill (reads clearly on white headers). */
const projectTabListClass =
  'w-full max-w-none rounded-lg border-0 bg-[#eceef2] p-1 gap-0.5 shadow-none h-auto min-h-10 justify-start overflow-x-auto overflow-y-hidden';

const projectTabTriggerClass =
  'rounded-md h-9 shrink-0 flex-none basis-auto px-3 sm:px-4 text-sm font-medium border-0 shadow-none transition-all ' +
  'text-muted-foreground hover:text-foreground ' +
  'data-[state=active]:bg-white data-[state=active]:text-[#202950] data-[state=active]:shadow-sm ' +
  'data-[state=active]:ring-1 data-[state=active]:ring-black/[0.06]';

export default function ProjectWorkspaceTabsLayout() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { projects, userStories } = useApp();

  const project = projects.find((p) => p.id === projectId);

  const activeTab: ProjectTabId = useMemo(() => {
    const path = location.pathname;
    if (path.includes('/documentation')) return 'documentation';
    if (path.includes('/stories')) return 'stories';
    if (path.includes('/sdd')) return 'sdd';
    return 'overview';
  }, [location.pathname]);

  const storiesCount = useMemo(
    () => userStories.filter((story) => story.projectId === projectId).length,
    [userStories, projectId],
  );
  const tabToPath: Record<ProjectTabId, string> = {
    overview: `/projects/${projectId}`,
    documentation: `/projects/${projectId}/documentation`,
    stories: `/projects/${projectId}/stories`,
    sdd: `/projects/${projectId}/sdd`,
  };

  if (!project) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center h-full py-32 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-foreground">Proyecto no encontrado</h2>
        <p className="text-sm text-muted-foreground">El proyecto que busca no existe.</p>
        <Button variant="outline" onClick={() => navigate('/projects')}>
          <ArrowLeft size={14} className="mr-2" /> Volver a Proyectos
        </Button>
      </motion.div>
    );
  }

  const path = location.pathname;
  if (
    path.includes('/testcases') ||
    path.includes('/automation') ||
    path.includes('/jira')
  ) {
    return <Navigate to={`/projects/${projectId}`} replace />;
  }
  if (path.includes('/sdd') && !project.sddProjectId) {
    return <Navigate to={`/projects/${projectId}/stories`} replace />;
  }

  const s = STATUS_STYLES[project.status];

  return (
    <div className="flex flex-col h-full">
      <motion.div
        className="bg-white px-6 pt-5 pb-4"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
          <Link to="/projects" className="hover:text-foreground transition-colors">
            Proyectos
          </Link>
          <ChevronRight size={12} />
          <span className="text-foreground">{project.name}</span>
        </div>

        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate('/projects')}
              className="mt-1 p-1.5 rounded-md transition-colors text-muted-foreground hover:text-foreground"
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#f0f0f4';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              }}
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-foreground">{project.name}</h1>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: s.bg, color: s.text }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
                  {project.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <OwnerInitials name={project.owner} />
                <span>{project.owner}</span>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(next) => navigate(tabToPath[next as ProjectTabId])}>
          <TabsList className={projectTabListClass}>
            <TabsTrigger value="overview" className={projectTabTriggerClass}>
              Resumen
            </TabsTrigger>
            <TabsTrigger value="documentation" className={projectTabTriggerClass}>
              Documentación
            </TabsTrigger>
            <TabsTrigger value="stories" className={projectTabTriggerClass}>
              Historias ({storiesCount})
            </TabsTrigger>
            <TabsTrigger
              value="sdd"
              className={projectTabTriggerClass}
              disabled={!project.sddProjectId}
              title={
                project.sddProjectId
                  ? undefined
                  : 'Prepare la generación de la aplicación desde la pestaña Historias.'
              }
            >
              Generación de aplicación
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      <div className="flex-1 min-h-0 overflow-auto" style={{ backgroundColor: '#f5f6fa' }}>
        <Outlet />
      </div>
    </div>
  );
}

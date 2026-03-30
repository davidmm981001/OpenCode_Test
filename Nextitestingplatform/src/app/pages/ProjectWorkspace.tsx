import { motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import {
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useApp } from '../context/AppContext';
import { ProjectStatus } from '../data/mockData';
import type { ZipFileMap } from '../lib/zipArchetype';
import { RequirementsListView } from './workspace/RequirementsListView';
import { RequirementDetailView } from './workspace/RequirementDetailView';

const EMPTY_ARCHETYPE_MAPS: Record<string, ZipFileMap | null> = {};

const STATUS_STYLES: Record<ProjectStatus, { bg: string; text: string; dot: string }> = {
  'Activo':        { bg: '#ecfdf5', text: '#065f46', dot: '#10b981' },
  'Planificación': { bg: '#eff6ff', text: '#1d4ed8', dot: '#3b82f6' },
  'Completado':    { bg: '#f3f4f6', text: '#374151', dot: '#9ca3af' },
  'En Espera':     { bg: '#fffbeb', text: '#92400e', dot: '#f59e0b' },
  'En Riesgo':     { bg: '#fff1f2', text: '#9f1239', dot: '#f43f5e' },
};

function OwnerInitials({ name }: { name: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
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

export default function ProjectWorkspace() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, requirements, projectArchetypes } = useApp();
  const [selectedRequirementId, setSelectedRequirementId] = useState<string | null>(null);
  const [didAutoSelectRequirement, setDidAutoSelectRequirement] = useState(false);

  // Reset selection when switching projects
  useEffect(() => {
    setSelectedRequirementId(null);
    setDidAutoSelectRequirement(false);
  }, [projectId]);

  const project = projects.find(p => p.id === projectId);
  const selectedRequirement = requirements.find(r => r.id === selectedRequirementId) ?? null;

  // If user opens a project with existing requirements, select the first one.
  useEffect(() => {
    if (!project) return;
    if (selectedRequirementId) return;
    if (didAutoSelectRequirement) return;
    const first = requirements.find(r => r.projectId === project.id);
    if (first) {
      setSelectedRequirementId(first.id);
      setDidAutoSelectRequirement(true);
    }
  }, [project, requirements, selectedRequirementId, didAutoSelectRequirement]);

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

  const s = STATUS_STYLES[project.status];

  return (
    <div className="flex flex-col h-full">
      {/* === PROJECT HEADER === */}
      <motion.div
        className="bg-white px-6 pt-5 pb-0"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
          <Link to="/projects" className="hover:text-foreground transition-colors">Proyectos</Link>
          <ChevronRight size={12} />
          <span className="text-foreground">{project.name}</span>
        </div>

        {/* Title row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate('/projects')}
              className="mt-1 p-1.5 rounded-md transition-colors text-muted-foreground hover:text-foreground"
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f0f0f4'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
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
                {/* {project.components} componentes — desactivado: dato mock */}
                {/* {project.progress}% completado — desactivado: dato mock */}
              </div>
            </div>
          </div>
        </div>

      </motion.div>

      <div className="flex-1 min-h-0 overflow-hidden" style={{ backgroundColor: '#f5f6fa' }}>
        {selectedRequirement ? (
          <RequirementDetailView
            project={project}
            requirement={selectedRequirement}
            onBackToList={() => setSelectedRequirementId(null)}
            archetypeFileMapByFramework={projectArchetypes[project.id] ?? EMPTY_ARCHETYPE_MAPS}
          />
        ) : (
          <RequirementsListView
            project={project}
            selectedRequirementId={selectedRequirementId}
            onSelectRequirement={(id) => setSelectedRequirementId(id)}
          />
        )}
      </div>
    </div>
  );
}
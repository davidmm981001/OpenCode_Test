import React from 'react';
import { useNavigate } from 'react-router';
import { FolderOpen, TrendingUp, ArrowRight, Activity, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { ProjectStatus } from '../data/mockData';
import { Button } from '../components/ui/button';
import { staggerContainer, staggerItem, fadeUp } from '../components/motion/variants';

const STATUS_STYLES: Record<ProjectStatus, { bg: string; text: string; dot: string }> = {
  'Activo':        { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'Planificación': { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-500' },
  'Completado':    { bg: 'bg-gray-100',   text: 'text-gray-600',    dot: 'bg-gray-400' },
  'En Espera':     { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500' },
  'En Riesgo':     { bg: 'bg-rose-50',    text: 'text-rose-700',    dot: 'bg-rose-500' },
};

function StatusBadge({ status }: { status: ProjectStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { projects } = useApp();

  const activeProjects = projects.filter(p => p.status === 'Activo').length;
  const completedProjects = projects.filter(p => p.status === 'Completado').length;
  const recentProjects = projects.slice(0, 5);

  const stats = [
    { label: 'Total de Proyectos', value: projects.length, icon: FolderOpen, color: '#202950', bg: '#e8eaf2', sub: `${activeProjects} activo${activeProjects !== 1 ? 's' : ''}` },
    { label: 'Completados', value: completedProjects, icon: CheckCircle2, color: '#10b981', bg: '#ecfdf5', sub: 'Proyectos finalizados' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Page header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <h1 className="text-foreground">Panel</h1>
          <p className="text-sm text-muted-foreground mt-0.5 max-w-lg leading-relaxed">
            Vista general de sus proyectos de modernización y entrega.
          </p>
        </div>
        <Button onClick={() => navigate('/projects')} className="gap-2">
          <FolderOpen size={16} />
          Ver Todos los Proyectos
        </Button>
      </motion.div>

      {/* Stats cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              className="bg-white rounded-2xl p-5 sm:p-6"
              style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(32,41,80,0.05)' }}
              variants={staggerItem}
              whileHover={{ y: -2, boxShadow: '0 12px 32px rgba(32,41,80,0.08)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="flex size-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: stat.bg }}
                >
                  <Icon size={20} style={{ color: stat.color }} strokeWidth={2} />
                </div>
                <TrendingUp size={14} className="text-muted-foreground/60 mt-0.5" aria-hidden />
              </div>
              <div className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">{stat.value}</div>
              <div className="text-sm font-medium text-foreground mt-1">{stat.label}</div>
              <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{stat.sub}</div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Recent projects */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.div
          className="bg-white rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(32,41,80,0.05)' }}
          variants={fadeUp}
        >
          <div
            className="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5"
            style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-[#f0f2f7]">
                <Activity size={16} className="text-[#202950]" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">Proyectos recientes</h4>
                <p className="text-xs text-muted-foreground">Acceso rápido a los últimos abiertos</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/projects')}
              className="flex items-center gap-1 text-xs transition-colors"
              style={{ color: '#58B888' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.75'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
            >
              Ver todos <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-[rgba(0,0,0,0.04)]">
            {recentProjects.map((project, idx) => (
              <motion.div
                key={project.id}
                className="flex items-center gap-4 px-5 py-3.5 cursor-pointer"
                onClick={() => navigate(`/projects/${project.id}`)}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f8f9fb'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + idx * 0.05, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">{project.name}</span>
                    <StatusBadge status={project.status} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {project.owner}
                  </div>
                </div>
                {/* Barra de progreso del proyecto desactivada: era solo dato mock (0–100%), no refleja flujo real */}
                <ArrowRight size={14} className="text-muted-foreground flex-shrink-0" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

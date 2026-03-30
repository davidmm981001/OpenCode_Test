import React, { useMemo } from 'react';
import { Link } from 'react-router';
import {
  ArrowRight,
  Calendar,
  Flag,
  Hash,
  Layers,
  User,
} from 'lucide-react';
import { Project } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/button';
import { cn } from '../../components/ui/utils';

function DetailRow({
  icon: Icon,
  label,
  children,
  isFirst,
}: {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  label: string;
  children: React.ReactNode;
  isFirst?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex gap-3 py-3.5 sm:py-4',
        !isFirst && 'border-t border-[rgba(0,0,0,0.06)]',
      )}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#f0f2f7] text-[#202950]">
        <Icon className="size-4" size={16} strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="mt-0.5 text-sm font-medium text-foreground">{children}</div>
      </div>
    </div>
  );
}

export function OverviewTab({ project }: { project: Project }) {
  const { userStories } = useApp();
  const projectStories = useMemo(
    () => userStories.filter((story) => story.projectId === project.id),
    [userStories, project.id],
  );

  const storiesCount = projectStories.length;
  const storiesHref = `/projects/${project.id}/stories`;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-stretch">
          {/* User stories — primary metric */}
          <div className="lg:col-span-5">
            <div
              className={cn(
                'relative h-full overflow-hidden rounded-2xl border bg-white p-6 sm:p-7',
                'border-[rgba(88,184,136,0.28)] shadow-[0_1px_3px_rgba(32,41,80,0.06)]',
              )}
            >
              <div
                className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full opacity-[0.12]"
                style={{ background: 'radial-gradient(circle, #58B888 0%, transparent 70%)' }}
              />
              <div className="relative flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-[#202950] text-white shadow-sm">
                    <Layers className="size-5" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold tracking-tight text-foreground">Historias de usuario</h2>
                    <p className="text-xs text-muted-foreground">En este proyecto</p>
                  </div>
                </div>
                <div>
                  <p
                    className="text-5xl font-semibold tracking-tight tabular-nums sm:text-6xl"
                    style={{ color: '#202950', lineHeight: 1.05 }}
                  >
                    {storiesCount}
                  </p>
                  <p className="mt-2 max-w-[220px] text-sm leading-relaxed text-muted-foreground">
                    {storiesCount === 0
                      ? 'Cree historias desde Documentación o la pestaña Historias para preparar la generación de la aplicación.'
                      : 'Revise y guarde los cambios en Historias antes de sincronizar con la generación de aplicación.'}
                  </p>
                </div>
                <Button
                  asChild
                  className="w-full gap-2 bg-[#58B888] text-white hover:bg-[#4a9f76] sm:w-auto"
                >
                  <Link to={storiesHref}>
                    {storiesCount === 0 ? 'Ir a historias' : 'Ver historias'}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Project details */}
          <div className="lg:col-span-7">
            <div
              className="h-full rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white p-1 shadow-[0_1px_3px_rgba(32,41,80,0.04)]"
            >
              <div className="rounded-xl px-5 pb-2 pt-5 sm:px-6">
                <h2 className="text-sm font-semibold text-foreground">Detalles del proyecto</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Datos generales y fechas planificadas</p>
              </div>
              <div className="px-4 pb-4 sm:px-5">
                <DetailRow icon={Hash} label="Código" isFirst>
                  <span className="font-mono text-[13px] text-[#202950]">{project.id}</span>
                </DetailRow>
                <DetailRow icon={Layers} label="Nombre">
                  {project.name}
                </DetailRow>
                <DetailRow icon={User} label="Responsable">
                  {project.owner}
                </DetailRow>
                <DetailRow icon={Flag} label="Estado">
                  <span className="inline-flex items-center rounded-md border border-[rgba(0,0,0,0.08)] bg-[#f8f9fb] px-2 py-0.5 text-xs font-medium">
                    {project.status}
                  </span>
                </DetailRow>
                <DetailRow icon={Calendar} label="Inicio planificado">
                  {project.startDate || '—'}
                </DetailRow>
                <DetailRow icon={Calendar} label="Fin planificado">
                  {project.endDate || '—'}
                </DetailRow>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

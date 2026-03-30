import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Plus,
  Eye,
  Settings2,
  Search,
  FolderOpen,
  Filter,
  Upload,
  Trash2,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { useApp } from '../context/AppContext';
import { Project, ProjectStatus } from '../data/mockData';
import { CreateProjectSheet } from '../components/CreateProjectSheet';
import { staggerContainer, staggerItem, fadeUp } from '../components/motion/variants';
import { loadZipToFileMap, type ZipFileMap } from '../lib/zipArchetype';
import { getSupabaseClient } from '../lib/supabaseClient';
import {
  PROJECT_FRAMEWORK_CATEGORIES,
  slotIdFor,
  ALL_PROJECT_FRAMEWORK_SLOTS,
  defaultFrameworkByCategory,
  resolveFrameworkSelectionForProject,
  type FrameworkCategoryId,
} from '../lib/projectFrameworkArchetypeSelection';

const STATUS_STYLES: Record<ProjectStatus, { bg: string; text: string; dot: string }> = {
  'Activo':        { bg: '#ecfdf5', text: '#065f46', dot: '#10b981' },
  'Planificación': { bg: '#eff6ff', text: '#1d4ed8', dot: '#3b82f6' },
  'Completado':    { bg: '#f3f4f6', text: '#374151', dot: '#9ca3af' },
  'En Espera':     { bg: '#fffbeb', text: '#92400e', dot: '#f59e0b' },
  'En Riesgo':     { bg: '#fff1f2', text: '#9f1239', dot: '#f43f5e' },
};

function StatusBadge({ status }: { status: ProjectStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
      {status}
    </span>
  );
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-EC', { month: 'short', day: 'numeric', year: 'numeric' });
}

function OwnerAvatar({ name }: { name: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['#202950', '#8b5cf6', '#58B888', '#f59e0b', '#f43f5e', '#06b6d4'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-white flex-shrink-0"
        style={{ backgroundColor: color, fontSize: '10px', fontWeight: 600 }}
      >
        {initials}
      </div>
      <span className="text-sm text-foreground">{name}</span>
    </div>
  );
}

export default function ProjectsList() {
  const navigate = useNavigate();
  const {
    projects,
    projectArchetypes,
    setProjectArchetypeFileMap,
    getProjectFrameworkSelection,
    setProjectFrameworkSelection,
  } = useApp();
  const supabaseEnabled = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'Todos'>('Todos');
  const [sheetOpen, setSheetOpen] = useState(false);

  const [archetypesProjectId, setArchetypesProjectId] = useState<string | null>(null);
  const [archetypesOpen, setArchetypesOpen] = useState(false);

  const NA_OPTION = 'N/A' as const;
  type CategorySelection = string | typeof NA_OPTION;

  const selectionForArchetypesSheet = (projectId: string): Record<FrameworkCategoryId, CategorySelection> => {
    const maps = projectArchetypes[projectId] ?? {};
    const resolved = resolveFrameworkSelectionForProject(getProjectFrameworkSelection(projectId), maps);
    return {
      api: resolved.api == null ? NA_OPTION : resolved.api,
      web: resolved.web == null ? NA_OPTION : resolved.web,
      performance: resolved.performance == null ? NA_OPTION : resolved.performance,
    };
  };

  const persistArchetypesSheetSelection = (
    projectId: string,
    next: Record<FrameworkCategoryId, CategorySelection>,
  ) => {
    setProjectFrameworkSelection(projectId, {
      api: next.api === NA_OPTION ? null : next.api,
      web: next.web === NA_OPTION ? null : next.web,
      performance: next.performance === NA_OPTION ? null : next.performance,
    });
  };

  // We allow only 1 framework per category (API/Web/Performance),
  // even if the same framework appears in multiple categories (e.g. Playwright en API y Web).
  const [selectedFrameworkByCategory, setSelectedFrameworkByCategory] = useState<
    Record<FrameworkCategoryId, CategorySelection>
  >(defaultFrameworkByCategory());
  const [archetypeLoadingByFramework, setArchetypeLoadingByFramework] = useState<
    Record<string, boolean>
  >(() =>
    Object.fromEntries(ALL_PROJECT_FRAMEWORK_SLOTS.map(s => [s, false])) as Record<string, boolean>,
  );
  const [archetypeErrorByFramework, setArchetypeErrorByFramework] = useState<
    Record<string, string | null>
  >(() =>
    Object.fromEntries(ALL_PROJECT_FRAMEWORK_SLOTS.map(s => [s, null])) as Record<string, string | null>,
  );

  const [archetypeFileNameByFramework, setArchetypeFileNameByFramework] = useState<
    Record<string, string | null>
  >(() =>
    Object.fromEntries(ALL_PROJECT_FRAMEWORK_SLOTS.map(s => [s, null])) as Record<
      string,
      string | null
    >,
  );

  const activeProjectArchetypes = archetypesProjectId
    ? projectArchetypes[archetypesProjectId] ?? {}
    : {};

  const handleProjectArchetypeUpload = async (
    slotId: string,
    frameworkName: string,
    file: File | null,
  ) => {
    if (!file || !archetypesProjectId) return;

    setArchetypeErrorByFramework(prev => ({ ...prev, [slotId]: null }));
    setArchetypeLoadingByFramework(prev => ({ ...prev, [slotId]: true }));

    try {
      const map = await loadZipToFileMap(file);
      setProjectArchetypeFileMap(archetypesProjectId, slotId, map);
      setArchetypeFileNameByFramework(prev => ({ ...prev, [slotId]: file.name }));

      if (supabaseEnabled) {
        try {
          const supabase = getSupabaseClient();
          const { data } = await supabase.auth.getUser();
          const ownerUserId = data.user?.id;

          if (!ownerUserId) {
            throw new Error('No hay usuario autenticado para persistir el ZIP.');
          }

          const safeSlotId = slotId.replace(/[^a-zA-Z0-9._-]/g, '_');
          const storagePath = `${ownerUserId}/${archetypesProjectId}/${safeSlotId}/${Date.now()}_${file.name}`;

          const uploadRes = await supabase.storage
            .from('archetypes')
            .upload(storagePath, file, { contentType: 'application/zip', upsert: false });

          if (uploadRes.error) throw uploadRes.error;

          const insertRes = await supabase.from('archetype_zips').insert({
            owner_user_id: ownerUserId,
            project_id: archetypesProjectId,
            framework_slot: slotId,
            framework_name: frameworkName,
            storage_path: storagePath,
            file_name: file.name,
          });

          if (insertRes.error) throw insertRes.error;
        } catch (persistErr) {
          setArchetypeErrorByFramework(prev => ({
            ...prev,
            [slotId]: persistErr instanceof Error ? persistErr.message : 'No se pudo persistir el ZIP en Supabase.',
          }));
        }
      }
    } catch (e) {
      setArchetypeErrorByFramework(prev => ({
        ...prev,
        [slotId]: e instanceof Error ? e.message : 'No se pudo leer el ZIP.',
      }));
    } finally {
      setArchetypeLoadingByFramework(prev => ({ ...prev, [slotId]: false }));
    }
  };

  const handleClearArchetype = (slotId: string) => {
    if (!archetypesProjectId) return;
    setProjectArchetypeFileMap(archetypesProjectId, slotId, null);
    setArchetypeErrorByFramework(prev => ({ ...prev, [slotId]: null }));
    setArchetypeFileNameByFramework(prev => ({ ...prev, [slotId]: null }));
  };

  const archetypesStats = useMemo(() => {
    const selectedSlots = PROJECT_FRAMEWORK_CATEGORIES
      .map(cat => {
        const fw = selectedFrameworkByCategory[cat.id];
        return fw === NA_OPTION ? null : slotIdFor(cat.id, fw);
      })
      .filter((x): x is string => !!x);

    const loaded = selectedSlots.filter(slotId => !!(activeProjectArchetypes[slotId] ?? null)).length;
    const total = selectedSlots.length;
    const pending = total - loaded;
    return { loaded, pending, total };
  }, [activeProjectArchetypes, selectedFrameworkByCategory]);

  const getZipFolderStructurePreview = (
    fileMap: ZipFileMap,
    maxLines: number,
  ): { lines: string[]; truncated: boolean; totalDirs: number } => {
    const dirSet = new Set<string>();

    // ZipFileMap keys are already normalized with `/` separators.
    for (const path of fileMap.keys()) {
      const parts = path.split('/');
      if (parts.length <= 1) continue;
      // Add every directory along the path (exclude the file name itself).
      for (let i = 0; i < parts.length - 1; i++) {
        dirSet.add(parts.slice(0, i + 1).join('/'));
      }
    }

    const dirs = Array.from(dirSet);
    dirs.sort((a, b) => {
      const da = a.split('/').length;
      const db = b.split('/').length;
      return da - db || a.localeCompare(b);
    });

    const totalDirs = dirs.length;
    const shown = dirs.slice(0, maxLines);
    const truncated = totalDirs > maxLines;

    const lines = shown.map(d => {
      const parts = d.split('/');
      const depth = parts.length - 1;
      const name = parts[parts.length - 1];
      const indent = '  '.repeat(depth);
      return `${indent}${name}/`;
    });

    return { lines, truncated, totalDirs };
  };

  const filtered = projects.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.owner.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Todos' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 space-y-5 max-w-[1400px]">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <h1 className="text-foreground">Proyectos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {projects.length} proyecto{projects.length !== 1 ? 's' : ''} en su espacio de trabajo.
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Button onClick={() => setSheetOpen(true)} className="gap-2">
            <Plus size={16} />
            Nuevo Proyecto
          </Button>
        </motion.div>
      </motion.div>

      {/* Table card */}
      <motion.div
        className="bg-white rounded-lg"
        style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar proyectos o responsables..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-8 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as ProjectStatus | 'Todos')}
              className="h-8 text-sm rounded-md border px-2 bg-white focus:outline-none focus:ring-2 focus:ring-ring"
              style={{ borderColor: 'rgba(0,0,0,0.1)' }}
            >
              <option value="Todos">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Planificación">Planificación</option>
              <option value="En Espera">En Espera</option>
              <option value="En Riesgo">En Riesgo</option>
              <option value="Completado">Completado</option>
            </select>
          </div>
          <span className="text-xs text-muted-foreground ml-auto">
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                {['Nombre del Proyecto', 'Responsable', 'Fecha de Inicio', 'Fecha de Fin', 'Estado', 'Acciones'].map(col => (
                  <th
                    key={col}
                    className="px-5 py-3 text-left text-xs uppercase tracking-wider"
                    style={{ color: '#717182', fontWeight: 500 }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filtered.length === 0 ? (
                  <motion.tr
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={8} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <FolderOpen size={32} className="opacity-30" />
                        <p className="text-sm">No se encontraron proyectos.</p>
                      </div>
                    </td>
                  </motion.tr>
                ) : (
                  filtered.map((project: Project, idx: number) => (
                    <motion.tr
                      key={project.id}
                      className="cursor-pointer"
                      style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}
                      onClick={() => navigate(`/projects/${project.id}`)}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f8f9fb'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ delay: idx * 0.04, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: STATUS_STYLES[project.status].dot }}
                          />
                          <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                            {project.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <OwnerAvatar name={project.owner} />
                      </td>
                      <td className="px-5 py-3.5 text-sm text-foreground whitespace-nowrap">
                        {formatDate(project.startDate)}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-foreground whitespace-nowrap">
                        {formatDate(project.endDate)}
                      </td>
                      {/* Columna «Componentes» eliminada — dato mock; reservado para API */}
                      <td className="px-5 py-3.5">
                        <StatusBadge status={project.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div
                          className="flex items-center gap-1"
                          onClick={e => e.stopPropagation()}
                        >
                          <motion.button
                            className="p-1.5 rounded-md transition-colors"
                            title="Ver proyecto"
                            onClick={() => navigate(`/projects/${project.id}`)}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f0f0f4'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Eye size={15} className="text-muted-foreground" />
                          </motion.button>
                          <motion.button
                            className="p-1.5 rounded-md transition-colors"
                            title="Ajustes"
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f0f0f4'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={e => {
                              e.stopPropagation();
                              setArchetypesProjectId(project.id);
                              setSelectedFrameworkByCategory(selectionForArchetypesSheet(project.id));
                              setArchetypesOpen(true);
                            }}
                          >
                            <Settings2 size={15} className="text-muted-foreground" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      <CreateProjectSheet open={sheetOpen} onOpenChange={setSheetOpen} />

      <Sheet
        open={archetypesOpen}
        onOpenChange={(open) => {
          setArchetypesOpen(open);
          if (!open) setArchetypesProjectId(null);
        }}
      >
        <SheetContent
          side="right"
          className="!w-[60vw] !max-w-none p-0 flex flex-col"
        >
          <SheetHeader className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <SheetTitle className="flex items-center gap-2">
              <Settings2 size={16} /> Arquetipos del proyecto
            </SheetTitle>
            <SheetDescription>
              Suba un ZIP por framework. Se fusionará con los scripts generados usando el `path` del archivo.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/90">
                Frameworks
              </div>

              <div className="rounded-lg p-3" style={{ backgroundColor: '#f4f5f7', border: '1px solid rgba(0,0,0,0.08)' }}>
                <p className="text-xs text-muted-foreground">
                  Cargados: <span className="font-medium text-foreground">{archetypesStats.loaded}</span> · Pendientes:{' '}
                  <span className="font-medium text-foreground">{archetypesStats.pending}</span>
                </p>
              </div>

              {PROJECT_FRAMEWORK_CATEGORIES.map(cat => (
                <div key={cat.id} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-foreground/80">{cat.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {selectedFrameworkByCategory[cat.id]}
                    </div>
                  </div>

                  <Select
                    value={selectedFrameworkByCategory[cat.id]}
                    onValueChange={(v) =>
                      setSelectedFrameworkByCategory(prev => {
                        const next = { ...prev, [cat.id]: v as CategorySelection };
                        if (archetypesProjectId) persistArchetypesSheetSelection(archetypesProjectId, next);
                        return next;
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NA_OPTION}>N/A</SelectItem>
                      {cat.frameworks.map(fw => (
                        <SelectItem key={fw} value={fw}>
                          {fw}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="space-y-5">
                {PROJECT_FRAMEWORK_CATEGORIES.map(cat => {
                  const framework = selectedFrameworkByCategory[cat.id];
                  if (framework === NA_OPTION) return null;
                  const slotId = slotIdFor(cat.id, framework);
                  const archetypeFileMap: ZipFileMap | null =
                    activeProjectArchetypes[slotId] ?? null;
                  const entryCount = archetypeFileMap ? archetypeFileMap.size : 0;
                  const fileName = archetypeFileNameByFramework[slotId];
                  const isLoading = archetypeLoadingByFramework[slotId];
                  const hasArchetype = !!archetypeFileMap;
                  const folderPreview =
                    archetypeFileMap && hasArchetype
                      ? getZipFolderStructurePreview(archetypeFileMap, 12)
                      : null;

                  return (
                    <div key={cat.id}>
                      <div className="text-sm font-medium text-foreground/80 mb-3">
                        {cat.label}
                      </div>

                      <div
                        className="rounded-lg p-4"
                        style={{
                          border: '1px solid rgba(0,0,0,0.08)',
                          backgroundColor: '#fff',
                        }}
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-foreground">
                              {framework}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {hasArchetype
                                ? `${entryCount} archivos detectados · ${fileName ?? 'ZIP cargado'}`
                                : 'No cargado todavía'}
                            </div>

                            {folderPreview && (
                              <div className="mt-2">
                                <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/80 mb-1">
                                  Estructura del ZIP
                                </div>
                                <pre className="text-[11px] font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                  {folderPreview.lines.join('\n')}
                                  {folderPreview.truncated ? `\n... +${folderPreview.totalDirs - folderPreview.lines.length} carpetas` : ''}
                                </pre>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {hasArchetype && (
                              <button
                                type="button"
                                className="p-2 rounded-md transition-colors"
                                style={{ backgroundColor: 'rgba(0,0,0,0.04)' }}
                                onClick={() => handleClearArchetype(slotId)}
                                aria-label={`Eliminar arquetipo ${cat.label} - ${framework}`}
                              >
                                <Trash2
                                  size={16}
                                  className="text-muted-foreground"
                                />
                              </button>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wide text-foreground/80 block mb-2">
                            Subir arquetipo ZIP
                          </label>

                          <div className="flex items-center gap-3">
                            <label
                              htmlFor={`archetype-${archetypesProjectId ?? 'unknown'}-${slotId}`}
                              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                              style={{
                                backgroundColor: isLoading
                                  ? '#9ca3af'
                                  : hasArchetype
                                    ? '#3b82f6'
                                    : '#58B888',
                                color: '#fff',
                                border: '1px solid rgba(0,0,0,0.06)',
                                opacity: isLoading ? 0.95 : 1,
                              }}
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 size={16} className="animate-spin" />
                                  Cargando…
                                </>
                              ) : (
                                <>
                                  <Upload size={16} />
                                  {hasArchetype ? 'Reemplazar ZIP' : 'Subir ZIP'}
                                </>
                              )}
                            </label>

                            <input
                              id={`archetype-${archetypesProjectId ?? 'unknown'}-${slotId}`}
                              type="file"
                              accept=".zip"
                              className="hidden"
                              disabled={isLoading}
                              onChange={e =>
                                void handleProjectArchetypeUpload(
                                  slotId,
                                  framework,
                                  e.target.files?.[0] ?? null,
                                )
                              }
                            />
                          </div>

                          {archetypeErrorByFramework[slotId] && (
                            <p className="text-xs text-rose-500 mt-2">
                              {archetypeErrorByFramework[slotId]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

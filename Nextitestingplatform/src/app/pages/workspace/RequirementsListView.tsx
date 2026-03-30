import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, ListTodo, Eye } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useApp } from '../../context/AppContext';
import type { Project } from '../../data/mockData';
import type { Requirement } from '../../types/requirements';
import { CreateRequirementSheet } from '../../components/CreateRequirementSheet';

function requirementLabel(r: Requirement) {
  if (r.requirementTitle?.trim()) return r.requirementTitle;
  if (r.featureId?.trim()) return r.featureId;
  return 'Untitled';
}

export function RequirementsListView({
  project,
  selectedRequirementId,
  onSelectRequirement,
}: {
  project: Project;
  selectedRequirementId: string | null;
  onSelectRequirement: (id: string) => void;
}) {
  const { requirements, deleteRequirement } = useApp();
  const [sheetOpen, setSheetOpen] = useState(false);

  const reqs = useMemo(
    () => requirements.filter(r => r.projectId === project.id),
    [requirements, project.id],
  );

  return (
    <div className="p-6 space-y-5 max-w-[1400px]">
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <h1 className="text-foreground">Requerimientos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {reqs.length} requerimiento{reqs.length !== 1 ? 's' : ''} en este proyecto.
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Button onClick={() => setSheetOpen(true)} className="gap-2">
            <Plus size={16} /> Nueva
          </Button>
        </motion.div>
      </motion.div>

      <AnimatePresence mode="popLayout">
        <motion.div
          className="bg-white rounded-lg"
          style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ListTodo size={15} className="text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Listado</span>
              </div>
              <span className="text-xs text-muted-foreground">
                Seleccione uno para ver resumen, análisis y scripts
              </span>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {reqs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: '#f0f2f5', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <Eye size={28} className="opacity-60" />
                </div>
                <p className="text-sm font-medium text-foreground">Aún no hay requerimientos</p>
                <p className="text-xs text-muted-foreground mt-2 max-w-sm">
                  Cree el primer requerimiento para empezar el análisis funcional.
                </p>
              </div>
            ) : (
              reqs.map(r => {
                const active = selectedRequirementId === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => onSelectRequirement(r.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') onSelectRequirement(r.id);
                    }}
                    className="cursor-pointer rounded-xl transition-colors"
                    style={{
                      border: active ? '1px solid #202950' : '1px solid rgba(0,0,0,0.08)',
                      backgroundColor: active ? '#f3f4f6' : '#fff',
                    }}
                  >
                    <div className="px-4 py-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground truncate max-w-[560px]">
                            {requirementLabel(r)}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          ID: {r.featureId || 'unknown'} · Criterios: {r.acceptanceCriteria.length}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="p-1.5 rounded-md hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          style={{ color: '#6b7280' }}
                          onClick={e => {
                            e.stopPropagation();
                            deleteRequirement(r.id);
                          }}
                          aria-label="Eliminar requerimiento"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <CreateRequirementSheet project={project} open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}


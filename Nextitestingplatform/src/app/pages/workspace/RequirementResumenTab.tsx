import React, { useEffect, useMemo, useState } from 'react';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import { Plus, Trash2, Upload, X } from 'lucide-react';
import { extractDocText } from '../../lib/extractDocText';
import { useApp } from '../../context/AppContext';
import type { Requirement } from '../../types/requirements';

function debounce(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

export function RequirementResumenTab({ requirement }: { requirement: Requirement }) {
  const { updateRequirement } = useApp();

  const [featureIdDraft, setFeatureIdDraft] = useState(requirement.featureId);
  const [requirementTitleDraft, setRequirementTitleDraft] = useState(requirement.requirementTitle);
  const [requirementTextDraft, setRequirementTextDraft] = useState(requirement.requirementText);
  const [acceptanceCriteriaDraft, setAcceptanceCriteriaDraft] = useState<string[]>(requirement.acceptanceCriteria);

  const [reqFileName, setReqFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = useMemo(() => {
    return (
      featureIdDraft.trim().length > 0 ||
      requirementTitleDraft.trim().length > 0 ||
      requirementTextDraft.trim().length > 0
    );
  }, [featureIdDraft, requirementTextDraft, requirementTitleDraft]);

  useEffect(() => {
    setFeatureIdDraft(requirement.featureId);
    setRequirementTitleDraft(requirement.requirementTitle);
    setRequirementTextDraft(requirement.requirementText);
    setAcceptanceCriteriaDraft(requirement.acceptanceCriteria);
    setReqFileName(null);
    setError(null);
  }, [requirement.id]);

  // Debounced persistence (so typing does not write to localStorage on every keystroke)
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      await debounce(450);
      if (cancelled) return;
      const inputsChanged =
        featureIdDraft.trim() !== requirement.featureId.trim() ||
        requirementTitleDraft.trim() !== requirement.requirementTitle.trim() ||
        requirementTextDraft !== requirement.requirementText ||
        acceptanceCriteriaDraft.join('||') !== requirement.acceptanceCriteria.join('||');

      updateRequirement(requirement.id, {
        featureId: featureIdDraft.trim() || 'unknown',
        requirementTitle: requirementTitleDraft.trim() || 'Untitled',
        requirementText: requirementTextDraft,
        acceptanceCriteria: acceptanceCriteriaDraft,
        ...(inputsChanged ? { bddResult: null, editedGherkin: null, workspaceSnapshot: null } : {}),
      });
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [
    requirement.id,
    featureIdDraft,
    requirementTitleDraft,
    requirementTextDraft,
    acceptanceCriteriaDraft,
    updateRequirement,
  ]);

  const addCriterion = () => setAcceptanceCriteriaDraft(p => [...p, '']);
  const removeCriterionAt = (idx: number) => setAcceptanceCriteriaDraft(p => p.filter((_, i) => i !== idx));
  const setCriterionAt = (idx: number, value: string) =>
    setAcceptanceCriteriaDraft(p => p.map((c, i) => (i === idx ? value : c)));

  const handleUpload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const text = (await extractDocText(file)).trim();
      setRequirementTextDraft(text);
      setReqFileName(file.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo extraer el texto del archivo.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-8">
      <div
        className="rounded-lg bg-white"
        style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <span className="text-sm font-medium text-foreground">Resumen</span>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide block">ID</Label>
              <Input
                value={featureIdDraft}
                onChange={e => setFeatureIdDraft(e.target.value)}
                placeholder="FUNC-001"
                className="h-10"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide block">Título</Label>
              <Input
                value={requirementTitleDraft}
                onChange={e => setRequirementTitleDraft(e.target.value)}
                placeholder="Nombre corto"
                className="h-10"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide block">
                Documento / Descripción del requerimiento
              </Label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  className="hidden"
                  accept=".txt,.md,.pdf,.docx"
                  id={`req-upload-${requirement.id}`}
                  onChange={e => void handleUpload(e.target.files?.[0] ?? null)}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={() => document.getElementById(`req-upload-${requirement.id}`)?.click()}
                  disabled={uploading}
                >
                  <Upload size={14} />
                  {uploading ? 'Procesando…' : (reqFileName ? 'Cambiar archivo' : 'Cargar archivo')}
                </Button>
              </div>
            </div>

            <Textarea
              value={requirementTextDraft}
              onChange={e => setRequirementTextDraft(e.target.value)}
              rows={7}
              className="resize-none text-sm"
              placeholder="Pegue aquí el texto del requerimiento…"
            />

            {error && <p className="text-xs text-rose-500 mt-2">{error}</p>}
            {!canSave && <p className="text-xs text-muted-foreground mt-2">Rellene al menos título o texto.</p>}
          </div>

          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide block">
                Criterios de aceptación
              </Label>
              <button
                type="button"
                onClick={addCriterion}
                className="text-xs flex items-center gap-1.5"
                style={{ color: '#58B888' }}
              >
                <Plus size={11} /> Agregar
              </button>
            </div>

            <div className="flex flex-col gap-3 rounded-xl p-3" style={{ backgroundColor: '#f4f5f7', border: '1px solid rgba(0,0,0,0.08)' }}>
              {acceptanceCriteriaDraft.map((c, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="text-xs font-medium tabular-nums text-muted-foreground w-5 text-right pt-2">
                    {idx + 1}.
                  </div>
                  <Textarea
                    value={c}
                    onChange={e => setCriterionAt(idx, e.target.value)}
                    rows={2}
                    className="resize-y text-sm"
                    placeholder="Criterio de aceptación…"
                  />
                  <button
                    type="button"
                    onClick={() => removeCriterionAt(idx)}
                    className="mt-1 p-1.5 rounded-md hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    aria-label="Eliminar criterio"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {acceptanceCriteriaDraft.length === 0 && (
                <div className="flex items-center justify-center py-8 rounded-lg border border-dashed border-foreground/20 bg-white">
                  <p className="text-xs text-muted-foreground italic">Sin criterios (opcional)</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


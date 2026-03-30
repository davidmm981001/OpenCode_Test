import React, { useMemo, useRef, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useApp } from '../context/AppContext';
import { extractDocText } from '../lib/extractDocText';
import type { Requirement } from '../types/requirements';
import type { Project } from '../data/mockData';

interface CreateRequirementSheetProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (created: Requirement) => void;
}

export function CreateRequirementSheet({
  project,
  open,
  onOpenChange,
  onCreated,
}: CreateRequirementSheetProps) {
  const { addRequirement } = useApp();

  const reqFileRef = useRef<HTMLInputElement>(null);

  const [featureId, setFeatureId] = useState('');
  const [requirementTitle, setRequirementTitle] = useState('');
  const [requirementText, setRequirementText] = useState('');
  const [reqFileName, setReqFileName] = useState<string | null>(null);

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setFeatureId('');
    setRequirementTitle('');
    setRequirementText('');
    setReqFileName(null);
    setGenerating(false);
    setError(null);
  };

  const close = (val: boolean) => {
    if (!val) reset();
    onOpenChange(val);
  };

  const canSave = useMemo(() => {
    return (requirementTitle.trim().length > 0 || featureId.trim().length > 0 || requirementText.trim().length > 0);
  }, [featureId, requirementText, requirementTitle]);

  const handleExtract = async (file: File | null) => {
    if (!file) return;
    setGenerating(true);
    setError(null);
    try {
      const text = await extractDocText(file);
      const normalized = text.trim();
      setRequirementText(normalized);
      setReqFileName(file.name);
      if (!requirementTitle.trim()) {
        // Best-effort: use filename as title seed
        setRequirementTitle(file.name.replace(/\.[^.]+$/, ''));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo extraer el texto del documento.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = () => {
    if (!canSave) return;
    const nowReq = {
      featureId: featureId.trim() || 'unknown',
      requirementTitle: requirementTitle.trim() || 'Untitled',
      requirementText: requirementText.trim(),
      acceptanceCriteria: [],
      bddResult: null,
      editedGherkin: null,
      workspaceSnapshot: null,
    };
    const prevLen = project.id.length; // keep TS from complaining about unused project in some configs
    void prevLen;

    const created = addRequirement(project.id, nowReq);
    onCreated?.(created);

    // Best-effort: we can't easily recover the created id from context call,
    // so we rely on parent selecting via list update after close.
    close(false);
  };

  return (
    <Sheet open={open} onOpenChange={close}>
      <SheetContent
        side="right"
        className="!w-[60vw] !max-w-none p-0 flex flex-col"
      >
        <SheetHeader className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <SheetTitle>Nueva Requerimiento</SheetTitle>
          <SheetDescription>Creación rápida del requisito; luego ajusta criterios y genera el análisis.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <section>
            <h4 className="text-xs uppercase tracking-wide mb-4" style={{ color: '#717182', letterSpacing: '0.05em', fontWeight: 600 }}>
              Datos del Requerimiento
            </h4>
            <div className="space-y-4">
              <div>
                <Label htmlFor="req-featureId" className="text-sm mb-1.5 block">
                  ID / Feature ID
                </Label>
                <Input
                  id="req-featureId"
                  placeholder="Ej: CBS9522"
                  value={featureId}
                  onChange={e => setFeatureId(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="req-title" className="text-sm mb-1.5 block">
                  Título
                </Label>
                <Input
                  id="req-title"
                  placeholder="Nombre del requerimiento"
                  value={requirementTitle}
                  onChange={e => setRequirementTitle(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="req-text" className="text-sm mb-1.5 block">
                  Texto del requerimiento
                </Label>
                <Textarea
                  id="req-text"
                  rows={6}
                  className="resize-none"
                  placeholder="Pegue aquí el texto del requerimiento o use la extracción desde archivo…"
                  value={requirementText}
                  onChange={e => setRequirementText(e.target.value)}
                />
              </div>

              <div>
                <Label className="text-sm mb-1.5 block">
                  O extraer desde archivo
                </Label>
                <div
                  role="button"
                  tabIndex={0}
                  className="rounded-xl p-4 cursor-pointer transition-all"
                  style={{
                    border: reqFileName ? '1.5px solid #bbf7d0' : '1.5px dashed rgba(0,0,0,0.13)',
                    backgroundColor: reqFileName ? '#f0fdf4' : '#fafbfc',
                  }}
                  onClick={() => !generating && reqFileRef.current?.click()}
                  onKeyDown={e => {
                    if ((e.key === 'Enter' || e.key === ' ') && !generating) reqFileRef.current?.click();
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: reqFileName ? '#dcfce7' : '#f0f2f5' }}
                    >
                      <span style={{ fontSize: 18, color: reqFileName ? '#16a34a' : '#9ca3af' }}>
                        📄
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {reqFileName ? reqFileName : 'Clic para cargar .txt .md .pdf .docx'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {generating ? 'Procesando…' : 'Se extrae el texto y se rellena el requerimiento'}
                      </p>
                    </div>
                  </div>
                  <input
                    ref={reqFileRef}
                    type="file"
                    className="hidden"
                    accept=".txt,.md,.pdf,.docx"
                    onChange={e => void handleExtract(e.target.files?.[0] ?? null)}
                  />
                </div>
              </div>

              {error && <p className="text-xs text-rose-500">{error}</p>}
            </div>
          </section>
        </div>

        <div
          className="flex items-center justify-end gap-3 px-6 py-4"
          style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
        >
          <Button variant="outline" onClick={() => close(false)} disabled={generating}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!canSave || generating} className="gap-2">
            Guardar Requerimiento
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}


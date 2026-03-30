import React, { useState } from 'react';
import { Info, Save, BookOpen } from 'lucide-react';
import { Project, NomenclatureConfig } from '../../data/mockData';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useApp } from '../../context/AppContext';

const FIELDS: Array<{ key: keyof NomenclatureConfig; label: string; placeholder: string; icon: string }> = [
  { key: 'testCaseFormat',    label: 'Formato de Caso de Prueba',       placeholder: '[PROYECTO]-TC-[NUM]',              icon: '🧪' },
  { key: 'scriptFormat',      label: 'Formato de Script',               placeholder: '[PROYECTO]-SC-[FRAMEWORK]-[NUM]',  icon: '📜' },
  { key: 'apiFormat',         label: 'Formato de Prueba API',           placeholder: '[PROYECTO]-API-[NUM]',             icon: '🔌' },
  { key: 'manualTestFormat',  label: 'Formato de Prueba Manual',        placeholder: '[PROYECTO]-MT-[NUM]',              icon: '📋' },
  { key: 'performanceFormat', label: 'Formato de Prueba de Rendimiento',placeholder: '[PROYECTO]-PERF-[NUM]',            icon: '⚡' },
  { key: 'e2eFormat',         label: 'Formato de Prueba E2E',           placeholder: '[PROYECTO]-E2E-[NUM]',             icon: '🔄' },
];

const DEFAULT_NOMENCLATURE: NomenclatureConfig = {
  testCaseFormat: '[PROJECT]-TC-[NUM]',
  scriptFormat: '[PROJECT]-SC-[FRAMEWORK]-[NUM]',
  apiFormat: '[PROJECT]-API-[NUM]',
  manualTestFormat: '[PROJECT]-MT-[NUM]',
  performanceFormat: '[PROJECT]-PERF-[NUM]',
  e2eFormat: '[PROJECT]-E2E-[NUM]',
};

const VARIABLES = [
  { token: '[PROYECTO]', desc: 'Código corto del proyecto (ej: ECP, BCM)' },
  { token: '[NUM]',      desc: 'Número secuencial con ceros (ej: 001)' },
  { token: '[TC]',       desc: 'Abreviación del tipo de caso de prueba' },
  { token: '[FRAMEWORK]', desc: 'Nombre del framework (ej: Selenium, Serenity, Playwright)' },
];

export function NomenclatureTab({ project }: { project: Project }) {
  const { updateProject } = useApp();
  const [config, setConfig] = useState<NomenclatureConfig>(
    project.nomenclature ?? DEFAULT_NOMENCLATURE
  );
  const [saved, setSaved] = useState(false);

  const handleChange = (field: keyof NomenclatureConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    updateProject(project.id, { nomenclature: config });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={16} className="text-muted-foreground" />
            <h3>Convenciones de Nomenclatura</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Define los patrones de formato para los artefactos de prueba. Estas convenciones se aplicarán a todos los escenarios generados por IA en este proyecto.
          </p>
        </div>
        <Button onClick={handleSave} className="gap-2 flex-shrink-0" size="sm">
          <Save size={14} />
          {saved ? '¡Guardado!' : 'Guardar Cambios'}
        </Button>
      </div>

      {/* Variables reference */}
      <div className="rounded-lg p-4" style={{ backgroundColor: '#f0f3ff', border: '1px solid #d4dcfb' }}>
        <div className="flex items-start gap-2">
          <Info size={14} style={{ color: '#202950', flexShrink: 0, marginTop: 2 }} />
          <div>
            <p className="text-sm font-medium mb-2" style={{ color: '#202950' }}>Variables Disponibles</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
              {VARIABLES.map(v => (
                <div key={v.token} className="flex items-center gap-2">
                  <code
                    className="text-xs px-1.5 py-0.5 rounded font-mono"
                    style={{ backgroundColor: '#dde4fd', color: '#3730a3' }}
                  >
                    {v.token}
                  </code>
                  <span className="text-xs" style={{ color: '#1e40af' }}>{v.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Format fields – 2 column grid */}
      <div className="bg-white rounded-lg p-6" style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <h4 className="mb-5 text-sm font-semibold uppercase tracking-wide" style={{ color: '#717182', letterSpacing: '0.05em' }}>
          Patrones de Formato
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {FIELDS.map(field => (
            <div key={field.key}>
              <Label htmlFor={field.key} className="flex items-center gap-1.5 text-sm mb-1.5">
                <span>{field.icon}</span>
                {field.label}
              </Label>
              <Input
                id={field.key}
                value={config[field.key]}
                placeholder={field.placeholder}
                onChange={e => handleChange(field.key, e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                ej. <code className="text-xs">{field.placeholder}</code>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Live Preview */}
      <div className="bg-white rounded-lg p-6" style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide" style={{ color: '#717182', letterSpacing: '0.05em' }}>
          Vista previa (ejemplo con NUM=001)
        </h4>
        <div className="space-y-2">
          {FIELDS.map(field => {
            const preview = config[field.key]
              .replace('[PROYECTO]', 'ECP')
              .replace('[NUM]', '001')
              .replace('[FRAMEWORK]', 'Cypress')
              .replace('[TC]', 'TC');
            return (
              <div key={field.key} className="flex items-center gap-3 py-1.5 px-3 rounded-md" style={{ backgroundColor: '#f8f9fb' }}>
                <span className="text-xs text-muted-foreground w-36">{field.label}</span>
                <code
                  className="text-xs font-mono px-2 py-1 rounded"
                  style={{ backgroundColor: '#0f1117', color: '#a5f3fc' }}
                >
                  {preview}
                </code>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
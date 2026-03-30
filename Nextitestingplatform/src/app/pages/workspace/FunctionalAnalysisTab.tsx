import {
  generateBDD,
  coverageTotal,
  BDDCodeContext,
  BDDGenerationResponse,
  BDDServiceError,
  DEMO_BDD_RESPONSE,
  DEMO_FORM_DATA,
} from '../../services/bddService';
import { extractDocText } from '../../lib/extractDocText';
import { readCodeFiles } from '../../lib/readCodeFiles';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, Plus, Trash2, Upload, X, ChevronDown, ChevronUp,
  AlertTriangle, CheckCircle2, BarChart3, Bot, Languages,
  Paperclip, FileText, Code2, Loader2, Copy, Check,
  WifiOff, GitCompare, ChevronRight, ChevronLeft, Pencil,
} from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { useApp } from '../../context/AppContext';
import type { AIRole, ProgrammingLanguage } from '../../data/mockData';
import type { BddWorkspaceSnapshot } from '../../types/generation';
import type { Requirement } from '../../types/requirements';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '../../components/ui/drawer';

const DEFAULT_ISTQB_PROMPT =
  'Genere los casos siguiendo buenas prácticas ISTQB: cobertura balanceada de casos positivos/negativos, ' +
  'condiciones de borde, precondiciones y resultados esperados claros, con trazabilidad al requerimiento.';
type OutputTab = 'scenarios' | 'ambiguities' | 'mismatches' | 'coverage';

// ─── BDD code block ───────────────────────────────────────────────────────────

function BDDScenarioBlock({ text, onSave }: { text: string; onSave: (next: string) => void }) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(text);

  useEffect(() => {
    if (!isEditing) setDraft(text);
  }, [text, isEditing]);

  const copyPayload = isEditing ? draft : text;

  const handleCopy = () => {
    navigator.clipboard.writeText(copyPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = () => {
    setDraft(text);
    setIsEditing(true);
    setCopied(false);
  };

  const handleSave = () => {
    onSave(draft);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(text);
    setIsEditing(false);
  };

  const renderLine = (line: string, idx: number) => {
    const t = line.trim();
    let color = '#374151';
    if      (t.startsWith('Funcionalidad:') || t.startsWith('Feature:'))    color = '#7c3aed';
    else if (t.startsWith('Antecedentes:')  || t.startsWith('Background:')) color = '#9333ea';
    else if (t.startsWith('Escenario:')     || t.startsWith('Scenario:'))   color = '#b45309';
    else if (t.startsWith('Dado ')          || t.startsWith('Given '))      color = '#1d4ed8';
    else if (t.startsWith('Cuando ')        || t.startsWith('When '))       color = '#0369a1';
    else if (t.startsWith('Entonces ')      || t.startsWith('Then '))       color = '#047857';
    else if (t.startsWith('Y ')             || t.startsWith('And '))        color = '#065f46';
    else if (t.startsWith('Pero ')          || t.startsWith('But '))        color = '#9a3412';
    else if (t.startsWith('@'))                                              color = '#a21caf';
    else if (t.startsWith('#'))                                              color = '#9ca3af';
    else if (t === '')                                                       color = 'transparent';
    return (
      <div key={idx} style={{ color, lineHeight: '1.75' }}>
        {line || '\u00A0'}
      </div>
    );
  };

  const headerBtn =
    'flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md transition-all border border-transparent';

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.08)', backgroundColor: '#f8f9fb' }}>
      <div
        className="flex flex-wrap items-center justify-between gap-2 px-4 py-2"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.07)', backgroundColor: '#f0f2f5' }}
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#ff5f57' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#febc2e' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#28c840' }} />
          </div>
          <span className="text-xs font-mono" style={{ color: '#9ca3af' }}>
            {isEditing ? 'gherkin · edición' : 'gherkin'}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 justify-end">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                className={headerBtn}
                style={{
                  color: '#fff',
                  backgroundColor: '#58B888',
                  borderColor: 'rgba(0,0,0,0.06)',
                }}
              >
                <Check size={11} /> Guardar
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className={headerBtn}
                style={{
                  color: '#6b7280',
                  backgroundColor: 'rgba(0,0,0,0.04)',
                  borderColor: 'rgba(0,0,0,0.07)',
                }}
              >
                <X size={11} /> Cancelar
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className={headerBtn}
                style={{
                  color: copied ? '#047857' : '#6b7280',
                  backgroundColor: copied ? '#ecfdf5' : 'rgba(0,0,0,0.04)',
                  borderColor: copied ? '#bbf7d0' : 'rgba(0,0,0,0.07)',
                }}
              >
                {copied ? <Check size={11} /> : <Copy size={11} />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCopy}
                className={headerBtn}
                style={{
                  color: copied ? '#047857' : '#6b7280',
                  backgroundColor: copied ? '#ecfdf5' : 'rgba(0,0,0,0.04)',
                  borderColor: copied ? '#bbf7d0' : 'rgba(0,0,0,0.07)',
                }}
              >
                {copied ? <Check size={11} /> : <Copy size={11} />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
              <button
                type="button"
                onClick={handleEdit}
                className={headerBtn}
                style={{
                  color: '#202950',
                  backgroundColor: '#e8eaf2',
                  borderColor: '#c8ccd6',
                }}
              >
                <Pencil size={11} /> Editar
              </button>
            </>
          )}
        </div>
      </div>
      {isEditing ? (
        <Textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          className="w-full min-h-[280px] max-h-[min(70vh,560px)] resize-y rounded-none border-0 text-xs font-mono p-4 leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0"
          style={{ backgroundColor: '#fafbfc' }}
          spellCheck={false}
          aria-label="Editar Gherkin"
        />
      ) : (
        <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed">
          {text.split('\n').map((line, idx) => renderLine(line, idx))}
        </pre>
      )}
    </div>
  );
}

function RoleChip({ name, onRemove }: { name: string; onRemove: () => void }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: '#eff2ff', color: '#3730a3', border: '1px solid #c7d2fe' }}
    >
      <Bot size={10} />
      {name}
      <button onClick={onRemove} className="ml-0.5 hover:text-rose-500 transition-colors">
        <X size={9} />
      </button>
    </span>
  );
}

function FileChip({ name, onRemove }: { name: string; onRemove: () => void }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: '#f0fdf4', color: '#065f46', border: '1px solid #bbf7d0' }}
    >
      <Paperclip size={10} />
      {name}
      <button
        onClick={e => { e.stopPropagation(); onRemove(); }}
        className="ml-0.5 hover:text-rose-500 transition-colors"
      >
        <X size={9} />
      </button>
    </span>
  );
}

const COVERAGE_META = [
  { key: 'happy_path'       as const, label: 'Camino Feliz',         color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
  { key: 'validation'       as const, label: 'Validación',           color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
  { key: 'negative'         as const, label: 'Negativo',             color: '#f43f5e', bg: '#fff1f2', border: '#fecdd3' },
  { key: 'boundary'         as const, label: 'Límite',               color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
  { key: 'permission'       as const, label: 'Permisos',             color: '#6b7280', bg: '#f3f4f6', border: '#e5e7eb' },
  { key: 'state_transition' as const, label: 'Transición de Estado', color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

interface FunctionalAnalysisTabProps {
  requirement: Requirement;
  onGherkinOutputChange?: (text: string | null) => void;
  onNavigateToScripts?: () => void;
  /** Syncs UI context (roles, language, etc.) for the Scripts tab + n8n script flow. */
  onWorkspaceContextForScripts?: (ctx: BddWorkspaceSnapshot | null) => void;
  /** Persist BDD + scripts workspace context into the selected requirement record. */
  onPersistRequirementOutputs?: (updates: {
    bddResult: BDDGenerationResponse | null;
    editedGherkin: string | null;
    workspaceSnapshot: BddWorkspaceSnapshot | null;
  }) => void;
}

export function FunctionalAnalysisTab({
  requirement,
  onGherkinOutputChange,
  onNavigateToScripts,
  onWorkspaceContextForScripts,
  onPersistRequirementOutputs,
}: FunctionalAnalysisTabProps) {
  const {
    aiRoles,
    addRole,
    updateRole,
    deleteRole,
    programmingLanguages,
    addProgrammingLanguage,
    updateProgrammingLanguage,
    deleteProgrammingLanguage,
  } = useApp();

  const initialWorkspaceSnapshot = requirement.workspaceSnapshot ?? null;

  // Panels
  const [contextExpanded, setContextExpanded] = useState(true);
  const [rolesDrawerOpen, setRolesDrawerOpen] = useState(false);
  const [languagesDrawerOpen, setLanguagesDrawerOpen] = useState(false);

  // Roles drawer — create / edit
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editRoleName, setEditRoleName] = useState('');
  const [editRoleDescription, setEditRoleDescription] = useState('');

  // Languages drawer — catálogo global (AppContext)
  const [newLangName, setNewLangName] = useState('');
  const [newLangDescription, setNewLangDescription] = useState('');
  const [editingLanguageId, setEditingLanguageId] = useState<string | null>(null);
  const [editLangName, setEditLangName] = useState('');
  const [editLangDescription, setEditLangDescription] = useState('');

  // Context config
  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    () =>
      initialWorkspaceSnapshot?.aiRoles?.map(r =>
        typeof r === 'string' ? r : r.name,
      ) ?? ['Ingeniero QA', 'Experto COBOL'],
  );
  const [language, setLanguage] = useState(() => {
    return initialWorkspaceSnapshot?.scriptingLanguage ?? programmingLanguages[0]?.name ?? '';
  });
  const [maxScenarios, setMaxScenarios] = useState(() => initialWorkspaceSnapshot?.maxScenarios ?? 10);
  const [minPositiveCases, setMinPositiveCases] = useState(
    () => initialWorkspaceSnapshot?.minPositiveCases ?? 1,
  );
  const [minNegativeCases, setMinNegativeCases] = useState(
    () => initialWorkspaceSnapshot?.minNegativeCases ?? 1,
  );
  const [istqbPrompt, setIstqbPrompt] = useState(
    () => initialWorkspaceSnapshot?.istqbPrompt ?? DEFAULT_ISTQB_PROMPT,
  );
  const [contextFiles,  setContextFiles]  = useState<string[]>([]);

  useEffect(() => {
    if (programmingLanguages.length === 0) return;
    setLanguage(prev => {
      if (programmingLanguages.some(l => l.name === prev)) return prev;
      return programmingLanguages[0].name;
    });
  }, [programmingLanguages]);

  // Code context (uploaded)
  const [codeFiles, setCodeFiles] = useState<BDDCodeContext[]>(
    () => initialWorkspaceSnapshot?.codeContext ?? [],
  );
  // Scripts workspace context persisted into the requirement record
  const [workspaceSnapshot, setWorkspaceSnapshot] = useState<BddWorkspaceSnapshot | null>(
    () => initialWorkspaceSnapshot,
  );

  // Legacy requirement UI state (the editable UX is in `RequirementResumenTab`).
  // We keep it to avoid breaking the existing JSX structure.
  const [inputExpanded, setInputExpanded] = useState(true);
  const [requirementText, setRequirementText] = useState(requirement.requirementText);
  const [featureId, setFeatureId] = useState(requirement.featureId);
  const [requirementTitle, setRequirementTitle] = useState(requirement.requirementTitle);
  const [criteria, setCriteria] = useState<{ id: string; text: string }[]>(
    () => requirement.acceptanceCriteria.map((text, idx) => ({ id: String(idx), text })),
  );
  const [reqFile, setReqFile] = useState<string | null>(null);

  // Output
  const [generating, setGenerating] = useState(false);
  const [bddResult,  setBddResult]  = useState<BDDGenerationResponse | null>(
    () => requirement.bddResult ?? null,
  );
  /** User-edited Gherkin; cleared when a new BDD output is loaded */
  const [editedGherkin, setEditedGherkin] = useState<string | null>(
    () => requirement.editedGherkin ?? null,
  );
  /** Remounts scenario block so edit UI resets on new generation */
  const [gherkinOutputKey, setGherkinOutputKey] = useState(0);
  const [error,      setError]      = useState<{ message: string; isOffline: boolean } | null>(null);
  const [outputTab,  setOutputTab]  = useState<OutputTab>('scenarios');

  // Keep legacy requirement UI state aligned with the selected requirement.
  useEffect(() => {
    setRequirementText(requirement.requirementText);
    setFeatureId(requirement.featureId);
    setRequirementTitle(requirement.requirementTitle);
    setCriteria(
      requirement.acceptanceCriteria.map((text, idx) => ({ id: String(idx), text })),
    );
  }, [
    requirement.id,
    requirement.featureId,
    requirement.requirementTitle,
    requirement.requirementText,
    requirement.acceptanceCriteria,
  ]);

  // Tabs scroll
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const [tabsCanScrollRight, setTabsCanScrollRight] = useState(false);
  const [tabsCanScrollLeft,  setTabsCanScrollLeft]  = useState(false);

  // Refs
  const contextFileRef = useRef<HTMLInputElement>(null);
  const codeFileRef    = useRef<HTMLInputElement>(null);
  const reqFileRef     = useRef<HTMLInputElement>(null);
  const outputCardRef  = useRef<HTMLDivElement>(null);    // para scroll suave

  const handleTabsScroll = () => {
    const el = tabsScrollRef.current;
    if (!el) return;
    setTabsCanScrollLeft(el.scrollLeft > 4);
    setTabsCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  const scrollTabs = (dir: 'left' | 'right') =>
    tabsScrollRef.current?.scrollBy({ left: dir === 'right' ? 160 : -160, behavior: 'smooth' });

  // ─── Scroll suave al output card ──────────────────────────────────────────

  const scrollToOutput = () => {
    setTimeout(() => {
      outputCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80); // pequeño delay para que React renderice el card primero
  };

  // Reportar Gherkin al padre (para habilitar Scripts de Prueba)
  const displayedGherkin = editedGherkin ?? bddResult?.gherkin ?? null;
  useEffect(() => {
    onGherkinOutputChange?.(displayedGherkin);
  }, [displayedGherkin, onGherkinOutputChange]);

  // Scripts snapshot is emitted when generation runs (so Scripts uses the context that produced the BDD).

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const handleLoadDemo = () => {
    // Demo keeps legacy UX functional while the requirement layer is being introduced.
    setFeatureId(DEMO_FORM_DATA.featureId);
    setRequirementTitle(DEMO_FORM_DATA.requirementTitle);
    setRequirementText(DEMO_FORM_DATA.requirementText);
    setCriteria([]);
    setCodeFiles(DEMO_FORM_DATA.codeFiles);
    setError(null);
    setEditedGherkin(null);
    setGherkinOutputKey(k => k + 1);
    setBddResult(DEMO_BDD_RESPONSE);
    setOutputTab('scenarios');
    setInputExpanded(false);
    scrollToOutput();
  };

  const addCriteria = () =>
    setCriteria(p => [...p, { id: String(Date.now()), text: '' }]);
  const removeCriteria = (id: string) =>
    setCriteria(p => p.filter(c => c.id !== id));
  const updateCriteria = (id: string, text: string) =>
    setCriteria(p => p.map(c => (c.id === id ? { ...c, text } : c)));

  const toggleRole     = (name: string) => setSelectedRoles(p =>
    p.includes(name) ? p.filter(r => r !== name) : [...p, name]
  );

  const handleAddCustomRole = () => {
    const name = newRoleName.trim();
    if (!name) return;
    const exists = aiRoles.some(r => r.name.toLowerCase() === name.toLowerCase());
    if (exists) return;
    addRole({
      name,
      description: newRoleDescription.trim() || 'Rol personalizado para el contexto de IA',
    });
    setSelectedRoles(p => (p.includes(name) ? p : [...p, name]));
    setNewRoleName('');
    setNewRoleDescription('');
  };

  const startEditRole = (role: AIRole) => {
    setEditingRoleId(role.id);
    setEditRoleName(role.name);
    setEditRoleDescription(role.description);
  };

  const cancelEditRole = () => {
    setEditingRoleId(null);
    setEditRoleName('');
    setEditRoleDescription('');
  };

  const saveEditRole = () => {
    if (!editingRoleId) return;
    const old = aiRoles.find(r => r.id === editingRoleId);
    if (!old) return;
    const name = editRoleName.trim();
    if (!name) return;
    updateRole(editingRoleId, {
      name,
      description: editRoleDescription.trim() || 'Sin descripción',
    });
    if (old.name !== name) {
      setSelectedRoles(p => p.map(n => (n === old.name ? name : n)));
    }
    cancelEditRole();
  };

  const handleDeleteRole = (role: AIRole) => {
    deleteRole(role.id);
    setSelectedRoles(p => p.filter(n => n !== role.name));
    if (editingRoleId === role.id) cancelEditRole();
  };

  const handleAddLanguage = () => {
    const name = newLangName.trim();
    if (!name) return;
    if (programmingLanguages.some(l => l.name.toLowerCase() === name.toLowerCase())) return;
    addProgrammingLanguage({
      name,
      description: newLangDescription.trim() || 'Sin descripción',
    });
    setLanguage(name);
    setNewLangName('');
    setNewLangDescription('');
  };

  const startEditLanguage = (lang: ProgrammingLanguage) => {
    setEditingLanguageId(lang.id);
    setEditLangName(lang.name);
    setEditLangDescription(lang.description);
  };

  const cancelEditLanguage = () => {
    setEditingLanguageId(null);
    setEditLangName('');
    setEditLangDescription('');
  };

  const saveEditLanguage = () => {
    if (!editingLanguageId) return;
    const name = editLangName.trim();
    if (!name) return;
    const dup = programmingLanguages.some(
      l => l.name.toLowerCase() === name.toLowerCase() && l.id !== editingLanguageId
    );
    if (dup) return;
    const old = programmingLanguages.find(l => l.id === editingLanguageId);
    updateProgrammingLanguage(editingLanguageId, {
      name,
      description: editLangDescription.trim() || 'Sin descripción',
    });
    if (old && language === old.name) setLanguage(name);
    cancelEditLanguage();
  };

  const handleDeleteLanguage = (lang: ProgrammingLanguage) => {
    deleteProgrammingLanguage(lang.id);
  };

  const handleCodeFileUpload = async (files: FileList | null) => {
    if (!files) return;
    try {
      const parsedFiles = await readCodeFiles(Array.from(files));
      setCodeFiles(p => [...p, ...(parsedFiles as BDDCodeContext[])]);
    } catch {
      setError({
        message: 'No se pudieron leer algunos archivos de código.',
        isOffline: false,
      });
    }
  };

  const handleRequirementFileUpload = async (file: File | null) => {
    if (!file) return;
    setReqFile(file.name);
    try {
      const extractedText = await extractDocText(file);
      if (extractedText.trim()) {
        setRequirementText(extractedText.trim());
      }
    } catch {
      setError({
        message: 'No se pudo extraer el texto del documento de requerimiento.',
        isOffline: false,
      });
    }
  };

  const handleGenerateBDD = async () => {
    setGenerating(true);
    setBddResult(null);
    setEditedGherkin(null);
    setError(null);
    scrollToOutput();          // scroll suave hacia el card que va a aparecer

    const payload = {
      featureId: requirement.featureId.trim() || 'unknown',
      requirementTitle: requirement.requirementTitle.trim() || 'Untitled',
      requirementText: requirement.requirementText.trim() || '',
      acceptanceCriteria: requirement.acceptanceCriteria.map(c => c).filter(Boolean),
      codeContext: codeFiles,
      aiRoles: selectedRoles.map(name => {
        const role = aiRoles.find(r => r.name === name);
        return {
          name,
          description: role?.description ?? 'Sin descripción',
        };
      }),
      scriptingLanguage: language,
      maxScenarios,
      minPositiveCases,
      minNegativeCases,
      istqbPrompt: istqbPrompt.trim(),
    };

    try {
      const result = await generateBDD(payload);
      setEditedGherkin(null);
      setGherkinOutputKey(k => k + 1);
      setBddResult(result);
      setOutputTab('scenarios');

      const nextWorkspaceSnapshot: BddWorkspaceSnapshot = {
        aiRoles: selectedRoles.map(name => {
          const role = aiRoles.find(r => r.name === name);
          return {
            name,
            description: role?.description ?? 'Sin descripción',
          };
        }),
        scriptingLanguage: language,
        maxScenarios,
        minPositiveCases,
        minNegativeCases,
        istqbPrompt: istqbPrompt.trim(),
        requirementText: requirement.requirementText.trim(),
        codeContext: codeFiles,
        testHints: result.test_hints ?? null,
      };
      setWorkspaceSnapshot(nextWorkspaceSnapshot);
      onWorkspaceContextForScripts?.(nextWorkspaceSnapshot);
      onPersistRequirementOutputs?.({
        bddResult: result,
        editedGherkin: null,
        workspaceSnapshot: nextWorkspaceSnapshot,
      });
    } catch (err) {
      setError(err instanceof BDDServiceError
        ? { message: err.message, isOffline: err.isOffline }
        : { message: 'Error inesperado al generar los escenarios BDD.', isOffline: false });
    } finally {
      setGenerating(false);
    }
  };

  // El output card se muestra si hay algo que mostrar
  const showOutput = generating || !!bddResult || !!error;

  const coverageSummary = bddResult?.coverage_summary ?? null;
  const total = coverageSummary ? coverageTotal(coverageSummary) : 0;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4 p-4 pb-8">

      {/* ══════════════════════════════════════════════════
          SECCIÓN 1 — CONTEXTO IA
      ══════════════════════════════════════════════════ */}
      <div
        className="rounded-lg bg-white"
        style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        {/* Header */}
        <button
          className="flex items-center w-full gap-3 px-4 py-3 text-left"
          onClick={() => setContextExpanded(v => !v)}
        >
          <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#e8eaf2' }}>
            <Bot size={12} style={{ color: '#202950' }} />
          </div>
          <span className="text-sm font-medium text-foreground flex-1">Configuración de Contexto IA</span>
          <span className="text-xs text-muted-foreground">
            {selectedRoles.length} rol{selectedRoles.length !== 1 ? 'es' : ''} · {language}
          </span>
          {contextExpanded
            ? <ChevronUp size={14} className="text-muted-foreground" />
            : <ChevronDown size={14} className="text-muted-foreground" />
          }
        </button>

        <AnimatePresence initial={false}>
          {contextExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <div className="px-4 pb-4" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 pt-4">

                  {/* Roles de IA */}
                  <div className="xl:col-span-5">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Roles de IA</Label>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setRolesDrawerOpen(true); }}
                        className="text-xs flex items-center gap-1 shrink-0 px-2 py-1 rounded-md transition-colors"
                        style={{ color: '#58B888', border: '1px solid rgba(88,184,136,0.35)', backgroundColor: 'rgba(88,184,136,0.08)' }}
                      >
                        <Pencil size={11} /> Gestionar roles
                      </button>
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-2 leading-snug">
                      Roles activos en el contexto. Use el panel para crear, editar o eliminar roles.
                    </p>
                    <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                      {selectedRoles.map(r => (
                        <RoleChip key={r} name={r} onRemove={() => toggleRole(r)} />
                      ))}
                      {selectedRoles.length === 0 && (
                        <span className="text-xs text-muted-foreground italic">Ningún rol seleccionado — abra Gestionar roles</span>
                      )}
                    </div>
                  </div>

                  {/* Lenguaje de Script */}
                  <div className="xl:col-span-4">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                        <Languages size={10} className="inline mr-1" />Lenguaje de Script
                      </Label>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setLanguagesDrawerOpen(true); }}
                        className="text-xs flex items-center gap-1 shrink-0 px-2 py-1 rounded-md transition-colors"
                        style={{ color: '#202950', border: '1px solid rgba(0,0,0,0.12)', backgroundColor: '#f0f2f5' }}
                      >
                        <Pencil size={11} /> Gestionar lenguajes
                      </button>
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-2 leading-snug">
                      Catálogo global (Administración → Lenguajes). Pulse un chip para el lenguaje activo del script.
                    </p>
                    <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                      {programmingLanguages.length === 0 && (
                        <span className="text-xs text-muted-foreground italic">No hay lenguajes — añada en el panel o en Administración</span>
                      )}
                      {programmingLanguages.map(lang => (
                        <button
                          key={lang.id}
                          type="button"
                          onClick={() => setLanguage(lang.name)}
                          className="text-xs px-2.5 py-1 rounded-full transition-all"
                          style={{
                            border: language === lang.name ? '1px solid #202950' : '1px solid rgba(0,0,0,0.1)',
                            backgroundColor: language === lang.name ? '#e8eaf2' : 'transparent',
                            color: language === lang.name ? '#202950' : '#717182',
                            fontWeight: language === lang.name ? 500 : 400,
                          }}
                        >
                          {lang.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Escenarios + ISTQB */}
                  <div className="xl:col-span-3 space-y-4">
                    <div>
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide block mb-1.5">
                        Máx. escenarios
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        max={50}
                        value={maxScenarios}
                        onChange={e => {
                          const v = Number.parseInt(e.target.value, 10);
                          if (Number.isFinite(v)) setMaxScenarios(Math.min(50, Math.max(1, v)));
                        }}
                        className="h-9 text-sm"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">Límite sugerido para la generación BDD</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide block mb-1.5">
                          Mín. positivos
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          max={50}
                          value={minPositiveCases}
                          onChange={e => {
                            const v = Number.parseInt(e.target.value, 10);
                            if (Number.isFinite(v)) setMinPositiveCases(Math.min(50, Math.max(0, v)));
                          }}
                          className="h-9 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide block mb-1.5">
                          Mín. negativos
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          max={50}
                          value={minNegativeCases}
                          onChange={e => {
                            const v = Number.parseInt(e.target.value, 10);
                            if (Number.isFinite(v)) setMinNegativeCases(Math.min(50, Math.max(0, v)));
                          }}
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide block mb-1.5">
                        Prompt ISTQB
                      </Label>
                      <Textarea
                        value={istqbPrompt}
                        onChange={e => setIstqbPrompt(e.target.value)}
                        rows={4}
                        className="text-xs"
                        placeholder="Instrucciones ISTQB para la generación..."
                      />
                    </div>
                  </div>
                </div>

                {/* Archivos de contexto — ancho completo */}
                <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide block mb-2">
                      Archivos de Contexto
                    </Label>
                    <div
                      className="rounded-xl p-4 cursor-pointer transition-all"
                      style={{
                        border: contextFiles.length > 0 ? '1.5px solid #c7d2fe' : '1.5px dashed rgba(0,0,0,0.13)',
                        backgroundColor: contextFiles.length > 0 ? '#f5f3ff' : '#fafbfc',
                      }}
                      onClick={() => contextFileRef.current?.click()}
                      onMouseEnter={e => { if (contextFiles.length === 0) (e.currentTarget as HTMLElement).style.backgroundColor = '#f3f5f8'; }}
                      onMouseLeave={e => { if (contextFiles.length === 0) (e.currentTarget as HTMLElement).style.backgroundColor = '#fafbfc'; }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: contextFiles.length > 0 ? '#ede9fe' : '#f0f2f5' }}>
                          <Paperclip size={16} style={{ color: contextFiles.length > 0 ? '#7c3aed' : '#9ca3af' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground">
                            {contextFiles.length > 0
                              ? `${contextFiles.length} archivo${contextFiles.length !== 1 ? 's' : ''} de contexto`
                              : 'Archivos de Contexto'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {contextFiles.length > 0 ? 'Clic para agregar más' : 'Múltiples archivos · .txt · .md · .pdf'}
                          </p>
                        </div>
                        {contextFiles.length > 0 && (
                          <button
                            onClick={e => { e.stopPropagation(); setContextFiles([]); }}
                            className="w-6 h-6 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                            style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fecdd3')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.06)')}
                          >
                            <X size={10} />
                          </button>
                        )}
                      </div>
                      {contextFiles.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2.5 pt-2.5"
                          style={{ borderTop: '1px solid rgba(124,58,237,0.1)' }}>
                          {contextFiles.map(f => (
                            <FileChip key={f} name={f} onRemove={() => setContextFiles(p => p.filter(x => x !== f))} />
                          ))}
                        </div>
                      )}
                      <input ref={contextFileRef} type="file" className="hidden" multiple accept=".txt,.md,.pdf,.docx"
                        onChange={e => {
                          const names = Array.from(e.target.files || []).map(f => f.name);
                          setContextFiles(p => [...p, ...names]);
                        }} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ══════════════════════════════════════════════════
          SECCIÓN 2 — FORMULARIO DE REQUERIMIENTO
      ══════════════════════════════════════════════════ */}
      <div
        className="rounded-lg bg-white"
        style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        {/* Header con botones de acción */}
        <div
          className="flex items-center gap-3 px-4 py-3 cursor-pointer"
          style={{ borderBottom: inputExpanded ? '1px solid rgba(0,0,0,0.06)' : 'none' }}
          onClick={() => setInputExpanded(v => !v)}
        >
          <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#e8eaf2' }}>
            <FileText size={12} style={{ color: '#202950' }} />
          </div>
          <span className="text-sm font-medium text-foreground flex-1">Ingreso de Requerimiento</span>

          <button
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition-colors"
            style={{ backgroundColor: '#e8eaf2', color: '#202950', border: '1px solid #c8ccd6' }}
            disabled
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#d4d8ec')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#e8eaf2')}
            onClick={e => { e.stopPropagation(); handleLoadDemo(); }}
          >
            <Sparkles size={11} /> Demo
          </button>

          <button
            disabled={generating}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all"
            style={{
              backgroundColor: generating ? '#9ca3af' : '#58B888',
              color: '#fff',
              fontWeight: 500,
              cursor: generating ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => { if (!generating) (e.currentTarget as HTMLElement).style.backgroundColor = '#4aa577'; }}
            onMouseLeave={e => { if (!generating) (e.currentTarget as HTMLElement).style.backgroundColor = '#58B888'; }}
            onClick={e => { e.stopPropagation(); if (!generating) handleGenerateBDD(); }}
          >
            {generating
              ? <><Loader2 size={11} className="animate-spin" /> Generando…</>
              : <><Sparkles size={11} /> Generar BDD</>
            }
          </button>

          {inputExpanded
            ? <ChevronUp size={14} className="text-muted-foreground flex-shrink-0" />
            : <ChevronDown size={14} className="text-muted-foreground flex-shrink-0" />
          }
        </div>

        <AnimatePresence initial={false}>
          {inputExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <div className="p-4 space-y-4">

                {/* ── Archivos de entrada ── */}
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide block mb-2">
                    Archivos de Entrada
                  </Label>
                  <div className="grid grid-cols-1 gap-3">

                    {/* Documento de requerimiento */}
                    <div
                      className="rounded-xl p-4 cursor-pointer transition-all"
                      style={{
                        border: reqFile ? '1.5px solid #bbf7d0' : '1.5px dashed rgba(0,0,0,0.13)',
                        backgroundColor: reqFile ? '#f0fdf4' : '#fafbfc',
                        pointerEvents: 'none',
                        opacity: 0.75,
                        display: 'none',
                      }}
                      onClick={() => !reqFile && reqFileRef.current?.click()}
                      onMouseEnter={e => { if (!reqFile) (e.currentTarget as HTMLElement).style.backgroundColor = '#f3f5f8'; }}
                      onMouseLeave={e => { if (!reqFile) (e.currentTarget as HTMLElement).style.backgroundColor = '#fafbfc'; }}
                    >
                      {reqFile ? (
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: '#dcfce7' }}>
                            <FileText size={16} style={{ color: '#16a34a' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">{reqFile}</p>
                            <p className="text-xs text-muted-foreground">Documento de requerimiento</p>
                          </div>
                          <button
                            onClick={e => { e.stopPropagation(); setReqFile(null); }}
                            className="w-6 h-6 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                            style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fecdd3')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.06)')}
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: '#f0f2f5' }}>
                            <Upload size={16} className="text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-foreground">Documento de Requerimiento</p>
                            <p className="text-xs text-muted-foreground">.txt · .md · .pdf · .docx</p>
                          </div>
                        </div>
                      )}
                      <input ref={reqFileRef} type="file" className="hidden" accept=".txt,.md,.pdf,.docx"
                        onChange={e => { void handleRequirementFileUpload(e.target.files?.[0] ?? null); }} />
                    </div>

                    {/* Código fuente */}
                    <div
                      className="rounded-xl p-4 cursor-pointer transition-all"
                      style={{
                        border: codeFiles.length > 0 ? '1.5px solid #c7d2fe' : '1.5px dashed rgba(0,0,0,0.13)',
                        backgroundColor: codeFiles.length > 0 ? '#f5f3ff' : '#fafbfc',
                      }}
                      onClick={() => codeFileRef.current?.click()}
                      onMouseEnter={e => { if (codeFiles.length === 0) (e.currentTarget as HTMLElement).style.backgroundColor = '#f3f5f8'; }}
                      onMouseLeave={e => { if (codeFiles.length === 0) (e.currentTarget as HTMLElement).style.backgroundColor = '#fafbfc'; }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: codeFiles.length > 0 ? '#ede9fe' : '#f0f2f5' }}>
                          <Code2 size={16} style={{ color: codeFiles.length > 0 ? '#7c3aed' : '#9ca3af' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground">
                            {codeFiles.length > 0
                              ? `${codeFiles.length} archivo${codeFiles.length !== 1 ? 's' : ''} de código`
                              : 'Código Fuente'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {codeFiles.length > 0 ? 'Clic para agregar más' : 'Múltiples archivos · cualquier lenguaje'}
                          </p>
                        </div>
                        {codeFiles.length > 0 && (
                          <button
                            onClick={e => { e.stopPropagation(); setCodeFiles([]); }}
                            className="w-6 h-6 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                            style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fecdd3')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.06)')}
                          >
                            <X size={10} />
                          </button>
                        )}
                      </div>
                      {codeFiles.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2.5 pt-2.5"
                          style={{ borderTop: '1px solid rgba(124,58,237,0.1)' }}>
                          {codeFiles.map(f => (
                            <FileChip key={f.fileName} name={f.fileName}
                              onRemove={() => setCodeFiles(p => p.filter(x => x.fileName !== f.fileName))} />
                          ))}
                        </div>
                      )}
                      <input ref={codeFileRef} type="file" className="hidden" multiple
                        onChange={e => handleCodeFileUpload(e.target.files)} />
                    </div>
                  </div>
                </div>

                {/* ── Descripción + ID/Título (izq.) | Criterios (der.) — 50/50, debajo de archivos ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 lg:items-start" style={{ display: 'none' }}>
                  {/* Columna izquierda: descripción compacta arriba, ID y título abajo (50/50) */}
                  <div className="flex flex-col gap-4 min-h-0 w-full">
                    <div className="flex flex-col shrink-0">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide block mb-1.5">
                        Descripción del Requerimiento
                      </Label>
                      <Textarea
                        value={requirementText}
                        onChange={e => setRequirementText(e.target.value)}
                        className="resize-none text-sm w-full min-h-[72px] max-h-[96px] py-2 leading-snug"
                        rows={3}
                        placeholder="Describa el requerimiento o historia de usuario…"
                        disabled
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide block mb-1.5">ID</Label>
                        <Input
                          value={featureId}
                          onChange={e => setFeatureId(e.target.value)}
                          className="text-sm h-10 w-full"
                          placeholder="FUNC-001"
                          disabled
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide block mb-1.5">Título</Label>
                        <Input
                          value={requirementTitle}
                          onChange={e => setRequirementTitle(e.target.value)}
                          className="text-sm h-10 w-full"
                          placeholder="Nombre corto"
                          disabled
                        />
                      </div>
                    </div>
                  </div>

                  {/* Columna derecha: criterios — altura según contenido; scroll si hay muchos */}
                  <div className="flex flex-col min-h-0 w-full max-w-full">
                    <div className="flex items-center justify-between mb-2 gap-2 shrink-0">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                        Criterios de Aceptación
                      </Label>
                      <button
                        type="button"
                        onClick={addCriteria}
                        className="text-xs flex items-center gap-0.5 shrink-0 transition-colors"
                        style={{ color: '#58B888' }}
                        disabled
                      >
                        <Plus size={11} /> Agregar
                      </button>
                    </div>
                    <div
                      className="flex flex-col gap-2.5 rounded-xl p-3 overflow-y-auto min-h-[132px] max-h-[min(50vh,320px)] lg:max-h-[min(55vh,380px)]"
                      style={{ backgroundColor: '#f4f5f7', border: '1px solid rgba(0,0,0,0.08)' }}
                    >
                      {criteria.map((c, idx) => (
                        <div key={c.id} className="flex items-start gap-2 shrink-0">
                          <span
                            className="text-xs font-medium tabular-nums text-muted-foreground w-5 text-right flex-shrink-0 pt-2"
                          >
                            {idx + 1}.
                          </span>
                          <Textarea
                            value={c.text}
                            onChange={e => updateCriteria(c.id, e.target.value)}
                            rows={2}
                            className="flex-1 min-w-0 min-h-[30px] max-h-[88px] resize-y text-sm py-2 leading-snug bg-background border border-border shadow-sm"
                            placeholder="Criterio de aceptación…"
                            disabled
                          />
                          <button
                            type="button"
                            onClick={() => removeCriteria(c.id)}
                            className="text-muted-foreground hover:text-rose-500 transition-colors flex-shrink-0 p-1.5 rounded-md hover:bg-rose-50 mt-1"
                            aria-label="Eliminar criterio"
                            disabled
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      {criteria.length === 0 && (
                        <div
                          className="flex min-h-[100px] items-center justify-center px-4 py-6 rounded-lg"
                          style={{ border: '1px dashed rgba(0,0,0,0.12)', backgroundColor: 'rgba(255,255,255,0.6)' }}
                        >
                          <p className="text-xs text-muted-foreground italic text-center leading-relaxed">
                            Sin criterios — opcional
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ══════════════════════════════════════════════════
          SECCIÓN 3 — OUTPUT (solo aparece cuando hay algo)
      ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showOutput && (
          <motion.div
            ref={outputCardRef}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-lg bg-white"
            style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            {/* Tab bar */}
            <div className="relative" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              {tabsCanScrollLeft && (
                <button
                  onClick={() => scrollTabs('left')}
                  className="absolute left-0 top-0 h-full z-10 flex items-center px-1.5"
                  style={{ background: 'linear-gradient(to left, transparent, white 65%)', paddingRight: '16px' }}
                >
                  <span className="flex items-center justify-center w-5 h-5 rounded-full"
                    style={{ backgroundColor: '#f0f2f5', color: '#202950' }}>
                    <ChevronLeft size={12} />
                  </span>
                </button>
              )}

              <div
                ref={tabsScrollRef}
                onScroll={handleTabsScroll}
                className="flex items-center gap-1 py-2.5 overflow-x-auto"
                style={{
                  scrollbarWidth: 'none',
                  paddingLeft:  tabsCanScrollLeft  ? '30px' : '12px',
                  paddingRight: tabsCanScrollRight ? '30px' : '12px',
                }}
              >
                {([
                  { id: 'scenarios'   as const, label: 'Escenarios',    icon: FileText      },
                  { id: 'ambiguities' as const, label: 'Ambigüedades',  icon: AlertTriangle },
                  { id: 'mismatches'  as const, label: 'Discrepancias', icon: GitCompare    },
                  { id: 'coverage'    as const, label: 'Cobertura',     icon: BarChart3     },
                ]).map(tab => {
                  const Icon    = tab.icon;
                  const active  = outputTab === tab.id;
                  const ambN    = bddResult?.ambiguities.length ?? 0;
                  const misN    = bddResult?.mismatches.length ?? 0;
                  const badge   =
                    tab.id === 'ambiguities' && bddResult && ambN > 0 ? ambN :
                    tab.id === 'mismatches'  && bddResult && misN > 0 ? misN : null;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setOutputTab(tab.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all flex-shrink-0"
                      style={{
                        backgroundColor: active ? '#eef0f8' : 'transparent',
                        color:           active ? '#3d4f8a' : '#717182',
                        border:          active ? '1px solid #d4d8ec' : '1px solid transparent',
                        fontWeight:      active ? 500 : 400,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Icon size={12} />
                      {tab.label}
                      {badge !== null && (
                        <span
                          className="ml-0.5 px-1.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: tab.id === 'mismatches' ? '#fff1f2' : '#fffbeb',
                            color:           tab.id === 'mismatches' ? '#9f1239' : '#92400e',
                            fontSize: '10px',
                          }}
                        >
                          {badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {tabsCanScrollRight && (
                <button
                  onClick={() => scrollTabs('right')}
                  className="absolute right-0 top-0 h-full z-10 flex items-center px-1.5"
                  style={{ background: 'linear-gradient(to right, transparent, white 65%)', paddingLeft: '16px' }}
                >
                  <span className="flex items-center justify-center w-5 h-5 rounded-full"
                    style={{ backgroundColor: '#f0f2f5', color: '#202950' }}>
                    <ChevronRight size={12} />
                  </span>
                </button>
              )}
            </div>

            {/* Output body */}
            <div className="p-5">

              {/* ── Cargando ── */}
              {generating && (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  {/* Animación de "pensamiento" */}
                  <div className="relative mb-6">
                    <motion.div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: '#f0fdf4', border: '1px solid #d1fae5' }}
                      animate={{ scale: [1, 1.06, 1] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Sparkles size={24} style={{ color: '#58B888' }} />
                    </motion.div>
                    {/* Puntos orbitando */}
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: ['#58B888', '#202950', '#8b5cf6'][i],
                          top: '50%', left: '50%',
                          marginTop: -4, marginLeft: -4,
                        }}
                        animate={{
                          x: [0, Math.cos((i * 2 * Math.PI) / 3) * 32],
                          y: [0, Math.sin((i * 2 * Math.PI) / 3) * 32],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 1.8,
                          repeat: Infinity,
                          delay: i * 0.6,
                          ease: 'easeInOut',
                        }}
                      />
                    ))}
                  </div>

                  <p className="text-sm font-medium text-foreground mb-1">Analizando con IA…</p>
                  <p className="text-xs text-muted-foreground mb-5 max-w-xs">
                    Procesando el requerimiento y generando escenarios BDD con el endpoint N8N
                  </p>

                  {/* Pasos animados */}
                  <div className="flex flex-col gap-2 items-start">
                    {[
                      'Enviando contexto al endpoint N8N…',
                      'Procesando con el modelo de IA…',
                      'Construyendo escenarios Gherkin…',
                    ].map((step, i) => (
                      <motion.div
                        key={step}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.4, duration: 0.3 }}
                      >
                        <Loader2 size={10} className="animate-spin flex-shrink-0"
                          style={{ animationDelay: `${i * 200}ms` }} />
                        {step}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Error ── */}
              {error && !generating && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                    style={{
                      backgroundColor: error.isOffline ? '#fffbeb' : '#fff1f2',
                      border: `1px solid ${error.isOffline ? '#fde68a' : '#fecdd3'}`,
                    }}>
                    {error.isOffline
                      ? <WifiOff size={22} style={{ color: '#f59e0b' }} />
                      : <AlertTriangle size={22} style={{ color: '#f43f5e' }} />}
                  </div>
                  <h3 className="text-foreground mb-2">
                    {error.isOffline ? 'Servicio N8N no disponible' : 'Error en la generación'}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm mb-5">{error.message}</p>
                  <button
                    onClick={handleGenerateBDD}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors"
                    style={{ backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid rgba(0,0,0,0.1)' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#e5e7eb')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                  >
                    <Sparkles size={14} /> Reintentar
                  </button>
                </div>
              )}

              {/* ── Escenarios ── */}
              {bddResult && !generating && outputTab === 'scenarios' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded flex items-center justify-center"
                        style={{ backgroundColor: '#f0fdf4' }}>
                        <CheckCircle2 size={12} style={{ color: '#58B888' }} />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {bddResult.scenarios.length} escenario{bddResult.scenarios.length !== 1 ? 's' : ''} generados
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground truncate max-w-xs">{bddResult.feature_title}</span>
                  </div>
                  <BDDScenarioBlock
                    key={gherkinOutputKey}
                    text={editedGherkin ?? bddResult.gherkin}
                    onSave={(next) => {
                      setEditedGherkin(next);
                      onPersistRequirementOutputs?.({
                        bddResult,
                        editedGherkin: next,
                        workspaceSnapshot,
                      });
                    }}
                  />
                  {onNavigateToScripts && (
                    <button
                      type="button"
                      onClick={onNavigateToScripts}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors mt-4"
                      style={{
                        backgroundColor: '#e8eaf2',
                        color: '#202950',
                        border: '1px solid #c8ccd6',
                      }}
                    >
                      Ir a scripts <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              )}

              {/* ── Ambigüedades ── */}
              {bddResult && !generating && outputTab === 'ambiguities' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={14} style={{ color: '#f59e0b' }} />
                    <span className="text-sm font-medium text-foreground">
                      {bddResult.ambiguities.length} ambigüedad{bddResult.ambiguities.length !== 1 ? 'es' : ''} detectada{bddResult.ambiguities.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {bddResult.ambiguities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <CheckCircle2 size={26} className="mb-2" style={{ color: '#58B888' }} />
                      <p className="text-sm text-muted-foreground">Sin ambigüedades detectadas.</p>
                    </div>
                  ) : bddResult.ambiguities.map((text, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 rounded-lg"
                      style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                      <AlertTriangle size={13} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <span className="text-xs font-medium" style={{ color: '#92400e' }}>Ambigüedad #{idx + 1}</span>
                        <p className="text-sm text-foreground mt-0.5">{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Discrepancias ── */}
              {bddResult && !generating && outputTab === 'mismatches' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <GitCompare size={14} style={{ color: '#f43f5e' }} />
                    <span className="text-sm font-medium text-foreground">
                      {bddResult.mismatches.length} discrepancia{bddResult.mismatches.length !== 1 ? 's' : ''} encontrada{bddResult.mismatches.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {bddResult.mismatches.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <CheckCircle2 size={26} className="mb-2" style={{ color: '#58B888' }} />
                      <p className="text-sm text-muted-foreground">Código alineado con la especificación.</p>
                    </div>
                  ) : bddResult.mismatches.map((text, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 rounded-lg"
                      style={{ backgroundColor: '#fff1f2', border: '1px solid #fecdd3' }}>
                      <GitCompare size={13} style={{ color: '#f43f5e', flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <span className="text-xs font-medium" style={{ color: '#9f1239' }}>Discrepancia #{idx + 1}</span>
                        <p className="text-sm text-foreground mt-0.5">{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Cobertura ── */}
              {bddResult && coverageSummary && !generating && outputTab === 'coverage' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 size={14} style={{ color: '#202950' }} />
                      <span className="text-sm font-medium text-foreground">Análisis de Cobertura</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full"
                      style={{ backgroundColor: '#f0fdf4', border: '1px solid #d1fae5' }}>
                      <span className="text-sm font-semibold" style={{ color: '#58B888' }}>{total}</span>
                      <span className="text-xs text-muted-foreground">escenarios totales</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {COVERAGE_META.map(item => {
                      const value = coverageSummary[item.key];
                      return (
                        <div key={item.key} className="p-4 rounded-lg text-center"
                          style={{ backgroundColor: item.bg, border: `1px solid ${item.border}` }}>
                          <div className="text-2xl font-semibold mb-0.5" style={{ color: item.color }}>{value}</div>
                          <div className="text-xs font-medium" style={{ color: item.color }}>{item.label}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-lg p-4"
                    style={{ border: '1px solid rgba(0,0,0,0.07)', backgroundColor: '#fafafa' }}>
                    <h4 className="text-sm text-foreground mb-4">Distribución de Cobertura</h4>
                    <div className="space-y-3">
                      {COVERAGE_META.map(item => {
                        const value = coverageSummary[item.key];
                        const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                        return (
                          <div key={item.key} className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground w-36 flex-shrink-0">{item.label}</span>
                            <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: '#f3f4f6' }}>
                              <div className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%`, backgroundColor: item.color }} />
                            </div>
                            <span className="text-xs text-muted-foreground w-5 text-right">{value}</span>
                            <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {(bddResult.raw_structured_output?.background?.length ?? 0) > 0 && (
                    <div className="rounded-lg p-4"
                      style={{ border: '1px solid rgba(0,0,0,0.07)', backgroundColor: '#fafafa' }}>
                      <h4 className="text-sm text-foreground mb-3">Antecedentes del Escenario</h4>
                      <ul className="space-y-2">
                        {(bddResult.raw_structured_output?.background ?? []).map((bg, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="mt-2 w-1 h-1 rounded-full flex-shrink-0"
                              style={{ backgroundColor: '#58B888' }} />
                            {bg}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drawer — Gestión de roles (CRUD + selección en contexto) */}
      <Drawer open={rolesDrawerOpen} onOpenChange={setRolesDrawerOpen} direction="right" shouldScaleBackground={false}>
        <DrawerContent
          className="left-auto right-0 top-0 mt-0 h-full max-h-full w-[min(100vw,440px)] max-w-[min(100vw,440px)] rounded-none rounded-l-xl border-l flex flex-col gap-0 p-0 data-[vaul-drawer-direction=right]:mt-0"
        >
          <DrawerHeader className="border-b px-5 py-4 text-left">
            <DrawerTitle>Gestión de roles</DrawerTitle>
            <DrawerDescription className="text-xs">
              Cree roles, edítelos o elimínelos. Marque los que deben formar parte del contexto de IA.
            </DrawerDescription>
          </DrawerHeader>

          <div className="border-b px-5 py-4 space-y-2 shrink-0" onClick={e => e.stopPropagation()}>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Nuevo rol</span>
            <Input
              value={newRoleName}
              onChange={e => setNewRoleName(e.target.value)}
              placeholder="Nombre del rol"
              className="h-9 text-sm"
            />
            <Textarea
              value={newRoleDescription}
              onChange={e => setNewRoleDescription(e.target.value)}
              placeholder="Descripción (opcional)"
              className="text-sm min-h-[72px] resize-none"
            />
            <button
              type="button"
              onClick={handleAddCustomRole}
              disabled={!newRoleName.trim()}
              className="w-full flex items-center justify-center gap-1.5 text-sm py-2 rounded-lg font-medium transition-colors disabled:opacity-45"
              style={{
                backgroundColor: newRoleName.trim() ? '#58B888' : '#e5e7eb',
                color: newRoleName.trim() ? '#fff' : '#9ca3af',
              }}
            >
              <Plus size={14} /> Añadir y activar en contexto
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-3">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Roles disponibles</span>
            {aiRoles.length === 0 && (
              <p className="text-sm text-muted-foreground">No hay roles. Cree uno arriba.</p>
            )}
            {aiRoles.map(role => {
              const isEditing = editingRoleId === role.id;
              const inContext = selectedRoles.includes(role.name);
              return (
                <div
                  key={role.id}
                  className="rounded-xl p-3 space-y-2"
                  style={{ border: '1px solid rgba(0,0,0,0.08)', backgroundColor: '#fafbfc' }}
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-start gap-2">
                    <label className="flex items-center gap-2 cursor-pointer shrink-0 pt-0.5">
                      <input
                        type="checkbox"
                        checked={inContext}
                        onChange={() => toggleRole(role.name)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-[10px] text-muted-foreground leading-none">Contexto</span>
                    </label>
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <>
                          <Input
                            value={editRoleName}
                            onChange={e => setEditRoleName(e.target.value)}
                            className="h-8 text-sm mb-2"
                          />
                          <Textarea
                            value={editRoleDescription}
                            onChange={e => setEditRoleDescription(e.target.value)}
                            className="text-xs min-h-[64px] resize-none"
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              type="button"
                              onClick={saveEditRole}
                              disabled={!editRoleName.trim()}
                              className="text-xs px-2.5 py-1.5 rounded-md font-medium text-white disabled:opacity-45"
                              style={{ backgroundColor: '#202950' }}
                            >
                              Guardar
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditRole}
                              className="text-xs px-2.5 py-1.5 rounded-md border border-border"
                            >
                              Cancelar
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-foreground">{role.name}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                aria-label="Editar rol"
                                onClick={() => startEditRole(role)}
                                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-black/5"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                type="button"
                                aria-label="Eliminar rol"
                                onClick={() => handleDeleteRole(role)}
                                className="p-1.5 rounded-md text-muted-foreground hover:text-rose-600 hover:bg-rose-50"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{role.description}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <DrawerFooter className="border-t py-3">
            <DrawerClose asChild>
              <button
                type="button"
                className="w-full py-2.5 rounded-lg text-sm font-medium border border-border hover:bg-muted/50 transition-colors"
              >
                Cerrar
              </button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Drawer — Idiomas de script */}
      <Drawer open={languagesDrawerOpen} onOpenChange={setLanguagesDrawerOpen} direction="right" shouldScaleBackground={false}>
        <DrawerContent
          className="left-auto right-0 top-0 mt-0 h-full max-h-full w-[min(100vw,400px)] max-w-[min(100vw,400px)] rounded-none rounded-l-xl border-l flex flex-col gap-0 p-0 data-[vaul-drawer-direction=right]:mt-0"
        >
          <DrawerHeader className="border-b px-5 py-4 text-left">
            <DrawerTitle>Gestión de lenguajes</DrawerTitle>
            <DrawerDescription className="text-xs">
              Cree, edite o elimine entradas; el lenguaje activo se usa al generar BDD.
            </DrawerDescription>
          </DrawerHeader>

          <div className="border-b px-5 py-4 space-y-2 shrink-0" onClick={e => e.stopPropagation()}>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Nuevo lenguaje</span>
            <Input
              value={newLangName}
              onChange={e => setNewLangName(e.target.value)}
              placeholder="Nombre (ej. Kotlin, Swift)"
              className="h-9 text-sm"
            />
            <Textarea
              value={newLangDescription}
              onChange={e => setNewLangDescription(e.target.value)}
              placeholder="Descripción (opcional)"
              className="text-sm min-h-[72px] resize-none"
            />
            <button
              type="button"
              onClick={handleAddLanguage}
              disabled={!newLangName.trim()}
              className="w-full flex items-center justify-center gap-1.5 text-sm py-2 rounded-lg font-medium transition-colors disabled:opacity-45"
              style={{
                backgroundColor: newLangName.trim() ? '#202950' : '#e5e7eb',
                color: newLangName.trim() ? '#fff' : '#9ca3af',
              }}
            >
              <Plus size={14} /> Añadir y seleccionar
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-3">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Lenguaje activo (rápido)</span>
            <div className="flex flex-wrap gap-1.5 pb-2">
              {programmingLanguages.map(lang => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setLanguage(lang.name)}
                  className="text-xs px-2.5 py-1.5 rounded-full transition-all"
                  style={{
                    border: language === lang.name ? '1px solid #202950' : '1px solid rgba(0,0,0,0.1)',
                    backgroundColor: language === lang.name ? '#e8eaf2' : 'transparent',
                    color: language === lang.name ? '#202950' : '#717182',
                    fontWeight: language === lang.name ? 600 : 400,
                  }}
                >
                  {lang.name}
                </button>
              ))}
            </div>

            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Catálogo</span>
            {programmingLanguages.length === 0 && (
              <p className="text-sm text-muted-foreground">No hay lenguajes. Cree uno arriba o en la página de administración.</p>
            )}
            {programmingLanguages.map(lang => {
              const isEditing = editingLanguageId === lang.id;
              return (
                <div
                  key={lang.id}
                  className="rounded-xl p-3 space-y-2"
                  style={{ border: '1px solid rgba(0,0,0,0.08)', backgroundColor: '#fafbfc' }}
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <>
                          <Input
                            value={editLangName}
                            onChange={e => setEditLangName(e.target.value)}
                            className="h-8 text-sm mb-2"
                          />
                          <Textarea
                            value={editLangDescription}
                            onChange={e => setEditLangDescription(e.target.value)}
                            className="text-xs min-h-[64px] resize-none"
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              type="button"
                              onClick={saveEditLanguage}
                              disabled={!editLangName.trim()}
                              className="text-xs px-2.5 py-1.5 rounded-md font-medium text-white disabled:opacity-45"
                              style={{ backgroundColor: '#202950' }}
                            >
                              Guardar
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditLanguage}
                              className="text-xs px-2.5 py-1.5 rounded-md border border-border"
                            >
                              Cancelar
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-foreground">{lang.name}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                aria-label="Editar lenguaje"
                                onClick={() => startEditLanguage(lang)}
                                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-black/5"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                type="button"
                                aria-label="Eliminar lenguaje"
                                onClick={() => handleDeleteLanguage(lang)}
                                className="p-1.5 rounded-md text-muted-foreground hover:text-rose-600 hover:bg-rose-50"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{lang.description}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <DrawerFooter className="border-t py-3">
            <DrawerClose asChild>
              <button
                type="button"
                className="w-full py-2.5 rounded-lg text-sm font-medium border border-border hover:bg-muted/50 transition-colors"
              >
                Cerrar
              </button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
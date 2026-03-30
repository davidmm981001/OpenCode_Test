import React, { useMemo, useState } from 'react';
import { ChevronLeft, FolderOpen, FileText, Sparkles, Bot } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../../components/ui/button';
import { useApp } from '../../context/AppContext';
import type { Project } from '../../data/mockData';
import type { Requirement } from '../../types/requirements';
import { RequirementResumenTab } from './RequirementResumenTab';
import { FunctionalAnalysisTab } from './FunctionalAnalysisTab';
import { ScriptsDePruebaTab } from './ScriptsDePruebaTab';
import type { BddWorkspaceSnapshot } from '../../types/generation';
import type { ZipFileMap } from '../../lib/zipArchetype';

type RequirementInternalTab = 'resumen' | 'functional-analysis' | 'scripts-de-prueba';

export function RequirementDetailView({
  project,
  requirement,
  onBackToList,
  archetypeFileMapByFramework,
  initialTab = 'resumen',
}: {
  project: Project;
  requirement: Requirement;
  onBackToList: () => void;
  archetypeFileMapByFramework: Record<string, ZipFileMap | null>;
  initialTab?: RequirementInternalTab;
}) {
  const { updateRequirement } = useApp();

  const [activeTab, setActiveTab] = useState<RequirementInternalTab>(initialTab);

  const [gherkinOutput, setGherkinOutput] = useState<string | null>(() => {
    return requirement.editedGherkin ?? requirement.bddResult?.gherkin ?? null;
  });
  const [bddWorkspaceSnapshot, setBddWorkspaceSnapshot] = useState<BddWorkspaceSnapshot | null>(() => {
    return requirement.workspaceSnapshot ?? null;
  });

  const hasGherkinOutput = useMemo(() => !!gherkinOutput, [gherkinOutput]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, requirement.id]);

  return (
    <div className="flex flex-col h-full">
      <motion.div
        className="bg-white px-6 pt-5 pb-4"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-3 mb-2">
          <Button variant="outline" size="sm" onClick={onBackToList} className="gap-2">
            <ChevronLeft size={14} /> Volver a Requerimientos
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-foreground text-lg truncate">
              {requirement.requirementTitle}
            </h1>
            <p className="text-sm text-muted-foreground truncate">
              {project.name} · ID: {requirement.featureId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-0 -mb-px">
          <button
            onClick={() => setActiveTab('resumen')}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm transition-colors relative"
            style={{
              color: activeTab === 'resumen' ? '#030213' : '#717182',
              fontWeight: activeTab === 'resumen' ? 500 : 400,
              borderBottom: activeTab === 'resumen' ? '2px solid #030213' : '2px solid transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <FileText size={14} /> Resumen
          </button>
          <button
            onClick={() => setActiveTab('functional-analysis')}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm transition-colors relative"
            style={{
              color: activeTab === 'functional-analysis' ? '#030213' : '#717182',
              fontWeight: activeTab === 'functional-analysis' ? 500 : 400,
              borderBottom: activeTab === 'functional-analysis' ? '2px solid #030213' : '2px solid transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <Bot size={14} /> Análisis Funcional
          </button>
          <button
            onClick={() => hasGherkinOutput && setActiveTab('scripts-de-prueba')}
            disabled={!hasGherkinOutput}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm transition-colors relative"
            style={{
              color: !hasGherkinOutput ? '#c8ccd6' : activeTab === 'scripts-de-prueba' ? '#030213' : '#717182',
              fontWeight: activeTab === 'scripts-de-prueba' ? 500 : 400,
              borderBottom: activeTab === 'scripts-de-prueba' ? '2px solid #030213' : '2px solid transparent',
              cursor: !hasGherkinOutput ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              opacity: !hasGherkinOutput ? 0.8 : 1,
            }}
          >
            <Sparkles size={14} /> Scripts de Prueba
          </button>
        </div>
      </motion.div>

      <div className="flex-1 min-h-0 overflow-hidden" style={{ backgroundColor: '#f5f6fa' }}>
        <div className="h-full min-h-0">
          <div className={`h-full min-h-0 overflow-y-auto ${activeTab === 'resumen' ? '' : 'hidden'}`} aria-hidden={activeTab !== 'resumen'}>
            <RequirementResumenTab requirement={requirement} />
          </div>
          <div
            className={`h-full min-h-0 overflow-y-auto ${activeTab === 'functional-analysis' ? '' : 'hidden'}`}
            aria-hidden={activeTab !== 'functional-analysis'}
          >
            <FunctionalAnalysisTab
              key={requirement.id}
              requirement={requirement}
              onGherkinOutputChange={setGherkinOutput}
              onNavigateToScripts={() => setActiveTab('scripts-de-prueba')}
              onWorkspaceContextForScripts={setBddWorkspaceSnapshot}
              onPersistRequirementOutputs={({ bddResult, editedGherkin, workspaceSnapshot }) => {
                updateRequirement(requirement.id, {
                  bddResult,
                  editedGherkin,
                  workspaceSnapshot,
                });
              }}
            />
          </div>
          <div
            className={`h-full min-h-0 overflow-y-auto ${activeTab === 'scripts-de-prueba' ? '' : 'hidden'}`}
            aria-hidden={activeTab !== 'scripts-de-prueba'}
          >
            <ScriptsDePruebaTab
              key={requirement.id}
              gherkinOutput={gherkinOutput}
              project={project}
              workspaceSnapshot={bddWorkspaceSnapshot}
              archetypeFileMapByFramework={archetypeFileMapByFramework}
            />
          </div>
        </div>
      </div>
    </div>
  );
}


import type { UserStory } from '../types/usTcFlow';

function formatDetailSections(detail: NonNullable<UserStory['detail']>): string {
  const lines: string[] = [];
  if (detail.actor.trim()) lines.push(`Actor: ${detail.actor.trim()}`);
  if (detail.functionalFlow.trim()) lines.push(`Flujo funcional:\n${detail.functionalFlow.trim()}`);
  if (detail.screensInvolved.trim()) lines.push(`Pantallas / superficies: ${detail.screensInvolved.trim()}`);
  if (detail.businessRules.trim()) lines.push(`Reglas de negocio:\n${detail.businessRules.trim()}`);
  if (detail.technicalNotes.trim()) lines.push(`Notas técnicas:\n${detail.technicalNotes.trim()}`);
  return lines.length ? `\n\n${lines.join('\n\n')}` : '';
}

/** Text blob sent to the app-generation orchestrator (OpenSpec / generation). */
export function buildSddUserStoriesBlob(stories: UserStory[]): string {
  if (stories.length === 0) {
    return '(Sin historias de usuario en este proyecto. Añada historias en la pestaña Historias.)';
  }
  return stories
    .map((s, i) => {
      const crit =
        s.criteria.length > 0
          ? `\nCriterios:\n${s.criteria.map((c, j) => `  ${j + 1}. ${c}`).join('\n')}`
          : '';
      const extra = s.detail ? formatDetailSections(s.detail) : '';
      return `## ${i + 1}. ${s.title}\nMódulo: ${s.module}\n\n${s.description}${extra}${crit}`;
    })
    .join('\n\n---\n\n');
}

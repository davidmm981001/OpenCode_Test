import type { UserStory } from '../types/usTcFlow';

export interface SddUserStoriesBlobMetadata {
  projectId: string;
  sourceRunId: string | null;
}

function formatSourceRunId(sourceRunId: string | null): string {
  return sourceRunId?.trim() || 'null';
}

function formatMetadataHeader(metadata: SddUserStoriesBlobMetadata): string {
  return `<!-- nexti-sdd-meta ${JSON.stringify({
    projectId: metadata.projectId.trim(),
    sourceRunId: metadata.sourceRunId?.trim() || null,
  })} -->\n\n`;
}

export function getSddUserStoriesSourceRunId(stories: UserStory[]): string | null {
  const latestGeneratedStory = [...stories]
    .filter((story) => Boolean(story.sourceRunId?.trim()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  return latestGeneratedStory?.sourceRunId?.trim() ?? null;
}

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
export function buildSddUserStoriesBlob(
  stories: UserStory[],
  metadata?: SddUserStoriesBlobMetadata,
): string {
  const header = metadata ? formatMetadataHeader(metadata) : '';
  if (stories.length === 0) {
    return `${header}(Sin historias de usuario en este proyecto. Añada historias en la pestaña Historias.)`;
  }
  const body = stories
    .map((s, i) => {
      const sourceRunId = formatSourceRunId(s.sourceRunId);
      const crit =
        s.criteria.length > 0
          ? `\nCriterios:\n${s.criteria.map((c, j) => `  ${j + 1}. ${c}`).join('\n')}`
          : '';
      const extra = s.detail ? formatDetailSections(s.detail) : '';
      return `## ${i + 1}. ${s.title}\nsourceRunId: ${sourceRunId}\nMódulo: ${s.module}\n\n${s.description}${extra}${crit}`;
    })
    .join('\n\n---\n\n');
  return `${header}${body}`;
}

export function extractSddUserStoriesSourceRunIds(blob: string): string[] {
  return [...blob.matchAll(/^sourceRunId:\s*(.+)$/gim)]
    .map((match) => match[1].trim())
    .filter((sourceRunId) => sourceRunId && sourceRunId !== 'null');
}

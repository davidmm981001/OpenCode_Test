import type { ZipFileMap } from './zipArchetype';

export type FrameworkCategoryId = 'api' | 'web' | 'performance';

/** Same categories/slots as project settings (arquetipos). */
export const PROJECT_FRAMEWORK_CATEGORIES: Array<{
  id: FrameworkCategoryId;
  label: string;
  frameworks: string[];
}> = [
  { id: 'api', label: 'API testing', frameworks: ['Karate', 'Playwright'] },
  { id: 'web', label: 'Web testing', frameworks: ['Playwright', 'Selenium', 'Serenity'] },
  { id: 'performance', label: 'Performance', frameworks: ['k6', 'JMeter'] },
];

export function slotIdFor(catId: FrameworkCategoryId, framework: string): string {
  return `${catId}:${framework}`;
}

export const ALL_PROJECT_FRAMEWORK_SLOTS = PROJECT_FRAMEWORK_CATEGORIES.flatMap(cat =>
  cat.frameworks.map(fw => slotIdFor(cat.id, fw)),
);

export function defaultFrameworkByCategory(): Record<FrameworkCategoryId, string> {
  return PROJECT_FRAMEWORK_CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat.id] = cat.frameworks[0];
      return acc;
    },
    {} as Record<FrameworkCategoryId, string>,
  );
}

/**
 * Infer which framework is “active” per category from uploaded archetype maps
 * (same logic as opening the arquetipos sheet in Projects).
 */
export function deriveFrameworkSelectionFromArchetypeMaps(
  maps: Record<string, ZipFileMap | null>,
): Record<FrameworkCategoryId, string> {
  const next: Record<FrameworkCategoryId, string> = {
    ...defaultFrameworkByCategory(),
  };

  for (const cat of PROJECT_FRAMEWORK_CATEGORIES) {
    const found = cat.frameworks.find(fw => maps[slotIdFor(cat.id, fw)] != null);
    if (found) next[cat.id] = found;
  }

  return next;
}

/** Persisted per project: `null` = N/A / no framework for that category. */
export type ProjectFrameworkCategoryPersisted = Record<FrameworkCategoryId, string | null>;

export function resolveFrameworkSelectionForProject(
  persisted: Partial<ProjectFrameworkCategoryPersisted> | undefined,
  maps: Record<string, ZipFileMap | null>,
): ProjectFrameworkCategoryPersisted {
  const derived = deriveFrameworkSelectionFromArchetypeMaps(maps);
  if (!persisted) {
    return { api: derived.api, web: derived.web, performance: derived.performance };
  }
  return {
    api: persisted.api !== undefined ? persisted.api : derived.api,
    web: persisted.web !== undefined ? persisted.web : derived.web,
    performance:
      persisted.performance !== undefined ? persisted.performance : derived.performance,
  };
}

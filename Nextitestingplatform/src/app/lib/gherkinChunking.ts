/**
 * Splits large Gherkin (many Escenario / Scenario blocks) so script generation can run in
 * multiple n8n calls — each LLM response stays within practical output limits.
 */

/** Smaller batches = smaller JSON per n8n call → less chance of LLM truncating mid-string (batch 10+ failures). */
export const DEFAULT_SCENARIOS_PER_SCRIPT_CHUNK = 3;

export interface SplitGherkinResult {
  header: string;
  /** Each string is one scenario block (includes # TC id line when present). */
  scenarios: string[];
}

/**
 * Prefer blocks starting with `# TC id:` (automation tab format).
 * Fallback: split on `Escenario:` (Spanish) or `Scenario:` (English / Karate).
 */
export function splitGherkinScenarios(gherkin: string): SplitGherkinResult {
  const trimmed = gherkin.trim();
  if (!trimmed) return { header: '', scenarios: [] };

  const byTc = trimmed.split(/\n(?=#\s*TC id:)/);
  if (byTc.length > 1) {
    const header = byTc[0]?.trim() ?? '';
    const scenarios = byTc
      .slice(1)
      .map((s) => s.trim())
      .filter(Boolean);
    return { header, scenarios };
  }

  const byScenario = trimmed.split(/\n(?=Escenario:|Scenario:)/);
  const header = byScenario[0]?.trim() ?? '';
  const scenarios = byScenario
    .slice(1)
    .map((s) => s.trim())
    .filter(Boolean);
  return { header, scenarios };
}

/**
 * Returns one Gherkin string per chunk, or a single-element array if small enough.
 */
export function chunkGherkinForScriptGeneration(
  gherkin: string,
  maxScenariosPerChunk: number = DEFAULT_SCENARIOS_PER_SCRIPT_CHUNK,
): string[] {
  const { header, scenarios } = splitGherkinScenarios(gherkin);
  if (scenarios.length === 0) {
    return [gherkin];
  }
  if (scenarios.length <= maxScenariosPerChunk) {
    return [gherkin];
  }

  const chunks: string[][] = [];
  for (let i = 0; i < scenarios.length; i += maxScenariosPerChunk) {
    chunks.push(scenarios.slice(i, i + maxScenariosPerChunk));
  }

  const total = chunks.length;
  return chunks.map((block, idx) => {
    const note =
      total > 1
        ? `\n\n[Instrucción: este es el lote ${idx + 1} de ${total}. Debes implementar en los archivos generados TODOS los escenarios listados abajo, sin omitir ninguno. Para Karate: Gherkin en inglés; en cada escenario el orden debe ser url → request → method (nunca method antes de request); usa email/password coherentes; no pongas -partN en el nombre del archivo .feature.]`
        : '';
    return `${header}\n\n${block.join('\n\n')}${note}`;
  });
}

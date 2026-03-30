/**
 * LLM often returns { text: "{ ... }" } where inner JSON breaks JSON.parse because:
 * - Invalid escapes inside string values (e.g. \d, \w in TS snippets — JSON only allows \" \\ \/ \b \f \n \r \t \uXXXX)
 * - Markdown fences, trailing commas, or prose before/after the object
 */
function tryParseJson(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

/** Escape backslashes that are invalid in JSON string literals (fixes \d, \w, etc.) */
function fixInvalidJsonEscapes(s) {
  return s.replace(/\\(?![\\/"bfnrtu]|u[0-9a-fA-F]{4})/g, '\\\\');
}

function normalizeLlmJsonPayload(s) {
  let t = String(s).trim();
  const fence = t.match(/^```(?:json)?\s*([\s\S]*?)```$/m);
  if (fence) t = fence[1].trim();
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start >= 0 && end > start) t = t.slice(start, end + 1);
  t = t.replace(/,(\s*[}\]])/g, '$1');
  return fixInvalidJsonEscapes(t);
}

function extractParsedPayload(root) {
  if (!root || typeof root !== 'object') return null;
  if (Array.isArray(root.playwrightFiles) && Array.isArray(root.cucumberFiles)) return root;

  const raw =
    root.text ?? root.response ?? root.output ?? (root.message && root.message.content);
  if (raw == null) return null;

  if (typeof raw === 'object' && Array.isArray(raw.playwrightFiles) && Array.isArray(raw.cucumberFiles)) return raw;

  if (typeof raw !== 'string') {
    const s = JSON.stringify(raw);
    return tryParseJson(normalizeLlmJsonPayload(s)) || tryParseJson(s);
  }

  let parsed = tryParseJson(raw);
  if (parsed && Array.isArray(parsed.playwrightFiles) && Array.isArray(parsed.cucumberFiles)) return parsed;

  parsed = tryParseJson(normalizeLlmJsonPayload(raw));
  if (parsed && Array.isArray(parsed.playwrightFiles) && Array.isArray(parsed.cucumberFiles)) return parsed;

  return null;
}

const parsed = extractParsedPayload($json);

if (!parsed) {
  const preview =
    typeof ($json && $json.text) === 'string'
      ? $json.text.slice(0, 800)
      : JSON.stringify($json).slice(0, 800);
  throw new Error(
    'Could not parse LLM output as JSON with playwrightFiles/cucumberFiles. First 800 chars of text: ' +
      preview,
  );
}

if (!Array.isArray(parsed.playwrightFiles) || !Array.isArray(parsed.cucumberFiles)) {
  throw new Error('Missing playwrightFiles/cucumberFiles arrays. Keys: ' + Object.keys(parsed).join(','));
}

return [
  {
    json: {
      playwrightFiles: parsed.playwrightFiles,
      cucumberFiles: parsed.cucumberFiles,
    },
  },
];

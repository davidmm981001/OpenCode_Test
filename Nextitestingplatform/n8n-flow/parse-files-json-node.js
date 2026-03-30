/**
 * Paste into n8n "Parse Files JSON" Code node (or keep in repo as reference).
 * Handles: markdown fences without closing ```, balanced JSON extraction, trailing junk.
 */

function tryParseJson(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

/** Strip ```json / ``` at start; strip closing ``` if present (optional). */
function stripMarkdownFence(s) {
  let t = String(s).trim();
  if (t.startsWith('```')) {
    const nl = t.indexOf('\n');
    t = nl > 0 ? t.slice(nl + 1) : t.replace(/^```\w*\s*/i, '');
  }
  const idx = t.lastIndexOf('\n```');
  if (idx >= 0) {
    t = t.slice(0, idx).trim();
  } else if (t.endsWith('```')) {
    t = t.slice(0, -3).trim();
  }
  return t.trim();
}

/** Extract one balanced {...} from first `{`, respecting strings (handles nested braces in strings). */
function extractBalancedJsonFrom(s) {
  const start = s.indexOf('{');
  if (start < 0) return null;
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (esc) {
      esc = false;
      continue;
    }
    if (inStr) {
      if (c === '\\' && i + 1 < s.length) {
        esc = true;
        continue;
      }
      if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') {
      inStr = true;
      continue;
    }
    if (c === '{') depth++;
    if (c === '}') {
      depth--;
      if (depth === 0) return s.slice(start, i + 1);
    }
  }
  return null;
}

function tryParseLlmJson(raw) {
  if (raw == null) return null;
  if (typeof raw === 'object' && Array.isArray(raw.frameworkFiles)) return raw;
  if (typeof raw !== 'string') return null;

  const stripped = stripMarkdownFence(raw);
  const direct = tryParseJson(stripped);
  if (direct && Array.isArray(direct.frameworkFiles)) return direct;

  const balanced = extractBalancedJsonFrom(stripped);
  if (balanced) {
    const p = tryParseJson(balanced);
    if (p && Array.isArray(p.frameworkFiles)) return p;
  }

  const loose = stripped.replace(/,(\s*[\]}])/g, '$1');
  const p2 = tryParseJson(loose);
  if (p2 && Array.isArray(p2.frameworkFiles)) return p2;

  return null;
}

function extractParsedPayload(root) {
  if (!root || typeof root !== 'object') return null;
  if (Array.isArray(root.frameworkFiles)) return root;

  const raw =
    root.text ?? root.response ?? root.output ?? (root.message && root.message.content);
  if (raw == null) return null;
  if (typeof raw === 'object') return raw;

  return tryParseLlmJson(typeof raw === 'string' ? raw : String(raw));
}

// n8n injects $json
const parsed = extractParsedPayload($json);
if (!parsed || !Array.isArray(parsed.frameworkFiles)) {
  const preview =
    typeof ($json && $json.text) === 'string' ? $json.text.slice(0, 800) : JSON.stringify($json).slice(0, 800);
  throw new Error(
    'Expected frameworkFiles[] in LLM output (check markdown fences, truncated JSON, or max tokens). Preview: ' +
      preview,
  );
}

const frameworkFiles = parsed.frameworkFiles
  .filter((f) => f && typeof f === 'object')
  .map((f) => ({
    framework: String(f.framework || '').trim(),
    path: String(f.path || '').trim(),
    content: String(f.content ?? ''),
  }))
  .filter((f) => f.framework && f.path);

const frameworkMessages = Array.isArray(parsed.frameworkMessages)
  ? parsed.frameworkMessages
      .filter((m) => m && typeof m === 'object')
      .map((m) => ({
        framework: String(m.framework || '').trim(),
        level: String(m.level || 'info').trim(),
        message: String(m.message || '').trim(),
      }))
      .filter((m) => m.framework && m.message)
  : [];

if (!frameworkFiles.length) {
  throw new Error('No frameworkFiles generated. Expected at least one output file.');
}

return [
  {
    json: {
      frameworkFiles,
      frameworkMessages,
    },
  },
];

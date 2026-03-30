/**
 * Calls the app-generation orchestrator HTTP API from the NexTI origin (CORS on orchestrator backend).
 */
function getSddApiBase(): string {
  const base = import.meta.env.VITE_SDD_ORCHESTRATOR_API_URL?.replace(/\/$/, '');
  if (!base) return '';
  return base;
}

export function isSddApiConfigured(): boolean {
  return Boolean(getSddApiBase());
}

export async function sddPatchProject(
  sddProjectId: string,
  body: { name?: string; userStories?: string },
): Promise<void> {
  const api = getSddApiBase();
  if (!api) throw new Error('La URL del servicio de generación no está configurada en .env.');
  const res = await fetch(`${api}/api/projects/${encodeURIComponent(sddProjectId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const payload = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(payload.message ?? `Error del servicio de generación (${res.status}).`);
  }
}

export async function sddCreateProject(name: string, userStories: string): Promise<{ id: string }> {
  const api = getSddApiBase();
  if (!api) throw new Error('La URL del servicio de generación no está configurada en .env.');
  const res = await fetch(`${api}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, userStories }),
  });
  if (!res.ok) {
    const payload = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(payload.message ?? `Error del servicio de generación (${res.status}).`);
  }
  const data = (await res.json()) as { id: string };
  if (!data.id) throw new Error('El servicio de generación no devolvió id de proyecto.');
  return { id: data.id };
}

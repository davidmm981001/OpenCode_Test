import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type UpsertCredentialRequest = {
  projectId?: string;
  jiraUserEmail?: string;
  jiraToken?: string;
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function bytesToBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function base64ToBytes(base64: string): Uint8Array {
  const raw = atob(base64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

async function encryptToken(plaintext: string): Promise<{ encryptedToken: string; iv: string }> {
  const secretBase64 = Deno.env.get('JIRA_CREDENTIALS_MASTER_KEY');
  if (!secretBase64?.trim()) {
    throw new Error('Missing JIRA_CREDENTIALS_MASTER_KEY secret.');
  }
  const keyBytes = base64ToBytes(secretBase64.trim());
  if (keyBytes.length !== 32) {
    throw new Error('JIRA_CREDENTIALS_MASTER_KEY must decode to 32 bytes (base64).');
  }
  const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext),
  );
  return {
    encryptedToken: bytesToBase64(new Uint8Array(encrypted)),
    iv: bytesToBase64(iv),
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return jsonResponse(405, { error: 'Method not allowed' });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !supabaseAnonKey) {
      return jsonResponse(500, { error: 'Missing SUPABASE_URL or SUPABASE_ANON_KEY' });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return jsonResponse(401, { error: 'Missing authorization header' });

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) return jsonResponse(401, { error: 'Unauthorized' });

    const payload = (await req.json()) as UpsertCredentialRequest;
    const projectId = String(payload.projectId ?? '').trim();
    const jiraUserEmail = String(payload.jiraUserEmail ?? '').trim().toLowerCase();
    const jiraToken = String(payload.jiraToken ?? '').trim();
    if (!projectId || !jiraUserEmail || !jiraToken) {
      return jsonResponse(400, { error: 'projectId, jiraUserEmail and jiraToken are required.' });
    }

    const { data: project, error: projectErr } = await supabase
      .from('projects')
      .select('id, owner_user_id')
      .eq('id', projectId)
      .eq('owner_user_id', authData.user.id)
      .maybeSingle();
    if (projectErr) return jsonResponse(400, { error: projectErr.message });
    if (!project) return jsonResponse(403, { error: 'Project not accessible.' });

    const nowIso = new Date().toISOString();

    const { data: existingConn } = await supabase
      .from('jira_project_connections')
      .select('base_url,project_key,credential_id,jira_user_email')
      .eq('project_id', projectId)
      .eq('owner_user_id', authData.user.id)
      .maybeSingle();

    let credentialId: number;
    const existingId =
      typeof existingConn?.credential_id === 'number' && Number.isFinite(existingConn.credential_id)
        ? Math.trunc(existingConn.credential_id)
        : null;
    if (!existingConn) {
      return jsonResponse(400, {
        error: 'Jira connection row not found. Save Jira project configuration first.',
      });
    }

    const baseUrl = String(existingConn.base_url ?? '').replace(/\/+$/, '');
    const projectKey = String(existingConn.project_key ?? '').trim();
    if (!baseUrl || !projectKey) {
      return jsonResponse(400, {
        error: 'Jira connection row is incomplete (missing baseUrl/projectKey).',
      });
    }

    // Validate token before encrypting/storing it.
    const jiraAuth = btoa(`${jiraUserEmail}:${jiraToken}`);
    const jiraTestRes = await fetch(
      `${baseUrl}/rest/api/3/project/${encodeURIComponent(projectKey)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Basic ${jiraAuth}`,
          Accept: 'application/json',
        },
      },
    );
    if (!jiraTestRes.ok) {
      const text = (await jiraTestRes.text()).slice(0, 500);
      return jsonResponse(400, {
        error: `Jira token validation failed (${jiraTestRes.status}): ${text || jiraTestRes.statusText}`,
      });
    }

    const { encryptedToken, iv } = await encryptToken(jiraToken);

    if (existingId != null) {
      const { error: updateCredErr } = await supabase
        .from('jira_credentials')
        .update({
          jira_user_email: jiraUserEmail,
          encrypted_token: encryptedToken,
          iv,
          algorithm: 'AES-GCM',
          updated_at: nowIso,
        })
        .eq('id', existingId)
        .eq('owner_user_id', authData.user.id);
      if (updateCredErr) return jsonResponse(400, { error: updateCredErr.message });
      credentialId = existingId;
    } else {
      const { data: inserted, error: insertCredErr } = await supabase
        .from('jira_credentials')
        .insert({
          owner_user_id: authData.user.id,
          jira_user_email: jiraUserEmail,
          encrypted_token: encryptedToken,
          iv,
          algorithm: 'AES-GCM',
          created_at: nowIso,
          updated_at: nowIso,
        })
        .select('id')
        .single();
      if (insertCredErr) return jsonResponse(400, { error: insertCredErr.message });
      credentialId = Number(inserted.id);
    }

    const { error: connErr } = await supabase
      .from('jira_project_connections')
      .update({
        credential_id: credentialId,
        jira_user_email: jiraUserEmail,
        updated_at: nowIso,
      })
      .eq('project_id', projectId)
      .eq('owner_user_id', authData.user.id);
    if (connErr) return jsonResponse(400, { error: connErr.message });

    return jsonResponse(200, { ok: true, credentialId });
  } catch (error) {
    return jsonResponse(500, { error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type JiraSyncRequest = {
  mode?: 'sync' | 'test';
  projectId?: string;
  storyIds?: string[];
};

type JiraSyncResponse = {
  synced: Array<{ storyId: string; jiraKey: string }>;
  failed: Array<{ storyId: string; error: string }>;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function base64ToBytes(base64: string): Uint8Array {
  const raw = atob(base64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

async function decryptToken(encryptedToken: string, ivBase64: string): Promise<string> {
  const secretBase64 = Deno.env.get('JIRA_CREDENTIALS_MASTER_KEY');
  if (!secretBase64?.trim()) throw new Error('Missing JIRA_CREDENTIALS_MASTER_KEY secret.');
  const keyBytes = base64ToBytes(secretBase64.trim());
  if (keyBytes.length !== 32) {
    throw new Error('JIRA_CREDENTIALS_MASTER_KEY must decode to 32 bytes (base64).');
  }
  const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['decrypt']);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToBytes(ivBase64) },
    key,
    base64ToBytes(encryptedToken),
  );
  return new TextDecoder().decode(decrypted);
}

type StoryDetail = {
  actor?: string;
  functionalFlow?: string;
  screensInvolved?: string;
  businessRules?: string;
  technicalNotes?: string;
};

function pushParagraph(content: Record<string, unknown>[], text: string) {
  const t = text.trim();
  if (!t) return;
  content.push({
    type: 'paragraph',
    content: [{ type: 'text', text: t }],
  });
}

function toJiraDescription(story: {
  description: string;
  criteria: string[];
  detail?: StoryDetail | null;
}): Record<string, unknown> {
  const content: Record<string, unknown>[] = [];
  if (story.description.trim()) {
    content.push({
      type: 'paragraph',
      content: [{ type: 'text', text: story.description.trim() }],
    });
  }

  const d = story.detail;
  if (d && typeof d === 'object') {
    const actor = String(d.actor ?? '').trim();
    if (actor) pushParagraph(content, `Actor: ${actor}`);
    const flow = String(d.functionalFlow ?? '').trim();
    if (flow) pushParagraph(content, `Functional flow:\n${flow}`);
    const screens = String(d.screensInvolved ?? '').trim();
    if (screens) pushParagraph(content, `Screens / surfaces: ${screens}`);
    const rules = String(d.businessRules ?? '').trim();
    if (rules) pushParagraph(content, `Business rules:\n${rules}`);
    const tech = String(d.technicalNotes ?? '').trim();
    if (tech) pushParagraph(content, `Technical notes:\n${tech}`);
  }

  if (story.criteria.length > 0) {
    content.push({
      type: 'paragraph',
      content: [{ type: 'text', text: 'Acceptance Criteria:' }],
    });
    for (const criterion of story.criteria) {
      content.push({
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: criterion }],
              },
            ],
          },
        ],
      });
    }
  }

  if (content.length === 0) {
    content.push({
      type: 'paragraph',
      content: [{ type: 'text', text: 'Generated from Nexti user story sync.' }],
    });
  }

  return { type: 'doc', version: 1, content };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

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

    const payload = (await req.json()) as JiraSyncRequest;
    const projectId = String(payload.projectId ?? '').trim();
    const mode = payload.mode === 'test' ? 'test' : 'sync';
    const storyIds = Array.isArray(payload.storyIds)
      ? payload.storyIds.map((x) => String(x).trim()).filter(Boolean)
      : [];
    if (!projectId) {
      return jsonResponse(400, { error: 'projectId is required' });
    }
    if (mode === 'sync' && storyIds.length === 0) {
      return jsonResponse(400, { error: 'storyIds are required for sync mode' });
    }

    const { data: connection, error: connErr } = await supabase
      .from('jira_project_connections')
      .select(
        'project_id,base_url,project_key,story_issue_type,default_labels,jira_user_email,credential_id',
      )
      .eq('project_id', projectId)
      .eq('owner_user_id', authData.user.id)
      .maybeSingle();
    if (connErr) return jsonResponse(400, { error: connErr.message });
    if (!connection) return jsonResponse(400, { error: 'Jira connection is not configured for this project.' });

    let jiraToken = '';
    if (typeof connection.credential_id !== 'number' || !Number.isFinite(connection.credential_id)) {
      return jsonResponse(400, { error: 'No Jira credential saved for this project. Save the Jira token first.' });
    }

    const { data: credential, error: credentialErr } = await supabase
      .from('jira_credentials')
      .select('encrypted_token,iv')
      .eq('id', Math.trunc(connection.credential_id))
      .eq('owner_user_id', authData.user.id)
      .maybeSingle();
    if (credentialErr) return jsonResponse(400, { error: credentialErr.message });
    if (!credential) return jsonResponse(400, { error: 'Stored Jira credential not found.' });
    jiraToken = await decryptToken(String(credential.encrypted_token ?? ''), String(credential.iv ?? ''));

    const { data: stories, error: storiesErr } = await supabase
      .from('user_stories')
      .select('id,title,description,module,criteria,detail')
      .eq('project_id', projectId)
      .eq('owner_user_id', authData.user.id)
      .in('id', storyIds);
    if (storiesErr) return jsonResponse(400, { error: storiesErr.message });

    const storyMap = new Map((stories ?? []).map((s) => [String(s.id), s]));
    const response: JiraSyncResponse = { synced: [], failed: [] };
    const jiraAuth = btoa(`${connection.jira_user_email}:${jiraToken}`);
    const baseUrl = String(connection.base_url ?? '').replace(/\/+$/, '');
    const labels = Array.isArray(connection.default_labels)
      ? connection.default_labels.map((x) => String(x)).filter(Boolean)
      : [];

    if (mode === 'test') {
      const jiraTestRes = await fetch(
        `${baseUrl}/rest/api/3/project/${encodeURIComponent(String(connection.project_key))}`,
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
          error: `Jira connection test failed (${jiraTestRes.status}): ${text || jiraTestRes.statusText}`,
        });
      }
      return jsonResponse(200, {
        ok: true,
        message: `Jira connection is valid for project key ${String(connection.project_key)}.`,
      });
    }

    for (const storyId of storyIds) {
      const story = storyMap.get(storyId);
      if (!story) {
        response.failed.push({ storyId, error: 'Story not found or not accessible.' });
        continue;
      }

      try {
        const jiraRes = await fetch(`${baseUrl}/rest/api/3/issue`, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${jiraAuth}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            fields: {
              project: { key: connection.project_key },
              issuetype: { name: connection.story_issue_type },
              summary: String(story.title ?? '').trim().slice(0, 255),
              description: toJiraDescription({
                description: String(story.description ?? ''),
                criteria: Array.isArray(story.criteria) ? story.criteria.map((x) => String(x)) : [],
                detail: (story as { detail?: StoryDetail | null }).detail ?? null,
              }),
              labels,
            },
          }),
        });

        if (!jiraRes.ok) {
          const text = (await jiraRes.text()).slice(0, 500);
          response.failed.push({
            storyId,
            error: `Jira API error (${jiraRes.status}): ${text || jiraRes.statusText}`,
          });
          continue;
        }

        const issue = (await jiraRes.json()) as { key?: string };
        const jiraKey = String(issue.key ?? '').trim();
        if (!jiraKey) {
          response.failed.push({ storyId, error: 'Jira did not return an issue key.' });
          continue;
        }
        response.synced.push({ storyId, jiraKey });
      } catch (error) {
        response.failed.push({
          storyId,
          error: error instanceof Error ? error.message : 'Unknown Jira sync error',
        });
      }
    }

    return jsonResponse(200, response);
  } catch (error) {
    return jsonResponse(500, { error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

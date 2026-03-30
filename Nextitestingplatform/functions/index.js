const { onRequest } = require('firebase-functions/v2/https');
const { Agent } = require('undici');

// Undici Agent lets us disable TLS verification for the upstream n8n host.
// This is needed because `n8n.nextisolutions.com` has an expired/invalid certificate.
const insecureUndiciAgent = new Agent({
  connect: {
    rejectUnauthorized: false,
  },
});

function jsonResponse(res, status, body) {
  res.status(status);
  if (body == null) return res.send('');
  // If body is already a string, keep it as-is.
  if (typeof body === 'string') return res.send(body);
  return res.json(body);
}

async function proxyToN8n({ targetUrl, req, res }) {
  // Ensure CORS works for browser calls from the same origin (still safe to set).
  res.set('Access-Control-Allow-Origin', req.get('origin') || '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return jsonResponse(res, 405, { error: 'Method Not Allowed' });
  }

  const body =
    req.get('content-type')?.includes('application/json')
      ? JSON.stringify(req.body ?? {})
      : typeof req.body === 'string'
        ? req.body
        : '';

  const upstreamRes = await fetch(targetUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
    dispatcher: insecureUndiciAgent,
  });

  const text = await upstreamRes.text();
  res.status(upstreamRes.status);
  res.set('Content-Type', upstreamRes.headers.get('content-type') || 'application/json');
  res.send(text);
}

exports.n8nWebhook = onRequest({ cors: false }, async (req, res) => {
  const targetUrl = process.env.N8N_WEBHOOK_URL;
  if (!targetUrl) return jsonResponse(res, 500, { error: 'Missing N8N_WEBHOOK_URL' });
  return proxyToN8n({ targetUrl, req, res });
});

exports.n8nScriptsWebhook = onRequest({ cors: false }, async (req, res) => {
  const targetUrl = process.env.N8N_SCRIPTS_WEBHOOK_URL;
  if (!targetUrl) return jsonResponse(res, 500, { error: 'Missing N8N_SCRIPTS_WEBHOOK_URL' });
  return proxyToN8n({ targetUrl, req, res });
});


const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);
  if (!response.ok) {
    const payload = await response.text();
    throw new Error(payload || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function listProjects() {
  return request("/api/projects");
}

export async function createProject(name) {
  return request("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });
}

export async function listRuns(projectId) {
  return request(`/api/projects/${projectId}/runs`);
}

export async function getRun(projectId, runId) {
  return request(`/api/projects/${projectId}/runs/${runId}`);
}

export async function getArtifact(projectId, runId, artifactName) {
  return request(`/api/projects/${projectId}/runs/${runId}/artifacts/${artifactName}`);
}

export async function createRun(projectId, files, comment = "", previousRunId = "") {
  const form = new FormData();
  files.forEach((file) => form.append("files", file));
  if (comment) form.append("comment", comment);
  if (previousRunId) form.append("previous_run_id", previousRunId);

  return request(`/api/projects/${projectId}/runs`, {
    method: "POST",
    body: form
  });
}

export async function getRagStatus() {
  return request("/api/rag/status");
}

export async function uploadRagSources(files) {
  const form = new FormData();
  files.forEach((file) => form.append("files", file));
  return request("/api/rag/sources", {
    method: "POST",
    body: form
  });
}

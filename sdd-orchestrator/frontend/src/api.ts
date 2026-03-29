import type { Project } from "./types";

const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8003";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(payload.message ?? `Request failed: ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  listProjects: () => request<Project[]>("/api/projects"),
  getProject: (id: string) => request<Project>(`/api/projects/${id}`),
  createProject: (body: { name: string; userStories: string }) => request<Project>("/api/projects", { method: "POST", body: JSON.stringify(body) }),
  updateProject: (id: string, body: Partial<Pick<Project, "name" | "userStories">>) => request<Project>(`/api/projects/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteProject: (id: string, confirmName: string) => request<void>(`/api/projects/${id}`, { method: "DELETE", body: JSON.stringify({ confirmName }) }),
  generateProject: (id: string) => request<{ project: Project }>(`/api/projects/${id}/generate`, { method: "POST" }),
  completeProject: (id: string) => request<{ zipPath: string; zipSizeBytes: number; fileCount: number }>(`/api/projects/${id}/complete`, { method: "POST" }),
};

export function getApiBase() {
  return apiBase;
}

export function getAppLinks() {
  return {
    rag: import.meta.env.VITE_RAGAPP_URL ?? "http://localhost:3000",
    manager: import.meta.env.VITE_MANAGER_URL ?? "http://localhost:3001",
    sdd: import.meta.env.VITE_SDD_URL ?? "http://localhost:3002",
  };
}

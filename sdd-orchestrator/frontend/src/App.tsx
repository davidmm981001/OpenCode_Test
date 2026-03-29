import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { api, getApiBase, getAppLinks } from "./api";
import type { Project, ProjectStatus, TerminalPayload } from "./types";

type Tab = "stories" | "console" | "result";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function formatBytes(bytes: number | null) {
  if (bytes == null) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unit]}`;
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  return <span className={`badge ${status}`}>{status}</span>;
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const links = getAppLinks();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("stories");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [inputEnabled, setInputEnabled] = useState(false);
  const [consoleInput, setConsoleInput] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleteName, setDeleteName] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [completionPrompt, setCompletionPrompt] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState({ name: "", userStories: "" });
  const [editingName, setEditingName] = useState("");
  const logBottomRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const selected = useMemo(() => projects.find((project) => project.id === selectedId) ?? null, [projects, selectedId]);

  async function refreshProjects(nextSelectedId?: string) {
    const items = await api.listProjects();
    setProjects(items);
    if (nextSelectedId) setSelectedId(nextSelectedId);
    else if (!selectedId && items[0]) setSelectedId(items[0].id);
    return items;
  }

  useEffect(() => {
    void refreshProjects();
  }, []);

  useEffect(() => {
    if (selected) setEditingName(selected.name);
  }, [selected?.id]);

  useEffect(() => {
    socketRef.current?.close();
    const ws = selectedId ? new WebSocket(`${apiUrlToWs()}/ws?projectId=${selectedId}`) : null;
    if (!ws) return;
    socketRef.current = ws;

    ws.onmessage = (message) => {
      const payload = JSON.parse(message.data) as TerminalPayload;
      if (payload.type === "snapshot") {
        setLogs(payload.lines);
        setInputEnabled(payload.inputEnabled);
      } else if (payload.type === "line") {
        setLogs((current) => [...current, payload.line]);
      } else if (payload.type === "input_enabled") {
        setInputEnabled(payload.inputEnabled);
      } else if (payload.type === "completion_ready") {
        setCompletionPrompt(payload.message);
      } else if (payload.type === "error") {
        setError(payload.message);
      }
      void refreshProjects(selectedId ?? undefined);
    };

    return () => {
      if (socketRef.current === ws) socketRef.current = null;
      ws.close();
    };
  }, [selectedId]);

  useEffect(() => {
    logBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  function apiUrlToWs() {
    return getApiBase().replace(/^http/, "ws");
  }

  async function createProject() {
    setBusy("create");
    setError(null);
    try {
      const project = await api.createProject(projectForm);
      setCreateOpen(false);
      setProjectForm({ name: "", userStories: "" });
      await refreshProjects(project.id);
      setTab("stories");
    } catch (error_) {
      setError((error_ as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function saveProjectName() {
    if (!selected) return;
    setBusy("save");
    try {
      const updated = await api.updateProject(selected.id, { name: editingName });
      setProjects((current) => current.map((project) => (project.id === updated.id ? updated : project)));
    } catch (error_) {
      setError((error_ as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function launchGeneration() {
    if (!selected) return;
    setBusy("generate");
    setError(null);
    try {
      await api.updateProject(selected.id, { userStories: selected.userStories });
      await api.generateProject(selected.id);
      await refreshProjects(selected.id);
      setTab("console");
    } catch (error_) {
      setError((error_ as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function sendConsoleInput() {
    if (!selectedId || !consoleInput.trim()) return;
    socketRef.current?.send(JSON.stringify({ type: "input", message: consoleInput.trim() }));
    setConsoleInput("");
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setBusy("delete");
    try {
      await api.deleteProject(deleteTarget.id, deleteName);
      setDeleteTarget(null);
      setDeleteName("");
      const items = await refreshProjects();
      if (selectedId === deleteTarget.id) setSelectedId(items[0]?.id ?? null);
    } catch (error_) {
      setError((error_ as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function completeProject() {
    if (!selected) return;
    setBusy("complete");
    try {
      await api.completeProject(selected.id);
      await refreshProjects(selected.id);
      setTab("result");
      setCompletionPrompt(null);
    } catch (error_) {
      setError((error_ as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <h1>SDD Orchestrator</h1>
          <p>Generador visual de proyectos con OpenCode + OpenSpec</p>
        </div>
        <nav className="app-links">
          <a className="app-link" href={links.rag}>RagApp</a>
          <a className="app-link" href={links.manager}>Manager</a>
          <a className="app-link active" href={links.sdd}>SDD Orchestrator</a>
        </nav>
      </header>

      <main className="content">
        <aside className="sidebar">
          <div className="section-title">
            <h2>Proyectos</h2>
            <button className="button" onClick={() => setCreateOpen(true)}>Nuevo Proyecto</button>
          </div>
          {error && <div className="card"><strong>Error:</strong> {error}</div>}
          <div className="project-list">
            {projects.map((project) => (
              <div key={project.id} className={`project-item ${project.id === selectedId ? "active" : ""}`} onClick={() => setSelectedId(project.id)}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <div>
                    <p className="project-name">{project.name}</p>
                    <div className="meta">Creado {formatDate(project.createdAt)}</div>
                  </div>
                  <StatusBadge status={project.status} />
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section className="main-panel">
          {selected ? (
            <>
              <div className="card grid-two">
                <div>
                  <div className="section-title"><h2>Proyecto</h2><StatusBadge status={selected.status} /></div>
                  <input className="field" value={editingName} onChange={(event) => setEditingName(event.target.value)} />
                  <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                    <button className="button secondary" onClick={saveProjectName} disabled={busy !== null}>Guardar nombre</button>
                    <button className="button danger" onClick={() => setDeleteTarget(selected)}>Eliminar</button>
                  </div>
                </div>
                <div>
                  <div className="status-row">
                    <div><div className="meta">Archivos</div><strong>{selected.fileCount ?? 0}</strong></div>
                    <div><div className="meta">ZIP</div><strong>{formatBytes(selected.zipSizeBytes)}</strong></div>
                    <div><div className="meta">Completado</div><strong>{formatDate(selected.completedAt)}</strong></div>
                  </div>
                  <div className="meta" style={{ marginTop: 10 }}>{selected.lastError ?? "Sin errores reportados"}</div>
                </div>
              </div>

              <div className="tabs">
                {(["stories", "console", "result"] as Tab[]).map((item) => (
                  <button key={item} className={`tab ${tab === item ? "active" : ""}`} onClick={() => setTab(item)}>{item === "stories" ? "Historias de Usuario" : item === "console" ? "Proceso de Ejecución" : "Resultado"}</button>
                ))}
              </div>

              {tab === "stories" && (
                <div className="card stack">
                  <textarea className="field" value={selected.userStories} onChange={(event) => setProjects((current) => current.map((project) => project.id === selected.id ? { ...project, userStories: event.target.value } : project))} />
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <div className="muted small">Stack fijo: Java Spring Boot + React + PostgreSQL.</div>
                    <button className="button" onClick={launchGeneration} disabled={busy !== null || selected.status === "running"}>Generar Aplicación</button>
                  </div>
                  {selected.status === "running" && <div className="meta">Hay un proceso corriendo para este proyecto.</div>}
                </div>
              )}

              {tab === "console" && (
                <div className="terminal">
                  <div className="terminal-body">
                    {logs.map((line, index) => <p key={index} className="terminal-line">{line}</p>)}
                    <div ref={logBottomRef} />
                  </div>
                  <div className="terminal-input">
                    <input className="field" value={consoleInput} onChange={(event) => setConsoleInput(event.target.value)} placeholder={inputEnabled ? "Escribe un mensaje para opencode..." : "El proceso debe estar en espera para habilitar entrada"} disabled={!inputEnabled} />
                    <button className="button secondary" onClick={sendConsoleInput} disabled={!inputEnabled || !consoleInput.trim()}>Enviar</button>
                    <button className="button" onClick={completeProject} disabled={selected.status !== "running" || busy !== null}>Marcar como Completado</button>
                  </div>
                </div>
              )}

              {tab === "result" && (
                <div className="card stack">
                  {selected.status === "completed" ? (
                    <>
                      <div className="grid-two">
                        <div><div className="meta">Nombre</div><strong>{selected.name}</strong></div>
                        <div><div className="meta">ZIP</div><strong>{formatBytes(selected.zipSizeBytes)}</strong></div>
                        <div><div className="meta">Archivos</div><strong>{selected.fileCount ?? 0}</strong></div>
                        <div><div className="meta">Fecha</div><strong>{formatDate(selected.completedAt)}</strong></div>
                      </div>
                      <a className="button" href={`${apiBase()}/api/projects/${selected.id}/download`} target="_blank">Descargar .zip</a>
                    </>
                  ) : <div className="muted">Esta tab solo está activa cuando el proyecto finaliza.</div>}
                </div>
              )}
            </>
          ) : (
            <div className="card">No hay proyectos todavía. Crea uno para empezar.</div>
          )}
        </section>
      </main>

      {createOpen && (
        <Modal title="Nuevo Proyecto" onClose={() => setCreateOpen(false)}>
          <div className="stack">
            <input className="field" placeholder="Nombre del proyecto" value={projectForm.name} onChange={(event) => setProjectForm((current) => ({ ...current, name: event.target.value }))} />
            <textarea className="field" placeholder="Pega aquí todas las historias de usuario" value={projectForm.userStories} onChange={(event) => setProjectForm((current) => ({ ...current, userStories: event.target.value }))} />
            <div className="modal-actions">
              <button className="button secondary" onClick={() => setCreateOpen(false)}>Cancelar</button>
              <button className="button" onClick={createProject} disabled={busy === "create"}>Crear</button>
            </div>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Confirmar eliminación" onClose={() => setDeleteTarget(null)}>
          <div className="stack">
            <div className="muted">Escribe exactamente <strong>{deleteTarget.name}</strong> para eliminar el proyecto y su carpeta.</div>
            <input className="field" value={deleteName} onChange={(event) => setDeleteName(event.target.value)} />
            <div className="modal-actions">
              <button className="button secondary" onClick={() => setDeleteTarget(null)}>Cancelar</button>
              <button className="button danger" onClick={confirmDelete} disabled={deleteName !== deleteTarget.name || busy === "delete"}>Eliminar</button>
            </div>
          </div>
        </Modal>
      )}

      {completionPrompt && (
        <Modal title="Proyecto listo" onClose={() => setCompletionPrompt(null)}>
          <div className="stack">
            <div>{completionPrompt}</div>
            <div className="modal-actions">
              <button className="button secondary" onClick={() => setCompletionPrompt(null)}>Seguir ejecutando</button>
              <button className="button" onClick={completeProject}>Confirmar y empaquetar</button>
            </div>
          </div>
        </Modal>
      )}

      <div className="footer">OpenCode: gpt-5.4-mini · WebSocket console · monorepo navigation configurable via env</div>
    </div>
  );
}

function apiBase() {
  return import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8003";
}

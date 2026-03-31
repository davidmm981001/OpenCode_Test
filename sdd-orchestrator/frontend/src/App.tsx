import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { api, getApiBase, getAppLinks } from "./api";
import "./orchestrator-app.css";
import type { ExecutionPhase, Project, ProjectExecutionSnapshot, ProjectStatus, TerminalPayload, WorkspaceFileEntry } from "./types";

type Tab = "stories" | "console" | "result";
type ConnectionState = "idle" | "connecting" | "open" | "reconnecting";
type StopState = "idle" | "stopping" | "stopped";

type WorkspaceTreeNode = WorkspaceFileEntry & { children: WorkspaceTreeNode[] };

const selectedProjectStorageKey = "sdd-orchestrator:selected-project-id";

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

function formatCost(value: number | null | undefined) {
  if (value == null) return "—";
  return `$${value.toFixed(6)}`;
}

function phaseLabel(phase: ExecutionPhase) {
  const labels: Record<ExecutionPhase, string> = {
    idle: "Idle",
    preparing: "Preparing",
    starting: "Starting",
    running: "Running",
    waiting_input: "Waiting input",
    monitoring: "Monitoring",
    packaging: "Packaging",
    stopping: "Stopping",
    completed: "Completed",
    error: "Error",
  };
  return labels[phase];
}

function phaseTone(phase: ExecutionPhase) {
  if (phase === "completed") return "completed";
  if (phase === "error") return "error";
  if (phase === "idle") return "idle";
  return "running";
}

function connectionStateLabel(state: ConnectionState) {
  if (state === "open") return "Conectada";
  if (state === "connecting") return "Conectando";
  if (state === "reconnecting") return "Reconectando";
  return "Inactiva";
}

function isEditablePhase(phase: ExecutionPhase) {
  return phase === "idle" || phase === "error";
}

function resolveSelectedProjectId(projects: Project[], currentSelectedId: string | null, rememberedId: string | null) {
  const selectedExists = currentSelectedId ? projects.some((project) => project.id === currentSelectedId) : false;
  if (selectedExists) return currentSelectedId;

  const rememberedExists = rememberedId ? projects.some((project) => project.id === rememberedId) : false;
  if (rememberedExists) return rememberedId;

  return projects[0]?.id ?? null;
}

function defaultExecution(projectId: string): ProjectExecutionSnapshot {
  return {
    projectId,
    phase: "idle",
    status: "idle",
    lines: [],
    inputEnabled: false,
    sessionId: null,
    port: null,
    lastError: null,
    message: null,
    lastOutputAt: null,
    usage: {
      inputTokens: 0,
      outputTokens: 0,
      reasoningTokens: 0,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      estimatedCostUsd: null,
    },
  };
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  return <span className={`badge ${status}`}>{status}</span>;
}

function PhaseBadge({ phase }: { phase: ExecutionPhase }) {
  return <span className={`badge ${phaseTone(phase)}`}>{phaseLabel(phase)}</span>;
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

function getLanguageIcon(fileName: string) {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".tsx") || lower.endsWith(".ts")) return "⚛";
  if (lower.endsWith(".jsx") || lower.endsWith(".js")) return "🟨";
  if (lower.endsWith(".java")) return "☕";
  if (lower.endsWith(".kt")) return "🟣";
  if (lower.endsWith(".cs")) return "💠";
  if (lower.endsWith(".py")) return "🐍";
  if (lower.endsWith(".sql")) return "🗄";
  if (lower.endsWith(".css")) return "🎨";
  if (lower.endsWith(".html") || lower.endsWith(".htm")) return "🌐";
  if (lower.endsWith(".json") || lower.endsWith(".jsonc")) return "{}";
  if (lower.endsWith(".yml") || lower.endsWith(".yaml")) return "⚙";
  if (lower.endsWith(".md")) return "📝";
  if (lower.endsWith(".xml")) return "🧩";
  if (lower.endsWith(".gradle") || lower.endsWith(".pom") || lower.endsWith(".toml")) return "🧱";
  if (lower === "dockerfile" || lower.endsWith(".dockerfile")) return "🐳";
  if (lower.endsWith(".gitignore")) return "🙈";
  return "📄";
}

function buildWorkspaceTree(entries: WorkspaceFileEntry[]) {
  const sorted = [...entries].sort((a, b) => a.path.localeCompare(b.path));
  const nodes = new Map<string, WorkspaceTreeNode>();
  const roots: WorkspaceTreeNode[] = [];

  for (const entry of sorted) {
    nodes.set(entry.path, { ...entry, children: [] });
  }

  for (const entry of sorted) {
    const node = nodes.get(entry.path);
    if (!node) continue;
    const parentPath = entry.path.includes("/") ? entry.path.slice(0, entry.path.lastIndexOf("/")) : "";
    const parent = parentPath ? nodes.get(parentPath) : null;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }

  const sortChildren = (items: WorkspaceTreeNode[]) => {
    items.sort((a, b) => {
      if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    for (const item of items) sortChildren(item.children);
  };

  sortChildren(roots);
  return roots;
}

function readEmbedSearchParams() {
  if (typeof window === "undefined") {
    return { embed: false, sddProjectId: null as string | null };
  }
  const p = new URLSearchParams(window.location.search);
  return {
    embed: p.get("embed") === "1" || p.get("embed") === "true",
    sddProjectId: p.get("sddProjectId"),
  };
}

export default function App() {
  const links = getAppLinks();
  const embedParams = useMemo(() => readEmbedSearchParams(), []);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<ProjectExecutionSnapshot | null>(null);
  const [tab, setTab] = useState<Tab>(() => (readEmbedSearchParams().embed ? "console" : "stories"));
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
  const [connectionState, setConnectionState] = useState<ConnectionState>("idle");
  const [stopState, setStopState] = useState<StopState>("idle");
  const [workspaceFiles, setWorkspaceFiles] = useState<WorkspaceFileEntry[]>([]);
  const [workspaceStats, setWorkspaceStats] = useState<{ fileCount: number; totalBytes: number } | null>(null);
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(() => new Set());
  const logBottomRef = useRef<HTMLDivElement | null>(null);
  const terminalBodyRef = useRef<HTMLDivElement | null>(null);
  const filesBodyRef = useRef<HTMLDivElement | null>(null);
  const autoScrollRef = useRef(true);
  const filesScrollRef = useRef(true);
  const socketRef = useRef<WebSocket | null>(null);
  const pollRef = useRef<number | null>(null);
  const filesPollRef = useRef<number | null>(null);
  const reconnectRef = useRef<number | null>(null);
  const connectSeqRef = useRef(0);
  const selectedIdRef = useRef<string | null>(null);

  const selected = useMemo(() => projects.find((project) => project.id === selectedId) ?? null, [projects, selectedId]);
  const execution = selectedExecution ?? (selected ? defaultExecution(selected.id) : null);
  const currentPhase = execution?.phase ?? (selected?.status === "running" ? "starting" : selected?.status === "completed" ? "completed" : selected?.status === "error" ? "error" : "idle");
  const workspaceTree = useMemo(() => buildWorkspaceTree(workspaceFiles), [workspaceFiles]);

  function clearReconnectTimer() {
    if (reconnectRef.current) {
      window.clearTimeout(reconnectRef.current);
      reconnectRef.current = null;
    }
  }

  async function refreshProjects(nextSelectedId?: string) {
    const items = await api.listProjects();
    setProjects(items);
    if (nextSelectedId) {
      setSelectedId(nextSelectedId);
      return items;
    }

    const rememberedId = window.localStorage.getItem(selectedProjectStorageKey);
    const nextId = resolveSelectedProjectId(items, selectedIdRef.current, rememberedId);
    if (nextId && nextId !== selectedIdRef.current) setSelectedId(nextId);
    if (!nextId) setSelectedId(null);
    return items;
  }

  async function syncSelectedStatus(projectId: string) {
    const response = await api.getProjectStatus(projectId);
    setProjects((current) => current.map((project) => (project.id === response.project.id ? response.project : project)));
    if (projectId === selectedIdRef.current) {
      setSelectedExecution(response.execution);
      setLogs(response.execution.lines);
      setInputEnabled(response.execution.inputEnabled);
      if (response.execution.phase === "completed") setCompletionPrompt(null);
    }
    return response;
  }

  async function refreshProjectFiles(projectId: string) {
    const response = await api.getProjectFiles(projectId);
    setWorkspaceFiles(response.files);
    setWorkspaceStats(response.stats);
    if (filesScrollRef.current) {
      window.requestAnimationFrame(() => filesBodyRef.current?.scrollTo({ top: filesBodyRef.current.scrollHeight, behavior: "smooth" }));
    }
    return response;
  }

  function connectProjectStream(projectId: string) {
    clearReconnectTimer();
    const currentSeq = ++connectSeqRef.current;
    socketRef.current?.close();
    socketRef.current = null;
    setConnectionState("connecting");
    const ws = new WebSocket(`${getApiBase().replace(/^http/, "ws")}/ws?projectId=${projectId}`);
    socketRef.current = ws;

    ws.onopen = () => {
      if (socketRef.current === ws) setConnectionState("open");
    };

    ws.onmessage = (message) => {
      let payload: TerminalPayload;
      try {
        payload = JSON.parse(message.data) as TerminalPayload;
      } catch {
        setError("La consola recibió un mensaje inválido del backend.");
        return;
      }

      if (payload.type === "snapshot") {
        setSelectedExecution({
          projectId: payload.projectId,
          phase: payload.phase,
          status: payload.status,
          lines: payload.lines,
          inputEnabled: payload.inputEnabled,
          sessionId: payload.sessionId,
          port: payload.port,
          lastError: payload.lastError,
          message: payload.message,
          lastOutputAt: payload.lastOutputAt,
          usage: payload.usage,
        });
        setLogs(payload.lines);
        setInputEnabled(payload.inputEnabled);
        setProjects((current) => current.map((project) => (project.id === payload.projectId ? { ...project, status: payload.status } : project)));
      } else if (payload.type === "line") {
        setLogs((current) => [...current, payload.line]);
      } else if (payload.type === "status") {
        setSelectedExecution((current) => (current ? { ...current, status: payload.status, phase: payload.phase, message: payload.message ?? current.message } : current));
        setProjects((current) => current.map((project) => (project.id === projectId ? { ...project, status: payload.status } : project)));
      } else if (payload.type === "phase") {
        setSelectedExecution((current) => (current ? { ...current, phase: payload.phase, message: payload.message ?? current.message } : current));
      } else if (payload.type === "input_enabled") {
        setInputEnabled(payload.inputEnabled);
        setSelectedExecution((current) => (current ? { ...current, inputEnabled: payload.inputEnabled } : current));
      } else if (payload.type === "completion_ready") {
        setCompletionPrompt(payload.message);
      } else if (payload.type === "completion_confirmed") {
        setCompletionPrompt(null);
        setTab("result");
      } else if (payload.type === "error") {
        setError(payload.message);
      }

      void refreshProjects(projectId).catch((error_) => setError((error_ as Error).message));
    };

    ws.onerror = () => setConnectionState("reconnecting");
    ws.onclose = () => {
      if (socketRef.current === ws) socketRef.current = null;
      if (selectedIdRef.current === projectId && connectSeqRef.current === currentSeq) {
        setConnectionState("reconnecting");
        reconnectRef.current = window.setTimeout(() => {
          if (selectedIdRef.current === projectId) connectProjectStream(projectId);
        }, 1500);
        return;
      }
      setConnectionState("idle");
    };
  }

  useEffect(() => {
    void refreshProjects();
  }, []);

  useEffect(() => {
    if (!embedParams.embed || !embedParams.sddProjectId) return;
    const id = embedParams.sddProjectId;
    const exists = projects.some((project) => project.id === id);
    if (exists) setSelectedId(id);
    else if (projects.length > 0) setSelectedId(null);
  }, [embedParams.embed, embedParams.sddProjectId, projects]);

  useEffect(() => {
    selectedIdRef.current = selectedId;
    if (embedParams.embed) return;
    if (selectedId) window.localStorage.setItem(selectedProjectStorageKey, selectedId);
  }, [selectedId, embedParams.embed]);

  useEffect(() => {
    if (!embedParams.embed || !selected) return;
    if (selected.status === "completed") setTab("result");
    else setTab("console");
  }, [embedParams.embed, selected?.id, selected?.status]);

  useEffect(() => {
    if (selected) setEditingName(selected.name);
  }, [selected?.id]);

  useEffect(() => {
    if (!selectedId) return;

    setLogs([]);
    setInputEnabled(false);
    setCompletionPrompt(null);
    setSelectedExecution(null);
    setStopState("idle");
    setWorkspaceFiles([]);
    setWorkspaceStats(null);
    setCollapsedFolders(new Set());
    autoScrollRef.current = true;
    filesScrollRef.current = true;

    connectProjectStream(selectedId);
    void syncSelectedStatus(selectedId).catch((error_) => setError((error_ as Error).message));
    void refreshProjectFiles(selectedId).catch((error_) => setError((error_ as Error).message));

    if (pollRef.current) window.clearInterval(pollRef.current);
    pollRef.current = window.setInterval(() => {
      void syncSelectedStatus(selectedId).catch((error_) => setError((error_ as Error).message));
    }, 2000);

    if (filesPollRef.current) window.clearInterval(filesPollRef.current);
    filesPollRef.current = window.setInterval(() => {
      void refreshProjectFiles(selectedId).catch((error_) => setError((error_ as Error).message));
    }, 5000);

    return () => {
      connectSeqRef.current += 1;
      clearReconnectTimer();
      socketRef.current?.close();
      if (pollRef.current) window.clearInterval(pollRef.current);
      if (filesPollRef.current) window.clearInterval(filesPollRef.current);
    };
  }, [selectedId]);

  useEffect(() => {
    if (tab !== "console" || !autoScrollRef.current) return;
    logBottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [logs, tab, selectedId]);

  function handleTerminalScroll() {
    const el = terminalBodyRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    autoScrollRef.current = distanceFromBottom < 80;
  }

  function handleFilesScroll() {
    const el = filesBodyRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    filesScrollRef.current = distanceFromBottom < 80;
  }

  function toggleFolder(path: string) {
    setCollapsedFolders((current) => {
      const next = new Set(current);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }

  function renderWorkspaceNode(node: WorkspaceTreeNode) {
    const isDirectory = node.type === "directory";
    const isCollapsed = isDirectory && collapsedFolders.has(node.path);
    const icon = isDirectory ? (isCollapsed ? "▸" : "▾") + " 📁" : getLanguageIcon(node.name);

    return (
      <div key={node.path} className={`file-tree-row depth-${Math.min(node.depth, 5)} ${node.type}`}>
        <button
          type="button"
          className="file-tree-entry"
          onClick={() => isDirectory && toggleFolder(node.path)}
          aria-expanded={isDirectory ? !isCollapsed : undefined}
        >
          <span className="file-tree-icon">{icon}</span>
          <span className="file-entry-path">{node.name}</span>
        </button>
        {isDirectory && !isCollapsed && node.children.length > 0 && (
          <div className="file-tree-children">
            {node.children.map((child) => renderWorkspaceNode(child))}
          </div>
        )}
      </div>
    );
  }

  async function createProject() {
    setBusy("create");
    setError(null);
    try {
      const project = await api.createProject({ name: projectForm.name, userStories: projectForm.userStories });
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
    if (!selectedId || !execution?.sessionId || !consoleInput.trim()) return;
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

  async function stopProject() {
    if (!selected || !execution) return;
    if (currentPhase === "idle" || currentPhase === "completed" || currentPhase === "error" || stopState === "stopping") return;
    setBusy("stop");
    setStopState("stopping");
    setError(null);
    try {
      const response = await api.stopProject(selected.id);
      setProjects((current) => current.map((project) => (project.id === selected.id ? { ...project, status: response.project.status } : project)));
      setSelectedExecution(response.execution);
      setLogs(response.execution.lines);
      setInputEnabled(false);
      setCompletionPrompt(null);
      await syncSelectedStatus(selected.id).catch((error_) => setError((error_ as Error).message));
      setStopState("stopped");
    } catch (error_) {
      setError((error_ as Error).message);
      setStopState("idle");
    } finally {
      setBusy(null);
    }
  }

  const storiesLocked = selected ? selected.status === "running" || selected.status === "completed" : false;
  const canStop = currentPhase !== "idle" && currentPhase !== "completed" && currentPhase !== "error";
  const stopButtonLabel = stopState === "stopping" ? "Deteniendo..." : stopState === "stopped" ? "Proceso detenido" : "Detener proceso";
  const activeConsoleCount = projects.filter((project) => project.status === "running").length;
  const consoleCapacity = 5;
  const availableConsoles = Math.max(consoleCapacity - activeConsoleCount, 0);
  const usage = execution?.usage;
  const consoleReady = Boolean(execution?.sessionId);
  const consoleReadyLabel = consoleReady ? "Lista para escribir" : "Bloqueada";

  const visibleTabs: Tab[] = embedParams.embed ? (["console", "result"] as Tab[]) : (["stories", "console", "result"] as Tab[]);

  return (
    <div className="app-shell">
      {!embedParams.embed && (
        <header className="topbar">
          <div className="brand">
            <h1>Generación de aplicación</h1>
            <p>Generador visual de proyectos con OpenCode + OpenSpec</p>
          </div>
          <nav className="app-links">
            <a className="app-link" href={links.rag}>RagApp</a>
            <a className="app-link" href={links.manager}>Manager</a>
            <a className="app-link active" href={links.sdd}>Generación de aplicación</a>
          </nav>
          <div className="topbar-stats">
            <div><strong>{activeConsoleCount}/{consoleCapacity}</strong> consolas activas</div>
            <div><strong>{availableConsoles}/{consoleCapacity}</strong> disponibles</div>
            <div><strong>{projects.length}</strong> proyectos</div>
          </div>
        </header>
      )}

      <main className={`content ${embedParams.embed ? "embed-layout" : ""}`}>
        {!embedParams.embed && (
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
        )}

        <section className="main-panel">
          {embedParams.embed &&
          embedParams.sddProjectId &&
          projects.length > 0 &&
          !projects.some((p) => p.id === embedParams.sddProjectId) ? (
            <div className="card">
              <p><strong>Proyecto de generación no encontrado.</strong></p>
              <p className="muted small" style={{ marginTop: 8 }}>El id <code>{embedParams.sddProjectId}</code> no existe en este servicio.</p>
            </div>
          ) : selected && execution ? (
            <>
              <div className="card grid-two">
                <div>
                  <div className="section-title">
                    <h2>{embedParams.embed ? "Estado" : "Proyecto"}</h2>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <StatusBadge status={selected.status} />
                      <PhaseBadge phase={currentPhase} />
                    </div>
                  </div>
                  {embedParams.embed && (
                    <p className="muted small" style={{ marginBottom: 10 }}>
                      Historias gestionadas en NexTI; use Generar cuando estén sincronizadas con el servicio de generación.
                    </p>
                  )}
                  {!embedParams.embed && (
                    <input className="field" value={editingName} onChange={(event) => setEditingName(event.target.value)} disabled={storiesLocked} />
                  )}
                  <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                    {!embedParams.embed && (
                      <>
                        <button className="button secondary" onClick={saveProjectName} disabled={busy !== null || storiesLocked}>
                          Guardar nombre
                        </button>
                        <button className="button danger" onClick={() => setDeleteTarget(selected)}>Eliminar</button>
                      </>
                    )}
                    <button className="button secondary" onClick={stopProject} disabled={!canStop || busy !== null || stopState === "stopping"}>{stopButtonLabel}</button>
                    {embedParams.embed && isEditablePhase(currentPhase) && (
                      <button type="button" className="button" onClick={() => void launchGeneration()} disabled={busy !== null || storiesLocked}>
                        Generar aplicación
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <div className="status-row">
                    <div><div className="meta">Fase</div><strong>{stopState === "stopping" ? "Deteniendo..." : stopState === "stopped" ? "Proceso detenido" : phaseLabel(execution.phase)}</strong></div>
                    <div><div className="meta">Sesión</div><strong>{execution.sessionId ?? "—"}</strong></div>
                    <div><div className="meta">Puerto</div><strong>{execution.port ?? "—"}</strong></div>
                    <div><div className="meta">Conexión</div><strong>{connectionStateLabel(connectionState)}</strong></div>
                    <div>
                      <div className="meta">Entrada</div>
                      <strong className="console-ready-line">
                        <span className={`status-light ${consoleReady ? "ok" : "bad"}`} />
                        {consoleReadyLabel}
                      </strong>
                    </div>
                    <div><div className="meta">Tokens</div><strong>{usage ? `${usage.inputTokens + usage.outputTokens + usage.reasoningTokens}` : "—"}</strong></div>
                    <div><div className="meta">Costo aprox.</div><strong>{usage?.estimatedCostUsd != null ? `$${usage.estimatedCostUsd.toFixed(6)}` : "—"}</strong></div>
                  </div>
                </div>
              </div>

              <div className="tabs">
                {visibleTabs.map((item) => (
                  <button key={item} className={`tab ${tab === item ? "active" : ""}`} onClick={() => setTab(item)}>{item === "stories" ? "Historias de Usuario" : item === "console" ? "Proceso de Ejecución" : "Resultado"}</button>
                ))}
              </div>

              {tab === "stories" && !embedParams.embed && (
                <div className="card stack">
                  <textarea className="field" value={selected.userStories} onChange={(event) => setProjects((current) => current.map((project) => (project.id === selected.id ? { ...project, userStories: event.target.value } : project)))} disabled={storiesLocked} />
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <div className="muted small">Stack fijo: Java Spring Boot + React + PostgreSQL.</div>
                    <button className="button" onClick={launchGeneration} disabled={busy !== null || storiesLocked}>Generar Aplicación</button>
                  </div>
                  {storiesLocked && <div className="meta">Las historias se bloquean mientras el proyecto está en ejecución para evitar desincronización.</div>}
                </div>
              )}

              {tab === "console" && (
                <div className="console-grid">
                  <div className="terminal">
                    <div className="terminal-body" ref={terminalBodyRef} onScroll={handleTerminalScroll}>
                      {logs.length === 0 ? <p className="terminal-line muted">{phaseLabel(execution.phase)}...</p> : logs.map((line, index) => <p key={`${index}-${line}`} className="terminal-line">{line}</p>)}
                      <div ref={logBottomRef} />
                    </div>
                    <div className="terminal-input">
                        <input className="field" value={consoleInput} onChange={(event) => setConsoleInput(event.target.value)} placeholder={execution?.sessionId ? "Escribe un mensaje para opencode..." : "Sin sesión activa"} disabled={!execution?.sessionId} />
                        <button className="button secondary" onClick={sendConsoleInput} disabled={!execution?.sessionId || !consoleInput.trim()}>Enviar</button>
                      <button className="button" onClick={() => setCompletionPrompt("Confirma que deseas empaquetar el proyecto actual.")} disabled={currentPhase !== "running" && currentPhase !== "monitoring" && currentPhase !== "waiting_input"}>Marcar como Completado</button>
                      {stopState === "stopped" && <div className="meta">Proceso detenido</div>}
                    </div>
                  </div>

                  <div className="files-panel card">
                    <div className="section-title">
                      <h2>Archivos del proyecto</h2>
                      <div className="files-stats">
                        <span className="files-stat-pill">{workspaceStats?.fileCount ?? 0} archivos</span>
                        <span className="files-stat-pill">{workspaceStats ? formatBytes(workspaceStats.totalBytes) : "—"} aprox.</span>
                      </div>
                    </div>
                    <div className="files-body" ref={filesBodyRef} onScroll={handleFilesScroll}>
                      {workspaceTree.length === 0 ? (
                        <p className="muted">Aún no hay archivos visibles en esta vista.</p>
                      ) : (
                        workspaceTree.map((node) => renderWorkspaceNode(node))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {tab === "result" && (
                <div className="card stack">
                  <div className="section-title">
                    <h2>Entrega</h2>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <StatusBadge status={selected.status} />
                      <PhaseBadge phase={currentPhase} />
                    </div>
                  </div>

                  <div className="grid-two">
                    {!embedParams.embed && (
                      <div><div className="meta">Nombre</div><strong>{selected.name}</strong></div>
                    )}
                    <div><div className="meta">ZIP</div><strong>{formatBytes(selected.zipSizeBytes)}</strong></div>
                    <div><div className="meta">Archivos</div><strong>{selected.fileCount ?? workspaceStats?.fileCount ?? 0}</strong></div>
                    <div><div className="meta">Fecha</div><strong>{formatDate(selected.completedAt)}</strong></div>
                    <div><div className="meta">Sesión OpenCode</div><strong>{execution.sessionId ?? "—"}</strong></div>
                    <div><div className="meta">Costo aprox.</div><strong>{formatCost(usage?.estimatedCostUsd)}</strong></div>
                  </div>

                  <div className="card result-callout">
                    {selected.status === "completed" ? (
                      <div className="result-ready"><span className="status-light ok" /><strong>Proyecto listo para descargar</strong></div>
                    ) : currentPhase === "packaging" ? (
                      <div className="result-ready"><span className="status-light warn" /><strong>Empaquetando ZIP...</strong></div>
                    ) : (
                      <div className="result-ready"><span className="status-light bad" /><strong>El proyecto aún no está listo</strong></div>
                    )}
                    <div className="muted small">Aquí verás el estado final, el ZIP descargable y las métricas de entrega cuando OpenCode termine y el proceso de empaquetado concluya.</div>
                  </div>

                  {selected.status === "completed" ? (
                    <a className="button" href={`${getApiBase()}/api/projects/${selected.id}/download`} target="_blank" rel="noreferrer">Descargar .zip</a>
                  ) : (
                    <button className="button secondary" disabled>Descarga disponible al finalizar</button>
                  )}
                </div>
              )}
            </>
          ) : embedParams.embed ? (
            <div className="card">
              {!embedParams.sddProjectId ? (
                <p className="muted">Falta el identificador del proyecto en la URL del iframe.</p>
              ) : (
                <p className="muted">Cargando proyecto de generación…</p>
              )}
            </div>
          ) : (
            <div className="card">No hay proyectos todavía. Crea uno para empezar.</div>
          )}
        </section>
      </main>

      {createOpen && (
        <Modal title="Nuevo Proyecto" onClose={() => setCreateOpen(false)}>
          <div className="stack">
            <input className="field" placeholder="Nombre del proyecto" value={projectForm.name} onChange={(event) => setProjectForm((current) => ({ ...current, name: event.target.value }))} />
            <textarea className="field stories-textarea" placeholder="Pega aquí todas las historias de usuario" value={projectForm.userStories} onChange={(event) => setProjectForm((current) => ({ ...current, userStories: event.target.value }))} />
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
              <button className="button" onClick={completeProject} disabled={busy === "complete"}>Confirmar y empaquetar</button>
            </div>
          </div>
        </Modal>
      )}

      {!embedParams.embed && (
        <div className="footer">OpenCode: gpt-5.4-mini · WebSocket + polling por proyecto · OpenSpec local por proyecto</div>
      )}
    </div>
  );
}

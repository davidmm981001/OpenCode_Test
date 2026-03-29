import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { api, getApiBase, getAppLinks } from "./api";
import type { ExecutionPhase, Project, ProjectExecutionSnapshot, ProjectStatus, TerminalPayload, WorkspaceFileEntry } from "./types";

type Tab = "stories" | "console" | "result";
type ConnectionState = "idle" | "connecting" | "open" | "reconnecting";
type StopState = "idle" | "stopping" | "stopped";

type WorkspaceTreeNode = WorkspaceFileEntry & { children: WorkspaceTreeNode[] };

const selectedProjectStorageKey = "sdd-orchestrator:selected-project-id";

const orchestratorStyles = `
:root{color-scheme:dark;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;--bg:#0b1220;--panel:#101a2e;--panel-2:#16233a;--border:rgba(148,163,184,.18);--text:#e2e8f0;--muted:#94a3b8;--accent:#7dd3fc;--accent-2:#a78bfa;--good:#34d399;--warn:#f59e0b;--bad:#ef4444;--accent-soft:rgba(125,211,252,.12)}
*{box-sizing:border-box}html,body,#root{height:100%}body{margin:0;background:radial-gradient(circle at top left,rgba(125,211,252,.14),transparent 30%),radial-gradient(circle at top right,rgba(167,139,250,.12),transparent 25%),linear-gradient(180deg,#050814,#0b1220 30%,#0b1220);color:var(--text)}
a{color:inherit;text-decoration:none}button,input,textarea{font:inherit}
.app-shell{display:grid;grid-template-rows:auto 1fr;min-height:100%}
.topbar{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:16px 20px;border-bottom:1px solid var(--border);background:rgba(8,15,29,.82);backdrop-filter:blur(16px)}
.brand{display:flex;flex-direction:column;gap:4px}.brand h1{margin:0;font-size:18px;letter-spacing:.02em}.brand p{margin:0;color:var(--muted);font-size:13px}
.app-links{display:flex;gap:10px;flex-wrap:wrap}.app-link{padding:10px 14px;border:1px solid var(--border);border-radius:999px;background:rgba(255,255,255,.02);color:var(--muted)}.app-link.active{color:white;border-color:rgba(125,211,252,.5);box-shadow:0 0 0 1px rgba(125,211,252,.12) inset}
.topbar-stats{display:flex;flex-direction:column;gap:4px;text-align:right;color:var(--muted);font-size:12px}
.content{display:grid;grid-template-columns:360px 1fr;gap:16px;padding:16px;min-height:0}
.sidebar,.main-panel,.card,.terminal{background:linear-gradient(180deg,rgba(22,35,58,.92),rgba(16,26,46,.92));border:1px solid var(--border);border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,.2)}
.sidebar{padding:16px;display:flex;flex-direction:column;gap:14px;min-height:0}
.section-title{display:flex;justify-content:space-between;align-items:center;gap:12px}.section-title h2{margin:0;font-size:14px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}
.button{border:1px solid rgba(125,211,252,.28);background:linear-gradient(180deg,rgba(125,211,252,.2),rgba(59,130,246,.18));color:white;border-radius:12px;padding:10px 14px;cursor:pointer}.button.secondary{background:rgba(255,255,255,.03);border-color:var(--border);color:var(--text)}.button.ghost{background:transparent;border-color:var(--border);color:var(--text)}.button.danger{background:rgba(239,68,68,.12);border-color:rgba(239,68,68,.3)}.button:disabled{opacity:.45;cursor:not-allowed}
.project-list{display:flex;flex-direction:column;gap:10px;overflow:auto;min-height:0}.project-item{padding:14px;border:1px solid var(--border);border-radius:16px;background:rgba(255,255,255,.02);cursor:pointer}.project-item.active{border-color:rgba(125,211,252,.5);box-shadow:0 0 0 1px rgba(125,211,252,.12) inset}.project-name{margin:0 0 6px;font-weight:700}
.meta{color:var(--muted);font-size:12px}.small{font-size:12px}.muted{color:var(--muted)}
.badge{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:999px;font-size:12px;font-weight:700}.badge.idle{background:rgba(148,163,184,.12);color:#cbd5e1}.badge.running{background:rgba(59,130,246,.16);color:#93c5fd}.badge.completed{background:rgba(52,211,153,.15);color:#86efac}.badge.error{background:rgba(239,68,68,.14);color:#fca5a5}
.main-panel{padding:16px;min-height:0;display:flex;flex-direction:column;gap:14px}.tabs{display:flex;gap:8px;flex-wrap:wrap}.tab{border:1px solid var(--border);background:rgba(255,255,255,.02);color:var(--text);border-radius:999px;padding:10px 14px;cursor:pointer}.tab.active{border-color:rgba(125,211,252,.5);background:rgba(125,211,252,.12)}
.grid-two{display:grid;grid-template-columns:1fr 1fr;gap:12px}.card{padding:16px}.field,textarea,input[type="text"]{width:100%;border:1px solid var(--border);background:rgba(2,6,23,.38);color:var(--text);border-radius:14px;padding:12px 14px;outline:none}textarea{min-height:180px;resize:vertical}.field:focus,textarea:focus,input[type="text"]:focus{outline:2px solid var(--accent-soft);border-color:var(--accent)}
.status-row{display:flex;gap:10px;flex-wrap:wrap}
.console-grid{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(280px,.9fr);gap:14px;min-height:0}
.terminal{display:flex;flex-direction:column;min-height:0;height:min(64vh,700px);max-height:700px;overflow:hidden}.terminal-body{flex:1;min-height:0;padding:16px;overflow:auto;overscroll-behavior:contain;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;background:linear-gradient(180deg,rgba(0,0,0,.55),rgba(2,6,23,.9))}.terminal-line{white-space:pre-wrap;word-break:break-word;margin:0 0 4px}.terminal-input{border-top:1px solid var(--border);padding:12px;display:flex;gap:10px}.terminal-input input{flex:1}.terminal-input .button{white-space:nowrap}
.files-panel{display:flex;flex-direction:column;gap:12px;min-height:0;height:min(64vh,700px);max-height:700px;overflow:hidden}.files-stats{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}.files-stat-pill{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border:1px solid rgba(125,211,252,.18);border-radius:999px;background:rgba(255,255,255,.03);color:var(--muted);font-size:12px}.files-body{flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;padding-right:4px}
.file-tree-row{display:flex;flex-direction:column}.file-tree-entry{width:100%;display:flex;align-items:center;gap:10px;min-height:34px;padding:6px 10px;margin-bottom:4px;border:1px solid transparent;border-radius:10px;background:rgba(255,255,255,.02);color:inherit;text-align:left;cursor:pointer}.file-tree-entry:hover{background:rgba(125,211,252,.08)}.file-tree-row.directory>.file-tree-entry{color:var(--accent)}.file-tree-row.file>.file-tree-entry{color:#dbeafe}.file-tree-icon{width:28px;flex:0 0 28px;text-align:center;font-size:14px;opacity:.95}.file-entry-path{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;word-break:break-word}.file-tree-children{padding-left:14px;border-left:1px dashed rgba(148,163,184,.18);margin-left:12px}
.console-ready-line{display:inline-flex;align-items:center;gap:8px}.status-light{display:inline-block;width:10px;height:10px;border-radius:999px;box-shadow:0 0 0 4px rgba(255,255,255,.03)}.status-light.ok{background:#22c55e;box-shadow:0 0 0 4px rgba(34,197,94,.12)}.status-light.bad{background:#ef4444;box-shadow:0 0 0 4px rgba(239,68,68,.12)}.status-light.warn{background:#f59e0b;box-shadow:0 0 0 4px rgba(245,158,11,.12)}
.result-callout{display:flex;flex-direction:column;gap:10px;background:rgba(255,255,255,.02)}.result-ready{display:flex;align-items:center;gap:10px}
.stack{display:flex;flex-direction:column;gap:8px}.footer{color:var(--muted);font-size:12px;padding:0 4px 10px}
.modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.6);display:grid;place-items:center;padding:16px}.modal{width:min(560px,100%);background:#0f172a;border:1px solid var(--border);border-radius:20px;padding:20px;box-shadow:0 30px 90px rgba(0,0,0,.45)}.modal h3{margin:0 0 8px}.modal-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:18px}
@media (max-width:980px){.content{grid-template-columns:1fr}.grid-two{grid-template-columns:1fr}.console-grid{grid-template-columns:1fr}.terminal,.files-panel{height:auto;max-height:none}.topbar{flex-direction:column;align-items:flex-start}.topbar-stats{text-align:left}}
`;

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

export default function App() {
  const links = getAppLinks();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<ProjectExecutionSnapshot | null>(null);
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
    selectedIdRef.current = selectedId;
    if (selectedId) window.localStorage.setItem(selectedProjectStorageKey, selectedId);
  }, [selectedId]);

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

  const currentMessage = execution?.message ?? execution?.lastError ?? selected?.lastError ?? "Sin errores reportados";
  const storiesLocked = selected ? selected.status === "running" || selected.status === "completed" : false;
  const canStop = currentPhase !== "idle" && currentPhase !== "completed" && currentPhase !== "error";
  const stopButtonLabel = stopState === "stopping" ? "Deteniendo..." : stopState === "stopped" ? "Proceso detenido" : "Detener proceso";
  const activeConsoleCount = projects.filter((project) => project.status === "running").length;
  const consoleCapacity = 5;
  const availableConsoles = Math.max(consoleCapacity - activeConsoleCount, 0);
  const usage = execution?.usage;
  const consoleReady = Boolean(inputEnabled && execution?.sessionId);
  const consoleReadyLabel = consoleReady ? "Lista para escribir" : "Bloqueada";

  return (
    <div className="app-shell">
      <style>{orchestratorStyles}</style>
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
        <div className="topbar-stats">
          <div><strong>{activeConsoleCount}/{consoleCapacity}</strong> consolas activas</div>
          <div><strong>{availableConsoles}/{consoleCapacity}</strong> disponibles</div>
          <div><strong>{projects.length}</strong> proyectos</div>
        </div>
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
          {selected && execution ? (
            <>
              <div className="card grid-two">
                <div>
                  <div className="section-title">
                    <h2>Proyecto</h2>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <StatusBadge status={selected.status} />
                      <PhaseBadge phase={currentPhase} />
                    </div>
                  </div>
                  <input className="field" value={editingName} onChange={(event) => setEditingName(event.target.value)} disabled={storiesLocked} />
                  <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                    <button className="button secondary" onClick={saveProjectName} disabled={busy !== null || storiesLocked}>Guardar nombre</button>
                    <button className="button danger" onClick={() => setDeleteTarget(selected)}>Eliminar</button>
                    <button className="button secondary" onClick={stopProject} disabled={!canStop || busy !== null || stopState === "stopping"}>{stopButtonLabel}</button>
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
                  <div className="meta" style={{ marginTop: 10 }}>{currentMessage}</div>
                </div>
              </div>

              <div className="tabs">
                {(["stories", "console", "result"] as Tab[]).map((item) => (
                  <button key={item} className={`tab ${tab === item ? "active" : ""}`} onClick={() => setTab(item)}>{item === "stories" ? "Historias de Usuario" : item === "console" ? "Proceso de Ejecución" : "Resultado"}</button>
                ))}
              </div>

              {tab === "stories" && (
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
                      <input className="field" value={consoleInput} onChange={(event) => setConsoleInput(event.target.value)} placeholder={inputEnabled ? "Escribe un mensaje para opencode..." : "El proceso debe estar esperando entrada"} disabled={!inputEnabled} />
                      <button className="button secondary" onClick={sendConsoleInput} disabled={!inputEnabled || !consoleInput.trim()}>Enviar</button>
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
                    <div><div className="meta">Nombre</div><strong>{selected.name}</strong></div>
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
              <button className="button" onClick={completeProject} disabled={busy === "complete"}>Confirmar y empaquetar</button>
            </div>
          </div>
        </Modal>
      )}

      <div className="footer">OpenCode: gpt-5.4-mini · WebSocket + polling por proyecto · OpenSpec local por proyecto</div>
    </div>
  );
}

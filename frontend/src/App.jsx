import { useEffect, useMemo, useState } from "react";
import {
  createProject,
  createRun,
  getArtifact,
  getRagStatus,
  getRun,
  listProjects,
  listRuns,
  uploadRagSources
} from "./api";

const TABS = [
  "Overview",
  "Files",
  "Context",
  "User Stories",
  "Build & Tests",
  "Test Preview",
  "GitHub",
  "Re-modernize"
];

function App() {
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [runs, setRuns] = useState([]);
  const [selectedRun, setSelectedRun] = useState("");
  const [activeTab, setActiveTab] = useState("Overview");
  const [files, setFiles] = useState([]);
  const [ragFiles, setRagFiles] = useState([]);
  const [ragStatus, setRagStatus] = useState(null);
  const [remodernizeComment, setRemodernizeComment] = useState("");
  const [artifactCache, setArtifactCache] = useState({});
  const [status, setStatus] = useState("Ready");
  const [error, setError] = useState("");

  const currentRun = useMemo(
    () => runs.find((run) => run.run_id === selectedRun) || null,
    [runs, selectedRun]
  );

  useEffect(() => {
    refreshProjects();
    refreshRagStatus();
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    refreshRuns(selectedProject);
  }, [selectedProject]);

  async function refreshProjects() {
    try {
      const data = await listProjects();
      setProjects(data);
      if (!selectedProject && data.length) {
        setSelectedProject(data[0].project_id);
      }
    } catch (err) {
      setError(String(err));
    }
  }

  async function refreshRagStatus() {
    try {
      const data = await getRagStatus();
      setRagStatus(data);
    } catch (err) {
      setError(String(err));
    }
  }

  async function refreshRuns(projectId) {
    try {
      const data = await listRuns(projectId);
      setRuns(data);
      if (data.length) {
        setSelectedRun(data[data.length - 1].run_id);
      } else {
        setSelectedRun("");
      }
    } catch (err) {
      setError(String(err));
    }
  }

  async function handleCreateProject() {
    if (projectName.trim().length < 3) return;
    setStatus("Creating project...");
    setError("");
    try {
      const project = await createProject(projectName.trim());
      setProjectName("");
      await refreshProjects();
      setSelectedProject(project.project_id);
      setStatus("Project created");
    } catch (err) {
      setError(String(err));
      setStatus("Error");
    }
  }

  async function handleUploadRag() {
    if (!ragFiles.length) return;
    setStatus("Indexing RAG sources...");
    setError("");
    try {
      await uploadRagSources(ragFiles);
      await refreshRagStatus();
      setStatus("RAG updated");
    } catch (err) {
      setError(String(err));
      setStatus("Error");
    }
  }

  async function handleRun(previousRunId = "") {
    if (!selectedProject || files.length === 0) return;
    setStatus("Running modernization...");
    setError("");
    try {
      const response = await createRun(
        selectedProject,
        files,
        previousRunId ? remodernizeComment : "",
        previousRunId
      );
      await refreshRuns(selectedProject);
      setSelectedRun(response.run_id);
      setStatus(`Run ${response.run_id} finished (${response.state})`);
    } catch (err) {
      setError(String(err));
      setStatus("Error");
    }
  }

  async function loadArtifact(name) {
    if (!selectedProject || !selectedRun) return;
    const key = `${selectedRun}:${name}`;
    if (artifactCache[key]) return;
    try {
      const data = await getArtifact(selectedProject, selectedRun, name);
      setArtifactCache((prev) => ({ ...prev, [key]: data.content }));
    } catch (err) {
      setError(String(err));
    }
  }

  useEffect(() => {
    if (!selectedProject || !selectedRun) return;
    getRun(selectedProject, selectedRun)
      .then((updated) => {
        setRuns((prev) => prev.map((run) => (run.run_id === updated.run_id ? updated : run)));
      })
      .catch(() => {});
  }, [selectedProject, selectedRun]);

  const currentPreview = currentRun?.metadata?.preview_url_public;
  const githubRepo = currentRun?.metadata?.github_repo_url;
  const previewMode = currentRun?.metadata?.preview_mode || "-";

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>Projects</h2>
        <div className="create-project">
          <input
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
            placeholder="New project"
          />
          <button onClick={handleCreateProject}>Create</button>
        </div>
        <ul className="project-list">
          {projects.map((project) => (
            <li key={project.project_id}>
              <button
                className={selectedProject === project.project_id ? "project-item active" : "project-item"}
                onClick={() => setSelectedProject(project.project_id)}
              >
                <span>{project.name}</span>
                <small>{project.project_id}</small>
              </button>
            </li>
          ))}
        </ul>

        <div className="rag-panel">
          <h3>RAG Sources</h3>
          <input type="file" multiple onChange={(e) => setRagFiles(Array.from(e.target.files || []))} />
          <button onClick={handleUploadRag} disabled={!ragFiles.length}>
            Upload and Index
          </button>
          <p className="muted">docs: {ragStatus?.docs_count ?? "-"} | chunks: {ragStatus?.chunks_count ?? "-"}</p>
        </div>
      </aside>

      <main className="workspace">
        <header className="header-card">
          <h1>Legacy Modernization Platform</h1>
          <div className="header-metrics">
            <span>Project: {selectedProject || "none"}</span>
            <span>Run State: {currentRun?.state || "NO RUN"}</span>
            <span>Status: {status}</span>
          </div>
        </header>

        <section className="panel">
          <div className="row">
            <input type="file" multiple onChange={(event) => setFiles(Array.from(event.target.files || []))} />
            <button
              onClick={() => handleRun("")}
              disabled={files.length === 0 || !selectedProject}
              title="Requires >=1 COBOL and >=1 BMS"
            >
              Run Modernization
            </button>
          </div>
          {error && <p className="error">{error}</p>}
        </section>

        <section className="tabs">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={activeTab === tab ? "active" : ""}>
              {tab}
            </button>
          ))}
        </section>

        <section className="content panel">
          {activeTab === "Overview" && (
            <div>
              <h2>Overview</h2>
              <p>Corridas del proyecto: {runs.length}</p>
              <ul>
                {runs.map((run) => (
                  <li key={run.run_id}>
                    <button className="link" onClick={() => setSelectedRun(run.run_id)}>
                      {run.run_id}
                    </button>
                    <span> - {run.state}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "Files" && (
            <div>
              <h2>Files staged for next run</h2>
              <ul>
                {files.map((file) => (
                  <li key={file.name}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "Context" && (
            <div>
              <h2>Unified Context</h2>
              <button onClick={() => loadArtifact("contexto_unificado.json")}>Load context</button>
              <pre>{artifactCache[`${selectedRun}:contexto_unificado.json`] || "No context loaded."}</pre>
            </div>
          )}

          {activeTab === "User Stories" && (
            <div>
              <h2>User Stories (RAG-supported)</h2>
              <button onClick={() => loadArtifact("historias_usuario.md")}>Load stories</button>
              <article className="markdown">{artifactCache[`${selectedRun}:historias_usuario.md`] || "No stories loaded."}</article>
            </div>
          )}

          {activeTab === "Build & Tests" && (
            <div>
              <h2>Build & Tests</h2>
              <ul>
                {currentRun &&
                  Object.values(currentRun.stages).map((stage) => (
                    <li key={stage.name}>
                      {stage.name}: <strong>{stage.status}</strong>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {activeTab === "Test Preview" && (
            <div>
              <h2>Generated App Preview</h2>
              <div className="preview-header">
                <span>Mode: {previewMode}</span>
                <span>{currentPreview || "No preview URL"}</span>
                {currentPreview && (
                  <a href={currentPreview} target="_blank" rel="noreferrer">
                    Open in new tab
                  </a>
                )}
                {githubRepo && (
                  <a href={githubRepo} target="_blank" rel="noreferrer">
                    GitHub Repo
                  </a>
                )}
              </div>
              {currentPreview ? (
                <iframe title="Generated App Preview" src={currentPreview} className="preview" />
              ) : (
                <p>No preview available.</p>
              )}
            </div>
          )}

          {activeTab === "GitHub" && (
            <div>
              <h2>GitHub</h2>
              <p>Preview mode: {previewMode}</p>
              <p>Repo: {githubRepo ? <a href={githubRepo}>{githubRepo}</a> : "Not published"}</p>
              <p>Branch: {currentRun?.metadata?.github_branch || "-"}</p>
              <p>SHA: {currentRun?.metadata?.github_commit_sha || "-"}</p>
            </div>
          )}

          {activeTab === "Re-modernize" && (
            <div>
              <h2>Re-modernize</h2>
              <textarea
                value={remodernizeComment}
                onChange={(event) => setRemodernizeComment(event.target.value)}
                placeholder="Comentario minimo 10 caracteres"
              />
              <p>{remodernizeComment.length} chars</p>
              <button
                onClick={() => handleRun(selectedRun)}
                disabled={!selectedRun || remodernizeComment.trim().length < 10}
              >
                Run Re-modernization
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;

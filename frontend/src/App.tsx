import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type HealthStatus = {
  status: string
  environment: string
  services: {
    api: { status: string }
    postgres: { status: string; detail: string }
    redis: { status: string; detail: string }
    celery: {
      status: string
      detail: string
      active_workers: number
      worker_slots: number
      required_workers: number
    }
  }
}

type Project = {
  id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

type SourceFile = {
  id: string
  file_name: string
  extension: string
  encoding: string
  size_bytes: number
  created_at: string
}

type FilesResponse = {
  source_snapshot_version: number | null
  files: SourceFile[]
}

type AnalysisRun = {
  run_id: string
  source_snapshot_version: number
  coverage: {
    files_processed: number
    relations_total: number
    unresolved_total: number
    unsupported_total: number
    constructs: Record<string, number>
  }
  relational: {
    relations: Array<{ type: string; source: string; target: string }>
    unresolved: Array<{ type: string; source: string; target: string }>
  }
  unsupported_constructs: Array<{
    file_name: string
    line: number | null
    construct: string
    detail: string | null
  }>
  created_at: string
}

type LatestAnalysisResponse = {
  run: AnalysisRun | null
}

function App() {
  const apiBaseUrl = useMemo(
    () => import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
    [],
  )

  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [healthError, setHealthError] = useState<string | null>(null)

  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [filesData, setFilesData] = useState<FilesResponse | null>(null)
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [runningAnalysis, setRunningAnalysis] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisRun | null>(null)

  const loadHealth = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/health`)
      const payload = (await response.json()) as HealthStatus
      setHealth(payload)
      setHealthError(response.ok ? null : 'Servicios con estado degradado')
    } catch {
      setHealthError('No fue posible conectar con /health')
    }
  }

  const loadProjects = async () => {
    const response = await fetch(`${apiBaseUrl}/projects`)
    const payload = (await response.json()) as Project[]
    setProjects(payload)
    if (!selectedProjectId && payload.length > 0) {
      setSelectedProjectId(payload[0].id)
    }
  }

  const loadFiles = async (projectId: string) => {
    const response = await fetch(`${apiBaseUrl}/projects/${projectId}/files`)
    const payload = (await response.json()) as FilesResponse
    setFilesData(payload)
  }

  const loadLatestAnalysis = async (projectId: string) => {
    const response = await fetch(`${apiBaseUrl}/projects/${projectId}/analysis/relational/latest`)
    const payload = (await response.json()) as LatestAnalysisResponse
    setAnalysis(payload.run)
  }

  useEffect(() => {
    loadHealth()
    loadProjects()
  }, [])

  useEffect(() => {
    if (selectedProjectId) {
      loadFiles(selectedProjectId)
      loadLatestAnalysis(selectedProjectId)
    }
  }, [selectedProjectId])

  const handleCreateProject = async (event: FormEvent) => {
    event.preventDefault()
    if (!projectName.trim()) return

    const response = await fetch(`${apiBaseUrl}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: projectName.trim(),
        description: projectDescription.trim() || null,
      }),
    })
    if (!response.ok) {
      setStatusMessage('No se pudo crear el proyecto')
      return
    }

    setProjectName('')
    setProjectDescription('')
    setStatusMessage('Proyecto creado')
    await loadProjects()
  }

  const handleUpload = async (files: FileList | null) => {
    if (!files || !selectedProjectId || files.length === 0) return
    const formData = new FormData()
    Array.from(files).forEach((file) => formData.append('files', file))

    setUploading(true)
    setStatusMessage('')
    try {
      const response = await fetch(`${apiBaseUrl}/projects/${selectedProjectId}/sources/upload`, {
        method: 'POST',
        body: formData,
      })
      const payload = await response.json()
      if (!response.ok) {
        setStatusMessage(payload.detail ?? 'Carga fallida')
      } else {
        setStatusMessage(`Snapshot ${payload.source_snapshot_version} persistido`)
        await loadFiles(selectedProjectId)
        await loadLatestAnalysis(selectedProjectId)
      }
    } catch {
      setStatusMessage('No fue posible subir archivos')
    } finally {
      setUploading(false)
    }
  }

  const runRelationalAnalysis = async () => {
    if (!selectedProjectId) return
    setRunningAnalysis(true)
    setStatusMessage('')
    try {
      const response = await fetch(`${apiBaseUrl}/projects/${selectedProjectId}/analysis/relational`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const payload = await response.json()
      if (!response.ok) {
        setStatusMessage(payload.detail ?? 'No fue posible ejecutar el analisis')
      } else {
        setStatusMessage(`Analisis relacional ejecutado (run ${payload.run_id})`)
        await loadLatestAnalysis(selectedProjectId)
      }
    } catch {
      setStatusMessage('No fue posible ejecutar el analisis relacional')
    } finally {
      setRunningAnalysis(false)
    }
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="chip">HU-02 · Gestión de proyectos</p>
        <h1>SoftFab V2</h1>
        <p className="subtitle">
          Proyectos, snapshots de fuentes y visualización de archivos persistidos.
        </p>
      </section>

      <section className="panel">
        <header className="panel-header">
          <h2>Health</h2>
          <button onClick={loadHealth} className="refresh">
            Revalidar
          </button>
        </header>
        {healthError && <p className="error">{healthError}</p>}
        {health && (
          <div className="grid">
            <article>
              <h3>API</h3>
              <p className={health.services.api.status}>{health.services.api.status}</p>
            </article>
            <article>
              <h3>PostgreSQL</h3>
              <p className={health.services.postgres.status}>{health.services.postgres.status}</p>
              <small>{health.services.postgres.detail}</small>
            </article>
            <article>
              <h3>Redis</h3>
              <p className={health.services.redis.status}>{health.services.redis.status}</p>
              <small>{health.services.redis.detail}</small>
            </article>
            <article>
              <h3>Celery</h3>
              <p className={health.services.celery.status}>{health.services.celery.status}</p>
              <small>{health.services.celery.detail}</small>
            </article>
          </div>
        )}
      </section>

      <section className="panel">
        <h2>Projects</h2>
        <form className="project-form" onSubmit={handleCreateProject}>
          <input
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
            placeholder="Nombre del proyecto"
          />
          <input
            value={projectDescription}
            onChange={(event) => setProjectDescription(event.target.value)}
            placeholder="Descripcion"
          />
          <button className="refresh" type="submit">
            Crear
          </button>
        </form>

        <div className="project-list">
          {projects.map((project) => (
            <button
              key={project.id}
              className={`project-item ${project.id === selectedProjectId ? 'selected' : ''}`}
              onClick={() => setSelectedProjectId(project.id)}
            >
              <strong>{project.name}</strong>
              <small>{project.description ?? 'Sin descripcion'}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Files</h2>
        <label className="upload">
          <span>{uploading ? 'Subiendo...' : 'Subir fuentes (.cob/.cbl/.cpy/.bms/.jcl/.zip)'}</span>
          <input
            type="file"
            multiple
            onChange={(event) => handleUpload(event.target.files)}
            disabled={!selectedProjectId || uploading}
          />
        </label>
        {statusMessage && <p className="muted">{statusMessage}</p>}

        <p className="muted">
          Snapshot actual:{' '}
          <strong>{filesData?.source_snapshot_version ?? 'sin snapshot'}</strong>
        </p>

        <div className="files-table">
          <div className="files-row files-head">
            <span>Archivo</span>
            <span>Tipo</span>
            <span>Encoding</span>
            <span>Tamaño</span>
          </div>
          {(filesData?.files ?? []).map((file) => (
            <div className="files-row" key={file.id}>
              <span>{file.file_name}</span>
              <span>{file.extension}</span>
              <span>{file.encoding}</span>
              <span>{file.size_bytes} bytes</span>
            </div>
          ))}
          {filesData && filesData.files.length === 0 && <p className="muted">Sin archivos</p>}
        </div>
      </section>

      <section className="panel">
        <header className="panel-header">
          <h2>Analisis relacional</h2>
          <button
            className="refresh"
            onClick={runRelationalAnalysis}
            disabled={!selectedProjectId || runningAnalysis}
          >
            {runningAnalysis ? 'Analizando...' : 'Ejecutar analisis'}
          </button>
        </header>

        {!analysis && <p className="muted">Sin corridas de analisis para este proyecto.</p>}

        {analysis && (
          <div className="analysis-grid">
            <article>
              <h3>Run</h3>
              <small>{analysis.run_id}</small>
              <small>snapshot {analysis.source_snapshot_version}</small>
            </article>
            <article>
              <h3>Relaciones</h3>
              <small>{analysis.coverage.relations_total} resueltas</small>
              <small>{analysis.coverage.unresolved_total} no resueltas</small>
            </article>
            <article>
              <h3>Cobertura</h3>
              <small>{analysis.coverage.files_processed} archivos procesados</small>
              <small>{analysis.coverage.unsupported_total} no soportados</small>
            </article>
          </div>
        )}

        {analysis && analysis.unsupported_constructs.length > 0 && (
          <div className="unsupported-list">
            <h3>Unsupported constructs</h3>
            {analysis.unsupported_constructs.slice(0, 6).map((item, idx) => (
              <p key={`${item.file_name}-${idx}`} className="muted">
                {item.file_name}:{item.line ?? '?'} · {item.construct}
              </p>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default App

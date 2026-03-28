import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchUsers } from '../api'
import { useAuth } from '../auth/AuthContext'
import type { UsuarioPage } from '../types'

type Filters = {
  empresa: string
  centro: string
  usuario: string
  perfil: string
  nombre: string
}

const initialFilters: Filters = {
  empresa: '',
  centro: '',
  usuario: '',
  perfil: '',
  nombre: '',
}

export function UsuariosPage() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [pageData, setPageData] = useState<UsuarioPage | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSearch = async (nextPage = 0) => {
    if (!session) return
    if (!Object.values(filters).some(Boolean)) {
      setError('Ingrese Criterio Consulta')
      setPageData(null)
      return
    }

    setLoading(true)
    setError('')
    try {
      const data = await searchUsers(session.token, { ...filters, page: nextPage, size: 14 })
      setPageData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible consultar usuarios')
      setPageData(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel stack">
      <div className="section">
        <h2>Consulta General de Usuarios</h2>
        <p className="muted">Filtros con prioridad heredada, tabla paginada y navegación de alta, detalle y edición.</p>
      </div>

      <form
        className="filters"
        onSubmit={(event) => {
          event.preventDefault()
          void handleSearch(0)
        }}
      >
        <div className="grid-3">
          {([
            ['empresa', 'Empresa'],
            ['centro', 'Centro'],
            ['usuario', 'Usuario'],
            ['perfil', 'Perfil'],
            ['nombre', 'Nombre'],
          ] as const).map(([key, label]) => (
            <label key={key}>
              {label}
              <input
                value={filters[key]}
                onChange={(event) => setFilters((current) => ({ ...current, [key]: event.target.value }))}
              />
            </label>
          ))}
        </div>

        <div className="actions">
          <button type="submit" className="primary" disabled={loading}>{loading ? 'Buscando...' : 'Buscar'}</button>
          <button type="button" className="secondary" onClick={() => navigate('/seguridad/usuarios/nuevo')}>Nuevo</button>
          <button type="button" className="ghost" onClick={() => setFilters(initialFilters)}>Limpiar</button>
        </div>
      </form>

      {error ? <div className="error">{error}</div> : null}
      {pageData ? <div className="success">{pageData.statusMessage}</div> : null}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Selección</th>
              <th>Usuario</th>
              <th>Nombres</th>
              <th>Perfil</th>
              <th>Empresa</th>
              <th>Centro</th>
              <th>Dominio</th>
              <th>Nodo</th>
              <th>Autorizador</th>
            </tr>
          </thead>
          <tbody>
            {(pageData?.content ?? []).map((item) => (
              <tr key={item.usuario} onClick={() => navigate(`/seguridad/usuarios/${item.usuario}`)} style={{ cursor: 'pointer' }}>
                <td>
                  <button type="button" className="ghost" onClick={(event) => { event.stopPropagation(); navigate(`/seguridad/usuarios/${item.usuario}/editar`) }}>Editar</button>
                </td>
                <td>{item.usuario}</td>
                <td>{item.nombres}</td>
                <td>{item.perfil}</td>
                <td>{item.empresa}</td>
                <td>{item.centro}</td>
                <td>{item.dominio}</td>
                <td>{item.nodo}</td>
                <td>{item.autorizador}</td>
              </tr>
            ))}
            {!pageData?.content?.length ? (
              <tr>
                <td colSpan={9} className="muted">Sin resultados</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="actions">
        <button type="button" className="secondary" disabled={!pageData?.hasPrevious} onClick={() => void handleSearch((pageData?.page ?? 0) - 1)}>Anterior</button>
        <button type="button" className="secondary" disabled={!pageData?.hasNext} onClick={() => void handleSearch((pageData?.page ?? 0) + 1)}>Siguiente</button>
        <span className="muted">Página {pageData ? pageData.page + 1 : 0} de {pageData ? pageData.totalPages : 0}</span>
      </div>
    </div>
  )
}

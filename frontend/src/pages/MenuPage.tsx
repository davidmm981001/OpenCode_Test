import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMenu } from '../api'
import { useAuth } from '../auth/AuthContext'
import type { MenuResponse } from '../types'

export function MenuPage() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [menu, setMenu] = useState<MenuResponse | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session) return
    getMenu(session.token)
      .then(setMenu)
      .catch((err) => setError(err instanceof Error ? err.message : 'No fue posible cargar el menú'))
  }, [session])

  return (
    <div className="panel">
      <div className="section">
        <h2>{menu?.applicationName ?? 'Módulo de Seguridad'}</h2>
        <div className="statline">
          <span className="chip">Usuario: {menu?.username ?? session?.username}</span>
          <span className="chip">Nombre: {menu?.fullName ?? session?.fullName}</span>
          <span className="chip">Fecha: {menu?.date ?? '—'}</span>
          <span className="chip">Hora: {menu?.time ?? '—'}</span>
        </div>
        <p className="muted">Seleccione una opción del menú para navegar al módulo correspondiente.</p>
        {error ? <div className="error">{error}</div> : null}
      </div>

      <div className="cards">
        {(menu?.options ?? []).map((option) => (
          <button
            key={option.code}
            className="menu-card"
            onClick={() => {
              if (option.code === 1) {
                navigate('/seguridad/usuarios')
              } else {
                navigate(`/seguridad/menu/${option.code}`)
              }
            }}
          >
            <strong>{String(option.code).padStart(2, '0')}</strong>
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

import { useNavigate, useParams } from 'react-router-dom'

const labels: Record<string, string> = {
  '2': 'Administración de Menús',
  '3': 'Administración Tabla Parámetros',
  '4': 'Administración de Perfiles de recursos',
  '5': 'Administración de Recursos de Host',
  '6': 'Consulta de Perfiles de ventana marco',
  '7': 'Consulta de Perfiles de recursos',
  '8': 'Consulta de Recursos de Host',
  '9': 'Reseteo de Claves / Modificar Dominio y Nodo',
}

export function PlaceholderPage() {
  const { code } = useParams()
  const navigate = useNavigate()
  const label = labels[code ?? ''] ?? 'Módulo de seguridad'

  return (
    <div className="placeholder-page">
      <div className="placeholder-card">
        <div className="section">
          <h2>{label}</h2>
          <p className="muted">Este módulo queda navegable para respetar el menú legado. La funcionalidad completa puede ampliarse en una iteración posterior.</p>
        </div>
        <div className="actions">
          <button className="secondary" type="button" onClick={() => navigate('/seguridad')}>Volver al menú</button>
          <button className="ghost" type="button" onClick={() => navigate('/seguridad/usuarios')}>Ir a usuarios</button>
        </div>
      </div>
    </div>
  )
}

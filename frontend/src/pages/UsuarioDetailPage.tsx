import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { deleteUser, getUser } from '../api'
import { useAuth } from '../auth/AuthContext'
import type { UsuarioDetalle } from '../types'

export function UsuarioDetailPage() {
  const { usuario } = useParams()
  const { session } = useAuth()
  const navigate = useNavigate()
  const [detail, setDetail] = useState<UsuarioDetalle | null>(null)
  const [error, setError] = useState('')
  const [showDelete, setShowDelete] = useState(false)
  const [observacion, setObservacion] = useState('')

  useEffect(() => {
    if (session && usuario) {
      getUser(session.token, usuario)
        .then(setDetail)
        .catch((err) => setError(err instanceof Error ? err.message : 'No fue posible cargar el detalle'))
    }
  }, [session, usuario])

  return (
    <div className="panel stack">
      <div className="section">
        <h2>Detalle de Usuario</h2>
        <p className="muted">Vista enriquecida con datos de lookup, BANCS, observaciones y auditoría.</p>
      </div>

      {error ? <div className="error">{error}</div> : null}

      {detail ? (
        <>
          <div className="grid-3">
            {[
              ['Usuario', detail.usuario],
              ['Nombre', detail.nombre],
              ['Cédula', detail.cedula ?? '—'],
              ['Cargo', detail.cargo ?? '—'],
              ['Empresa', `${detail.empresa} - ${detail.empresaNombre ?? '—'}`],
              ['Centro', `${detail.centro} - ${detail.centroNombre ?? '—'}`],
              ['Perfil', `${detail.perfil} - ${detail.perfilDescripcion ?? '—'}`],
              ['Dominio', detail.dominio ?? '—'],
              ['Nodo', detail.nodo ?? '—'],
              ['Autorizador', detail.autorizador ?? '—'],
              ['Usuario BANCS', detail.usuarioBancs ?? '—'],
              ['Terminal BANCS', detail.terminalBancs ?? '—'],
              ['Oficina Swift', detail.oficinaSwift ?? '—'],
            ].map(([label, value]) => (
              <label key={label}>
                {label}
                <input readOnly value={String(value)} />
              </label>
            ))}
          </div>

          <label>
            Observaciones
            <textarea readOnly value={detail.observacion ?? ''} rows={3} />
          </label>

          <div className="statline">
            <span className="chip">Última actualización: {detail.fechaActualizacion ?? '—'} {detail.horaActualizacion ?? ''}</span>
            <span className="chip">Actualizó: {detail.usuarioActualizacion ?? '—'}</span>
            <span className="chip">Terminal: {detail.terminalActualizacion ?? '—'}</span>
            <span className="chip">Último sign-on: {detail.fechaLogin ?? '—'} {detail.horaLogin ?? ''}</span>
          </div>

          <div className="actions">
            <button className="secondary" type="button" onClick={() => navigate(`/seguridad/usuarios/${detail.usuario}/editar`)}>Editar</button>
            <button className="danger" type="button" onClick={() => setShowDelete(true)}>Eliminar</button>
            <button className="ghost" type="button" onClick={() => navigate('/seguridad/usuarios')}>Volver</button>
          </div>
        </>
      ) : null}

      {showDelete ? (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Eliminar usuario</h3>
            <p className="muted">Ingrese observaciones obligatorias para registrar la baja.</p>
            <label>
              Observaciones
              <textarea value={observacion} onChange={(event) => setObservacion(event.target.value)} rows={4} />
            </label>
            <div className="actions">
              <button
                className="danger"
                type="button"
                onClick={async () => {
                  if (!session || !usuario) return
                  try {
                    await deleteUser(session.token, usuario, observacion)
                    navigate('/seguridad/usuarios')
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'No fue posible eliminar')
                  }
                }}
              >
                Confirmar eliminación
              </button>
              <button className="ghost" type="button" onClick={() => setShowDelete(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

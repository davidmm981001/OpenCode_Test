import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createUser, getUser, updateUser } from '../api'
import { useAuth } from '../auth/AuthContext'
import type { UsuarioDetalle, UsuarioFormValues } from '../types'

const emptyValues: UsuarioFormValues = {
  usuario: '',
  nombre: '',
  cedula: '',
  cargo: '',
  empresa: '',
  centro: '',
  perfil: '',
  autorizador: '0',
  usuarioBancs: '',
  terminalBancs: '',
  observacion: '',
  oficinaSwift: '',
}

export function UsuarioFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { usuario } = useParams()
  const { session } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState<UsuarioFormValues>(emptyValues)
  const [meta, setMeta] = useState<UsuarioDetalle | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (mode === 'edit' && session && usuario) {
      getUser(session.token, usuario)
        .then((data) => {
          setMeta(data)
          setValues({
            usuario: data.usuario,
            nombre: data.nombre,
            cedula: data.cedula ?? '',
            cargo: data.cargo ?? '',
            empresa: data.empresa,
            centro: data.centro,
            perfil: data.perfil,
            autorizador: data.autorizador ?? '0',
            usuarioBancs: data.usuarioBancs ?? '',
            terminalBancs: data.terminalBancs ?? '',
            observacion: data.observacion ?? '',
            oficinaSwift: data.oficinaSwift ?? '',
          })
        })
        .catch((err) => setError(err instanceof Error ? err.message : 'No fue posible cargar el usuario'))
    }
  }, [mode, session, usuario])

  const title = mode === 'create' ? 'Alta de Usuario' : 'Modificación de Usuario'

  return (
    <div className="panel stack">
      <div className="section">
        <h2>{title}</h2>
        <p className="muted">Validaciones completas, campos BANCS opcionales y auditoría de negocio.</p>
      </div>

      {meta ? (
        <div className="statline">
          <span className="chip">Dominio: {meta.dominio ?? '—'}</span>
          <span className="chip">Nodo: {meta.nodo ?? '—'}</span>
          <span className="chip">Última actualización: {meta.fechaActualizacion ?? '—'} {meta.horaActualizacion ?? ''}</span>
        </div>
      ) : null}

      <form
        className="user-form"
        onSubmit={async (event) => {
          event.preventDefault()
          if (values.usuarioBancs && !values.terminalBancs) {
            setError('Terminal BANCS es obligatoria si se ingresa Usuario BANCS')
            return
          }
          if (!values.usuarioBancs && values.terminalBancs) {
            setError('Usuario BANCS es obligatorio si se ingresa Terminal BANCS')
            return
          }
          setLoading(true)
          setError('')
          try {
            if (!session) throw new Error('Sesión no disponible')
            if (mode === 'create') {
              await createUser(session.token, values)
            } else if (usuario) {
              await updateUser(session.token, usuario, values)
            }
            navigate('/seguridad/usuarios')
          } catch (err) {
            setError(err instanceof Error ? err.message : 'No fue posible guardar')
          } finally {
            setLoading(false)
          }
        }}
      >
        <div className="grid-3">
          {([
            ['usuario', 'Usuario'],
            ['nombre', 'Nombres'],
            ['cedula', 'Cédula Identidad'],
            ['cargo', 'Cargo'],
            ['empresa', 'Empresa'],
            ['centro', 'Centro'],
            ['perfil', 'Perfil'],
            ['usuarioBancs', 'Usuario BANCS'],
            ['terminalBancs', 'Terminal BANCS'],
            ['observacion', 'Observaciones'],
            ['oficinaSwift', 'Oficina Swift'],
          ] as const).map(([key, label]) => (
            <label key={key}>
              {label}
              <input
                value={values[key]}
                readOnly={mode === 'edit' && key === 'usuario'}
                onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))}
              />
            </label>
          ))}
          <label>
            Autorizador
            <select value={values.autorizador} onChange={(event) => setValues((current) => ({ ...current, autorizador: event.target.value }))}>
              <option value="0">0 - No</option>
              <option value="1">1 - Sí</option>
            </select>
          </label>
        </div>

        {error ? <div className="error">{error}</div> : null}

        <div className="actions">
          <button type="submit" className="primary" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
          <button type="button" className="secondary" onClick={() => navigate('/seguridad/usuarios')}>Volver</button>
        </div>
      </form>
    </div>
  )
}

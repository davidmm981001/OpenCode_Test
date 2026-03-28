import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand">Módulo de Seguridad</div>
        <p className="muted">Acceso moderno al módulo migrado desde COBOL/BMS.</p>

        <form
          className="login-form"
          onSubmit={async (event) => {
            event.preventDefault()
            setLoading(true)
            setError('')
            try {
              await login(username, password)
              navigate('/seguridad')
            } catch (err) {
              setError(err instanceof Error ? err.message : 'No fue posible iniciar sesión')
            } finally {
              setLoading(false)
            }
          }}
        >
          <label>
            Usuario
            <input value={username} onChange={(event) => setUsername(event.target.value)} />
          </label>
          <label>
            Contraseña
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {error ? <div className="error">{error}</div> : null}
          <button type="submit" className="primary" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}

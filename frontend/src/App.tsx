import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { MenuPage } from './pages/MenuPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { UsuarioDetailPage } from './pages/UsuarioDetailPage'
import { UsuarioFormPage } from './pages/UsuarioFormPage'
import { UsuariosPage } from './pages/UsuariosPage'

function AppShell() {
  const { session, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand">Seguridad</div>
          <p className="muted">React + Spring + PostgreSQL</p>
        </div>
        <nav className="side-nav">
          <button type="button" onClick={() => navigate('/seguridad')}>Menú</button>
          <button type="button" onClick={() => navigate('/seguridad/usuarios')}>Usuarios</button>
          <button type="button" onClick={() => navigate('/seguridad/usuarios/nuevo')}>Nuevo usuario</button>
          <button type="button" onClick={() => navigate('/seguridad/menu/9')}>Opciones</button>
        </nav>
        <div className="sidebar-footer">
          <p>{session?.fullName}</p>
          <button
            type="button"
            className="ghost"
            onClick={async () => {
              await logout()
              navigate('/login')
            }}
          >
            Salir
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Routes>
          <Route path="/seguridad" element={<MenuPage />} />
          <Route path="/seguridad/usuarios" element={<UsuariosPage />} />
          <Route path="/seguridad/usuarios/nuevo" element={<UsuarioFormPage mode="create" />} />
          <Route path="/seguridad/usuarios/:usuario" element={<UsuarioDetailPage />} />
          <Route path="/seguridad/usuarios/:usuario/editar" element={<UsuarioFormPage mode="edit" />} />
          <Route path="/seguridad/menu/:code" element={<PlaceholderPage />} />
          <Route path="*" element={<Navigate to="/seguridad" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export function App() {
  const { session } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={(
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        )}
      />
      <Route path="*" element={<Navigate to={session ? '/seguridad' : '/login'} replace />} />
    </Routes>
  )
}

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { login as loginApi, logout as logoutApi, me as meApi } from '../api'
import type { SessionUser } from '../types'

type AuthContextValue = {
  session: SessionUser | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const STORAGE_KEY = 'seguridad.session'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      setLoading(false)
      return
    }

    let parsed: SessionUser | null = null
    try {
      parsed = JSON.parse(raw) as SessionUser
    } catch {
      localStorage.removeItem(STORAGE_KEY)
      setLoading(false)
      return
    }

    if (!parsed) {
      localStorage.removeItem(STORAGE_KEY)
      setLoading(false)
      return
    }

    meApi(parsed.token)
      .then((current) => setSession({ ...current, token: parsed.token }))
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY)
        setSession(null)
      })
      .finally(() => setLoading(false))
  }, [])

  async function login(username: string, password: string) {
    const next = await loginApi(username, password)
    setSession(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  async function logout() {
    if (session) {
      await logoutApi(session.token).catch(() => undefined)
    }
    localStorage.removeItem(STORAGE_KEY)
    setSession(null)
  }

  const value = useMemo(() => ({ session, loading, login, logout }), [session, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}

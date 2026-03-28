import type {
  MenuResponse,
  SessionUser,
  UsuarioDetalle,
  UsuarioFormValues,
  UsuarioPage,
} from './types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8080'

type RequestOptions = RequestInit & { token?: string }

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`)
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ message: 'Error' }))
    throw new Error(payload.message ?? 'Error')
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export function login(username: string, password: string) {
  return request<SessionUser & { token: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function me(token: string) {
  return request<SessionUser>('/api/auth/me', { token })
}

export function logout(token: string) {
  return request<{ message: string }>('/api/auth/logout', {
    method: 'POST',
    token,
  })
}

export function getMenu(token: string) {
  return request<MenuResponse>('/api/seguridad/menu', { token })
}

export function searchUsers(token: string, params: Record<string, string | number>) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== undefined && value !== null) search.set(key, String(value))
  })
  return request<UsuarioPage>(`/api/seguridad/usuarios?${search.toString()}`, { token })
}

export function getUser(token: string, usuario: string) {
  return request<UsuarioDetalle>(`/api/seguridad/usuarios/${encodeURIComponent(usuario)}`, { token })
}

export function createUser(token: string, values: UsuarioFormValues) {
  return request<UsuarioDetalle>('/api/seguridad/usuarios', {
    method: 'POST',
    token,
    body: JSON.stringify(values),
  })
}

export function updateUser(token: string, usuario: string, values: UsuarioFormValues) {
  return request<UsuarioDetalle>(`/api/seguridad/usuarios/${encodeURIComponent(usuario)}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(values),
  })
}

export function deleteUser(token: string, usuario: string, observacion: string) {
  const search = new URLSearchParams({ observacion })
  return request<void>(`/api/seguridad/usuarios/${encodeURIComponent(usuario)}?${search.toString()}`, {
    method: 'DELETE',
    token,
  })
}

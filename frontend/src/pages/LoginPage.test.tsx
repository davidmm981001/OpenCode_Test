import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LoginPage } from './LoginPage'

const navigate = vi.fn()
const login = vi.fn().mockResolvedValue(undefined)

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => navigate }
})

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({ login, session: null, loading: false, logout: vi.fn() }),
}))

describe('LoginPage', () => {
  it('debe autenticar y navegar', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(login).toHaveBeenCalledWith('admin', 'admin123')
    expect(navigate).toHaveBeenCalledWith('/seguridad')
  })
})

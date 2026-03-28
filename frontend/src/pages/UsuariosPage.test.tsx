import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { UsuariosPage } from './UsuariosPage'

const navigate = vi.fn()
const searchUsers = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => navigate }
})

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    session: { token: 'token', username: 'admin', fullName: 'Admin', roles: 'ROLE_ADMIN' },
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}))

vi.mock('../api', () => ({
  searchUsers: (...args: unknown[]) => searchUsers(...args),
}))

describe('UsuariosPage', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    searchUsers.mockReset()
    navigate.mockReset()
  })

  it('debe pedir criterio cuando no hay filtros', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <UsuariosPage />
      </MemoryRouter>,
    )

    await user.click(screen.getAllByRole('button', { name: 'Buscar' })[0])

    expect(screen.getByText('Ingrese Criterio Consulta')).toBeInTheDocument()
    expect(searchUsers).not.toHaveBeenCalled()
  })

  it('debe mostrar resultados paginados', async () => {
    searchUsers.mockResolvedValue({
      content: [
        { usuario: 'USR00001', nombres: 'Juan Perez', perfil: 'ADM', empresa: '0001', centro: '0001', dominio: 'DOM1', nodo: 'NOD1', autorizador: '1' },
      ],
      page: 0,
      size: 14,
      totalElements: 1,
      totalPages: 1,
      hasPrevious: false,
      hasNext: false,
      statusMessage: 'No existen más Datos',
    })

    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <UsuariosPage />
      </MemoryRouter>,
    )

    await user.type(screen.getAllByLabelText('Empresa')[0], '0001')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))

    expect(searchUsers).toHaveBeenCalled()
    expect(screen.getByText('USR00001')).toBeInTheDocument()
    expect(screen.getByText('No existen más Datos')).toBeInTheDocument()
  })
})

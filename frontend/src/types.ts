export type SessionUser = {
  username: string
  fullName: string
  roles: string
  token: string
}

export type MenuOption = {
  code: number
  label: string
  route: string
}

export type MenuResponse = {
  applicationName: string
  username: string
  fullName: string
  date: string
  time: string
  options: MenuOption[]
}

export type UsuarioListItem = {
  usuario: string
  nombres: string
  perfil: string
  empresa: string
  centro: string
  dominio: string
  nodo: string
  autorizador: string
}

export type UsuarioPage = {
  content: UsuarioListItem[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasPrevious: boolean
  hasNext: boolean
  statusMessage: string
}

export type UsuarioDetalle = {
  usuario: string
  nombre: string
  cedula: string | null
  cargo: string | null
  empresa: string
  empresaNombre: string | null
  centro: string
  centroNombre: string | null
  perfil: string
  perfilDescripcion: string | null
  dominio: string | null
  nodo: string | null
  autorizador: string | null
  usuarioBancs: string | null
  terminalBancs: string | null
  observacion: string | null
  oficinaSwift: string | null
  fechaActualizacion: string | null
  horaActualizacion: string | null
  usuarioActualizacion: string | null
  terminalActualizacion: string | null
  fechaLogin: string | null
  horaLogin: string | null
}

export type UsuarioFormValues = {
  usuario: string
  nombre: string
  cedula: string
  cargo: string
  empresa: string
  centro: string
  perfil: string
  autorizador: string
  usuarioBancs: string
  terminalBancs: string
  observacion: string
  oficinaSwift: string
}

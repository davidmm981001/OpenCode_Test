## ADDED Requirements

### Requirement: Inicio de sesión protegido
El sistema MUST permitir que un usuario autenticado acceda al módulo de seguridad mediante credenciales válidas y reciba un token JWT válido para mantener la sesión.

#### Scenario: Credenciales válidas
- **WHEN** el usuario envía usuario y contraseña correctos
- **THEN** el sistema responde con un token JWT y los datos básicos de sesión

#### Scenario: Credenciales inválidas
- **WHEN** el usuario envía credenciales incorrectas
- **THEN** el sistema rechaza el acceso y muestra un mensaje de error

### Requirement: Acceso restringido a rutas seguras
El sistema MUST bloquear el acceso a las rutas de seguridad cuando no exista una sesión activa.

#### Scenario: Ruta segura sin sesión
- **WHEN** un usuario no autenticado intenta abrir una ruta protegida
- **THEN** el sistema redirige a la pantalla de inicio de sesión

### Requirement: Cierre de sesión
El sistema MUST cerrar la sesión activa, eliminar el token local y evitar el acceso posterior a rutas protegidas.

#### Scenario: Cierre exitoso
- **WHEN** el usuario pulsa "Salir"
- **THEN** el sistema invalida la sesión local y redirige al login

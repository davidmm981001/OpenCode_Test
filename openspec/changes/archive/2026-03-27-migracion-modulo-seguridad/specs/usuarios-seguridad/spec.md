## ADDED Requirements

### Requirement: Consulta paginada de usuarios
El sistema MUST permitir consultar usuarios con filtros por empresa, centro, usuario, perfil y nombre, mostrando resultados paginados en bloques de 14 registros.

#### Scenario: Consulta sin criterios
- **WHEN** el usuario busca sin ingresar ningún criterio
- **THEN** el sistema muestra "Ingrese Criterio Consulta"

#### Scenario: Consulta con filtros
- **WHEN** el usuario ingresa un criterio válido
- **THEN** el sistema muestra una tabla paginada con los usuarios encontrados

### Requirement: Prioridad de filtros heredada
El sistema MUST aplicar la prioridad de filtros del legado al resolver la consulta.

#### Scenario: Múltiples campos informados
- **WHEN** el usuario ingresa varios filtros simultáneamente
- **THEN** el sistema aplica la prioridad funcional definida para empresa, centro, usuario, perfil y nombre

### Requirement: Detalle enriquecido de usuario
El sistema MUST mostrar el detalle completo de un usuario incluyendo datos generales, BANCS, observaciones, empresa, centro, perfil y auditoría.

#### Scenario: Usuario existente
- **WHEN** el usuario solicita el detalle de un usuario existente
- **THEN** el sistema devuelve toda la información enriquecida y legible

### Requirement: Alta de usuario con validaciones
El sistema MUST permitir crear usuarios validando obligatoriedad, formatos y existencia de empresa, centro y perfil.

#### Scenario: Alta válida
- **WHEN** el usuario completa todos los campos obligatorios y las referencias existen
- **THEN** el sistema crea el usuario y registra BANCS, observaciones y auditoría si corresponde

#### Scenario: Alta inválida
- **WHEN** falta un campo obligatorio o una referencia no existe
- **THEN** el sistema rechaza la operación con el mensaje de validación correspondiente

### Requirement: Modificación y eliminación de usuario
El sistema MUST permitir modificar y eliminar usuarios manteniendo la lógica de BANCS, observaciones y auditoría.

#### Scenario: Modificación exitosa
- **WHEN** el usuario actualiza datos válidos
- **THEN** el sistema persiste los cambios y conserva el historial necesario para auditoría

#### Scenario: Eliminación con observación
- **WHEN** el usuario solicita eliminar una cuenta con observación obligatoria
- **THEN** el sistema elimina o marca los registros según la regla de negocio y registra la auditoría

### Requirement: Búsqueda con comodines y mensajes de estado
El sistema MUST soportar comodines en usuario, perfil y nombre y mostrar mensajes de estado de paginación.

#### Scenario: Navegación de páginas
- **WHEN** existen más registros que la página actual
- **THEN** el sistema habilita navegación adelante y atrás y muestra el mensaje de estado correspondiente

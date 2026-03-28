## ADDED Requirements

### Requirement: Menú principal de seguridad
El sistema MUST mostrar un menú principal de seguridad con encabezado, fecha, hora, usuario autenticado y nombre de la aplicación.

#### Scenario: Render inicial del menú
- **WHEN** un usuario autenticado abre la ruta de seguridad
- **THEN** el sistema muestra el encabezado y las 9 opciones del menú

### Requirement: Navegación por opción válida
El sistema MUST permitir que cada opción válida del menú navegue a su ruta correspondiente.

#### Scenario: Opción válida
- **WHEN** el usuario selecciona una opción numérica válida
- **THEN** el sistema navega al módulo correspondiente

### Requirement: Validación de entrada numérica
El sistema MUST rechazar valores no numéricos en la opción del menú.

#### Scenario: Entrada no numérica
- **WHEN** el usuario ingresa un valor no numérico
- **THEN** el sistema muestra el mensaje "Ingrese un valor numérico"

### Requirement: Validación de rango del menú
El sistema MUST rechazar opciones fuera del rango permitido.

#### Scenario: Opción fuera de rango
- **WHEN** el usuario ingresa una opción fuera del rango definido
- **THEN** el sistema muestra el mensaje "Opción inválida"

### Requirement: Salida del menú
El sistema MUST permitir salir del módulo de seguridad desde el menú principal.

#### Scenario: Salida
- **WHEN** el usuario pulsa "Salir" o su equivalente funcional
- **THEN** el sistema cierra la sesión o regresa al dashboard protegido según el estado de autenticación

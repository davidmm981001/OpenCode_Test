## ADDED Requirements

### Requirement: Layout principal compartido
El sistema MUST mostrar una estructura de navegacion comun con encabezado, contenido y pie de pagina en todas las rutas publicas.

#### Scenario: Navegacion visible en todas las paginas
- **WHEN** el usuario accede a cualquier ruta publica
- **THEN** el sistema muestra un navbar con el nombre de la aplicacion y los enlaces Home, About y Contact
- **AND** renderiza el contenido de la ruta activa dentro del layout
- **AND** muestra un footer con el año actual

#### Scenario: Navegacion SPA
- **WHEN** el usuario hace clic en un enlace del menu
- **THEN** la aplicacion navega sin recargar completamente la pagina

### Requirement: Pagina About informativa
El sistema MUST mostrar una pagina About estaticamente renderizada y sin dependencia del backend.

#### Scenario: Acceso a About
- **WHEN** el usuario navega a `/about`
- **THEN** el sistema muestra el titulo `About`
- **AND** muestra el texto `Your application description page.`
- **AND** muestra el texto `Use this area to provide additional information.`

### Requirement: Pagina Contact informativa
El sistema MUST mostrar una pagina Contact estaticamente renderizada con datos de contacto publicados.

#### Scenario: Acceso a Contact
- **WHEN** el usuario navega a `/contact`
- **THEN** el sistema muestra el titulo `Contact`
- **AND** muestra la direccion `One Microsoft Way, Redmond, WA 98052-6399`
- **AND** muestra el telefono `425.555.0100`
- **AND** muestra enlaces `mailto:` para `Support@example.com` y `Marketing@example.com`

### Requirement: Listado de productos en la pantalla principal
El sistema MUST mostrar todos los productos existentes en una tabla al abrir la ruta principal `/`.

#### Scenario: Carga inicial muestra la tabla
- **WHEN** el usuario accede a `/`
- **THEN** el sistema consulta `GET /api/productos`
- **AND** muestra una tabla responsive con las columnas ID, Nombre, Cantidad, Precio y Acciones
- **AND** cada fila muestra una accion `Delete`

#### Scenario: Sin productos registrados
- **WHEN** no existen productos en la base de datos
- **THEN** el sistema muestra la tabla vacia o un mensaje equivalente sin error visible

#### Scenario: Error al cargar el listado
- **WHEN** la consulta al backend falla
- **THEN** el sistema muestra un mensaje de error visible al usuario

### Requirement: Registro de producto desde modal
El sistema MUST permitir crear un producto desde un modal en la pantalla principal.

#### Scenario: Abrir modal limpia el formulario
- **WHEN** el usuario abre el modal `Nuevo producto`
- **THEN** los campos Nombre, Cantidad y Precio quedan vacios
- **AND** cualquier error previo se oculta

#### Scenario: Guardado exitoso refresca el listado
- **WHEN** el usuario envia un Nombre valido, una Cantidad valida y un Precio valido
- **THEN** el sistema persiste el producto
- **AND** cierra el modal
- **AND** refresca la tabla

#### Scenario: Nombre vacio rechaza el guardado
- **WHEN** el Nombre viene vacio o solo con espacios
- **THEN** el sistema rechaza la operacion con el mensaje `Nombre requerido`

#### Scenario: Formato invalido rechaza el guardado
- **WHEN** Cantidad o Precio no son numericos validos
- **THEN** el sistema mantiene el modal abierto
- **AND** muestra `Revise cantidad y precio: deben ser números válidos.`

#### Scenario: Error inesperado al guardar
- **WHEN** ocurre un error de negocio o persistencia distinto al formato
- **THEN** el sistema muestra `No se pudo guardar: {mensaje}`

### Requirement: Eliminacion silenciosa de producto
El sistema MUST permitir eliminar productos por Id desde la tabla sin mostrar error visible si el Id no existe.

#### Scenario: Eliminacion existente
- **WHEN** el usuario ejecuta `Delete` sobre una fila existente
- **THEN** el sistema elimina el producto por Id
- **AND** refresca la tabla

#### Scenario: Eliminacion inexistente es silenciosa
- **WHEN** el producto ya no existe al momento de eliminar
- **THEN** el sistema completa la operacion sin error visible

### Requirement: Esquema de base de datos
El sistema MUST definir una tabla `productos` compatible con PostgreSQL para almacenar los datos del inventario.

#### Scenario: Estructura de tabla
- **WHEN** se crea el esquema de persistencia
- **THEN** la tabla incluye `id`, `nombre`, `cantidad` y `precio`
- **AND** `id` es autoincremental y clave primaria
- **AND** `precio` usa precision decimal adecuada

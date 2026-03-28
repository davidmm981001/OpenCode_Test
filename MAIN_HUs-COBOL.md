Historias de Usuario - Migración del Módulo de Seguridad (COBOL/BMS → React + Java Spring + PostgreSQL)
Análisis Previo del Sistema Legacy
El sistema analizado es un Módulo de Seguridad que gestiona usuarios, perfiles, y recursos en un entorno mainframe CICS. Los componentes son:
Componente
Tipo
Función
SSIM001.bms
Mapa BMS
Menú principal de seguridad (9 opciones)
SSIM002.bms
Mapa BMS
Consulta general de usuarios (lista paginada)
SSIM007.bms
Mapa BMS
Formulario de administración de usuarios (CRUD)
SSITP001.CBL
Programa COBOL
Lógica del menú principal, navegación por XCTL
SSITP002.CBL
Programa COBOL
Consultas SQL por empresa, centro, usuario, perfil, nombre
SSITP007.CBL
Programa COBOL
Alta, consulta, modificación, eliminación de usuarios + integración BANCS

Tablas DB2 identificadas: T95USU03 (usuarios), T95BAN04 (usuarios BANCS), T95OBS04 (observaciones), T95PAR02 (parámetros/perfiles), T01GRE20 (perfiles-recursos), T06TC005 (empresas), T06TC007 (centros).




HU-01: Menú Principal del Módulo de Seguridad
Título: Navegación principal del módulo de seguridad
Descripción: Como administrador de seguridad, necesito acceder a un menú principal que me permita navegar a los distintos submódulos del sistema de seguridad, para gestionar usuarios, menús, parámetros, perfiles y recursos.
Actor: Administrador de Seguridad (usuario autenticado)
Pantalla origen BMS: SSIM001.bms → mapa PRG00M1 Programa origen: SSITP001.CBL (PRG000)
Criterios de Aceptación:
Solo usuarios autenticados pueden ver el menú (en COBOL se valida W-USERID ≠ SPACES; en el sistema moderno se usa autenticación JWT/Session).
Se muestra la fecha, hora, usuario logueado y nombre de la aplicación en el header.
Se presentan las 9 opciones del menú:
(01) Administración de Usuarios
(02) Administración de Menús
(03) Administración Tabla Parámetros
(04) Administración de Perfiles de recursos
(05) Administración de Recursos de Host
(06) Consulta de Perfiles de ventana marco
(07) Consulta de Perfiles de recursos
(08) Consulta de Recursos de Host
(09) Reseteo de Claves / Modificar Dominio y Nodo
Si se ingresa una opción no numérica → mensaje "Ingrese un valor numérico".
Si se ingresa opción fuera de rango (no 1-10) → mensaje "Opción inválida".
Opción válida → redirige al módulo correspondiente.
Acción de salir (equivalente a CLEAR/CICS RETURN) → cierra sesión o regresa al dashboard.
Flujo Funcional:
Usuario accede a /seguridad (ruta React).
Frontend muestra menú con tarjetas o lista de opciones.
Usuario selecciona opción → React Router navega a la ruta correspondiente.
Si la opción es inválida (fuera de rango), se muestra toast/alerta de error.
Reglas de Negocio:
El programa original valida M1OPCIOI NUMERIC y rango 1-10.
El XCTL a cada programa se traduce como navegación de rutas React.
Teclas PF5/CLEAR se traducen como botones "Refrescar" / "Salir".
Notas Técnicas de Mapeo:
COBOL/CICS
Stack Moderno
EXEC CICS ASSIGN USERID
Token JWT / SecurityContextHolder.getContext()
EXEC CICS XCTL PROGRAM('SSITP002')
React Router: navigate('/seguridad/usuarios')
EXEC CICS RETURN TRANSID('PRG0')
Mantener sesión en SPA (Single Page App)
EXEC CICS SEND MAP / RECEIVE MAP
Renderizado React + llamadas API REST
Campo M1OPCIOI (input numérico 2 dígitos)
<Select> o botones de navegación
COMMAREA (W-COMMAREA)
Estado React (Context/Redux) o parámetros de URL







HU-02: Consulta General de Usuarios con Filtros y Paginación
Título: Búsqueda y listado paginado de usuarios del sistema
Descripción: Como administrador de seguridad, necesito consultar usuarios del sistema filtrando por empresa, centro, código de usuario, perfil o nombre, visualizando los resultados en una tabla paginada, para localizar y gestionar cuentas rápidamente.
Actor: Administrador de Seguridad
Pantalla origen BMS: SSIM002.bms → mapa SSI0201 Programa origen: SSITP002.CBL
Criterios de Aceptación:
Se presenta un formulario de filtros con campos: Empresa (4 dígitos), Centro (4 dígitos), Usuario (8 caracteres, soporta comodines), Perfil (8 caracteres, soporta comodines), Nombre (40 caracteres, soporta comodines), Número de registros para paginar.
Los filtros tienen prioridad: se evalúa el primer campo no vacío en orden Empresa → Centro → Usuario → Perfil → Nombre (misma lógica del COBOL original con la variable ENTRO).
Si no se ingresa ningún criterio → mensaje "Ingrese Criterio Consulta".
Los resultados se muestran en tabla con columnas: Selección, Usuario, Nombres, Perfil, Empresa, Centro, Dominio, Nodo, Autorizador.
Paginación: muestra 14 registros por página (igual que las OCCURS 14 del BMS). Navegación adelante/atrás.
Mensajes de estado: "Existen más Datos", "No existen más Datos", "Fin de Códigos".
Desde la lista se puede: seleccionar un registro para editar (equivalente a F4), o crear uno nuevo (equivalente a F2).
Búsqueda con comodines: espacios en usuario/perfil/nombre se sustituyen por % (LIKE en SQL) — lógica de CONSUL-BUSCAB y CONSUL-BUSCANOMBRE.
Flujo Funcional:
GET /seguridad/usuarios → React renderiza formulario de filtros + tabla vacía.
Usuario llena uno o más filtros y pulsa "Buscar" (ENTER original).
Frontend llama GET /api/seguridad/usuarios?empresa=0001&page=0&size=14.
Backend ejecuta query con filtro dinámico y paginación.
Se renderizan resultados en tabla. Si hay más datos, se habilita botón "Siguiente".
Botón "Anterior" (F7 original) retrocede la paginación.
Click en fila o botón "Editar" → navega a /seguridad/usuarios/{userId}/editar.
Botón "Nuevo" (F2 original) → navega a /seguridad/usuarios/nuevo.
Reglas de Negocio:
Los 5 cursores SQL del COBOL (CCODIGO, CEMPRESA, CCENTRO, CPERFIL, CNOMBRE) se traducen en un único endpoint con filtros dinámicos.
La prioridad de filtros se mantiene: si se llena empresa, se ignoran los demás (o bien, en el sistema moderno se permite combinarlos con AND).
La paginación por cursor del COBOL (variable WS-PAGINAR + skip de registros) se traduce a LIMIT/OFFSET o paginación Spring Pageable.
Notas Técnicas de Mapeo:
COBOL/CICS
Stack Moderno
5 cursores SQL (DECLARE CURSOR)
Un JpaRepository con Specification o query dinámico
FETCH + contador + WS-PAGINAR
Pageable de Spring Data (page, size)
OCCURS 14 en BMS (14 filas)
pageSize=14 en la petición paginada
LIKE :S-CODIGO con % wildcard
WHERE usr_siglo21 LIKE :pattern en JPA/JPQL
F2 → EXEC CICS XCTL PROGRAM('SSITP007')
navigate('/seguridad/usuarios/nuevo')
F4 + selección → XCTL con COMMAREA
navigate('/seguridad/usuarios/{id}/editar')
F7 → paginar atrás
Botón "Anterior" con page - 1
Tabla T95USU03 (DB2)
Tabla PostgreSQL t95_usu03

Modelo PostgreSQL (tabla principal):
sql
CREATE TABLE t95_usu03 (    usr_siglo21     VARCHAR(8) PRIMARY KEY,    usr_nombre      VARCHAR(40) NOT NULL,    usr_status      CHAR(1) NOT NULL DEFAULT 'N',    usr_cid         VARCHAR(10) NOT NULL,    usr_offset      VARCHAR(8),    usr_cargo       VARCHAR(15),    usr_empresa     VARCHAR(4) NOT NULL,    usr_centro      VARCHAR(4) NOT NULL,    usr_pers        VARCHAR(8) NOT NULL,  -- perfil    usr_dominio     VARCHAR(4),    usr_nodo        VARCHAR(4),    usr_autoriza    CHAR(1) DEFAULT '0',    usr_updfch      VARCHAR(8),    usr_updtime     VARCHAR(6),    usr_updusr      VARCHAR(8),    usr_updterm     VARCHAR(4),    usr_fchlogon    VARCHAR(8),    usr_timelogon   VARCHAR(6),    usr_token       VARCHAR(8),    usr_historia    VARCHAR(80),    usr_fchnewpass  VARCHAR(8),    usr_fchcambio   VARCHAR(8));






























HU-03: Alta (Ingreso) de Usuarios
Título: Registro de nuevo usuario en el sistema de seguridad
Descripción: Como administrador de seguridad, necesito crear nuevos usuarios ingresando sus datos personales, organizacionales y de acceso (incluyendo datos BANCS opcionales), con validaciones completas, para dar de alta cuentas en el sistema.
Actor: Administrador de Seguridad
Pantalla origen BMS: SSIM007.bms → mapa SSI0701 Programa origen: SSITP007.CBL (flujo VALIDA-INGRESO + PROCESA-REQUERIMIENTO)
Criterios de Aceptación:
El formulario presenta los campos: Usuario (8 chars, obligatorio), Usuario BANCS (8 dígitos, opcional), Terminal BANCS (5 dígitos, condicional), Nombres (43 chars, obligatorio), Cédula Identidad (10 dígitos), Código Empresa (4 dígitos, obligatorio), Código Centro (4 dígitos, obligatorio), Cargo (18 chars), Perfil de Usuario (8 chars, obligatorio), Dominio (solo lectura, asignado), Nodo (solo lectura, asignado), Autorizador (0=No, 1=Sí), Oficina Swift (solo "MSQUTODO" o vacío), Observaciones (50 chars, obligatorio).
Validaciones obligatorias (del párrafo VALIDA-CAMPOS):
Usuario no vacío → "Ingrese Usuario"
Nombre no vacío → "Ingrese Nombre de Usr."
Observaciones no vacías → "Ingrese Observaciones"
Perfil no vacío → "Ingrese Perfil de VM"
Si se ingresa Oficina Swift, debe ser exactamente "MSQUTODO"
Si se ingresa Usuario BANCS, Terminal BANCS es obligatorio (y viceversa)
Validaciones contra BD:
Perfil debe existir en T95PAR02 con COD_PARAMETRO = 'GR' → "Perfil NO definido en T95PAR02"
Perfil debe existir en T01GRE20 → "Perfil RE no definido en T01GRE20"
Empresa debe existir en T06TC005 → "Empresa no definida T06TC005"
Centro debe existir en T06TC007 para esa empresa → "Centro no definido T06TC007"
Centro mayor a 0 obligatorio → "Ingrese Código de Centro"
Al grabar exitosamente, se invoca PRG016 (lógica de persistencia), se graba en T95BAN04 si hay datos BANCS, se graba observación en T95OBS04, y se registra log en T95LOG01 vía PRG008.
Se muestran los datos de auditoría (fecha, hora, usuario que actualizó, terminal).
Mensaje de éxito o error según resultado.
Flujo Funcional:
Desde la lista de usuarios, clic en "Nuevo" → GET /seguridad/usuarios/nuevo.
React renderiza formulario vacío con todos los campos.
Al llenar los campos, validaciones frontend en tiempo real (campos requeridos, formatos).
Submit → POST /api/seguridad/usuarios con body JSON.
Backend valida:
Existencia del perfil en t95_par02 y t01_gre20.
Existencia de la empresa en t06_tc005.
Existencia del centro en t06_tc007.
Si hay datos BANCS, inserta en t95_ban04.
Inserta usuario en t95_usu03, observación en t95_obs04, y registro de log en t95_log01.
Retorna 201 con datos del usuario creado.
Frontend muestra toast de éxito y carga los datos en modo lectura.
Reglas de Negocio:
Al crear: P015-STATUS = 'N', FCHLOGON = 0, TIMELOGON = 0, LOGONSIGLO = SPACES.
Si hay datos BANCS, el estado proceso se setea como 'TC'.
La contraseña se encripta vía SSITP003 (en moderno: BCrypt o similar).
El log registra: transacción='T95USU03', operación='INGRESO', con detalle del usuario, perfil, centro y autorizador.
Notas Técnicas:
COBOL/CICS
Stack Moderno
EXEC CICS LINK PROGRAM('PRG016')
@Service UsuarioService.crear() con @Transactional
EXEC CICS LINK PROGRAM('PRG008') (log)
@Service AuditLogService.registrar()
EXEC CICS LINK PROGRAM('SSITP003') (cifrado)
BCryptPasswordEncoder o Spring Security
INSERT en T95USU03 + T95BAN04 + T95OBS04
Repositorios JPA con cascade o múltiples saves
COMMAREA (REG-INTP015, REG-INTP016)
DTOs: UsuarioRequestDTO, UsuarioResponseDTO
Validaciones SQL (COUNT + EXISTS)
@Valid + custom validators + queries de validación
















HU-04: Modificación y Eliminación de Usuarios
Título: Edición y baja de usuarios existentes del sistema
Descripción: Como administrador de seguridad, necesito modificar los datos de un usuario existente o eliminarlo del sistema, con todas las validaciones y registro de auditoría, para mantener actualizada la base de usuarios.
Actor: Administrador de Seguridad
Pantalla origen BMS: SSIM007.bms → mapa SSI0701 Programa origen: SSITP007.CBL (flujos VALIDA-MODIFICA y VALIDA-ELIMINA)
Criterios de Aceptación:
Modificación (F4 original):
Se cargan los datos actuales del usuario en el formulario (consulta previa).
Se aplican las mismas validaciones que en el alta (HU-03).
Se guarda el perfil, centro y autorizador anteriores para el log comparativo.
Si el usuario tiene datos BANCS:
Si se borran los campos BANCS → se mantienen los datos existentes en BD.
Si se cambia el usuario BANCS → se actualiza T95BAN04.
Si no existía en T95BAN04 y ahora se ingresa → se inserta.
Se actualiza la observación en T95OBS04 (UPDATE; si no existe, INSERT).
Log registra: operación='MODIFICACION', incluye valores anteriores y nuevos de perfil, centro y autorizador.
Eliminación (F5 original):
Se requiere ingresar observaciones obligatoriamente antes de eliminar.
Se elimina el registro de T95USU03 (vía PRG016 con tipo 'E').
Si hay datos BANCS, se cambia estado a 'TE' en T95BAN04 (baja lógica BANCS).
Se elimina la observación de T95OBS04.
Log registra: operación='ELIMINACION'.
Flujo Funcional (Modificación):
Desde lista, seleccionar usuario → GET /seguridad/usuarios/{userId}.
React carga formulario con datos actuales.
Usuario modifica campos → Submit → PUT /api/seguridad/usuarios/{userId}.
Backend valida, actualiza T95USU03, T95BAN04, T95OBS04, registra log.
Retorna 200 con datos actualizados.
Flujo Funcional (Eliminación):
En la vista de detalle del usuario, clic en "Eliminar".
Modal de confirmación solicita observaciones (obligatorias).
Confirma → DELETE /api/seguridad/usuarios/{userId}?observacion=...
Backend elimina de T95USU03, marca 'TE' en T95BAN04, elimina T95OBS04, registra log.
Retorna 200 → redirect a lista de usuarios.
Reglas de Negocio:
Modificación guarda snapshot previo (perfil, centro, autorizador) para auditoría comparativa.
Eliminación BANCS es lógica (estado 'TE'), no física.
Eliminación de usuario principal y observaciones es física (DELETE).
Observaciones siempre obligatorias en eliminación.
Notas Técnicas:
COBOL/CICS
Stack Moderno
F4 → VALIDA-MODIFICA
PUT /api/seguridad/usuarios/{id}
F5 → VALIDA-ELIMINA
DELETE /api/seguridad/usuarios/{id}
MOVE 'M' TO P015-TIPO → LINK PRG016
UsuarioService.actualizar() con @Transactional
MOVE 'E' TO P015-TIPO → LINK PRG016
UsuarioService.eliminar() con @Transactional
MODIFICA-ESTADO-BANCS (UPDATE estado 'TE')
bancsRepository.marcarBaja(userId)
ELIMINA-OBSERVACION (DELETE T95OBS04)
observacionRepository.deleteByUsuario(userId)
Log comparativo (valores antes/después)
Patrón Audit con @EntityListeners o servicio dedicado


HU-05: Consulta Detallada de Usuario con Datos Complementarios
Título: Visualización completa de un usuario con datos de perfil, empresa, centro, BANCS y auditoría
Descripción: Como administrador de seguridad, necesito consultar el detalle completo de un usuario incluyendo su información organizacional resuelta (nombre empresa, nombre centro, descripción perfil), datos BANCS, observaciones y datos de auditoría (última actualización y último sign-on), para tener visibilidad total de la cuenta.
Actor: Administrador de Seguridad
Pantalla origen BMS: SSIM007.bms → mapa SSI0701 Programa origen: SSITP007.CBL (flujo VALIDA-ENTER + lookups)
Criterios de Aceptación:
Al ingresar un código de usuario y pulsar "Consultar" (ENTER), se carga toda la información.
Datos del usuario (de T95USU03): usuario, nombre, cédula, empresa, centro, cargo, perfil, dominio (readonly), nodo (readonly), autorizador, oficina Swift.
Datos resueltos por lookup:
Descripción del perfil → consultada de T95PAR02 WHERE COD_GRUPO_USUARIO = perfil AND COD_PARAMETRO = 'GR' (función GETRECU).
Nombre del centro → consultada de T06TC007 WHERE empresa + centro (función GETCENTRO).
Nombre de la empresa → consultada de T06TC005 WHERE empresa (función GETEMPRESA).
Datos BANCS (de T95BAN04): Usuario BANCS, Terminal BANCS. Si no existe → campos vacíos.
Observaciones (de T95OBS04): texto de observación actual.
Datos de auditoría:
Última actualización: Fecha, Hora, Usuario, Terminal.
Último SIGNON: Fecha, Hora, IP/Terminal.
Si el usuario no existe → limpiar formulario y mostrar mensaje de error (respuesta de PRG016).
Teclas de acción mostradas: ENTER=Consulta, F2=Ingresa, F4=Modifica, F5=Elimina.
Flujo Funcional:
Navegar a /seguridad/usuarios → ingresar código en campo búsqueda → "Consultar".
Frontend llama GET /api/seguridad/usuarios/{userId}/detalle.
Backend ejecuta:
Query a t95_usu03 por PK.
Lookup a t95_par02 para descripción perfil.
Lookup a t06_tc007 para nombre centro.
Lookup a t06_tc005 para nombre empresa.
Query a t95_ban04 para datos BANCS.
Query a t95_obs04 para observaciones.
Retorna DTO completo con todos los datos enriquecidos.
React renderiza formulario con secciones: Datos Generales, Datos Organizacionales, Datos BANCS, Observaciones, Auditoría.
Botones de acción: Editar, Eliminar, Volver.
Reglas de Negocio:
Dominio y Nodo son de solo lectura (PROT en BMS original: M15DOMI, M15NODO).
Si el perfil no existe en T95PAR02 → mostrar "No existe en tabla Parámetros".
Si el centro no existe → "No existe en tabla T06TC007".
Si la empresa no existe → "No existe en tabla T06TC005".
Datos BANCS son opcionales; si no existen en T95BAN04, no se muestra error, solo campos vacíos.
Notas Técnicas:
COBOL/CICS
Stack Moderno
GETRECU (SELECT T95PAR02)
parametroRepository.findDescripcion(perfil, "GR")
GETCENTRO (SELECT T06TC007)
centroRepository.findNombre(empresa, centro)
GETEMPRESA (SELECT T06TC005)
empresaRepository.findNombre(empresa)
GETOBSER (SELECT T95OBS04)
observacionRepository.findByUsuario(userId)
CONSULTA-USR (SELECT T95BAN04)
bancsRepository.findByUsrSiglo21(userId)
Campos PROT en BMS (readonly)
disabled o readOnly en componentes React
Múltiples MOVEs a campos de salida del mapa
Mapping DTO → React state
Línea 20-21 del BMS (auditoría)
Sección "Auditoría" en el formulario React















Tabla de Mapeo: Sentencias COBOL/BMS/CICS → Stack Moderno
Concepto COBOL/BMS/CICS
Equivalente React
Equivalente Java Spring
Equivalente PostgreSQL
DFHMSD / DFHMDI (definición de mapa)
Componente React (.tsx)
N/A
N/A
DFHMDF POS=(r,c) (campo en pantalla)
<TextField>, <Select>, <Typography> posicionados con CSS Grid/Flexbox
N/A
N/A
ATTRB=(UNPROT) (campo editable)
<input> / <TextField> habilitado
Campo en RequestDTO
Columna en tabla
ATTRB=(PROT,ASKIP) (campo solo lectura)
<Typography> o input con readOnly
Campo en ResponseDTO
SELECT en query
ATTRB=(BRT) (brillante/resaltado)
fontWeight: bold o color: primary
N/A
N/A
PICIN='9999' (input numérico)
type="number" + validación regex
@NotNull @Digits
VARCHAR(4) o INTEGER
OCCURS 14 (filas repetidas)
array.map() → filas de tabla <Table>
List<DTO> paginada
LIMIT 14 OFFSET n
EXEC CICS SEND MAP
return <Component /> (render React)
ResponseEntity.ok(dto)
N/A
EXEC CICS RECEIVE MAP
onSubmit / onChange handlers
@RequestBody DTO
N/A
EXEC CICS XCTL PROGRAM
React Router navigate()
N/A (routing es frontend)
N/A
EXEC CICS LINK PROGRAM
N/A
@Service method call / @Transactional
N/A
EXEC CICS RETURN TRANSID
SPA state persistence (Context/Redux)
Session/JWT management
N/A
EXEC CICS ASSIGN USERID
useAuth() hook (contexto de sesión)
SecurityContextHolder / @AuthenticationPrincipal
N/A
COMMAREA
React state / URL params / Context
DTO transfer objects
N/A
EIBAID (DFHENTER, DFHPF2...)
Botones: "Buscar", "Nuevo", "Editar", "Eliminar"
Endpoints REST diferentes (GET, POST, PUT, DELETE)
N/A
DFHCLEAR
Botón "Salir" / "Cerrar Sesión"
/api/auth/logout
N/A
EXEC SQL DECLARE CURSOR
N/A
JpaRepository + Specification / @Query
Query SQL nativo
EXEC SQL OPEN / FETCH / CLOSE
N/A
Spring Data paginación (Pageable)
SELECT ... LIMIT n OFFSET m
EXEC SQL SELECT INTO
N/A
repository.findById() / @Query
SELECT ... WHERE pk = ?
EXEC SQL INSERT
POST form submit
repository.save(entity)
INSERT INTO ... VALUES (...)
EXEC SQL UPDATE
PUT form submit
repository.save(entity) (merge)
UPDATE ... SET ... WHERE ...
EXEC SQL DELETE
Botón "Eliminar" + confirmación
repository.deleteById()
DELETE FROM ... WHERE ...
SQLCODE = 0 (éxito)
Response status 200/201
No exception thrown
Query OK
SQLCODE = 100 (no encontrado)
Mostrar "No encontrado"
Throw ResourceNotFoundException → 404
Empty result set
SQLCODE < 0 (error)
Toast/Alert de error
@ExceptionHandler → 500
DB error
COPY copybook.cpy
Componentes compartidos / tipos TypeScript
Clases DTO / Entity reutilizables
N/A
WORKING-STORAGE
useState() / variables locales
Variables locales del servicio
N/A
77-level variables
const / let en componente
Variables locales en métodos
N/A
PERFORM ... THRU
Función JavaScript invocada
Método privado en @Service
Stored procedure (opcional)
EVALUATE / WHEN
switch/case
switch o if-else chain
CASE WHEN (si aplica)
MOVE ... TO
setState() / spread operator
BeanUtils.copyProperties() / manual mapping
N/A
W-FLAG / control flags
Estado booleano en React
Variables de control en lógica
N/A
T95USU03 (DB2 table)
N/A
@Entity Usuario
CREATE TABLE t95_usu03 (...)
T95BAN04 (DB2 table)
N/A
@Entity UsuarioBancs
CREATE TABLE t95_ban04 (...)
T95OBS04 (DB2 table)
N/A
@Entity Observacion
CREATE TABLE t95_obs04 (...)
T95PAR02 (parámetros)
Dropdown / autocomplete con datos
@Entity Parametro
CREATE TABLE t95_par02 (...)
T06TC005 (empresas)
Dropdown con lookup
@Entity Empresa
CREATE TABLE t06_tc005 (...)
T06TC007 (centros)
Dropdown filtrado por empresa
@Entity Centro
CREATE TABLE t06_tc007 (...)
PRG008 (write log)
N/A
AuditLogService.registrar()
INSERT INTO t95_log01 (...)
SSITP003 (cifrado)
N/A
BCryptPasswordEncoder
pgcrypto (si se necesita)
ABSTIME / FORMATTIME
new Date() / dayjs()
LocalDateTime.now()
CURRENT_TIMESTAMP
EIBTRMID (terminal ID)
navigator.userAgent / IP cliente
HttpServletRequest.getRemoteAddr()
Columna terminal
BMS line separators ___
<Divider> (MUI) / <hr>
N/A
N/A
POS=(24,01) mensajes
Toast / Snackbar / Alert banner
N/A (mensajes en response)
N/A



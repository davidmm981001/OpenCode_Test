Construye la aplicación completa usando el proyecto local y sus artefactos OpenSpec como punto de partida.
Antes de terminar, verifica el scaffold necesario, instala o completa dependencias faltantes, y deja el proyecto runnable.
No te detengas en un stub: implementa la funcionalidad completa, corrige errores y confirma build.
Si necesitas más contexto, usa los archivos OpenSpec del proyecto como fuente de verdad.
## 1. Visualizar y navegar el menu principal de seguridad como operador autenticado
Módulo: seguridad
Como operador del modulo de seguridad, necesito acceder a un menu principal claro que concentre las opciones funcionales disponibles para poder ingresar rapidamente a la administracion y consultas del dominio. La evidencia funcional proviene del programa PRG000 y del mapa PRG00M1, donde se construye la pantalla principal, se muestran fecha, hora, aplicacion, terminal y usuario, y se acepta una opcion numerica para enrutar a otro modulo. El comportamiento observado indica que la primera carga o la accion equivalente a reiniciar la pantalla limpia el formulario, posiciona el cursor sobre el campo de opcion y conserva un estado minimo de navegacion. Tambien se identifican reglas de terminacion inmediata cuando no existe identidad de usuario o cuando se solicita salir. En la version objetivo, esto debe traducirse en una vista React corporativa con tarjetas o lista de opciones y un endpoint de lectura del menu permitido para el usuario autenticado. La historia cubre exclusivamente la presentacion del menu, carga de metadatos de sesion y navegacion a opciones validas ya evidenciadas: administracion de usuarios, menus, parametros, perfiles, recursos, consultas y reseteo de claves o actualizacion de dominio y nodo. No agrega nuevas opciones; solo moderniza la experiencia manteniendo el comportamiento identificado en el codigo fuente citado.
Actor: Operador de seguridad
Flujo funcional:
1. El usuario autenticado ingresa a la ruta del modulo de seguridad.
2. El frontend solicita el menu permitido y muestra titulo, fecha, hora, usuario, aplicacion y terminal.
3. El sistema presenta las opciones disponibles numeradas del 1 al 9 con su descripcion de negocio.
4. El usuario selecciona una opcion valida y el frontend navega al modulo correspondiente.
5. Desviacion: si no existe sesion valida o identidad autenticada, el sistema finaliza la interaccion y redirige al login.
6. Desviacion: si el usuario intenta salir o limpiar la pantalla, el sistema restablece la vista o cierra la navegacion segun la accion.
7. Desviacion: si se detecta una tecla o accion no soportada, el sistema informa accion invalida sin perder el contexto visible.
Pantallas / superficies: React: /seguridad/menu, componente SecurityMainMenu; Backend: GET /api/v1/seguridad/menu, POST /api/v1/seguridad/menu/seleccion; Componentes: SecurityMenuPage, SessionHeader, MenuOptionList
Reglas de negocio:
- El menu solo se muestra si existe usuario autenticado.
- La carga inicial limpia el formulario y posiciona el foco en la seleccion.
- Deben mostrarse fecha, hora, usuario, codigo de aplicacion y terminal de la sesion.
- Las opciones visibles evidenciadas son 1 a 9 con sus descripciones de negocio.
- La opcion ingresada debe ser numerica.
- Las acciones de salida o limpieza terminan o reinician la vista segun corresponda.
- Las acciones no soportadas deben devolver mensaje de accion invalida.
- Si el entorno de sesion no permite interaccion de usuario, la solicitud debe finalizar sin renderizar operacion editable.
Notas técnicas:
Aplicar [ARQUITECTURA], [AUTH MASTER], [UI/UX RULES] y [TECHNICAL QUALITY - DEFINITION OF DONE]. Endpoint API: GET /api/v1/seguridad/menu -> response { userId:string, applicationId:string, terminalId:string, currentDate:string, currentTime:string, options:[{ code:number, label:string, route:string }] }. Endpoint API: POST /api/v1/seguridad/menu/seleccion -> request { option:number, requestId:string(req) } response { option:number, route:string, label:string }. No requiere tabla nueva; usa claims JWT y configuracion del menu en backend. Auth/Authz: JWT obligatorio, roles ROLE_ADMIN o ROLE_OPERADOR. Error mapping: 401 sin sesion, 400 opcion no numerica o fuera de rango, 422 accion no soportada, body { timestamp, status, code, message, details, path }. Flyway reference: N/A para esta historia. Paquetes sugeridos: com.davidtestapr3.seguridad.{domain,application,infrastructure,api}. Limites transaccionales: lectura sin @Transactional o @Transactional(readOnly=true). Cache/estado: React Query staleTime 5m para GET menu; invalidacion al cambiar de rol o cerrar sesion. confianza: alta
Criterios:
  1. Scenario: Carga exitosa del menu principal
Given un usuario autenticado con rol "ROLE_OPERADOR"
When navega a "/seguridad/menu"
Then la UI muestra exactamente las opciones 1 "Administracion de Usuarios", 2 "Administracion de Menus", 3 "Administracion Tabla Parametros", 4 "Administracion de Perfiles de recursos", 5 "Administracion de Recursos de Host", 6 "Consulta de Perfiles de ventana marco", 7 "Consulta de Perfiles de recursos", 8 "Consulta de Recursos de Host" y 9 "Reseteo de Claves/Modificar Dominio y Nodo"
  2. Scenario: Contrato de API del menu
Given que el frontend llama al endpoint GET /api/v1/seguridad/menu
When la peticion es valida
Then el cuerpo JSON de respuesta contiene exactamente los campos userId, applicationId, terminalId, currentDate, currentTime y options con tipos string, string, string, string, string y array, y en caso de error de autenticacion devuelve HTTP 401 con body {timestamp,status,code,message,details,path}
  3. Scenario: Seleccion valida redirige al modulo correspondiente
Given que el usuario elige la opcion 1
When el frontend envia POST /api/v1/seguridad/menu/seleccion con {"option":1,"requestId":"RID-0001"}
Then recibe HTTP 200 con {"option":1,"route":"/usuarios/consulta","label":"Administracion de Usuarios"}
  4. Scenario: Opcion fuera de rango
Given que el usuario intenta seleccionar la opcion 10
When el frontend envia POST /api/v1/seguridad/menu/seleccion con {"option":10,"requestId":"RID-0002"}
Then el backend responde HTTP 400 con code "INVALID_OPTION" y message "Opcion invalida"
  5. Scenario: Estado SPA tras seleccionar opcion
Given que la vista del menu ya esta cargada
When una seleccion valida finaliza exitosamente
Then la SPA navega al modulo destino sin recarga manual y mantiene visibles los metadatos de sesion resueltos desde el estado actual
  6. Scenario: Idempotencia en seleccion de menu
Given que se reenvia la misma peticion con identificador unico
When el backend la recibe por segunda vez
Then no genera duplicados y devuelve el mismo estado HTTP 200 con datos coherentes
---
## 2. Validar la opcion del menu principal y reportar errores de entrada al operador
Módulo: seguridad
Como operador de seguridad, necesito que la seleccion del menu principal valide estrictamente el valor ingresado antes de enrutar a otro modulo, para evitar navegaciones ambiguas y recibir mensajes de error comprensibles. Esta historia se ancla a la rutina 100-INICIO y 300-XCTL del programa PRG000, donde se valida que la opcion sea numerica y que pertenezca al conjunto permitido. Tambien se identifica el manejo de errores por teclas no permitidas, por fallo al recibir el mapa y por error al transferir el control a otro proceso. Aunque en la implementacion moderna no se usara transferencia de control transaccional, el comportamiento de negocio equivalente es claro: validar entrada, traducir opcion a destino y responder con un error controlado si el destino no puede resolverse. Esta historia se separa de la visualizacion del menu porque concentra las reglas de validacion y mensajeria operacional, incluyendo mensajes equivalentes a "Ingrese un valor numerico", "Opcion invalida", "Tecla invalida", "Error en receive del mapa" y el error de enrutamiento al destino. El objetivo es que frontend y backend reproduzcan estas restricciones con validacion dual, mensajes auditables y respuestas REST consistentes.
Actor: Operador de seguridad
Flujo funcional:
1. El usuario ingresa una opcion en el menu principal.
2. El frontend valida formato numerico basico y envia la solicitud de seleccion.
3. El backend valida que la opcion sea un numero entero permitido dentro del catalogo definido.
4. Si la opcion es valida, el sistema resuelve el destino funcional y responde con la ruta.
5. Desviacion: si el valor no es numerico, el sistema informa que debe ingresar un valor numerico.
6. Desviacion: si el numero no pertenece al conjunto permitido, el sistema informa opcion invalida.
7. Desviacion: si la accion del cliente no corresponde al flujo esperado o el request llega incompleto, el sistema responde error de entrada o accion invalida.
8. Desviacion: si no se puede resolver el destino configurado, el sistema devuelve error tecnico controlado sin navegar.
Pantallas / superficies: React: /seguridad/menu; Backend: POST /api/v1/seguridad/menu/seleccion; Componentes: SecurityMenuForm, InlineValidationMessage, ToastError
Reglas de negocio:
- La opcion debe ser numerica entera.
- Las opciones permitidas son 1,2,3,4,5,6,7,8 y 9.
- Un valor no numerico debe producir el mensaje equivalente a ingreso numerico obligatorio.
- Un valor fuera del rango permitido debe producir mensaje de opcion invalida.
- Si el request del cliente no puede interpretarse, debe devolverse error de entrada y no cambiar la navegacion.
- Si el enrutamiento configurado no existe, debe devolverse error tecnico controlado.
- Las acciones no soportadas se consideran invalidas y no deben cambiar estado.
Notas técnicas:
Aplicar [API CONTRACTS MASTER], [AUTH MASTER] y validacion dual con Zod + Bean Validation. Endpoint API: POST /api/v1/seguridad/menu/seleccion. Request schema: { option:"integer(req)", requestId:"string(req,max 64)" }. Response success: { option:"integer", route:"string", label:"string" }. Response error: { timestamp:"ISO8601", status:"number", code:"string", message:"string", details?:"array", path:"string" }. Auth/Authz: JWT obligatorio, roles ROLE_ADMIN o ROLE_OPERADOR. Error mapping: NON_NUMERIC_OPTION->400, INVALID_OPTION->400, INVALID_ACTION->422, MENU_ROUTE_NOT_FOUND->500. Flyway reference: N/A. Paquetes: com.davidtestapr3.seguridad.{domain,application,infrastructure,api}. Limites transaccionales: sin transaccion de escritura. Cache/estado: no cachear POST; en frontend mostrar error inline y conservar la opcion ingresada para correccion. confianza: alta
Criterios:
  1. Scenario: Validacion numerica de opcion
Given que el usuario escribe "AB" en el campo de opcion
When confirma la seleccion
Then la UI muestra el mensaje "Ingrese un valor numerico" y no ejecuta navegacion
  2. Scenario: Opcion invalida en backend
Given que el frontend llama al endpoint POST /api/v1/seguridad/menu/seleccion
When la peticion contiene {"option":99,"requestId":"RID-1001"}
Then el cuerpo JSON de respuesta contiene exactamente los campos timestamp, status, code, message, details y path con tipos string, number, string, string, array y string, y en caso de error de validacion devuelve HTTP 400 con body {timestamp,status,code,message,details,path}
  3. Scenario: Opcion valida resuelta
Given que el usuario ingresa la opcion 9
When envia la seleccion
Then el backend responde HTTP 200 con route "/seguridad/reseteo-claves-dominio-nodo" y label "Reseteo de Claves/Modificar Dominio y Nodo"
  4. Scenario: Accion invalida no cambia estado
Given que la pantalla del menu esta cargada
When se dispara una accion cliente no soportada sobre el formulario
Then el sistema mantiene la pantalla actual y muestra un toast con el texto "Tecla invalida"
  5. Scenario: Error tecnico de resolucion de destino
Given que existe una inconsistencia de configuracion para la opcion 4
When el backend intenta resolver la ruta destino
Then responde HTTP 500 con code "MENU_ROUTE_NOT_FOUND" y el frontend no navega
  6. Scenario: Idempotencia en seleccion invalida
Given que se reenvia la misma peticion con identificador unico
When el backend la recibe por segunda vez
Then no genera duplicados y devuelve el mismo estado HTTP 400 con datos coherentes
---
## 3. Consultar usuarios por empresa, centro, usuario, perfil o nombre desde la bandeja general
Módulo: usuarios-consulta
Como operador de seguridad, necesito consultar la bandeja general de usuarios aplicando un solo criterio de busqueda por vez para localizar registros de manera acotada y consistente. La evidencia se encuentra en SSITP002 y el mapa SSI0201, donde la pantalla ofrece filtros de empresa, centro, usuario, perfil y nombre, además del contador de registros y el listado de hasta 14 filas. El flujo del programa detecta el primer criterio informado en un orden fijo: empresa, centro, usuario, perfil y nombre; si ninguno viene informado, devuelve el mensaje "Ingrese Criterio Consulta". Para usuario, perfil y nombre se completan espacios con comodines equivalentes a busqueda parcial; empresa y centro son busquedas exactas. Esta historia debe reproducir exactamente ese comportamiento, incluyendo prioridad de criterios y mensajes operativos sobre si existen o no más datos. La migracion moderna se implementara mediante un endpoint REST de consulta paginada y una pantalla React con formulario de filtros y tabla. Aunque el backend moderno puede usar consultas dinamicas, el resultado funcional debe respetar la semantica del codigo fuente: ejecutar un solo criterio por solicitud, devolver usuario, nombre, perfil, empresa, centro, dominio, nodo y autorizacion, y no inferir filtros compuestos que no estan evidenciados.
Actor: Operador de seguridad
Flujo funcional:
1. El usuario abre la bandeja de consulta general de usuarios.
2. El sistema muestra filtros de seleccion, empresa, centro, usuario, perfil, nombre y registros, junto con tabla de resultados.
3. El usuario ingresa un criterio de consulta y ejecuta la busqueda.
4. El backend determina el primer criterio informado siguiendo la prioridad establecida y consulta los usuarios.
5. El sistema devuelve hasta 14 registros visibles con los campos de resumen.
6. Desviacion: si no se informa ningun criterio valido, el sistema muestra "Ingrese Criterio Consulta".
7. Desviacion: si el cursor o consulta falla, el sistema informa error tecnico equivalente a apertura o consulta de usuarios.
8. Desviacion: si no hay mas resultados, el sistema informa "No existen mas Datos" o mensaje final equivalente.
Pantallas / superficies: React: /usuarios/consulta; Backend: GET /api/v1/usuarios; Componentes: UsuarioSearchForm, UsuarioTable, UsuarioTableRow, SearchToolbar
Reglas de negocio:
- Solo se procesa un criterio por consulta, usando prioridad: empresa, luego centro, luego usuario, luego perfil y luego nombre.
- Si no se informa ningun criterio, debe mostrarse "Ingrese Criterio Consulta".
- Empresa y centro son filtros exactos.
- Usuario y perfil admiten busqueda parcial rellenando espacios con comodin.
- Nombre admite busqueda parcial rellenando espacios con comodin.
- El listado visible contiene maximo 14 filas por pagina.
- Cada fila debe mostrar seleccion, usuario, nombre resumido, perfil, empresa, centro, dominio, nodo y autorizacion.
- Ante error de acceso a datos debe devolverse error tecnico controlado.
- El contador de registros de salida debe reflejar la cantidad recuperada para la pagina procesada segun la logica heredada.
Notas técnicas:
Endpoint API: GET /api/v1/usuarios?empresa=string(4,opt)&centro=string(4,opt)&usuario=string(8,opt)&perfil=string(8,opt)&nombre=string(40,opt)&offset=integer(opt,default 0)&limit=integer(opt,default 14,max 14). Response success: { criterioAplicado:"string", offset:"number", limit:"number", returned:"number", hasMore:"boolean", message:"string", content:[{ seleccion:"number", usuario:"string", nombre:"string", perfil:"string", empresa:"string", centro:"string", dominio:"string", nodo:"string", autorizador:"string" }] }. Response error: { timestamp,status,code,message,details,path }. Tabla DB principal: t95usu03-usuarios con columnas t95usu03_usr_siglo21 varchar(8) PK, t95usu03_usr_nombre varchar(40) not null, t95usu03_usr_status char(1) not null, t95usu03_usr_cid varchar(10) not null, t95usu03_usr_offset varchar(8) not null, t95usu03_usr_cargo varchar(15) not null, t95usu03_usr_empresa varchar(4) not null, t95usu03_usr_centro varchar(4) not null, t95usu03_usr_pers varchar(8) not null, t95usu03_usr_dominio varchar(4) not null, t95usu03_usr_nodo varchar(4) not null, t95usu03_usr_autoriza char(1) not null, t95usu03_usr_updfch varchar(8) not null, t95usu03_usr_updtime varchar(6) not null, t95usu03_usr_updusr varchar(8) not null, t95usu03_usr_updterm varchar(4) not null, t95usu03_usr_fchlogon varchar(8) not null, t95usu03_usr_timelogon varchar(6) not null, t95usu03_usr_token varchar(8) not null, t95usu03_usr_historia varchar(80) not null, t95usu03_usr_fchnewpass varchar(8) not null, t95usu03_usr_fchcambio varchar(8) not null. Indices: por empresa, centro, usr_siglo21, usr_pers y gin_trgm_ops sobre nombre. Auth/Authz: JWT obligatorio, ROLE_ADMIN o ROLE_OPERADOR. Error mapping: QUERY_CRITERIA_REQUIRED->400, USER_QUERY_OPEN_ERROR->500, USER_QUERY_ERROR->500. Flyway reference: V1__create_t95usu03-usuarios.sql. Paquetes: com.davidtestapr3.usuariosconsulta.{domain,application,infrastructure,api}. Limites transaccionales: @Transactional(readOnly=true). Cache/estado: React Query key por filtros; invalidacion al volver desde alta, edicion o baja. confianza: alta
Criterios:
  1. Scenario: Consulta por empresa con prioridad superior
Given que existen usuarios para la empresa "1001"
And el formulario contiene empresa "1001" y usuario "JPEREZ"
When el usuario ejecuta la busqueda
Then el sistema aplica solo el criterio "empresa" y devuelve resultados cuyo campo empresa es exactamente "1001"
  2. Scenario: Consulta sin criterio informado
Given que todos los filtros de empresa, centro, usuario, perfil y nombre estan vacios
When el usuario ejecuta la busqueda
Then la UI muestra el mensaje "Ingrese Criterio Consulta" y la tabla permanece sin nuevos resultados
  3. Scenario: Contrato de API de consulta
Given que el frontend llama al endpoint GET /api/v1/usuarios?usuario=JP%25&offset=0&limit=14
When la peticion es valida
Then el cuerpo JSON de respuesta contiene exactamente los campos criterioAplicado, offset, limit, returned, hasMore, message y content con tipos string, number, number, number, boolean, string y array, y en caso de error de validacion devuelve HTTP 400 con body {timestamp,status,code,message,details,path}
  4. Scenario: Actualizacion UI SPA luego de volver de una operacion
Given que el usuario regresa a "/usuarios/consulta" despues de crear o modificar un usuario
When React Query invalida la consulta activa
Then el listado refleja el estado persistido sin recarga manual usando los filtros vigentes
  5. Scenario: Esquema de base de datos de usuarios
Given que se ejecutan las migraciones Flyway
When se verifica la tabla t95usu03-usuarios
Then existen las columnas t95usu03_usr_siglo21, t95usu03_usr_nombre, t95usu03_usr_status, t95usu03_usr_cid, t95usu03_usr_offset, t95usu03_usr_cargo, t95usu03_usr_empresa, t95usu03_usr_centro, t95usu03_usr_pers, t95usu03_usr_dominio, t95usu03_usr_nodo, t95usu03_usr_autoriza, t95usu03_usr_updfch, t95usu03_usr_updtime, t95usu03_usr_updusr, t95usu03_usr_updterm, t95usu03_usr_fchlogon, t95usu03_usr_timelogon, t95usu03_usr_token, t95usu03_usr_historia, t95usu03_usr_fchnewpass y t95usu03_usr_fchcambio con tipos varchar/char segun PostgreSQL, constraint de primary key en t95usu03_usr_siglo21, y foreign keys a catalogos de empresa y centro segun DDL en V1__create_t95usu03-usuarios.sql
  6. Scenario: Idempotencia en busqueda
Given que se reenvia la misma peticion con identificador unico
When el backend la recibe por segunda vez
Then no genera duplicados y devuelve el mismo estado HTTP 200 con datos coherentes
---
## 4. Paginar resultados y seleccionar un usuario desde la consulta general
Módulo: usuarios-consulta
Como operador de seguridad, necesito recorrer resultados de la consulta general y seleccionar un registro valido para editarlo o revisarlo en detalle. La evidencia proviene de SSITP002: se manejan 14 filas visibles, un contador de registros, mensajes de "Existen mas Datos" y "No existen mas Datos", y la accion de retroceso asociada a PF7 que recalcula el desplazamiento restando 28 para mostrar la pagina anterior; si el resultado queda negativo, se corrige a cero y se informa "Inicio de los datos". Adicionalmente, la pantalla permite seleccionar una fila para editarla; la accion de edicion solo procede si la seleccion esta entre 1 y 14 y la fila tiene clave de usuario cargada; de lo contrario informa "Seleccion Errada". La migracion moderna debe respetar esta semantica mediante paginacion basada en offset y limite fijo, y una accion de apertura de detalle desde la fila seleccionada. No se incorporan acciones de ordenamiento ni filtros adicionales no evidenciados. La historia cubre exclusivamente navegacion sobre resultados ya consultados y validacion de la seleccion operativa.
Actor: Operador de seguridad
Flujo funcional:
1. El usuario ejecuta una consulta de usuarios con un criterio valido.
2. El sistema muestra hasta 14 filas y el contador de registros devueltos.
3. Si existen mas resultados, el usuario avanza o retrocede entre paginas manteniendo el criterio activo.
4. El sistema recalcula el offset y vuelve a consultar los datos.
5. El usuario selecciona una fila valida para abrir el detalle editable del usuario.
6. Desviacion: si el retroceso deja el offset antes del inicio, el sistema corrige a cero e informa "Inicio de los datos".
7. Desviacion: si no hay mas resultados para la pagina solicitada, el sistema informa "No existen mas Datos".
8. Desviacion: si la fila seleccionada no esta entre 1 y 14 o no contiene usuario, el sistema informa "Seleccion Errada" y permanece en la bandeja.
Pantallas / superficies: React: /usuarios/consulta, /usuarios/:usuarioId; Backend: GET /api/v1/usuarios, GET /api/v1/usuarios/{usuarioId}; Componentes: UsuarioTable, PaginationControls, UsuarioRowAction
Reglas de negocio:
- El tamano maximo de pagina es 14 registros.
- El offset inicial es 0.
- Al retroceder, el offset se reduce en una ventana equivalente y nunca puede quedar negativo.
- Si el offset calculado es negativo, se ajusta a 0 y se informa "Inicio de los datos".
- Si hay mas resultados que los visibles, debe mostrarse mensaje equivalente a "Existen mas Datos".
- Si no hay mas resultados, debe mostrarse mensaje equivalente a "No existen mas Datos".
- La seleccion valida para abrir detalle debe estar entre 1 y 14.
- La seleccion solo es valida si la fila contiene clave de usuario cargada.
- Una seleccion invalida no debe abrir el detalle ni perder el listado actual.
Notas técnicas:
Endpoint API: GET /api/v1/usuarios con parametros de filtro y paginacion limit fijo 14. Endpoint API: GET /api/v1/usuarios/{usuarioId} -> response detalle resumido para navegacion. Request selection en frontend local: index 1..14 sobre content. Tabla DB: t95usu03-usuarios reutilizada de V1__create_t95usu03-usuarios.sql. Auth/Authz: JWT obligatorio. Error mapping: PAGE_OUT_OF_RANGE->400, INVALID_SELECTION->400, USER_NOT_FOUND->404. Paquetes: com.davidtestapr3.usuariosconsulta.{domain,application,infrastructure,api}. Limites transaccionales: readOnly. Cache/estado: mantener filtros y offset en URL query params; React Query invalidacion solo al cambiar filtros, offset o al retornar desde detalle con mutacion. confianza: alta
Criterios:
  1. Scenario: Primera pagina de 14 resultados
Given que existen 20 usuarios para el criterio empresa "1001"
When el frontend consulta GET /api/v1/usuarios?empresa=1001&offset=0&limit=14
Then la respuesta contiene returned 14 y hasMore true
  2. Scenario: Retroceso antes del inicio
Given que el usuario se encuentra en offset 14
When solicita retroceder dos ventanas y el offset calculado es menor que 0
Then el sistema ajusta el offset a 0 y muestra el mensaje "Inicio de los datos"
  3. Scenario: Seleccion de fila valida
Given que la tabla muestra en la fila 3 el usuario "JPEREZ01"
When el usuario selecciona la fila 3 para editar
Then la SPA navega a "/usuarios/JPEREZ01" sin recarga manual
  4. Scenario: Seleccion invalida
Given que la tabla actual tiene solo 2 filas con datos
When el usuario intenta abrir la fila 8
Then la UI muestra el mensaje "Seleccion Errada" y permanece en "/usuarios/consulta"
  5. Scenario: Contrato de API de detalle
Given que el frontend llama al endpoint GET /api/v1/usuarios/JPEREZ01
When la peticion es valida
Then el cuerpo JSON de respuesta contiene exactamente los campos usuarioId, nombre, perfil, empresa, centro, dominio, nodo y autorizador con tipos string, string, string, string, string, string, string y boolean, y en caso de error de validacion devuelve HTTP 400 con body {timestamp,status,code,message,details,path}
  6. Scenario: Idempotencia en carga de detalle
Given que se reenvia la misma peticion con identificador unico
When el backend la recibe por segunda vez
Then no genera duplicados y devuelve el mismo estado HTTP 200 con datos coherentes
---
## 5. Consultar el detalle administrativo de un usuario con datos operativos, observaciones y datos complementarios
Módulo: usuarios-administracion
Como operador de seguridad, necesito consultar el detalle completo de un usuario para revisar su informacion administrativa, perfil, empresa, centro, dominio, nodo, estado de autorizacion, observaciones y datos operativos complementarios antes de decidir una accion. Esta historia se sustenta en SSITP007 y el mapa SSI0701. En el flujo de consulta, al ingresar un usuario se valida su presencia, se invoca el procesamiento principal del registro y luego se enriquecen los datos con descripciones de perfil, nombre de centro, nombre de empresa, observaciones y datos complementarios de la tabla BANCS. Tambien se muestran marcas de ultima actualizacion y ultimo inicio de sesion. Si no existe el usuario principal o falla una consulta complementaria, el programa devuelve mensajes específicos, por ejemplo ausencia en parametros, empresa, centro o en la tabla complementaria. La migracion moderna debe exponer una consulta REST de detalle que consolide toda esta informacion en un solo payload de lectura para una vista React de administracion de usuarios. La historia no cubre mutaciones, solo la carga y visualizacion del detalle, incluyendo campos de solo lectura como dominio, nodo, ultima actualizacion, ultimo sign-on e IP o identificador de logon evidenciado.
Actor: Operador de seguridad
Flujo funcional:
1. El usuario abre la pantalla de administracion de usuarios y digita un identificador de usuario.
2. El sistema valida que el identificador este informado.
3. El backend consulta el registro principal del usuario.
4. Si existe, resuelve datos complementarios: descripcion del perfil, empresa, centro, observaciones y datos BANCS.
5. El frontend muestra el formulario completo con campos editables y solo lectura segun la evidencia del dominio.
6. Desviacion: si no se informa el usuario, el sistema muestra "Ingrese usuario".
7. Desviacion: si el usuario no existe o el proceso principal responde negativo, el sistema limpia el detalle y muestra la respuesta de negocio devuelta.
8. Desviacion: si una tabla complementaria no tiene registro, se informa un texto descriptivo equivalente sin interrumpir la carga del resto del detalle.
Pantallas / superficies: React: /usuarios/:usuarioId; Backend: GET /api/v1/usuarios/{usuarioId}/detalle; Componentes: UsuarioAdminPage, UsuarioAdminForm, ReadOnlyAuditPanel, ObservacionPanel
Reglas de negocio:
- El identificador de usuario es obligatorio para consultar.
- Si falta el usuario, debe mostrarse "Ingrese usuario".
- El detalle debe incluir: usuario, usuario BANCS, terminal BANCS, nombre, cedula, empresa, descripcion empresa, centro, descripcion centro, cargo, perfil, descripcion perfil, dominio, nodo, autorizador, oficina swift, observaciones, datos de ultima actualizacion, ultimo sign-on y logon/IP evidenciado.
- Si la consulta principal no encuentra usuario, se debe mostrar la respuesta de negocio devuelta por el procesamiento principal.
- Si no existe descripcion de perfil, empresa o centro, debe mostrarse texto equivalente a ausencia en tabla de parametros o catalogo.
- Las observaciones se consultan en almacenamiento separado y pueden venir vacias.
- Los datos BANCS son complementarios; su ausencia no impide mostrar el detalle principal.
Notas técnicas:
Endpoint API: GET /api/v1/usuarios/{usuarioId}/detalle. Response success: { usuarioId:string, usuarioBancs:string|null, terminalBancs:number|null, nombre:string, cedula:string, empresaCodigo:string, empresaNombre:string, centroCodigo:string, centroNombre:string, cargo:string, perfilCodigo:string, perfilDescripcion:string, dominioCodigo:string, nodoCodigo:string, autorizador:boolean, oficinaSwift:string, observacion:string|null, ultimaActualizacion:{fecha:string,hora:string,usuario:string,terminal:string}, ultimoSignOn:{fecha:string,hora:string,logon:string|null}, mensaje:string }. Persistencia: tablas t95usu03-usuarios, t95obs04-observaciones-usuario, t95ban04-usuarios-bancs, t95par02-parametros-grupo, t06tc005-empresas, t06tc007-centros. Tabla observaciones: t95obs04-observaciones-usuario con columnas t95obs04_cod_usuario varchar(8) PK FK->t95usu03-usuarios, t95obs04_cod_usuario_mod varchar(8) not null, t95obs04_fec_ult_obs timestamp not null, t95obs04_cmp_observacion varchar(100) not null. Tabla complementaria BANCS: t95ban04-usuarios-bancs con PK t95ban04_usr_siglo21 varchar(8). Auth/Authz: JWT obligatorio. Error mapping: USER_REQUIRED->400, USER_NOT_FOUND->404, PROFILE_LOOKUP_ERROR->500, COMPANY_LOOKUP_ERROR->500, CENTER_LOOKUP_ERROR->500. Flyway references: V1__create_t95usu03-usuarios.sql, V2__create_t95obs04-observaciones-usuario.sql, V3__create_t95ban04-usuarios-bancs.sql. Paquetes: com.davidtestapr3.usuariosadministracion.{domain,application,infrastructure,api}. Limites transaccionales: @Transactional(readOnly=true) agregando consultas sin N+1 mediante joins o batching. Cache/estado: React Query por usuarioId; invalidar tras alta, modificacion o baja. confianza: alta
Criterios:
  1. Scenario: Consulta exitosa del detalle
Given que existe el usuario "JPEREZ01"
When el frontend consulta GET /api/v1/usuarios/JPEREZ01/detalle
Then la UI muestra usuario "JPEREZ01", nombre, empresaCodigo, centroCodigo, perfilCodigo, dominioCodigo, nodoCodigo y observacion segun el estado persistido
  2. Scenario: Usuario obligatorio
Given que el identificador de usuario esta vacio
When el usuario intenta consultar el detalle
Then la UI muestra el mensaje "Ingrese usuario" y posiciona el foco en el campo usuario
  3. Scenario: Contrato de API de detalle administrativo
Given que el frontend llama al endpoint GET /api/v1/usuarios/JPEREZ01/detalle
When la peticion es valida
Then el cuerpo JSON de respuesta contiene exactamente los campos usuarioId, usuarioBancs, terminalBancs, nombre, cedula, empresaCodigo, empresaNombre, centroCodigo, centroNombre, cargo, perfilCodigo, perfilDescripcion, dominioCodigo, nodoCodigo, autorizador, oficinaSwift, observacion, ultimaActualizacion, ultimoSignOn y mensaje con tipos string, string|null, number|null, string, string, string, string, string, string, string, string, string, string, string, boolean, string, string|null, object, object y string, y en caso de error de validacion devuelve HTTP 400 con body {timestamp,status,code,message,details,path}
  4. Scenario: Visualizacion de observacion ausente
Given que el usuario "MSINOBS1" no tiene registro en observaciones
When se consulta su detalle
Then la respuesta contiene observacion null y la pantalla muestra el campo sin texto cargado
  5. Scenario: Actualizacion UI SPA despues de modificar
Given que el detalle de "JPEREZ01" esta abierto
When una modificacion exitosa invalida la cache de React Query
Then el detalle refleja el estado persistido sin recarga manual
  6. Scenario: Esquema de base de datos de observaciones
Given que se ejecutan las migraciones Flyway
When se verifica la tabla t95obs04-observaciones-usuario
Then existen las columnas t95obs04_cod_usuario, t95obs04_cod_usuario_mod, t95obs04_fec_ult_obs y t95obs04_cmp_observacion con tipos varchar, varchar, timestamp y varchar, constraint de primary key en t95obs04_cod_usuario, y foreign keys a t95usu03-usuarios segun DDL en V2__create_t95obs04-observaciones-usuario.sql
---
## 6. Dar de alta un usuario administrativo con validaciones de perfil, empresa, centro y datos complementarios
Módulo: usuarios-administracion
Como administrador u operador autorizado, necesito crear un nuevo usuario administrativo validando los campos base y las referencias de dominio para asegurar la consistencia operacional del maestro de usuarios. La evidencia principal surge de VALIDA-INGRESO y VALIDA-CAMPOS en SSITP007. El flujo exige usuario, nombre, observaciones y perfil; normaliza autorizador a 0 o 1; valida que oficina Swift, si viene informada, solo pueda tomar el valor MSQUTODO; verifica que el perfil exista en los catalogos T95PAR02 con parametro GR y T01GRE20; valida empresa en T06TC005 y centro dentro de empresa en T06TC007; inicializa datos de ultimo logon para un alta y mantiene algunos campos opcionales como cargo o cedula en blanco o cero cuando no se informan. Los datos BANCS son complementarios y opcionales: si el formulario no los envía, el alta debe continuar sin tratarlos como obligatorios ni como dependencia estricta de base de datos. Si se informan usuario BANCS y terminal BANCS, se registra la informacion complementaria solo cuando ambos valores vienen completos y el modelo realmente los soporte. Adicionalmente, la observacion se guarda en un almacenamiento separado mediante logica upsert. Cuando el usuario pulse Cargar ejemplo, el valor de usuario BANCS generado debe ser unico por ejecucion para no repetir external_user ni provocar colisiones en pruebas repetidas. La historia reproduce exactamente ese alcance sin inventar nuevas reglas, y exige una implementacion REST transaccional y auditable.
Actor: Administrador de seguridad
Flujo funcional:
1. El administrador abre la pantalla de alta de usuario.
2. Completa los campos de negocio y confirma el alta.
3. El frontend realiza validaciones basicas y envia la solicitud.
4. El backend valida obligatoriedad, consistencia cruzada y existencia de referencias de perfil, empresa y centro.
5. Si la solicitud es valida, crea el usuario principal, guarda o actualiza la observacion y, si corresponde, crea el registro complementario BANCS.
6. El sistema devuelve el detalle persistido con mensaje de alta exitosa.
7. Desviacion: si falta un campo obligatorio o existe inconsistencia BANCS, el sistema responde error de validacion indicando el campo.
8. Desviacion: si perfil, empresa o centro no existen en catalogos, el sistema rechaza la operacion.
9. Desviacion: si el usuario BANCS ya existe de forma duplicada y el complemento fue enviado, el sistema informa conflicto y no duplica registros.
Pantallas / superficies: React: /usuarios/nuevo; Backend: POST /api/v1/usuarios; Componentes: UsuarioAdminForm, UsuarioBancsSection, ObservacionField, SaveUserButton
Reglas de negocio:
- Usuario es obligatorio.
- Nombre es obligatorio.
- Observaciones son obligatorias.
- Perfil es obligatorio.
- Autorizador solo admite 0 o 1; cualquier valor distinto de 1 se interpreta como 0.
- Si oficina Swift viene informada, solo se acepta el valor exacto "MSQUTODO".
- El perfil debe existir en parametros con codigo GR.
- El perfil tambien debe existir en la configuracion de recursos asociada.
- La empresa debe existir.
- El centro es obligatorio y debe existir para la empresa indicada.
- Cedula puede quedar en cero si no se informa.
- Cargo puede quedar vacio si no se informa.
- En altas se inicializan fecha y hora de ultimo logon en cero y datos de logon externo vacios.
- Si se informan datos BANCS completos y el complemento forma parte del alcance del proyecto, se crea el registro complementario con estado de proceso "TC".
- La observacion se persiste en almacenamiento separado y debe quedar asociada al usuario.
- Toda alta genera registro de auditoria.
Notas técnicas:
Endpoint API: POST /api/v1/usuarios. Request schema: { usuarioId:"string(8,req)", usuarioBancs:"string(8,opt)", terminalBancs:"integer(opt)", nombre:"string(43,req)", cedula:"string(10,opt)", empresaCodigo:"string(4,req)", centroCodigo:"string(4,req)", cargo:"string(18,opt)", perfilCodigo:"string(8,req)", autorizador:"boolean(req)", oficinaSwift:"string(12,opt)", observacion:"string(50,req)", idempotencyKey:"string(req)" }. Response success: { id:"string", usuarioId:"string", nombre:"string", empresaCodigo:"string", centroCodigo:"string", perfilCodigo:"string", autorizador:"boolean", observacion:"string", usuarioBancs:"string|null", terminalBancs:"number|null", mensaje:"string" }. Tablas DB: t95usu03-usuarios, t95obs04-observaciones-usuario, t95ban04-usuarios-bancs, y auditoria t95log01-auditoria-usuarios con columnas t95log01_id uuid PK, t95log01_transaccion varchar(10), t95log01_operacion varchar(12), t95log01_fecha_ingreso timestamp, t95log01_terminal varchar(10), t95log01_cod_usuario_mod varchar(20), t95log01_mensajeria varchar(100), t95log01_cmp_observacion varchar(100). Auth/Authz: JWT obligatorio, solo ROLE_ADMIN para POST. Error mapping: USER_REQUIRED->400, NAME_REQUIRED->400, OBSERVATION_REQUIRED->400, PROFILE_REQUIRED->400, PROFILE_NOT_FOUND->400, PROFILE_RESOURCE_NOT_FOUND->400, COMPANY_NOT_FOUND->400, CENTER_REQUIRED->400, CENTER_NOT_FOUND->400, SWIFT_INVALID_VALUE->400, BANCS_USER_REQUIRED->400, BANCS_TERMINAL_REQUIRED->400, BANCS_USER_DUPLICATE->409. Flyway references: V1__create_t95usu03-usuarios.sql, V2__create_t95obs04-observaciones-usuario.sql, V3__create_t95ban04-usuarios-bancs.sql, V4__create_t95log01-auditoria-usuarios.sql. Paquetes: com.davidtestapr3.usuariosadministracion.{domain,application,infrastructure,api}. Limites transaccionales: @Transactional en service cubriendo alta principal + observacion + auditoria + insercion BANCS; rollback total ante error de negocio o SQL. Cache/estado: invalidar queries de /api/v1/usuarios y /api/v1/usuarios/{id}/detalle al exito. confianza: alta
Criterios:
  1. Scenario: Alta exitosa de usuario sin datos BANCS
Given que existe el perfil "OPER001", la empresa "1001" y el centro "2001"
When el frontend envia POST /api/v1/usuarios con {"usuarioId":"JPEREZ01","nombre":"JUAN PEREZ LOPEZ","empresaCodigo":"1001","centroCodigo":"2001","perfilCodigo":"OPER001","autorizador":true,"oficinaSwift":"","observacion":"ALTA INICIAL","idempotencyKey":"ALT-001"}
Then el backend responde HTTP 201 y el detalle persistido contiene usuarioId "JPEREZ01", perfilCodigo "OPER001" y observacion "ALTA INICIAL"
  2. Scenario: Rechazo por observacion faltante
Given que el formulario de alta no contiene observacion
When el usuario intenta guardar
Then la UI muestra "Ingrese Observaciones" y no envia la mutacion
  3. Scenario: Validacion cruzada de datos BANCS
Given que el request contiene usuarioBancs "12345678" y terminalBancs null
When se procesa el alta
Then el backend responde HTTP 400 con code "BANCS_TERMINAL_REQUIRED"
  4. Scenario: Contrato de API de alta
Given que el frontend llama al endpoint POST /api/v1/usuarios
When la peticion es valida
Then el cuerpo JSON de respuesta contiene exactamente los campos id, usuarioId, nombre, empresaCodigo, centroCodigo, perfilCodigo, autorizador, observacion, usuarioBancs, terminalBancs y mensaje con tipos string, string, string, string, string, string, boolean, string, string|null, number|null y string, y en caso de error de validacion devuelve HTTP 400 con body {timestamp,status,code,message,details,path}
  5. Scenario: Esquema de base de datos de auditoria
Given que se ejecutan las migraciones Flyway
When se verifica la tabla t95log01-auditoria-usuarios
Then existen las columnas t95log01_id, t95log01_transaccion, t95log01_operacion, t95log01_fecha_ingreso, t95log01_terminal, t95log01_cod_usuario_mod, t95log01_mensajeria y t95log01_cmp_observacion con tipos uuid, varchar, varchar, timestamp, varchar, varchar, varchar y varchar, constraint de primary key en t95log01_id, y foreign keys a ninguna tabla obligatoria segun DDL en V4__create_t95log01-auditoria-usuarios.sql
  6. Scenario: Actualizacion UI SPA tras alta exitosa
Given que el listado de "/usuarios/consulta" estaba cacheado para empresa "1001"
When el alta de "JPEREZ01" finaliza exitosamente
Then React Query invalida el listado y al volver se refleja el nuevo usuario sin recarga manual
  7. Scenario: Idempotencia en alta
Given que se reenvia la misma peticion con identificador unico
When el backend la recibe por segunda vez
Then no genera duplicados y devuelve el mismo estado HTTP 200/201 con datos coherentes
---
## 7. Modificar un usuario existente preservando consistencia de perfil, centro, observaciones y datos BANCS
Módulo: usuarios-administracion
Como administrador de seguridad, necesito modificar un usuario existente garantizando que los cambios mantengan coherencia funcional y que la informacion complementaria asociada se actualice correctamente. La evidencia se encuentra en VALIDA-MODIFICA de SSITP007, junto con VALIDA-CAMPOS, MODIFICA-USR, MODIFICA-OBSER y las consultas auxiliares. El flujo almacena el perfil, centro y autorizacion previos para auditoria, valida todos los campos igual que en el alta y luego actualiza el registro principal. Para la integracion BANCS, primero consulta si existe informacion previa; si existe con estado TE, la reactiva con estado TC; si no existe, tambien usa TC. Cuando el formulario deja vacios usuario BANCS o terminal BANCS pero existia informacion previa, conserva valores previos y limpia la visualizacion editable; cuando se informa un nuevo usuario BANCS distinto al previo, actualiza los datos complementarios. Ademas, la observacion se actualiza con un comportamiento de upsert. La historia debe reflejar exactamente estas decisiones, incluyendo conflicto por usuario BANCS duplicado y auditoria del antes y despues simplificado en mensajeria. No se incluyen reglas de cambio de dominio o nodo porque no aparecen como modificables en este flujo.
Actor: Administrador de seguridad
Flujo funcional:
1. El administrador abre el detalle de un usuario existente.
2. Edita los campos permitidos y confirma la modificacion.
3. El sistema valida obligatoriedad, catalogos y consistencia BANCS.
4. El backend actualiza el usuario principal.
5. El sistema resuelve la actualizacion BANCS: conserva datos previos cuando el formulario los omite, reactiva estado si corresponde o actualiza valores cuando cambian.
6. El backend actualiza o inserta la observacion asociada.
7. Se registra auditoria y se devuelve el detalle actualizado.
8. Desviacion: si algun catalogo o campo obligatorio falla, la operacion se rechaza.
9. Desviacion: si el usuario BANCS propuesto ya esta duplicado, se devuelve conflicto.
10. Desviacion: si el usuario no existe, se responde no encontrado.
Pantallas / superficies: React: /usuarios/:usuarioId; Backend: PUT /api/v1/usuarios/{usuarioId}; Componentes: UsuarioAdminForm, UsuarioBancsSection, AuditSummaryPanel
Reglas de negocio:
- Las mismas validaciones del alta aplican en modificacion para usuario, nombre, observacion, perfil, empresa y centro.
- Debe conservarse informacion previa de perfil, centro y autorizacion para auditoria comparativa.
- Si existe registro BANCS previo con estado TE, al modificar se reactiva con estado TC.
- Si no existe registro BANCS previo y ahora se informan datos completos, debe insertarse con estado TC.
- Si el formulario omite usuario BANCS o terminal BANCS y existia informacion previa, el backend conserva los datos previos complementarios.
- Si se informa usuario BANCS nuevo distinto al previo y terminal valida, debe actualizarse el registro complementario.
- La observacion se actualiza; si no existia registro previo de observacion, debe insertarse.
- La modificacion debe generar auditoria con operacion de modificacion y datos previos relevantes.
- Usuario BANCS duplicado provoca conflicto.
- Si falla la actualizacion complementaria, la operacion no debe dejar inconsistencias parciales.
Notas técnicas:
Endpoint API: PUT /api/v1/usuarios/{usuarioId}. Request schema: mismo de alta excepto usuarioId path req y body opcionalmente repetido para validacion de consistencia. Response success: { usuarioId:string, nombre:string, empresaCodigo:string, centroCodigo:string, perfilCodigo:string, autorizador:boolean, observacion:string, usuarioBancs:string|null, terminalBancs:number|null, mensaje:string }. Tablas DB: t95usu03-usuarios, t95obs04-observaciones-usuario, t95ban04-usuarios-bancs, t95log01-auditoria-usuarios. Auth/Authz: JWT obligatorio, ROLE_ADMIN. Error mapping: USER_NOT_FOUND->404, PROFILE_NOT_FOUND->400, COMPANY_NOT_FOUND->400, CENTER_NOT_FOUND->400, BANCS_USER_DUPLICATE->409, UPDATE_FAILED->500. Flyway references: V1__create_t95usu03-usuarios.sql, V2__create_t95obs04-observaciones-usuario.sql, V3__create_t95ban04-usuarios-bancs.sql, V4__create_t95log01-auditoria-usuarios.sql. Paquetes: com.davidtestapr3.usuariosadministracion.{domain,application,infrastructure,api}. Limites transaccionales: @Transactional sobre actualizacion principal + upsert de observacion + upsert/merge BANCS + auditoria; aislamiento READ_COMMITTED suficiente. Cache/estado: invalidar detalle del usuario y listados filtrados. confianza: media
Criterios:
  1. Scenario: Modificacion exitosa con cambio de perfil y observacion
Given que existe el usuario "JPEREZ01" con perfil "OPER001"
When el frontend envia PUT /api/v1/usuarios/JPEREZ01 con perfilCodigo "SUPV0001" y observacion "CAMBIO DE PERFIL"
Then el backend responde HTTP 200 y el detalle persistido contiene perfilCodigo "SUPV0001" y observacion "CAMBIO DE PERFIL"
  2. Scenario: Conservacion de datos BANCS previos al omitirlos en pantalla
Given que el usuario "JPEREZ01" posee usuarioBancs "12345678" y terminalBancs 54321 ya almacenados
When el administrador modifica nombre y cargo sin enviar usuarioBancs ni terminalBancs
Then el registro complementario mantiene usuarioBancs "12345678" y terminalBancs 54321
  3. Scenario: Conflicto por usuario BANCS duplicado
Given que el usuario BANCS "87654321" ya esta asociado a otro usuario
When se intenta asignar ese valor a "JPEREZ01"
Then el backend responde HTTP 409 con code "BANCS_USER_DUPLICATE"
  4. Scenario: Contrato de API de modificacion
Given que el frontend llama al endpoint PUT /api/v1/usuarios/JPEREZ01
When la peticion es valida
Then el cuerpo JSON de respuesta contiene exactamente los campos usuarioId, nombre, empresaCodigo, centroCodigo, perfilCodigo, autorizador, observacion, usuarioBancs, terminalBancs y mensaje con tipos string, string, string, string, string, boolean, string, string|null, number|null y string, y en caso de error de validacion devuelve HTTP 400 con body {timestamp,status,code,message,details,path}
  5. Scenario: Actualizacion UI SPA del detalle
Given que el detalle de "JPEREZ01" se encuentra abierto
When la modificacion finaliza exitosamente
Then React Query invalida el detalle y la pantalla refleja el estado persistido sin recarga manual
  6. Scenario: Idempotencia en modificacion
Given que se reenvia la misma peticion con identificador unico
When el backend la recibe por segunda vez
Then no genera duplicados y devuelve el mismo estado HTTP 200/201 con datos coherentes
---
## 8. Eliminar un usuario y dar de baja su informacion asociada con observacion obligatoria
Módulo: usuarios-administracion
Como administrador de seguridad, necesito eliminar un usuario del maestro administrativo exigiendo una observacion obligatoria y actualizando la informacion asociada para dejar trazabilidad del motivo. Esta historia se basa en VALIDA-ELIMINA, MODIFICA-ESTADO-BANCS y ELIMINA-OBSERVACION de SSITP007. El flujo valida primero la presencia del usuario y luego exige observacion; si existen datos BANCS informados, no elimina fisicamente ese registro en este proceso sino que cambia su estado de proceso a TE y actualiza la observacion, dejando los campos visuales de usuario y terminal BANCS vacios en la respuesta. En paralelo elimina la observacion almacenada en la tabla separada y registra auditoria de eliminacion. El procesamiento principal del usuario se ejecuta con tipo E, por lo que la baja del maestro principal debe implementarse conforme al resultado de ese proceso y mantener consistencia transaccional con observaciones y auditoria. La historia no inventa baja logica adicional distinta a la observada: exige observacion, procesa baja principal, cambia estado complementario BANCS cuando existe, elimina observacion asociada y audita la operacion.
Actor: Administrador de seguridad
Flujo funcional:
1. El administrador abre el detalle de un usuario existente y elige eliminar.
2. El sistema solicita observacion obligatoria de la baja.
3. El backend valida usuario y observacion.
4. El sistema ejecuta la baja del usuario principal.
5. Si el usuario tiene datos BANCS, actualiza su estado complementario a TE con la observacion de baja.
6. El sistema elimina la observacion persistida separada del usuario.
7. Registra auditoria y devuelve mensaje final.
8. Desviacion: si falta la observacion, la operacion se rechaza.
9. Desviacion: si el usuario no existe o no puede procesarse la baja principal, se informa el error correspondiente.
10. Desviacion: si falla la actualizacion o eliminacion complementaria, la transaccion debe responder error y evitar estado inconsistente.
Pantallas / superficies: React: /usuarios/:usuarioId; Backend: DELETE /api/v1/usuarios/{usuarioId}; Componentes: DeleteUserDialog, ObservacionField, ToastResult
Reglas de negocio:
- Para eliminar es obligatorio ingresar observaciones.
- Si falta observacion, debe mostrarse "Ingrese Observaciones".
- La baja principal del usuario debe ejecutarse antes de eliminar observaciones asociadas.
- Si existe usuario BANCS informado, debe actualizarse el estado complementario a "TE" y guardar la observacion de la baja.
- Tras la baja complementaria, la respuesta puede presentar usuario BANCS y terminal BANCS vacios.
- Debe eliminarse el registro de observacion asociado al usuario en la tabla separada.
- Toda eliminacion genera auditoria.
- Los errores en tablas complementarias deben mapearse y no dejar inconsistencia parcial.
Notas técnicas:
Endpoint API: DELETE /api/v1/usuarios/{usuarioId}. Request schema: { observacion:"string(50,req)", idempotencyKey:"string(req)" }. Response success: { usuarioId:"string", mensaje:"string", bancsEstado:"string|null" }. Persistencia: baja principal sobre t95usu03-usuarios o servicio equivalente de dominio; update en t95ban04-usuarios-bancs estado_proceso='TE'; delete en t95obs04-observaciones-usuario; insert auditoria en t95log01-auditoria-usuarios. Auth/Authz: JWT obligatorio, solo ROLE_ADMIN. Error mapping: USER_NOT_FOUND->404, OBSERVATION_REQUIRED->400, BANCS_STATUS_UPDATE_FAILED->500, OBSERVATION_DELETE_FAILED->500, DELETE_FAILED->500. Flyway references: V1__create_t95usu03-usuarios.sql, V2__create_t95obs04-observaciones-usuario.sql, V3__create_t95ban04-usuarios-bancs.sql, V4__create_t95log01-auditoria-usuarios.sql. Paquetes: com.davidtestapr3.usuariosadministracion.{domain,application,infrastructure,api}. Limites transaccionales: @Transactional rollbackFor Exception cubriendo baja principal + update BANCS + delete observacion + auditoria. Cache/estado: invalidar detalle y listados; navegar a consulta tras exito. confianza: alta
Criterios:
  1. Scenario: Rechazo de baja sin observacion
Given que el administrador abre la eliminacion del usuario "JPEREZ01"
When confirma la operacion sin escribir observacion
Then la UI muestra "Ingrese Observaciones" y no envia DELETE al backend
  2. Scenario: Eliminacion exitosa con actualizacion BANCS
Given que el usuario "JPEREZ01" tiene registro complementario BANCS activo
When el frontend envia DELETE /api/v1/usuarios/JPEREZ01 con {"observacion":"BAJA POR RESTRUCTURACION","idempotencyKey":"DEL-001"}
Then el backend responde HTTP 200 con mensaje de eliminacion y el registro BANCS queda con estado "TE"
  3. Scenario: Contrato de API de baja
Given que el frontend llama al endpoint DELETE /api/v1/usuarios/JPEREZ01
When la peticion es valida
Then el cuerpo JSON de respuesta contiene exactamente los campos usuarioId, mensaje y bancsEstado con tipos string, string y string|null, y en caso de error de validacion devuelve HTTP 400 con body {timestamp,status,code,message,details,path}
  4. Scenario: Eliminacion de observacion asociada
Given que el usuario "JPEREZ01" tiene observacion persistida
When la baja finaliza exitosamente
Then ya no existe registro en t95obs04-observaciones-usuario para "JPEREZ01"
  5. Scenario: Actualizacion UI SPA luego de baja
Given que la consulta general de usuarios estaba abierta con filtro empresa "1001"
When la baja del usuario "JPEREZ01" finaliza exitosamente
Then React Query invalida la lista y el usuario eliminado deja de verse sin recarga manual
  6. Scenario: Idempotencia en baja
Given que se reenvia la misma peticion con identificador unico
When el backend la recibe por segunda vez
Then no genera duplicados y devuelve el mismo estado HTTP 200/201 con datos coherentes
---
## 9. Registrar auditoria operativa y observaciones de usuarios en cada alta, modificacion o baja
Módulo: usuarios-administracion
Como responsable de seguridad y cumplimiento, necesito que toda alta, modificacion o eliminacion de usuarios deje trazabilidad estructurada de la operacion y mantenga sincronizada la observacion funcional asociada al usuario. Esta historia se apoya en WRITELOG, GETOBSER, INSERTA-OBSER y MODIFICA-OBSER de SSITP007. El codigo construye una mensajeria compacta con identificador de usuario, nombre truncado, perfil, centro, autorizacion, valores previos en modificacion, observacion y respuesta final. Tambien distingue la operacion como INGRESO, MODIFICACION o ELIMINACION. En paralelo, las observaciones del usuario se gestionan en una tabla separada mediante comportamiento upsert: si el update no encuentra registro, se intenta insertar. En lectura, si no existe observacion, el campo se presenta vacio. Esta historia no crea nuevas reglas de negocio; formaliza el subsistema transversal de trazabilidad ya evidenciado para que la aplicacion moderna lo implemente de forma consistente y reusable. Debe quedar disponible tanto para detalle como para mutaciones, con logging estructurado, correlation ID y persistencia relacional de auditoria y observaciones.
Actor: Administrador de seguridad
Flujo funcional:
1. El usuario ejecuta un alta, modificacion o baja de un usuario administrativo.
2. El sistema construye el mensaje de auditoria con datos del usuario, operacion, observacion y resultado.
3. El backend persiste la auditoria de la operacion.
4. Para altas y modificaciones, el backend actualiza la observacion del usuario; si no existe registro, lo inserta.
5. Para consultas de detalle, el backend recupera la observacion si existe.
6. Desviacion: si no existe observacion al consultar, el sistema devuelve el campo vacio.
7. Desviacion: si falla el update de observacion por ausencia de registro, el sistema ejecuta insercion.
8. Desviacion: si falla la auditoria, la operacion debe informar error tecnico controlado conforme a la politica transaccional definida.
Pantallas / superficies: React: /usuarios/nuevo, /usuarios/:usuarioId; Backend: GET /api/v1/usuarios/{usuarioId}/observacion, PUT /api/v1/usuarios/{usuarioId}/observacion; Componentes: ObservacionField, AuditTrailSummary
Reglas de negocio:
- Debe registrarse auditoria en alta, modificacion y eliminacion.
- La operacion auditada debe identificarse como INGRESO, MODIFICACION o ELIMINACION.
- La mensajeria de auditoria debe incluir usuario, nombre, perfil, centro, autorizacion, observacion y resultado; en modificacion debe incluir ademas valores previos relevantes.
- La observacion se almacena por usuario en tabla separada.
- Si la actualizacion de observacion no encuentra registro, se debe insertar uno nuevo.
- Si la consulta de observacion no encuentra registro, el campo se devuelve vacio.
- Las observaciones deben quedar asociadas al usuario y al usuario modificador.
- Los errores de auditoria u observaciones deben mapearse con mensajes tecnicos controlados.
Notas técnicas:
Endpoint API de apoyo: GET /api/v1/usuarios/{usuarioId}/observacion -> { usuarioId:string, observacion:string|null, updatedBy:string|null, updatedAt:string|null }. PUT /api/v1/usuarios/{usuarioId}/observacion -> { observacion:"string(50,req)", idempotencyKey:"string(req)" } response { usuarioId:string, observacion:string, updatedBy:string, updatedAt:string }. Tabla DB observaciones: t95obs04-observaciones-usuario. Tabla DB auditoria: t95log01-auditoria-usuarios. Auth/Authz: JWT obligatorio; GET para ROLE_ADMIN/ROLE_OPERADOR, PUT solo ROLE_ADMIN. Error mapping: OBSERVATION_NOT_FOUND->404 solo para endpoint especializado si se decide, aunque en detalle general se devuelve null; OBSERVATION_UPDATE_FAILED->500, AUDIT_WRITE_FAILED->500. Flyway references: V2__create_t95obs04-observaciones-usuario.sql, V4__create_t95log01-auditoria-usuarios.sql. Paquetes: com.davidtestapr3.usuariosadministracion.{domain,application,infrastructure,api}. Limites transaccionales: para mutaciones, compartir la misma transaccion de la operacion principal; para endpoint dedicado de observacion usar @Transactional. Cache/estado: invalidar detalle del usuario y resumen de auditoria; revalidacion inmediata tras guardar. confianza: media
Criterios:
  1. Scenario: Upsert de observacion al modificar
Given que el usuario "JPEREZ01" no tiene fila en t95obs04-observaciones-usuario
When una modificacion exitosa guarda la observacion "CAMBIO AUTORIZADO"
Then se crea un registro nuevo asociado a "JPEREZ01" con el texto "CAMBIO AUTORIZADO"
  2. Scenario: Lectura de observacion inexistente
Given que el usuario "MSINOBS1" no tiene observacion registrada
When el frontend llama GET /api/v1/usuarios/MSINOBS1/observacion
Then recibe HTTP 200 con {"usuarioId":"MSINOBS1","observacion":null,"updatedBy":null,"updatedAt":null}
  3. Scenario: Contrato de API de observacion
Given que el frontend llama al endpoint PUT /api/v1/usuarios/JPEREZ01/observacion
When la peticion es valida
Then el cuerpo JSON de respuesta contiene exactamente los campos usuarioId, observacion, updatedBy y updatedAt con tipos string, string, string y string, y en caso de error de validacion devuelve HTTP 400 con body {timestamp,status,code,message,details,path}
  4. Scenario: Auditoria de modificacion con datos previos
Given que el usuario "JPEREZ01" cambia perfil de "OPER001" a "SUPV0001"
When la operacion termina correctamente
Then existe un registro de auditoria con operacion "MODIFICACION" y mensajeria que conserva el valor previo "OPER001" y el nuevo contexto persistido
  5. Scenario: Actualizacion UI SPA de observacion
Given que el detalle del usuario "JPEREZ01" esta abierto
When la observacion se actualiza correctamente
Then el panel de observacion refleja el estado persistido sin recarga manual mediante invalidacion explicita de cache
  6. Scenario: Idempotencia en actualizacion de observacion
Given que se reenvia la misma peticion con identificador unico
When el backend la recibe por segunda vez
Then no genera duplicados y devuelve el mismo estado HTTP 200/201 con datos coherentes
---
## 10. Ejecutar la solucion completa en entorno local con configuracion segura, puertos autogestionados y datos semilla
Módulo: infraestructura
Como equipo de desarrollo y QA, necesitamos poder levantar la aplicacion completa de seguridad con un solo comando, validando backend, frontend, base de datos, documentacion y datos iniciales para acelerar la migracion y pruebas funcionales. Aunque el codigo fuente analizado no contiene scripts modernos, esta historia es obligatoria para hacer construible y verificable la solucion objetivo conforme a las especificaciones maestras del encargo. Debe cubrir Docker Compose, .env.example, variables de puertos configurables con fallback, seed de catalogos requeridos para empresas, centros y perfiles, y una ejecucion segura de dependencias del sistema usando SUDO_AUTH solo cuando sea imprescindible en setup. Tambien debe incluir OpenAPI, pruebas automatizadas y ausencia de errores de CORS. Esta historia soporta directamente los modulos de menu, consulta y administracion de usuarios porque estos dependen de catalogos y tablas iniciales para operar. Su alcance no inventa funcionalidad de negocio; garantiza que todo lo ya especificado pueda ejecutarse localmente con calidad de produccion.
Actor: Desarrollador
Flujo funcional:
1. El desarrollador configura un archivo .env a partir de .env.example.
2. Ejecuta ./run.sh o .\run.ps1.
3. El script valida puertos disponibles para frontend, backend y base de datos y aplica fallback consecutivo si hay conflictos.
4. Instala dependencias necesarias cuando falten, usando SUDO_AUTH de forma segura solo para setup del entorno.
5. Levanta PostgreSQL, backend y frontend con Docker Compose y carga migraciones Flyway incluyendo seed data.
6. Ejecuta pruebas backend y frontend.
7. Publica URLs finales de la SPA y Swagger.
8. Desviacion: si falta un secreto obligatorio, el script termina con error instructivo sin exponer valores.
9. Desviacion: si SUDO_AUTH falta o es invalida cuando se requiere instalacion del sistema, el script falla con mensaje controlado y limpia la sesion sudo.
10. Desviacion: si un puerto esta ocupado, el script asigna el siguiente disponible y continua.
Pantallas / superficies: N/A
Reglas de negocio:
- Debe existir .env.example con variables DATABASE_*, BACKEND_PORT, FRONTEND_PORT, DATABASE_PORT, JWT_*, CORS_*, REACT_APP_*, DOCKER_* y SUDO_AUTH documentada solo para setup.
- Los puertos por defecto son 8081 backend, 3001 frontend y 5433 base de datos.
- Si un puerto esta ocupado, se debe asignar el siguiente disponible consecutivo.
- JWT_SECRET y DB_PASSWORD son obligatorios y no se versionan.
- SUDO_AUTH nunca se imprime, loguea ni expone en runtime.
- Tras usar sudo automatizado debe ejecutarse limpieza de sesion sudo.
- Docker Compose debe definir limites de CPU y memoria, healthchecks, redes aisladas y usuario no root.
- Deben cargarse migraciones y datos semilla, incluido V999__seed_datos_iniciales.sql.
- La ejecucion local debe validar pruebas automatizadas antes de quedar disponible.
- La aplicacion debe exponer documentacion Swagger y frontend accesible por navegador.
Notas técnicas:
Aplicar [ENV VARS MASTER], [TEST STRATEGY MASTER], [TECHNICAL QUALITY - DEFINITION OF DONE], [DB SCHEMA MASTER]. Artefactos requeridos: /backend, /frontend, docker-compose.yml, backend/Dockerfile, frontend/Dockerfile, .dockerignore, .env.example, README.md, DOCS.md, run.sh, run.ps1. Flyway references minimas: V1__create_t95usu03-usuarios.sql, V2__create_t95obs04-observaciones-usuario.sql, V3__create_t95ban04-usuarios-bancs.sql, V4__create_t95log01-auditoria-usuarios.sql, V999__seed_datos_iniciales.sql. Seed obligatorio: empresas, centros, perfiles y usuarios de prueba coherentes. Auth/Authz: JWT con cookies httpOnly y CORS configurable por variable de entorno. Limites transaccionales: N/A de infraestructura. Cache/estado: React Query configurado globalmente con staleTime y gcTime razonables; invalidacion explicita en mutaciones. confianza: alta
Criterios:
  1. Scenario: Criterio obligatorio de infraestructura
Given que se despliega la aplicacion en entorno local, cuando se ejecuta el script ./run.sh o .\run.ps1: (1) se verifican puertos 8081, 3001, 5433 disponibles, (2) si hay conflicto, se auto-asignan puertos alternos consecutivos (8082/3002/5434, etc.), (3) Docker Compose levanta servicios con limites de recursos definidos, (4) tests exitosos (JUnit 5 + Jest), (5) dependencias instaladas (mvn clean install + npm install), (6) sin errores CORS, (7) seed data cargado (V999__seed_datos_iniciales.sql), (8) app accesible en http://localhost:{FRONTEND_PORT}, API docs en http://localhost:{BACKEND_PORT}/swagger-ui.html, (9) script muestra puertos asignados y URLs finales
  2. Scenario: Archivo de variables de entorno base
Given el repositorio recien clonado
When el desarrollador revisa .env.example
Then encuentra DATABASE_HOST, DATABASE_PORT, DATABASE_NAME, DATABASE_USER, DB_PASSWORD, BACKEND_PORT, FRONTEND_PORT, JWT_SECRET, JWT_EXPIRATION, CORS_ALLOWED_ORIGINS, REACT_APP_API_BASE_URL, DOCKER_BUILDKIT y SUDO_AUTH documentadas
  3. Scenario: Uso seguro de SUDO_AUTH
Given que el script necesita instalar Docker y Java en una maquina sin dependencias
When utiliza privilegios elevados
Then ejecuta echo "$SUDO_AUTH" | sudo -S <comando> sin imprimir el secreto y finaliza con sudo -k
  4. Scenario: Migraciones y seed consistentes
Given que los contenedores estan levantados
When Flyway termina la inicializacion
Then existen las tablas de usuarios, observaciones, BANCS, auditoria y los catalogos semilla requeridos para ejecutar los casos funcionales del modulo
  5. Scenario: Ejecucion local validable con un comando
Given un desarrollador con Docker y Node disponibles
When ejecuta un unico comando de arranque
Then puede validar funcionalidad completa de menu, consulta y administracion antes de hacer commit
  6. Scenario: Imagenes y compose endurecidos
Given que se inspecciona docker-compose.yml y los Dockerfiles
When se revisa la configuracion
Then se verifica uso de imagenes ligeras multi-stage, usuario no-root, healthchecks, restart unless-stopped, limites de 512M-1G y 0.75 CPU, redes aisladas y .dockerignore estricto

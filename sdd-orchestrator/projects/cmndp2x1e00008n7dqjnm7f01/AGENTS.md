# Inventario David

## Purpose
This repository is a generated project driven by OpenSpec and OpenCode.

## Working rules
- Treat "openspec/config.yaml", "openspec/specs/project-scope/spec.md", and "openspec/changes/cmndp2x1e00008n7dqjnm7f01" as the source of truth for scope.
- Read the full user stories before making changes.
- Use OpenSpec artifacts to plan the work before coding.
- Create the missing app scaffold, dependencies, scripts, and build files when the implementation needs them.
- Install dependencies from inside the project when the implementation needs them.
- Keep the result runnable and verify it before finishing.
- Prefer focused changes that satisfy the stories end to end.

## User stories
Historias de Usuario — Sistema de Inventario (MiInventario)
AnálisisHistorias de Usuario — Sistema de Inventario (MiInventario)
Análisis Arquitectónico del Sistema Original
Capa Original
Proyecto
Tecnología
Presentación
WebFormsApp
ASP.NET Web Forms (.aspx)
Lógica de Negocio
MiInventario.BLL
Servicios C# (.NET 4.8.1)
Acceso a Datos
MiInventario.DAL
Entity Framework 6 / SQL Server

Páginas identificadas: Default.aspx (inventario), About.aspx (acerca de), Contact.aspx (contacto), Site.Master (layout maestro).
Entidad principal: Producto (Id, Nombre, Cantidad, Precio).

MÓDULO 1: ESTRUCTURA Y NAVEGACIÓN GENERAL (Layout)

HU-1.1 — Visualizar estructura de navegación principal (Layout Maestro)
Título: Visualizar estructura de navegación principal con menú y contenido dinámico
Descripción:
Como usuario del sistema, quiero ver una estructura de página consistente con un encabezado de navegación, un área de contenido principal y un pie de página, para poder navegar entre las distintas secciones de la aplicación (Inicio, Acerca de, Contacto) de forma intuitiva.
Actor: Usuario general (sin autenticación requerida en el código fuente)
Criterios de aceptación:
#
Criterio
CA-1
La aplicación muestra un encabezado (navbar) con el nombre de la aplicación y enlaces de navegación visibles.
CA-2
El menú contiene al menos tres enlaces: "Home" (página principal), "About" y "Contact".
CA-3
Al hacer clic en cada enlace, se navega a la ruta correspondiente sin recarga completa de página (SPA).
CA-4
Existe un pie de página (footer) visible en todas las páginas con el año actual.
CA-5
Se incluyen los estilos Bootstrap y los estilos personalizados (inventory.css, Site.css).
CA-6
La estructura es responsive y se adapta a dispositivos móviles.

Flujo funcional paso a paso:
El usuario accede a la URL raíz de la aplicación.
El sistema renderiza el layout principal que incluye:
Header/Navbar: Logo/nombre de la app + enlaces de navegación (Home, About, Contact).
Área de contenido principal: Se renderiza el componente de la ruta activa.
Footer: Texto con copyright y año.
El usuario hace clic en cualquier enlace del menú.
El sistema navega a la ruta correspondiente y renderiza el contenido de esa sección dentro del layout, sin recargar toda la página.
El enlace activo se resalta visualmente en el menú.
Pantallas involucradas:
Original (.aspx)
Componente React
Site.Master
<AppLayout /> (componente layout con <Outlet /> de React Router)
Navegación dentro de Master
<NavBar />
Footer dentro de Master
<Footer />

Reglas de negocio:
#
Regla
RN-1
Todas las páginas de la aplicación comparten el mismo layout (header, footer).
RN-2
No existe autenticación en el sistema original; todas las páginas son de acceso público.

Notas técnicas (mapeo a React / Spring / PostgreSQL):
Aspecto
Detalle
React
Crear AppLayout.jsx que use <Outlet /> de react-router-dom v6. Incluir <NavBar /> y <Footer /> como componentes hijos fijos. Usar <NavLink> para resaltar la ruta activa.
Routing
Configurar BrowserRouter con rutas: / → ProductListPage, /about → AboutPage, /contact → ContactPage.
CSS
Migrar Bootstrap 3 (usado en Web Forms) a Bootstrap 5 o React-Bootstrap. Migrar Site.css e inventory.css a módulos CSS o styled-components.
Spring
No aplica directamente; es estructura puramente frontend.
Master → Layout
ContentPlaceHolderID="MainContent" equivale al <Outlet /> de React Router dentro de AppLayout.


HU-1.2 — Visualizar página "Acerca de" (About)
Título: Visualizar página informativa "Acerca de"
Descripción:
Como usuario del sistema, quiero poder acceder a una página "Acerca de" que muestre información descriptiva de la aplicación, para conocer el propósito del sistema.
Actor: Usuario general
Criterios de aceptación:
#
Criterio
CA-1
Al navegar a la ruta /about, se muestra el título "About".
CA-2
Se muestra el subtítulo "Your application description page."
CA-3
Se muestra el texto "Use this area to provide additional information."
CA-4
La página se renderiza dentro del layout principal (navbar + footer visibles).

Flujo funcional paso a paso:
El usuario hace clic en el enlace "About" del menú de navegación.
El sistema navega a la ruta /about.
Se renderiza el componente AboutPage dentro del layout con el contenido estático.
Pantallas involucradas:
Original (.aspx)
Componente React
About.aspx
<AboutPage />

Reglas de negocio:
#
Regla
RN-1
Es una página puramente informativa, sin lógica de negocio ni interacción con backend.

Notas técnicas:
Aspecto
Detalle
React
Componente funcional estático AboutPage.jsx. Sin estado ni efectos.
Spring
No requiere endpoint backend.
Migración
<%: Title %> se reemplaza por una constante o document.title via useEffect o react-helmet.


HU-1.3 — Visualizar página de Contacto
Título: Visualizar página de información de contacto
Descripción:
Como usuario del sistema, quiero poder acceder a una página de contacto que muestre direcciones, teléfono y correos electrónicos de soporte y marketing, para saber cómo comunicarme con la organización.
Actor: Usuario general
Criterios de aceptación:
#
Criterio
CA-1
Al navegar a la ruta /contact, se muestra el título "Contact".
CA-2
Se muestra la dirección física: "One Microsoft Way, Redmond, WA 98052-6399".
CA-3
Se muestra el teléfono: "425.555.0100".
CA-4
Se muestran enlaces mailto funcionales para Support@example.com y Marketing@example.com.
CA-5
La página se renderiza dentro del layout principal.

Flujo funcional paso a paso:
El usuario hace clic en el enlace "Contact" del menú de navegación.
El sistema navega a la ruta /contact.
Se renderiza el componente ContactPage con la información de contacto estática.
El usuario puede hacer clic en los enlaces de correo, abriendo su cliente de email predeterminado.
Pantallas involucradas:
Original (.aspx)
Componente React
Contact.aspx
<ContactPage />

Reglas de negocio:
#
Regla
RN-1
Página puramente informativa, sin interacción con backend.
RN-2
Los enlaces de correo deben usar protocolo mailto:.

Notas técnicas:
Aspecto
Detalle
React
Componente funcional estático ContactPage.jsx. Usar <a href="mailto:...">.
Spring
No requiere endpoint backend.


MÓDULO 2: GESTIÓN DE INVENTARIO DE PRODUCTOS (CRUD)

HU-2.1 — Listar todos los productos del inventario
Título: Visualizar el listado completo de productos del inventario en una tabla
Descripción:
Como usuario del sistema, quiero ver una tabla con todos los productos registrados en el inventario mostrando su ID, Nombre, Cantidad y Precio, para tener visibilidad del estado actual del inventario.
Actor: Usuario general
Criterios de aceptación:
#
Criterio
CA-1
Al acceder a la página principal (ruta /), se muestra una tabla con todos los productos existentes en la base de datos.
CA-2
La tabla muestra las columnas: ID, Nombre, Cantidad, Precio y una columna de Acciones.
CA-3
Los datos se cargan automáticamente al montar la página (equivalente a Page_Load con !IsPostBack).
CA-4
Si no hay productos, la tabla se muestra vacía o con un mensaje indicativo (ej: "No hay productos registrados").
CA-5
La tabla es responsive (se adapta a pantallas pequeñas con scroll horizontal).
CA-6
La tabla aplica estilos striped, hover y bordered (equivalente a las clases CSS originales).
CA-7
Cada fila tiene un botón o enlace "Delete" en la columna de acciones.

Flujo funcional paso a paso:
El usuario accede a la URL raíz / de la aplicación.
El frontend realiza una petición GET /api/productos al backend.
El backend ejecuta la consulta SELECT * FROM productos y retorna la lista en formato JSON.
El frontend recibe la respuesta y renderiza los datos en una tabla HTML.
Si la llamada falla, se muestra un mensaje de error al usuario.
La tabla se muestra dentro del layout principal, precedida por el botón "Nuevo".
Pantallas involucradas:
Original (.aspx)
Componente React
Default.aspx — GridView gvProductos
<ProductListPage /> que contiene <ProductTable />

Reglas de negocio:
#
Regla
RN-1
Se obtienen todos los productos sin paginación (el código original usa GetAll() sin filtros).
RN-2
Los campos mostrados son exactamente: Id, Nombre, Cantidad, Precio.
RN-3
El Id es la clave primaria y se usa como DataKey para operaciones de eliminación.

Notas técnicas:
Aspecto
Detalle
React
ProductListPage.jsx ejecuta useEffect al montar para llamar a GET /api/productos. Almacena resultados en useState. Renderiza <ProductTable productos={productos} onDelete={handleDelete} />.
Spring
ProductoController.java → @GetMapping("/api/productos") → llama a ProductoService.obtenerTodos() → ProductoRepository.findAll(). Retorna List<ProductoDTO> como JSON.
PostgreSQL
Tabla productos con columnas: id SERIAL PRIMARY KEY, nombre VARCHAR NOT NULL, cantidad INTEGER, precio NUMERIC(18,2).
Mapeo ViewState
El GridView.DataSource + DataBind() se reemplaza por estado React (useState) alimentado por la respuesta de la API. No hay ViewState.
Mapeo Postback
La carga inicial Page_Load(!IsPostBack) se reemplaza por useEffect([], () => fetch(...)) ejecutado una sola vez al montar.
DTO
ProductoDTO { id: number, nombre: string, cantidad: number, precio: number }.


HU-2.2 — Agregar un nuevo producto al inventario
Título: Registrar un nuevo producto mediante formulario modal
Descripción:
Como usuario del sistema, quiero poder agregar un nuevo producto ingresando su nombre, cantidad y precio a través de un formulario en un diálogo modal, para registrar nuevo inventario en el sistema.
Actor: Usuario general
Criterios de aceptación:
#
Criterio
CA-1
Existe un botón "Nuevo" (con ícono "+") visible encima de la tabla de productos.
CA-2
Al hacer clic en "Nuevo", se abre un modal con el título "Nuevo producto".
CA-3
El modal contiene tres campos de entrada: Nombre (texto), Cantidad (numérico), Precio (texto/decimal).
CA-4
Al abrir el modal, todos los campos se limpian y no se muestra ningún mensaje de error.
CA-5
El modal tiene dos botones: "Cancelar" (cierra el modal sin guardar) y "Guardar" (envía los datos).
CA-6
Al presionar "Guardar" con datos válidos, el producto se persiste en base de datos, el modal se cierra y la tabla se refresca mostrando el nuevo producto.
CA-7
Si el Nombre está vacío o es solo espacios, se muestra el error: "Nombre requerido".
CA-8
Si Cantidad o Precio no son números válidos, se muestra el error: "Revise cantidad y precio: deben ser números válidos."
CA-9
Si ocurre cualquier otro error al guardar, se muestra: "No se pudo guardar: {mensaje del error}".
CA-10
Los mensajes de error se muestran dentro del modal (sin cerrar el modal) en un área de error con estilo text-danger.
CA-11
Al cerrar el modal (cancelar o guardar exitoso), los campos se limpian.

Flujo funcional paso a paso:
Flujo exitoso (Happy Path):
El usuario hace clic en el botón "Nuevo".
Se abre el modal "Nuevo producto" con los campos vacíos y sin mensajes de error.
El usuario ingresa:
Nombre: texto no vacío (ej: "Teclado USB").
Cantidad: número entero válido (ej: "50").
Precio: número decimal válido (ej: "29.99").
El usuario hace clic en "Guardar".
El frontend valida los campos localmente:
Nombre no vacío.
Cantidad parseable como entero.
Precio parseable como decimal.
El frontend envía una petición POST /api/productos con el body JSON { nombre, cantidad, precio }.
El backend valida que el nombre no esté vacío (regla de negocio del servicio).
El backend persiste el registro en la tabla productos.
El backend retorna 201 Created con el producto creado (incluyendo el Id generado).
El frontend cierra el modal.
El frontend refresca la lista de productos (re-llama GET /api/productos o agrega al estado local).
La tabla muestra el nuevo producto.
Flujo alternativo — Error de formato:
Los pasos 1-4 son iguales.
El usuario ingresa texto no numérico en Cantidad o Precio (ej: "abc").
El frontend detecta que el parseo falla.
Se muestra dentro del modal el mensaje: "Revise cantidad y precio: deben ser números válidos."
El modal permanece abierto con los datos ingresados.
Flujo alternativo — Nombre vacío:
El usuario deja el campo Nombre vacío y presiona "Guardar".
El frontend o backend detecta que el nombre está vacío.
Se muestra dentro del modal: "Nombre requerido".
El modal permanece abierto.
Flujo alternativo — Error inesperado del servidor:
Datos válidos, pero el backend falla (ej: error de conexión a BD).
El backend retorna un código de error (500) con un mensaje.
El frontend muestra dentro del modal: "No se pudo guardar: {mensaje}".
El modal permanece abierto.
Pantallas involucradas:
Original (.aspx)
Componente React
Default.aspx — botón "Nuevo"
<ProductListPage /> → botón que controla estado modalOpen
Default.aspx — #modalNuevoProducto
<ProductFormModal isOpen={} onClose={} onSave={} />
txtNombre, txtCantidad, txtPrecio
Inputs controlados dentro del modal con useState
lblModalError
Estado errorMessage renderizado condicionalmente en el modal
btnGuardar → PostBack btnGuardar_Click
Llamada POST /api/productos vía fetch/axios

Reglas de negocio:
#
Regla
Origen en código
RN-1
El campo Nombre es obligatorio y no puede ser vacío ni solo espacios en blanco.
ProductoService.Agregar(): if (string.IsNullOrWhiteSpace(p.Nombre)) throw new Exception("Nombre requerido")
RN-2
El campo Cantidad debe ser un número entero válido.
Default.aspx.cs: int.Parse(txtCantidad.Text.Trim(), CultureInfo.InvariantCulture) — lanza FormatException si no es válido.
RN-3
El campo Precio debe ser un número decimal válido con formato invariante (punto como separador decimal).
Default.aspx.cs: decimal.Parse(txtPrecio.Text.Trim(), CultureInfo.InvariantCulture)
RN-4
Si el parseo de Cantidad o Precio falla, se muestra el mensaje específico de formato.
catch (FormatException) en btnGuardar_Click
RN-5
Si la validación de negocio falla (ej: nombre vacío), se muestra el mensaje de la excepción.
catch (Exception ex) en btnGuardar_Click
RN-6
Al guardar exitosamente, los campos del formulario se limpian.
txtNombre.Text = string.Empty; ...
RN-7
El Id es autogenerado por la base de datos, no se ingresa manualmente.
ProductoEntity.Id es Identity/Serial.

Notas técnicas:
Aspecto
Detalle
React
ProductFormModal.jsx: componente que recibe isOpen, onClose, onSave como props. Estado interno: nombre, cantidad, precio, errorMessage. Validación local antes de llamar a la API. Usar librería de modales (React-Bootstrap <Modal> o MUI <Dialog>).
Estado del modal
El ViewState implícito de los TextBox se reemplaza por useState en el componente modal. El control de apertura/cierre del modal (que en Web Forms se hacía con RegisterStartupScript + jQuery $('#modal').modal('show'/'hide')) se reemplaza por un useState<boolean> (isModalOpen).
Postback → API
btnGuardar_Click (postback completo) → POST /api/productos (llamada REST asíncrona).
Spring Controller
@PostMapping("/api/productos") recibe @RequestBody ProductoCreateRequest { nombre: String, cantidad: int, precio: BigDecimal }. Valida con @Valid + Bean Validation (@NotBlank, @NotNull). Retorna ResponseEntity<ProductoDTO> con status 201.
Spring Service
ProductoService.agregar(ProductoCreateRequest req): valida nombre no vacío, crea entidad JPA, persiste con productoRepository.save().
Spring Repository
ProductoRepository extends JpaRepository<ProductoEntity, Integer>.
PostgreSQL
INSERT INTO productos (nombre, cantidad, precio) VALUES (?, ?, ?) RETURNING id, nombre, cantidad, precio.
Parseo de números
El parseo con CultureInfo.InvariantCulture (punto decimal) se mantiene: el frontend enviará JSON con números nativos. La validación de formato se hace en el frontend antes de enviar.
Error handling
Crear un @ExceptionHandler global en Spring que retorne JSON { message: string } con status 400/500.


HU-2.3 — Eliminar un producto del inventario
Título: Eliminar un producto existente del inventario desde la tabla
Descripción:
Como usuario del sistema, quiero poder eliminar un producto del inventario haciendo clic en el botón "Delete" de la fila correspondiente en la tabla, para remover productos que ya no son necesarios.
Actor: Usuario general
Criterios de aceptación:
#
Criterio
CA-1
Cada fila de la tabla de productos muestra un botón/enlace "Delete" en la columna de acciones.
CA-2
Al hacer clic en "Delete", se envía una petición de eliminación al backend con el Id del producto.
CA-3
Tras la eliminación exitosa, la tabla se refresca y el producto eliminado ya no aparece.
CA-4
Si el producto no existe en la base de datos (ya fue eliminado), la operación no produce error visible (comportamiento silencioso, según el código original).
CA-5
No se requiere confirmación previa en el código original (el botón CommandField ShowDeleteButton ejecuta directamente). Nota de mejora recomendada: agregar diálogo de confirmación en la migración.

Flujo funcional paso a paso:
Flujo exitoso:
El usuario visualiza la tabla de productos con al menos un registro.
El usuario hace clic en el botón "Delete" de la fila del producto que desea eliminar.
(Recomendado en migración) Se muestra un diálogo de confirmación: "¿Está seguro de que desea eliminar este producto?".
El usuario confirma.
El frontend envía una petición DELETE /api/productos/{id} al backend.
El backend busca el producto por Id:
Si existe → lo elimina de la base de datos y retorna 204 No Content.
Si no existe → retorna 204 No Content (comportamiento silencioso, equivalente al original: if (p != null) { remove; save; }).
El frontend refresca la lista de productos (re-llama GET /api/productos o elimina del estado local).
La tabla se actualiza sin el producto eliminado.
Flujo alternativo — Error de red/servidor:
El usuario hace clic en "Delete".
La petición falla (error de red o error interno del servidor).
Se muestra un mensaje de error al usuario (ej: toast/notificación).
La tabla no cambia.
Pantallas involucradas:
Original (.aspx)
Componente React
Default.aspx — CommandField ShowDeleteButton="True" en gvProductos
<ProductTable /> → botón "Eliminar" en cada fila que invoca onDelete(id)
Evento gvProductos_RowDeleting (postback)
Llamada DELETE /api/productos/{id} vía fetch/axios

Reglas de negocio:
#
Regla
Origen en código
RN-1
La eliminación se realiza por Id (clave primaria).
gvProductos.DataKeys[e.RowIndex].Value obtiene el Id.
RN-2
Si el producto con el Id especificado no existe, no se produce error; la operación es idempotente.
ProductoRepository.Delete(): if (p != null) { remove; save; } — si Find(id) retorna null, no hace nada.
RN-3
La tabla se recarga completamente tras la eliminación.
Cargar() se llama después de Eliminar().
RN-4
No existe eliminación lógica (soft delete); es eliminación física permanente.
ctx.Productos.Remove(p) es un DELETE físico.

Notas técnicas:
Aspecto
Detalle
React
En <ProductTable />, cada fila renderiza un <button onClick={() => onDelete(producto.id)}>Eliminar</button>. En ProductListPage, handleDelete llama a DELETE /api/productos/{id}, y al completar exitosamente, refresca la lista.
Postback → API
El evento gvProductos_RowDeleting (postback WebForms con DataKeys) se reemplaza por una llamada REST DELETE /api/productos/{id}.
Spring Controller
@DeleteMapping("/api/productos/{id}") → productoService.eliminar(id) → retorna ResponseEntity.noContent().build().
Spring Service
ProductoService.eliminar(int id): productoRepository.findById(id).ifPresent(p -> productoRepository.delete(p)). Comportamiento idempotente.
Spring Repository
ProductoRepository extends JpaRepository<ProductoEntity, Integer> — usa findById() + delete().
PostgreSQL
DELETE FROM productos WHERE id = ?.
Confirmación (mejora)
Aunque el código original no muestra confirmación, se recomienda agregar un window.confirm() o un modal de confirmación en React antes de ejecutar la eliminación, como buena práctica de UX. Marcar como mejora, no como cambio funcional.


MÓDULO 3: CONFIGURACIÓN Y PERSISTENCIA DE DATOS

HU-3.1 — Configurar la base de datos PostgreSQL para el inventario
Título: Crear y configurar el esquema de base de datos PostgreSQL para productos
Descripción:
Como equipo de desarrollo, necesito tener el esquema de base de datos PostgreSQL creado y configurado correctamente para almacenar los productos del inventario, de manera que las APIs del backend puedan operar sobre los datos.
Actor: Equipo de desarrollo / DevOps
Criterios de aceptación:
#
Criterio
CA-1
Existe una tabla productos en PostgreSQL con la estructura correcta.
CA-2
El campo id es de tipo SERIAL (autoincremental) y clave primaria.
CA-3
El campo nombre es VARCHAR(255) NOT NULL.
CA-4
El campo cantidad es INTEGER NOT NULL DEFAULT 0.
CA-5
El campo precio es NUMERIC(18,2) NOT NULL DEFAULT 0.
CA-6
La cadena de conexión está configurada en application.yml / application.properties del proyecto Spring.

Flujo funcional paso a paso:
Se ejecuta el script DDL o migración (Flyway/Liquibase) para crear la tabla.
Se configura la conexión en el proyecto Spring Boot.
Se verifica la conexión y las operaciones CRUD básicas.
Reglas de negocio:
#
Regla
RN-1
La tabla debe mapear exactamente los campos del modelo original: Id, Nombre, Cantidad, Precio.
RN-2
La conexión original usa name=InventarioDB como connection string en Entity Framework.

Notas técnicas:
Aspecto
Detalle
DDL PostgreSQL
sql CREATE TABLE productos ( id SERIAL PRIMARY KEY, nombre VARCHAR(255) NOT NULL, cantidad INTEGER NOT NULL DEFAULT 0, precio NUMERIC(18,2) NOT NULL DEFAULT 0.00 );
Spring JPA Entity
java @Entity @Table(name = "productos") public class ProductoEntity { @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Integer id; @Column(nullable = false, length = 255) private String nombre; @Column(nullable = false) private Integer cantidad; @Column(nullable = false, precision = 18, scale = 2) private BigDecimal precio; }
application.yml
spring.datasource.url=jdbc:postgresql://host:5432/inventario_db, spring.jpa.hibernate.ddl-auto=validate, driver PostgreSQL.
Migración
Usar Flyway con script V1__create_productos_table.sql.
Mapeo EF6 → JPA
DbSet<ProductoEntity> Productos → JpaRepository<ProductoEntity, Integer>. InventarioContext → application.yml + Spring Data JPA auto-config.


RESUMEN DE MAPEO COMPLETO
Mapeo de Páginas a Componentes React
Página .aspx
Ruta React
Componente React
Descripción
Site.Master
(layout)
<AppLayout /> con <NavBar /> y <Footer />
Layout maestro
Default.aspx
/
<ProductListPage />
Página principal con tabla + modal
About.aspx
/about
<AboutPage />
Página informativa
Contact.aspx
/contact
<ContactPage />
Página de contacto

Mapeo de Controles WebForms a Componentes React
Control WebForms
Componente React
<asp:GridView>
<table> con .map() o componente <DataTable />
<asp:TextBox>
<input> controlado con useState
<asp:Button> + PostBack
<button onClick={}> + llamada fetch/axios
<asp:Label> (error)
{errorMessage && <p className="text-danger">{errorMessage}</p>}
Modal Bootstrap 3 (jQuery)
<Modal> de React-Bootstrap o componente custom
ViewState
useState / useReducer
Session
JWT en localStorage (no aplica en este sistema, no hay auth)
Postback completo
Llamada API REST asíncrona

Mapeo de Capas Arquitectónicas
Capa Original
Tecnología Original
Capa Nueva
Tecnología Nueva
WebFormsApp (UI)
ASP.NET Web Forms
Frontend
React 18 + React Router v6
MiInventario.BLL (Negocio)
C# Services
Backend Service
Spring @Service classes
MiInventario.DAL (Datos)
EF6 + SQL Server
Backend Repository
Spring Data JPA + PostgreSQL
ProductoEntity (DAL)
EF6 Entity
JPA Entity
@Entity class
ProductoRepository (DAL)
Clase C# manual
Spring Repository
JpaRepository<> interface
ProductoService (BLL)
Clase C#
Spring Service
@Service class
Producto (BLL Model)
C# POCO
DTO
ProductoDTO / ProductoCreateRequest

Endpoints API REST
Método
Ruta
Descripción
Origen WebForms
GET
/api/productos
Listar todos los productos
Page_Load → service.ObtenerTodos()
POST
/api/productos
Crear nuevo producto
btnGuardar_Click → service.Agregar()
DELETE
/api/productos/{id}
Eliminar producto por Id
gvProductos_RowDeleting → service.Eliminar()


Árbol de Componentes React Propuesto
php
Ejecutar código
Copiar código
<BrowserRouter> <Routes> <Route element={<AppLayout />}> ← Site.Master <Route path="/" element={<ProductListPage />} /> ← Default.aspx <Route path="/about" element={<AboutPage />} /> ← About.aspx <Route path="/contact" element={<ContactPage />} /> ← Contact.aspx </Route> </Routes> </BrowserRouter> <AppLayout> ├── <NavBar /> ├── <Outlet /> ← Contenido dinámico según ruta └── <Footer /> <ProductListPage> ├── <Button "Nuevo" /> ├── <ProductTable productos={} onDelete={} /> └── <ProductFormModal isOpen={} onClose={} onSave={} errorMessage={} />

Estructura de Proyecto Spring Boot Propuesta
java
Ejecutar código
Copiar código
src/main/java/com/inventario/ ├── InventarioApplication.java ├── controller/ │ └── ProductoController.java ← @RestController ├── service/ │ └── ProductoService.java ← @Service (lógica de negocio) ├── repository/ │ └── ProductoRepository.java ← extends JpaRepository ├── entity/ │ └── ProductoEntity.java ← @Entity JPA ├── dto/ │ ├── ProductoDTO.java ← Response DTO │ └── ProductoCreateRequest.java ← Request DTO con validaciones └── exception/ └── GlobalExceptionHandler.java ← @ControllerAdvice
 Arquitectónico del Sistema Original
Capa Original
Proyecto
Tecnología
Presentación
WebFormsApp
ASP.NET Web Forms (.aspx)
Lógica de Negocio
MiInventario.BLL
Servicios C# (.NET 4.8.1)
Acceso a Datos
MiInventario.DAL
Entity Framework 6 / SQL Server

Páginas identificadas: Default.aspx (inventario), About.aspx (acerca de), Contact.aspx (contacto), Site.Master (layout maestro).
Entidad principal: Producto (Id, Nombre, Cantidad, Precio).

MÓDULO 1: ESTRUCTURA Y NAVEGACIÓN GENERAL (Layout)

HU-1.1 — Visualizar estructura de navegación principal (Layout Maestro)
Título: Visualizar estructura de navegación principal con menú y contenido dinámico
Descripción:
Como usuario del sistema, quiero ver una estructura de página consistente con un encabezado de navegación, un área de contenido principal y un pie de página, para poder navegar entre las distintas secciones de la aplicación (Inicio, Acerca de, Contacto) de forma intuitiva.
Actor: Usuario general (sin autenticación requerida en el código fuente)
Criterios de aceptación:
#
Criterio
CA-1
La aplicación muestra un encabezado (navbar) con el nombre de la aplicación y enlaces de navegación visibles.
CA-2
El menú contiene al menos tres enlaces: "Home" (página principal), "About" y "Contact".
CA-3
Al hacer clic en cada enlace, se navega a la ruta correspondiente sin recarga completa de página (SPA).
CA-4
Existe un pie de página (footer) visible en todas las páginas con el año actual.
CA-5
Se incluyen los estilos Bootstrap y los estilos personalizados (inventory.css, Site.css).
CA-6
La estructura es responsive y se adapta a dispositivos móviles.

Flujo funcional paso a paso:
El usuario accede a la URL raíz de la aplicación.
El sistema renderiza el layout principal que incluye:
Header/Navbar: Logo/nombre de la app + enlaces de navegación (Home, About, Contact).
Área de contenido principal: Se renderiza el componente de la ruta activa.
Footer: Texto con copyright y año.
El usuario hace clic en cualquier enlace del menú.
El sistema navega a la ruta correspondiente y renderiza el contenido de esa sección dentro del layout, sin recargar toda la página.
El enlace activo se resalta visualmente en el menú.
Pantallas involucradas:
Original (.aspx)
Componente React
Site.Master
<AppLayout /> (componente layout con <Outlet /> de React Router)
Navegación dentro de Master
<NavBar />
Footer dentro de Master
<Footer />

Reglas de negocio:
#
Regla
RN-1
Todas las páginas de la aplicación comparten el mismo layout (header, footer).
RN-2
No existe autenticación en el sistema original; todas las páginas son de acceso público.

Notas técnicas (mapeo a React / Spring / PostgreSQL):
Aspecto
Detalle
React
Crear AppLayout.jsx que use <Outlet /> de react-router-dom v6. Incluir <NavBar /> y <Footer /> como componentes hijos fijos. Usar <NavLink> para resaltar la ruta activa.
Routing
Configurar BrowserRouter con rutas: / → ProductListPage, /about → AboutPage, /contact → ContactPage.
CSS
Migrar Bootstrap 3 (usado en Web Forms) a Bootstrap 5 o React-Bootstrap. Migrar Site.css e inventory.css a módulos CSS o styled-components.
Spring
No aplica directamente; es estructura puramente frontend.
Master → Layout
ContentPlaceHolderID="MainContent" equivale al <Outlet /> de React Router dentro de AppLayout.


HU-1.2 — Visualizar página "Acerca de" (About)
Título: Visualizar página informativa "Acerca de"
Descripción:
Como usuario del sistema, quiero poder acceder a una página "Acerca de" que muestre información descriptiva de la aplicación, para conocer el propósito del sistema.
Actor: Usuario general
Criterios de aceptación:
#
Criterio
CA-1
Al navegar a la ruta /about, se muestra el título "About".
CA-2
Se muestra el subtítulo "Your application description page."
CA-3
Se muestra el texto "Use this area to provide additional information."
CA-4
La página se renderiza dentro del layout principal (navbar + footer visibles).

Flujo funcional paso a paso:
El usuario hace clic en el enlace "About" del menú de navegación.
El sistema navega a la ruta /about.
Se renderiza el componente AboutPage dentro del layout con el contenido estático.
Pantallas involucradas:
Original (.aspx)
Componente React
About.aspx
<AboutPage />

Reglas de negocio:
#
Regla
RN-1
Es una página puramente informativa, sin lógica de negocio ni interacción con backend.

Notas técnicas:
Aspecto
Detalle
React
Componente funcional estático AboutPage.jsx. Sin estado ni efectos.
Spring
No requiere endpoint backend.
Migración
<%: Title %> se reemplaza por una constante o document.title via useEffect o react-helmet.


HU-1.3 — Visualizar página de Contacto
Título: Visualizar página de información de contacto
Descripción:
Como usuario del sistema, quiero poder acceder a una página de contacto que muestre direcciones, teléfono y correos electrónicos de soporte y marketing, para saber cómo comunicarme con la organización.
Actor: Usuario general
Criterios de aceptación:
#
Criterio
CA-1
Al navegar a la ruta /contact, se muestra el título "Contact".
CA-2
Se muestra la dirección física: "One Microsoft Way, Redmond, WA 98052-6399".
CA-3
Se muestra el teléfono: "425.555.0100".
CA-4
Se muestran enlaces mailto funcionales para Support@example.com y Marketing@example.com.
CA-5
La página se renderiza dentro del layout principal.

Flujo funcional paso a paso:
El usuario hace clic en el enlace "Contact" del menú de navegación.
El sistema navega a la ruta /contact.
Se renderiza el componente ContactPage con la información de contacto estática.
El usuario puede hacer clic en los enlaces de correo, abriendo su cliente de email predeterminado.
Pantallas involucradas:
Original (.aspx)
Componente React
Contact.aspx
<ContactPage />

Reglas de negocio:
#
Regla
RN-1
Página puramente informativa, sin interacción con backend.
RN-2
Los enlaces de correo deben usar protocolo mailto:.

Notas técnicas:
Aspecto
Detalle
React
Componente funcional estático ContactPage.jsx. Usar <a href="mailto:...">.
Spring
No requiere endpoint backend.


MÓDULO 2: GESTIÓN DE INVENTARIO DE PRODUCTOS (CRUD)

HU-2.1 — Listar todos los productos del inventario
Título: Visualizar el listado completo de productos del inventario en una tabla
Descripción:
Como usuario del sistema, quiero ver una tabla con todos los productos registrados en el inventario mostrando su ID, Nombre, Cantidad y Precio, para tener visibilidad del estado actual del inventario.
Actor: Usuario general
Criterios de aceptación:
#
Criterio
CA-1
Al acceder a la página principal (ruta /), se muestra una tabla con todos los productos existentes en la base de datos.
CA-2
La tabla muestra las columnas: ID, Nombre, Cantidad, Precio y una columna de Acciones.
CA-3
Los datos se cargan automáticamente al montar la página (equivalente a Page_Load con !IsPostBack).
CA-4
Si no hay productos, la tabla se muestra vacía o con un mensaje indicativo (ej: "No hay productos registrados").
CA-5
La tabla es responsive (se adapta a pantallas pequeñas con scroll horizontal).
CA-6
La tabla aplica estilos striped, hover y bordered (equivalente a las clases CSS originales).
CA-7
Cada fila tiene un botón o enlace "Delete" en la columna de acciones.

Flujo funcional paso a paso:
El usuario accede a la URL raíz / de la aplicación.
El frontend realiza una petición GET /api/productos al backend.
El backend ejecuta la consulta SELECT * FROM productos y retorna la lista en formato JSON.
El frontend recibe la respuesta y renderiza los datos en una tabla HTML.
Si la llamada falla, se muestra un mensaje de error al usuario.
La tabla se muestra dentro del layout principal, precedida por el botón "Nuevo".
Pantallas involucradas:
Original (.aspx)
Componente React
Default.aspx — GridView gvProductos
<ProductListPage /> que contiene <ProductTable />

Reglas de negocio:
#
Regla
RN-1
Se obtienen todos los productos sin paginación (el código original usa GetAll() sin filtros).
RN-2
Los campos mostrados son exactamente: Id, Nombre, Cantidad, Precio.
RN-3
El Id es la clave primaria y se usa como DataKey para operaciones de eliminación.

Notas técnicas:
Aspecto
Detalle
React
ProductListPage.jsx ejecuta useEffect al montar para llamar a GET /api/productos. Almacena resultados en useState. Renderiza <ProductTable productos={productos} onDelete={handleDelete} />.
Spring
ProductoController.java → @GetMapping("/api/productos") → llama a ProductoService.obtenerTodos() → ProductoRepository.findAll(). Retorna List<ProductoDTO> como JSON.
PostgreSQL
Tabla productos con columnas: id SERIAL PRIMARY KEY, nombre VARCHAR NOT NULL, cantidad INTEGER, precio NUMERIC(18,2).
Mapeo ViewState
El GridView.DataSource + DataBind() se reemplaza por estado React (useState) alimentado por la respuesta de la API. No hay ViewState.
Mapeo Postback
La carga inicial Page_Load(!IsPostBack) se reemplaza por useEffect([], () => fetch(...)) ejecutado una sola vez al montar.
DTO
ProductoDTO { id: number, nombre: string, cantidad: number, precio: number }.


HU-2.2 — Agregar un nuevo producto al inventario
Título: Registrar un nuevo producto mediante formulario modal
Descripción:
Como usuario del sistema, quiero poder agregar un nuevo producto ingresando su nombre, cantidad y precio a través de un formulario en un diálogo modal, para registrar nuevo inventario en el sistema.
Actor: Usuario general
Criterios de aceptación:
#
Criterio
CA-1
Existe un botón "Nuevo" (con ícono "+") visible encima de la tabla de productos.
CA-2
Al hacer clic en "Nuevo", se abre un modal con el título "Nuevo producto".
CA-3
El modal contiene tres campos de entrada: Nombre (texto), Cantidad (numérico), Precio (texto/decimal).
CA-4
Al abrir el modal, todos los campos se limpian y no se muestra ningún mensaje de error.
CA-5
El modal tiene dos botones: "Cancelar" (cierra el modal sin guardar) y "Guardar" (envía los datos).
CA-6
Al presionar "Guardar" con datos válidos, el producto se persiste en base de datos, el modal se cierra y la tabla se refresca mostrando el nuevo producto.
CA-7
Si el Nombre está vacío o es solo espacios, se muestra el error: "Nombre requerido".
CA-8
Si Cantidad o Precio no son números válidos, se muestra el error: "Revise cantidad y precio: deben ser números válidos."
CA-9
Si ocurre cualquier otro error al guardar, se muestra: "No se pudo guardar: {mensaje del error}".
CA-10
Los mensajes de error se muestran dentro del modal (sin cerrar el modal) en un área de error con estilo text-danger.
CA-11
Al cerrar el modal (cancelar o guardar exitoso), los campos se limpian.

Flujo funcional paso a paso:
Flujo exitoso (Happy Path):
El usuario hace clic en el botón "Nuevo".
Se abre el modal "Nuevo producto" con los campos vacíos y sin mensajes de error.
El usuario ingresa:
Nombre: texto no vacío (ej: "Teclado USB").
Cantidad: número entero válido (ej: "50").
Precio: número decimal válido (ej: "29.99").
El usuario hace clic en "Guardar".
El frontend valida los campos localmente:
Nombre no vacío.
Cantidad parseable como entero.
Precio parseable como decimal.
El frontend envía una petición POST /api/productos con el body JSON { nombre, cantidad, precio }.
El backend valida que el nombre no esté vacío (regla de negocio del servicio).
El backend persiste el registro en la tabla productos.
El backend retorna 201 Created con el producto creado (incluyendo el Id generado).
El frontend cierra el modal.
El frontend refresca la lista de productos (re-llama GET /api/productos o agrega al estado local).
La tabla muestra el nuevo producto.
Flujo alternativo — Error de formato:
Los pasos 1-4 son iguales.
El usuario ingresa texto no numérico en Cantidad o Precio (ej: "abc").
El frontend detecta que el parseo falla.
Se muestra dentro del modal el mensaje: "Revise cantidad y precio: deben ser números válidos."
El modal permanece abierto con los datos ingresados.
Flujo alternativo — Nombre vacío:
El usuario deja el campo Nombre vacío y presiona "Guardar".
El frontend o backend detecta que el nombre está vacío.
Se muestra dentro del modal: "Nombre requerido".
El modal permanece abierto.
Flujo alternativo — Error inesperado del servidor:
Datos válidos, pero el backend falla (ej: error de conexión a BD).
El backend retorna un código de error (500) con un mensaje.
El frontend muestra dentro del modal: "No se pudo guardar: {mensaje}".
El modal permanece abierto.
Pantallas involucradas:
Original (.aspx)
Componente React
Default.aspx — botón "Nuevo"
<ProductListPage /> → botón que controla estado modalOpen
Default.aspx — #modalNuevoProducto
<ProductFormModal isOpen={} onClose={} onSave={} />
txtNombre, txtCantidad, txtPrecio
Inputs controlados dentro del modal con useState
lblModalError
Estado errorMessage renderizado condicionalmente en el modal
btnGuardar → PostBack btnGuardar_Click
Llamada POST /api/productos vía fetch/axios

Reglas de negocio:
#
Regla
Origen en código
RN-1
El campo Nombre es obligatorio y no puede ser vacío ni solo espacios en blanco.
ProductoService.Agregar(): if (string.IsNullOrWhiteSpace(p.Nombre)) throw new Exception("Nombre requerido")
RN-2
El campo Cantidad debe ser un número entero válido.
Default.aspx.cs: int.Parse(txtCantidad.Text.Trim(), CultureInfo.InvariantCulture) — lanza FormatException si no es válido.
RN-3
El campo Precio debe ser un número decimal válido con formato invariante (punto como separador decimal).
Default.aspx.cs: decimal.Parse(txtPrecio.Text.Trim(), CultureInfo.InvariantCulture)
RN-4
Si el parseo de Cantidad o Precio falla, se muestra el mensaje específico de formato.
catch (FormatException) en btnGuardar_Click
RN-5
Si la validación de negocio falla (ej: nombre vacío), se muestra el mensaje de la excepción.
catch (Exception ex) en btnGuardar_Click
RN-6
Al guardar exitosamente, los campos del formulario se limpian.
txtNombre.Text = string.Empty; ...
RN-7
El Id es autogenerado por la base de datos, no se ingresa manualmente.
ProductoEntity.Id es Identity/Serial.

Notas técnicas:
Aspecto
Detalle
React
ProductFormModal.jsx: componente que recibe isOpen, onClose, onSave como props. Estado interno: nombre, cantidad, precio, errorMessage. Validación local antes de llamar a la API. Usar librería de modales (React-Bootstrap <Modal> o MUI <Dialog>).
Estado del modal
El ViewState implícito de los TextBox se reemplaza por useState en el componente modal. El control de apertura/cierre del modal (que en Web Forms se hacía con RegisterStartupScript + jQuery $('#modal').modal('show'/'hide')) se reemplaza por un useState<boolean> (isModalOpen).
Postback → API
btnGuardar_Click (postback completo) → POST /api/productos (llamada REST asíncrona).
Spring Controller
@PostMapping("/api/productos") recibe @RequestBody ProductoCreateRequest { nombre: String, cantidad: int, precio: BigDecimal }. Valida con @Valid + Bean Validation (@NotBlank, @NotNull). Retorna ResponseEntity<ProductoDTO> con status 201.
Spring Service
ProductoService.agregar(ProductoCreateRequest req): valida nombre no vacío, crea entidad JPA, persiste con productoRepository.save().
Spring Repository
ProductoRepository extends JpaRepository<ProductoEntity, Integer>.
PostgreSQL
INSERT INTO productos (nombre, cantidad, precio) VALUES (?, ?, ?) RETURNING id, nombre, cantidad, precio.
Parseo de números
El parseo con CultureInfo.InvariantCulture (punto decimal) se mantiene: el frontend enviará JSON con números nativos. La validación de formato se hace en el frontend antes de enviar.
Error handling
Crear un @ExceptionHandler global en Spring que retorne JSON { message: string } con status 400/500.


HU-2.3 — Eliminar un producto del inventario
Título: Eliminar un producto existente del inventario desde la tabla
Descripción:
Como usuario del sistema, quiero poder eliminar un producto del inventario haciendo clic en el botón "Delete" de la fila correspondiente en la tabla, para remover productos que ya no son necesarios.
Actor: Usuario general
Criterios de aceptación:
#
Criterio
CA-1
Cada fila de la tabla de productos muestra un botón/enlace "Delete" en la columna de acciones.
CA-2
Al hacer clic en "Delete", se envía una petición de eliminación al backend con el Id del producto.
CA-3
Tras la eliminación exitosa, la tabla se refresca y el producto eliminado ya no aparece.
CA-4
Si el producto no existe en la base de datos (ya fue eliminado), la operación no produce error visible (comportamiento silencioso, según el código original).
CA-5
No se requiere confirmación previa en el código original (el botón CommandField ShowDeleteButton ejecuta directamente). Nota de mejora recomendada: agregar diálogo de confirmación en la migración.

Flujo funcional paso a paso:
Flujo exitoso:
El usuario visualiza la tabla de productos con al menos un registro.
El usuario hace clic en el botón "Delete" de la fila del producto que desea eliminar.
(Recomendado en migración) Se muestra un diálogo de confirmación: "¿Está seguro de que desea eliminar este producto?".
El usuario confirma.
El frontend envía una petición DELETE /api/productos/{id} al backend.
El backend busca el producto por Id:
Si existe → lo elimina de la base de datos y retorna 204 No Content.
Si no existe → retorna 204 No Content (comportamiento silencioso, equivalente al original: if (p != null) { remove; save; }).
El frontend refresca la lista de productos (re-llama GET /api/productos o elimina del estado local).
La tabla se actualiza sin el producto eliminado.
Flujo alternativo — Error de red/servidor:
El usuario hace clic en "Delete".
La petición falla (error de red o error interno del servidor).
Se muestra un mensaje de error al usuario (ej: toast/notificación).
La tabla no cambia.
Pantallas involucradas:
Original (.aspx)
Componente React
Default.aspx — CommandField ShowDeleteButton="True" en gvProductos
<ProductTable /> → botón "Eliminar" en cada fila que invoca onDelete(id)
Evento gvProductos_RowDeleting (postback)
Llamada DELETE /api/productos/{id} vía fetch/axios

Reglas de negocio:
#
Regla
Origen en código
RN-1
La eliminación se realiza por Id (clave primaria).
gvProductos.DataKeys[e.RowIndex].Value obtiene el Id.
RN-2
Si el producto con el Id especificado no existe, no se produce error; la operación es idempotente.
ProductoRepository.Delete(): if (p != null) { remove; save; } — si Find(id) retorna null, no hace nada.
RN-3
La tabla se recarga completamente tras la eliminación.
Cargar() se llama después de Eliminar().
RN-4
No existe eliminación lógica (soft delete); es eliminación física permanente.
ctx.Productos.Remove(p) es un DELETE físico.

Notas técnicas:
Aspecto
Detalle
React
En <ProductTable />, cada fila renderiza un <button onClick={() => onDelete(producto.id)}>Eliminar</button>. En ProductListPage, handleDelete llama a DELETE /api/productos/{id}, y al completar exitosamente, refresca la lista.
Postback → API
El evento gvProductos_RowDeleting (postback WebForms con DataKeys) se reemplaza por una llamada REST DELETE /api/productos/{id}.
Spring Controller
@DeleteMapping("/api/productos/{id}") → productoService.eliminar(id) → retorna ResponseEntity.noContent().build().
Spring Service
ProductoService.eliminar(int id): productoRepository.findById(id).ifPresent(p -> productoRepository.delete(p)). Comportamiento idempotente.
Spring Repository
ProductoRepository extends JpaRepository<ProductoEntity, Integer> — usa findById() + delete().
PostgreSQL
DELETE FROM productos WHERE id = ?.
Confirmación (mejora)
Aunque el código original no muestra confirmación, se recomienda agregar un window.confirm() o un modal de confirmación en React antes de ejecutar la eliminación, como buena práctica de UX. Marcar como mejora, no como cambio funcional.


MÓDULO 3: CONFIGURACIÓN Y PERSISTENCIA DE DATOS

HU-3.1 — Configurar la base de datos PostgreSQL para el inventario
Título: Crear y configurar el esquema de base de datos PostgreSQL para productos
Descripción:
Como equipo de desarrollo, necesito tener el esquema de base de datos PostgreSQL creado y configurado correctamente para almacenar los productos del inventario, de manera que las APIs del backend puedan operar sobre los datos.
Actor: Equipo de desarrollo / DevOps
Criterios de aceptación:
#
Criterio
CA-1
Existe una tabla productos en PostgreSQL con la estructura correcta.
CA-2
El campo id es de tipo SERIAL (autoincremental) y clave primaria.
CA-3
El campo nombre es VARCHAR(255) NOT NULL.
CA-4
El campo cantidad es INTEGER NOT NULL DEFAULT 0.
CA-5
El campo precio es NUMERIC(18,2) NOT NULL DEFAULT 0.
CA-6
La cadena de conexión está configurada en application.yml / application.properties del proyecto Spring.

Flujo funcional paso a paso:
Se ejecuta el script DDL o migración (Flyway/Liquibase) para crear la tabla.
Se configura la conexión en el proyecto Spring Boot.
Se verifica la conexión y las operaciones CRUD básicas.
Reglas de negocio:
#
Regla
RN-1
La tabla debe mapear exactamente los campos del modelo original: Id, Nombre, Cantidad, Precio.
RN-2
La conexión original usa name=InventarioDB como connection string en Entity Framework.

Notas técnicas:
Aspecto
Detalle
DDL PostgreSQL
sql CREATE TABLE productos ( id SERIAL PRIMARY KEY, nombre VARCHAR(255) NOT NULL, cantidad INTEGER NOT NULL DEFAULT 0, precio NUMERIC(18,2) NOT NULL DEFAULT 0.00 );
Spring JPA Entity
java @Entity @Table(name = "productos") public class ProductoEntity { @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Integer id; @Column(nullable = false, length = 255) private String nombre; @Column(nullable = false) private Integer cantidad; @Column(nullable = false, precision = 18, scale = 2) private BigDecimal precio; }
application.yml
spring.datasource.url=jdbc:postgresql://host:5432/inventario_db, spring.jpa.hibernate.ddl-auto=validate, driver PostgreSQL.
Migración
Usar Flyway con script V1__create_productos_table.sql.
Mapeo EF6 → JPA
DbSet<ProductoEntity> Productos → JpaRepository<ProductoEntity, Integer>. InventarioContext → application.yml + Spring Data JPA auto-config.


RESUMEN DE MAPEO COMPLETO
Mapeo de Páginas a Componentes React
Página .aspx
Ruta React
Componente React
Descripción
Site.Master
(layout)
<AppLayout /> con <NavBar /> y <Footer />
Layout maestro
Default.aspx
/
<ProductListPage />
Página principal con tabla + modal
About.aspx
/about
<AboutPage />
Página informativa
Contact.aspx
/contact
<ContactPage />
Página de contacto

Mapeo de Controles WebForms a Componentes React
Control WebForms
Componente React
<asp:GridView>
<table> con .map() o componente <DataTable />
<asp:TextBox>
<input> controlado con useState
<asp:Button> + PostBack
<button onClick={}> + llamada fetch/axios
<asp:Label> (error)
{errorMessage && <p className="text-danger">{errorMessage}</p>}
Modal Bootstrap 3 (jQuery)
<Modal> de React-Bootstrap o componente custom
ViewState
useState / useReducer
Session
JWT en localStorage (no aplica en este sistema, no hay auth)
Postback completo
Llamada API REST asíncrona

Mapeo de Capas Arquitectónicas
Capa Original
Tecnología Original
Capa Nueva
Tecnología Nueva
WebFormsApp (UI)
ASP.NET Web Forms
Frontend
React 18 + React Router v6
MiInventario.BLL (Negocio)
C# Services
Backend Service
Spring @Service classes
MiInventario.DAL (Datos)
EF6 + SQL Server
Backend Repository
Spring Data JPA + PostgreSQL
ProductoEntity (DAL)
EF6 Entity
JPA Entity
@Entity class
ProductoRepository (DAL)
Clase C# manual
Spring Repository
JpaRepository<> interface
ProductoService (BLL)
Clase C#
Spring Service
@Service class
Producto (BLL Model)
C# POCO
DTO
ProductoDTO / ProductoCreateRequest

Endpoints API REST
Método
Ruta
Descripción
Origen WebForms
GET
/api/productos
Listar todos los productos
Page_Load → service.ObtenerTodos()
POST
/api/productos
Crear nuevo producto
btnGuardar_Click → service.Agregar()
DELETE
/api/productos/{id}
Eliminar producto por Id
gvProductos_RowDeleting → service.Eliminar()


Árbol de Componentes React Propuesto
php
Ejecutar código
Copiar código
<BrowserRouter> <Routes> <Route element={<AppLayout />}> ← Site.Master <Route path="/" element={<ProductListPage />} /> ← Default.aspx <Route path="/about" element={<AboutPage />} /> ← About.aspx <Route path="/contact" element={<ContactPage />} /> ← Contact.aspx </Route> </Routes> </BrowserRouter> <AppLayout> ├── <NavBar /> ├── <Outlet /> ← Contenido dinámico según ruta └── <Footer /> <ProductListPage> ├── <Button "Nuevo" /> ├── <ProductTable productos={} onDelete={} /> └── <ProductFormModal isOpen={} onClose={} onSave={} errorMessage={} />

Estructura de Proyecto Spring Boot Propuesta
java
Ejecutar código
Copiar código
src/main/java/com/inventario/ ├── InventarioApplication.java ├── controller/ │ └── ProductoController.java ← @RestController ├── service/ │ └── ProductoService.java ← @Service (lógica de negocio) ├── repository/ │ └── ProductoRepository.java ← extends JpaRepository ├── entity/ │ └── ProductoEntity.java ← @Entity JPA ├── dto/ │ ├── ProductoDTO.java ← Response DTO │ └── ProductoCreateRequest.java ← Request DTO con validaciones └── exception/ └── GlobalExceptionHandler.java ← @ControllerAdvice




Corrige la Tab 2 del SDD Orchestrator para que proyecte la consola real del opencode ejecutado para el proyecto seleccionado. Actualmente si funciona el opencode y esta agregando al proyecto. Sin embargo, no esta mostrando adecuadamente como es el flujo de la consola.
Requisitos:
- Mostrar el stream vivo de OpenCode del proyecto activo, no una conversación del monitor.
- Ocultar solo ruido técnico: `server.connected`, heartbeats y eventos internos irrelevantes.
- Mantener visibles stdout/stderr, mensajes útiles del agente, errores y prompts relevantes.
- Los mensajes del monitor LLM deben ir separados o marcados como sistema, nunca confundirse con la consola del agente.
- El monitor solo debe decidir finalización y, si corresponde, pedir confirmación de “listo para empaquetar”.
- La UI debe seguir conectada al runtime correcto aunque el proceso siga en background.
- Rehidratar el log sin sobrescribir el stream vivo.
- Si OpenCode deja de producir archivos o output por un tiempo, sugerir claramente si ya conviene marcar como completado.

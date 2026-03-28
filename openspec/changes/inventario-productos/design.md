## Context

La aplicacion fuente esta basada en ASP.NET Web Forms con una arquitectura de 3 capas y persistencia por Entity Framework 6.5.1. El objetivo es reconstruir el comportamiento funcional en React + Spring Boot + PostgreSQL sin introducir autenticacion, paginacion, filtros ni edicion inline, porque no aparecen en el material provisto.

## Goals / Non-Goals

**Goals:**
- Replicar el listado, alta y eliminacion de productos.
- Mantener el comportamiento silencioso en la eliminacion cuando el Id no existe.
- Implementar las paginas About y Contact como vistas estaticas.
- Permitir ejecucion local completa con backend, frontend y base de datos.

**Non-Goals:**
- No agregar autenticacion, autorizacion, auditoria ni roles.
- No agregar paginacion, ordenamiento, filtros ni edicion inline.
- No inventar reglas de negocio no presentes en los criterios entregados.

## Decisions

- **Monorepo por capas**: se implementa `frontend/` y `backend/` en el mismo repositorio para facilitar ejecucion local y pruebas. Alternativa: repos separados; se descarta por complejidad operativa.
- **Contrato REST simple**: `GET /api/productos`, `POST /api/productos`, `DELETE /api/productos/{id}`. Alternativa: GraphQL o endpoints mas granulares; se descarta por sobreingenieria.
- **Entrada de alta como texto**: el DTO de alta recibe `nombre`, `cantidad` y `precio` como texto para distinguir error de formato de error de negocio. Alternativa: tipos numericos directos; se descarta porque dificulta reproducir mensajes equivalentes al sistema actual.
- **Eliminacion idempotente**: borrar un Id inexistente responde sin error visible. Alternativa: error 404; se descarta por romper la equivalencia funcional solicitada.
- **Paginacion en cliente no en servidor**: la UI solo consulta la lista completa y renderiza la tabla. Alternativa: paginacion server-side; se descarta porque no existe evidencia en el sistema fuente.
- **Paginas About y Contact en React**: se resuelven como rutas estaticas sin dependencias al backend. Alternativa: servirlas desde Spring; se descarta por no aportar valor.
- **Pruebas por capas**: backend con JUnit/Spring Boot Test y frontend con Vitest/React Testing Library. Alternativa: solo pruebas manuales; se descarta porque el usuario pidio buenas pruebas.

## Risks / Trade-offs

- **[Validacion de formato en backend]** -> se usa parseo controlado y mensajes tipados para conservar la equivalencia funcional.
- **[Falta de Site.Master real]** -> se construye un layout comun razonable, manteniendo navegacion simple y consistente.
- **[Persistencia sin esquema entregado]** -> se define una tabla minima de productos con `id`, `nombre`, `cantidad` y `precio` usando `numeric` para precision.
- **[Eliminacion silenciosa puede ocultar errores reales]** -> se limita ese comportamiento al caso de registro inexistente; otros errores siguen visibles en logs y pruebas.

## Migration Plan

1. Crear backend Spring Boot con modelo, repositorio, servicio y controlador.
2. Crear frontend React con rutas, layout compartido, pagina principal, modal y paginas estaticas.
3. Conectar frontend y backend mediante REST.
4. Agregar pruebas automatizadas.
5. Validar localmente con base PostgreSQL y ejecucion integrada.

## Open Questions

- El contenido exacto de `Site.Master` no fue entregado; la navegacion se implementara con mejor criterio.
- No se entrego esquema SQL real; la estructura de tabla se definira por equivalencia funcional minima.

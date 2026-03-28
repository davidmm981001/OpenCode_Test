## Context

El alcance cubre la migración del módulo de seguridad legado desde COBOL/BMS/DB2 hacia una aplicación moderna con React + Vite, Java Spring Boot y PostgreSQL. El repositorio actual no expone un código fuente listo para adaptar, por lo que la implementación deberá levantarse con una estructura nueva y pruebas desde el inicio.

El módulo tiene tres superficies principales: autenticación protegida, menú principal de seguridad y gestión de usuarios. La gestión de usuarios concentra la mayor complejidad por validaciones cruzadas, consultas paginadas, lookups a catálogos y auditoría.

## Goals / Non-Goals

**Goals:**
- Reproducir los flujos HU-01 a HU-05 con una UX moderna y trazabilidad completa.
- Mantener la lógica funcional del legado, especialmente validaciones, prioridad de filtros, paginación y auditoría.
- Entregar una base ejecutable localmente con datos semilla y pruebas automáticas.
- Separar claramente frontend, backend y persistencia para facilitar mantenimiento.

**Non-Goals:**
- No migrar otros módulos ajenos al de seguridad más allá de rutas placeholder del menú.
- No replicar CICS/BMS literalmente; se reemplaza por SPA + REST.
- No integrar un proveedor corporativo externo de identidad en esta iteración.

## Decisions

- **Arquitectura modular monolítica en Spring Boot**: un solo backend con controladores, servicios, repositorios, seguridad y migraciones. Alternativa descartada: microservicios, por sobrecosto innecesario.
- **JWT stateless + bcrypt**: simplifica ejecución local y protege rutas React. Alternativa descartada: sesión server-side, por mayor acoplamiento y menos portabilidad.
- **React Router con guardas de ruta**: modela la navegación del menú y protege vistas. Alternativa descartada: navegación manual con estado local, por fragilidad.
- **Specification + Pageable para búsquedas**: replica filtros dinámicos del legado y soporta paginación de 14 registros. Alternativa descartada: consultas hardcoded por criterio, por menor mantenibilidad.
- **Flyway para esquema y semilla**: garantiza reproducibilidad y facilita pruebas. Alternativa descartada: creación manual de tablas en runtime.
- **Placeholder routes para opciones 2-9 del menú**: satisfacen la navegación esperada sin inventar requisitos funcionales no definidos. Alternativa descartada: ocultar opciones no desarrolladas.

## Risks / Trade-offs

- [La prioridad de filtros del COBOL puede interpretarse de forma distinta] → Mitigar documentando la regla exacta en especificación y cubriéndola con pruebas.
- [El repositorio actual no contiene un scaffold de aplicación completo] → Mitigar creando la estructura desde cero con convenciones estándar y tests desde el día uno.
- [El login local puede diferir de una integración corporativa real] → Mitigar encapsulando seguridad en una capa aislada para futura sustitución.
- [El módulo tiene varios catálogos de soporte] → Mitigar cargando datos semilla y validando integridad referencial desde la base.

## Migration Plan

1. Crear el esqueleto del backend Spring Boot y del frontend React.
2. Definir esquema PostgreSQL, semillas y entidades JPA.
3. Implementar autenticación, protección de rutas y menú principal.
4. Implementar la consulta/listado de usuarios y luego los flujos de detalle, alta, edición y baja.
5. Añadir pruebas unitarias, de integración y de UI.
6. Ejecutar la app localmente con datos semilla y validar los recorridos principales.

## Open Questions

- ¿Las opciones 2-9 del menú deben evolucionar a módulos funcionales en una siguiente iteración o permanecerán como rutas placeholder?
- ¿La autenticación local con un usuario semilla es suficiente para esta fase o se requerirá integración con un IdP externo más adelante?

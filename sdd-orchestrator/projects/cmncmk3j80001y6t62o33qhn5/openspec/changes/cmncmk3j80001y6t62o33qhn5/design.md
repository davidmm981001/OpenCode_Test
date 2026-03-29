## Contexto

La aplicación debe resolver operaciones aritméticas básicas con una UI React simple y un backend Spring Boot ligero.

## Objetivos / No objetivos

**Objetivos:**
- Exponer una API REST para suma, resta, multiplicación y división.
- Renderizar una UI React sencilla que consuma la API.
- Mantener el sistema fácil de ejecutar localmente con Docker Compose.

**No objetivos:**
- Persistencia en base de datos.
- Autenticación o autorización.
- Operaciones avanzadas como porcentaje, memoria o historial.

## Decisiones

- Backend Spring Boot 3.5.x con Java 21 y Spring Web + Validation.
- Endpoints bajo `/api/calculate` con payload JSON simple.
- Frontend con React + Vite + TypeScript.
- Uso de `fetch` nativo desde el frontend para evitar dependencias HTTP extra.
- Pruebas de backend con `@SpringBootTest` y pruebas de UI con Vitest + React Testing Library.

## Riesgos / Trade-offs

- La división puede producir resultados decimales; se usará precisión decimal estándar de Java.
- La UI será intencionalmente básica para mantener el cambio pequeño y verificable.

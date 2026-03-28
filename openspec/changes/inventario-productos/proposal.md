## Why

La aplicacion actual en ASP.NET Web Forms necesita una migracion a React + Spring REST + PostgreSQL para conservar su comportamiento funcional y, al mismo tiempo, dejar una base mas mantenible y moderna.

## What Changes

- Se crea un frontend en React con rutas para el inventario y las paginas informativas.
- Se crea un backend en Spring Boot con endpoints REST para consultar, crear y eliminar productos.
- Se agrega persistencia en PostgreSQL para los productos.
- Se conserva la experiencia funcional actual: listado inicial, alta desde modal, eliminacion silenciosa y paginas About/Contact estaticas.
- **BREAKING**: la implementacion deja de depender de Web Forms, GridView, ViewState y PostBack.

## Capabilities

### New Capabilities
- `inventario-productos`: inventario principal de productos, alta, eliminacion y paginas informativas asociadas.

### Modified Capabilities
- Ninguna.

## Impact

- Frontend React + Vite.
- Backend Spring Boot REST.
- Base de datos PostgreSQL.
- Pruebas unitarias e integracion para frontend y backend.
- Docker Compose para ejecucion local.

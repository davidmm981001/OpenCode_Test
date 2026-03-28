## Why

El módulo de seguridad legado concentra funciones críticas de navegación, consulta y mantenimiento de usuarios, pero hoy está definido por COBOL/BMS y tablas DB2. Migrarlo a React + Java Spring Boot + PostgreSQL permite mantener la lógica funcional, mejorar la mantenibilidad y habilitar pruebas automáticas y ejecución local reproducible.

## What Changes

- Se implementará un frontend React para el menú principal de seguridad y el mantenimiento de usuarios.
- Se implementará un backend Java Spring Boot con autenticación JWT, APIs REST y validaciones de negocio equivalentes a las del legado.
- Se modelará PostgreSQL para usuarios, BANCS, observaciones, parámetros, perfiles, empresas y centros.
- Se migrarán los flujos HU-01 a HU-05: menú principal, consulta paginada, alta, modificación, eliminación y detalle de usuarios.
- Se agregarán pruebas unitarias, de integración y de UI para validar navegación, validaciones, persistencia y auditoría.
- **BREAKING**: la implementación nueva reemplaza el flujo COBOL/BMS para el módulo de seguridad.

## Capabilities

### New Capabilities
- `autenticacion-seguridad`: inicio/cierre de sesión, emisión de JWT y protección de rutas.
- `menu-seguridad`: menú principal con 9 opciones y navegación protegida.
- `usuarios-seguridad`: consulta, detalle, alta, modificación y eliminación de usuarios con reglas de negocio, paginación, lookups y auditoría.

### Modified Capabilities
- Ninguna.

## Impact

- Nuevo frontend React + Vite con rutas protegidas y vistas del módulo de seguridad.
- Nuevo backend Spring Boot con controladores REST, servicios transaccionales, repositorios JPA y seguridad JWT.
- Nueva base PostgreSQL con tablas normalizadas y datos semilla para empresas, centros, perfiles y un usuario administrador.
- Nuevas pruebas backend (JUnit/MockMvc) y frontend (Vitest/React Testing Library).
- Nuevo archivo Docker Compose para levantar PostgreSQL y facilitar ejecución local.

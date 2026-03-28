## 1. Base del proyecto

- [ ] 1.1 Crear la estructura del backend Spring Boot con seguridad, JPA, validación y soporte PostgreSQL.
- [ ] 1.2 Crear la estructura del frontend React + Vite con router, layout y cliente HTTP.
- [ ] 1.3 Añadir configuración compartida de entorno, scripts de arranque y Docker Compose local.

## 2. Persistencia y dominio

- [ ] 2.1 Definir migraciones Flyway para usuarios, BANCS, observaciones, parámetros, perfiles, empresas, centros y auditoría.
- [ ] 2.2 Implementar entidades JPA, repositorios y semillas de datos base.
- [ ] 2.3 Implementar validaciones de integridad y consultas de soporte para lookups.

## 3. Autenticación y navegación

- [ ] 3.1 Implementar login/logout con JWT y protección de rutas backend/frontend.
- [ ] 3.2 Implementar el menú principal de seguridad con las 9 opciones y rutas protegidas.
- [ ] 3.3 Implementar pantallas placeholder para opciones aún no desarrolladas.

## 4. Gestión de usuarios

- [ ] 4.1 Implementar consulta paginada con filtros y prioridad heredada del legado.
- [ ] 4.2 Implementar detalle enriquecido de usuario con lookups y datos BANCS.
- [ ] 4.3 Implementar alta de usuarios con validaciones de negocio y persistencia transaccional.
- [ ] 4.4 Implementar modificación de usuarios con auditoría comparativa.
- [ ] 4.5 Implementar eliminación de usuarios con observación obligatoria y baja BANCS lógica.

## 5. Pruebas y verificación local

- [ ] 5.1 Agregar pruebas backend de servicios, controladores y validaciones críticas.
- [ ] 5.2 Agregar pruebas frontend de navegación, formulario y estados de error.
- [ ] 5.3 Ejecutar build/test local, levantar la app y validar manualmente el flujo completo.

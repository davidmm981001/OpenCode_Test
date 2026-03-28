# Inventario de productos

Aplicacion modernizada de inventario con React, Spring Boot y PostgreSQL.

## Ejecucion local

1. Levanta todo con `docker compose up --build`.
2. Abre `http://localhost:5173`.
3. PostgreSQL queda disponible en `localhost:5433` y la API en `http://localhost:8081` si necesitas acceder desde fuera de Docker.

## Ejecucion por separado

1. Levanta PostgreSQL con `docker compose up -d postgres`.
2. Inicia el backend en `backend/` con `mvn spring-boot:run` o usando Docker.
3. Inicia el frontend en `frontend/` con `npm install` y `npm run dev`.

## Pruebas

- Backend: `mvn test`
- Frontend: `npm test`

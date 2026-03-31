# Inventario David

Aplicación completa de inventario migrada desde Web Forms a:

- **Frontend:** React 18 + Vite + TypeScript
- **Backend:** Spring Boot 3 + Java 21 + Spring Data JPA
- **BD:** PostgreSQL + Flyway

## Ejecutar con Docker

```bash
docker compose up --build
```

- Frontend: http://localhost:4173
- Backend: http://localhost:18080
- Swagger/OpenAPI: http://localhost:8080/swagger-ui.html

## Desarrollo local

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
mvn test
mvn spring-boot:run
```

## Funcionalidades

- Layout compartido con navbar, contenido y footer
- Páginas About y Contact
- Listado de productos
- Alta de producto en modal
- Eliminación de producto por fila

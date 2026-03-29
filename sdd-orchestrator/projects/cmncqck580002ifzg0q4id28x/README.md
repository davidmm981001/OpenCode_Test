# Stopwatch simple

Aplicacion tipo cronometro para iniciar, detener y guardar varios tiempos con historial persistente.

## Requisitos

- Java 21
- Maven 3.9+
- Node.js 22+
- Docker y Docker Compose

## Desarrollo local

### Backend

```bash
cd backend
mvn spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Sistema completo

```bash
docker compose up --build
```

## URLs

- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- OpenAPI: http://localhost:8080/swagger-ui.html

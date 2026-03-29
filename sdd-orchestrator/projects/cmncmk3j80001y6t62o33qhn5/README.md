# calculator-test

Calculadora simple con React y Spring Boot.

## Requisitos

- Java 21
- Maven
- Node.js 20.19+ o 22.12+
- Docker y Docker Compose

## Ejecutar localmente

### Backend

```bash
mvn spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Pruebas

```bash
mvn test
cd frontend
npm test
```

### Docker Compose

```bash
docker-compose up --build
```

La interfaz queda disponible en `http://localhost:4173` y la API en `http://localhost:8080`.

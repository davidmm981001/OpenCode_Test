## MODIFIED Requirements

### Requirement: Plataforma local ejecutable
El sistema SHALL proveer una plataforma local ejecutable con frontend React + Vite, backend FastAPI, PostgreSQL, Redis y Celery para habilitar una base técnica V1.

#### Scenario: Inicio de servicios base
- **WHEN** una persona desarrolladora inicia la plataforma con la configuración local definida
- **THEN** los procesos de frontend y backend quedan en estado operativo
- **AND** PostgreSQL y Redis quedan disponibles para conexiones desde el backend
- **AND** Celery queda operativo con al menos 3 workers configurables por entorno

### Requirement: Endpoint de salud integrado
El backend MUST exponer un endpoint `GET /health` que reporte estado del servicio y resultado de conectividad con PostgreSQL, Redis y Celery.

#### Scenario: Salud general en estado correcto
- **WHEN** se invoca `GET /health` con todos los servicios disponibles
- **THEN** la respuesta retorna estado exitoso
- **AND** incluye indicadores explícitos de API, PostgreSQL, Redis y Celery en estado saludable

#### Scenario: Salud degradada por dependencia
- **WHEN** se invoca `GET /health` y PostgreSQL, Redis o Celery no están disponibles
- **THEN** la respuesta retorna estado degradado o error
- **AND** identifica qué dependencia falló para diagnóstico rápido

### Requirement: Configuración base por entorno
El sistema SHALL incluir una plantilla de configuración `.env` para ejecutar localmente frontend, backend y dependencias de infraestructura.

#### Scenario: Configuración de desarrollo inicial
- **WHEN** una persona desarrolladora prepara variables de entorno desde la plantilla
- **THEN** puede iniciar la plataforma sin definir parámetros adicionales fuera de la documentación base
- **AND** puede configurar cantidad de workers Celery desde variables de entorno

## 1. Artefactos y validación SDD

- [x] 1.1 Completar artefactos OpenSpec del delta change (proposal, specs, design, tasks)
- [x] 1.2 Ejecutar validación estricta previa del cambio

## 2. Backend y workers

- [x] 2.1 Configurar Celery en backend con Redis como broker/result backend
- [x] 2.2 Implementar tarea de worker con creación y limpieza de workspace efímero por run
- [x] 2.3 Extender endpoint `GET /health` para incluir estado de Celery workers

## 3. Infraestructura y frontend

- [x] 3.1 Actualizar `.env.example` con variables de Celery, workspace y cantidad de workers
- [x] 3.2 Ajustar `docker-compose.yml` para servicio worker y escalado configurable
- [x] 3.3 Actualizar pantalla base frontend para mostrar estado de Celery

## 4. Pruebas y cierre HU-01

- [x] 4.1 Ejecutar pruebas de integración local (backend + frontend + PostgreSQL + Redis + Celery)
- [x] 4.2 Ejecutar validación estricta final del cambio
- [x] 4.3 Cerrar criterios de aceptación + DoD y archivar el cambio

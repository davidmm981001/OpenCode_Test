## 1. Artefactos y gobernanza SDD

- [x] 1.1 Ajustar configuración de OpenSpec/OpenCode para flujo SDD estricto y modelos requeridos por rol
- [x] 1.2 Documentar política de ejecución SDD estricta (propose -> validate --strict -> apply -> validate --strict -> archive)
- [x] 1.3 Crear documento de separación formal SDD A (plataforma) y SDD B (proyectos generados)

## 2. Plataforma base backend e infraestructura

- [x] 2.1 Crear backend FastAPI con carga de configuración por entorno
- [x] 2.2 Implementar conexión y ping determinístico a PostgreSQL y Redis
- [x] 2.3 Exponer endpoint `GET /health` con detalle de estado por dependencia
- [x] 2.4 Definir infraestructura local de PostgreSQL/Redis con Docker Compose

## 3. Plataforma base frontend

- [x] 3.1 Crear frontend React + Vite con pantalla base operativa
- [x] 3.2 Integrar verificación visual del estado de backend mediante consumo de `GET /health`

## 4. Configuración y validación HU-01

- [x] 4.1 Completar `.env.example` base para plataforma runnable
- [x] 4.2 Ejecutar validaciones OpenSpec en modo estricto para confirmar consistencia de artefactos y cambio
- [x] 4.3 Levantar aplicación completa y validar criterios de aceptación + DoD de HU-01

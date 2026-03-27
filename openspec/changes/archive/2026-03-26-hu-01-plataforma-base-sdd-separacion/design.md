## Context

Se debe habilitar la HU-01 como base runnable sin adelantar capacidades de modernización de HUs posteriores. La arquitectura objetivo para esta sub-HU es simple y verificable: frontend React + Vite, backend FastAPI, PostgreSQL y Redis. Adicionalmente, el proyecto exige gobernanza SDD explícita para separar plataforma (A) de proyectos generados (B).

## Goals / Non-Goals

**Goals:**
- Levantar frontend y backend localmente con dependencias de infraestructura.
- Exponer `GET /health` con verificación real de PostgreSQL y Redis.
- Documentar separación SDD A/B en un artefacto de gobernanza consumible por el equipo.
- Dejar configuración base `.env` lista para ejecución local.

**Non-Goals:**
- Implementar parsing COBOL/BMS/CPY/JCL o generación de código final.
- Incorporar flujo conversacional operativo de proyectos generados.
- Construir lógica de negocio más allá de salud e inicialización de plataforma.

## Decisions

- Backend con FastAPI por arranque rápido, tipado claro y endpoint de salud sencillo.
  - Alternativa considerada: Spring Boot.
  - Razón de descarte en HU-01: FastAPI reduce fricción inicial para verificar infraestructura; Spring Boot queda fuera del alcance de esta sub-HU.
- Orquestación local con Docker Compose para PostgreSQL y Redis.
  - Alternativa considerada: instalación manual de servicios.
  - Razón de descarte: menor reproducibilidad y mayor tiempo de setup.
- Frontend mínimo con Vite para validar experiencia de arranque y conectividad base con API.
  - Alternativa considerada: omitir frontend.
  - Razón de descarte: el criterio de aceptación exige frontend y backend iniciando localmente.
- Documento dedicado de gobernanza para separar SDD A/B.
  - Alternativa considerada: incluir notas dispersas en README.
  - Razón de descarte: riesgo de ambigüedad y trazabilidad débil.

## Risks / Trade-offs

- [Riesgo] Diferencias de entorno local en puertos y credenciales -> Mitigación: variables centralizadas en `.env.example` y valores por defecto consistentes.
- [Riesgo] Falsos positivos de salud si no se prueba conectividad real -> Mitigación: `GET /health` ejecuta ping a PostgreSQL y Redis antes de responder.
- [Trade-off] Docker Compose añade dependencia de Docker Desktop -> Mitigación: mantener configuración mínima y documentada.

## Migration Plan

1. Crear estructura base de frontend, backend e infraestructura.
2. Configurar variables de entorno y conexiones backend para PostgreSQL/Redis.
3. Implementar endpoint de salud y pantalla base frontend.
4. Documentar gobernanza SDD A/B y validar con OpenSpec en modo estricto.
5. Levantar aplicación completa y ejecutar validación funcional de HU-01.

## Open Questions

- Ninguna para HU-01; alcance y criterios están cerrados para la base runnable.

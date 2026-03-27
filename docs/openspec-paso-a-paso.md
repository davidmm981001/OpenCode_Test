# Ejecucion OpenSpec paso a paso (regla operativa)

Este documento define el protocolo que OpenCode debe seguir siempre para evitar desvio de SDD.

## Protocolo obligatorio por cambio

1. Identificar cambio activo:
   - `openspec list --json`
2. Inspeccionar estado y dependencias:
   - `openspec status --change <change-name> --json`
3. Generar artefactos faltantes usando instrucciones oficiales del CLI:
   - `openspec instructions proposal --change <change-name> --json`
   - `openspec instructions specs --change <change-name> --json`
   - `openspec instructions design --change <change-name> --json`
   - `openspec instructions tasks --change <change-name> --json`
4. Ejecutar validacion estricta previa:
   - `openspec validate --type change --strict <change-name>`
5. Implementar solo tareas pendientes:
   - `openspec instructions apply --change <change-name> --json`
6. Marcar cada tarea completada de inmediato en `tasks.md`.
7. Ejecutar validacion estricta final:
   - `openspec validate --type change --strict <change-name>`
8. Validar funcionalmente la HU (app arriba + criterios de aceptacion + DoD).
9. Archivar el cambio:
   - `openspec archive <change-name>`

## Politica de bloqueo

- Si falla validacion estricta: detener implementacion y corregir primero.
- Si faltan dependencias de entorno (Docker, DB, Redis, etc.): registrar PARTIAL y no fingir resultados.
- Si no hay claridad de alcance: no asumir HU futura; pedir precision minima.

## Comandos de apoyo en OpenCode

- Explorar sin implementar: `/opsx-explore`
- Implementar tareas del cambio: `/opsx-apply <change-name>`
- Validar estricto del cambio: `/opsx-validate <change-name>`
- Archivar cambio finalizado: `/opsx-archive <change-name>`

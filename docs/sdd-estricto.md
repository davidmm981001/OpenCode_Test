# Politica SDD estricta del repositorio

## Objetivo

Garantizar ejecucion secuencial, atomica y trazable por sub-HU usando OpenSpec/OpenCode.

## Flujo obligatorio por sub-HU

1. Crear o seleccionar el cambio OpenSpec de la sub-HU.
2. Generar artefactos en orden: `proposal.md` -> `specs/*/spec.md` + `design.md` -> `tasks.md`.
3. Ejecutar validacion previa estricta:
   - `openspec validate --type change --strict <change-name>`
4. Implementar exclusivamente tareas pendientes del `tasks.md`.
5. Marcar cada tarea terminada en el momento (`- [ ]` -> `- [x]`).
6. Ejecutar validacion final estricta:
   - `openspec validate --type change --strict <change-name>`
7. Ejecutar validacion funcional de la sub-HU (arranque app + criterios de aceptacion + DoD).
8. Archivar el cambio al completar la sub-HU:
   - `openspec archive <change-name>`

## Checklist operativo obligatorio del agente

Para cada sub-HU, el agente debe ejecutar este checklist sin saltos:

1. `openspec list --json` para identificar cambios activos.
2. `openspec status --change <change-name> --json` para confirmar estado de artefactos.
3. Si faltan artefactos, generar en secuencia:
   - `openspec instructions proposal --change <change-name> --json`
   - `openspec instructions specs --change <change-name> --json`
   - `openspec instructions design --change <change-name> --json`
   - `openspec instructions tasks --change <change-name> --json`
4. Validar estricto antes de implementar:
   - `openspec validate --type change --strict <change-name>`
5. Solo si el cambio esta apply-ready, implementar tareas:
   - `openspec instructions apply --change <change-name> --json`
6. Marcar cada tarea en el acto (`- [ ]` -> `- [x]`).
7. Revalidar estricto al cierre:
   - `openspec validate --type change --strict <change-name>`
8. Verificar funcionalidad levantando app y comprobando criterios de aceptacion + DoD.
9. Archivar:
   - `openspec archive <change-name>`

## Reglas de control

- No se implementa codigo de aplicacion sin artefactos OpenSpec completos para `apply`.
- No se mezcla alcance de sub-HUs futuras con la sub-HU activa.
- Si una validacion estricta falla, se corrige antes de continuar.
- Si una sub-HU queda en estado PARTIAL, se conservan artefactos y se reintenta por etapa.

## Reglas anti-desvio (obligatorias)

- No escribir codigo de app si no existe `proposal.md` de ese delta change.
- No pasar a implementacion si `tasks.md` no existe o tiene tareas ambiguas.
- No avanzar a otra sub-HU si la actual no esta cerrada con aceptacion + DoD.
- No archivar un cambio sin validacion estricta final exitosa.
- Si hay bloqueo de infraestructura/herramienta, registrar estado PARTIAL y continuar solo con lo no bloqueado.
- Ante duda de alcance, priorizar lo especificado en el spec del cambio activo y pausar expansion fuera de HU.

## Roles de modelos

- Codegen principal: `openai/gpt-5.3-codex`.
- Razonamiento profundo: `openai/o3` (fallback: `openai/gpt-5.3-codex`).
- Auxiliar: `openai/gpt-4.1`.

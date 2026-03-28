# OpenSpec

Configuracion del flujo SDD del proyecto.

## Regla principal

No hay excepciones: si falta contexto, artefactos, decisiones o claridad tecnica, el agente debe detenerse y revisar la documentacion oficial/local antes de continuar.

## Flujo obligatorio

1. `explore`
2. `proposal`
3. `design`
4. `tasks`
5. `implementation`
6. `archive`

## Reglas estrictas

- No implementar codigo sin `proposal.md`, `design.md` y `tasks.md` completos.
- No inventar APIs, contratos ni comportamiento de librerias o componentes.
- Si una libreria, framework, componente o API no esta completamente claro, revisar la documentacion antes de seguir.
- No archivar cambios incompletos.
- No omitir revision de specs cuando existan delta specs.
- Mantener todos los artefactos en espanol.

## Estructura

- `openspec/config.yaml`: configuracion principal.
- `openspec/changes/`: cambios en curso.
- `openspec/specs/`: specs base por capacidad.

# Instrucciones OpenSpec SDD

Estas son reglas de ejecucion obligatorias para este proyecto:

1. Crear artefactos primero.
   - `proposal.md`
   - `specs/` como delta specs
   - `design.md`
   - `tasks.md`

2. No crear codigo hasta que los artefactos esten listos.

3. Implementar por tareas, progresivamente.
   - Completar un task antes de iniciar el siguiente.
   - Mantener los cambios pequenos y alineados al task actual.

4. Consultar documentacion oficial antes de usar librerias principales.
   - Antes de codificar o ejecutar comandos que dependan de una libreria principal, leer primero su documentacion oficial vigente.

5. Sincronizar las delta specs al final.
   - Integrar `openspec/changes/<change>/specs/` en `openspec/specs/`.
   - Solo despues archivar el cambio.

6. Si aparece una duda tecnica o de diseño, pausar y actualizar artefactos.

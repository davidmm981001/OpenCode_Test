# Reglas OpenSpec + SDD para Historias de Usuario (HU)

Estas reglas son obligatorias para cualquier solicitud de implementacion de HU.

1. Antes de escribir codigo, ejecutar flujo OpenSpec.
2. Iniciar siempre con este mensaje (o equivalente minimo):

   `Seguir estrictamente OpenSpec para implementar esta HU con delta changes siguiendo SDD, con artefactos OpenSpec concretos (proposal/design/tasks) listos para implementacion.`

3. No implementar si no existe un cambio activo con artefactos listos para aplicar.
4. Si no existe cambio, crear propuesta completa con delta changes:
   - proposal.md
   - design.md
   - tasks.md
5. Implementar solo desde tasks.md del cambio activo, marcando tareas completadas en el mismo archivo.
6. Si aparece un bloqueo tecnico o falta de definicion, pausar y actualizar artefactos OpenSpec antes de continuar.
7. Mantener todos los artefactos en espanol y alineados con `openspec/config.yaml` del repositorio.

Secuencia recomendada de comandos:

- `/opsx-propose <descripcion-o-change-name>`
- `/opsx-apply <change-name>`
- `/opsx-archive <change-name>` cuando todo este completo

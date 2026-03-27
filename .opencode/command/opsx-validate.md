---
description: Validar cambio OpenSpec en modo estricto
---

Valida un cambio OpenSpec en modo estricto.

**Input**: `/opsx-validate <change-name>`

Si no se indica `<change-name>`:
1. Ejecuta `openspec list --json`.
2. Si hay un unico cambio activo, usarlo.
3. Si hay multiples cambios, preguntar al usuario cual validar.

Ejecuta:

```bash
openspec validate --type change --strict "<change-name>"
```

Si falla validacion:
- Reportar errores exactos
- No continuar a implementacion hasta corregirlos

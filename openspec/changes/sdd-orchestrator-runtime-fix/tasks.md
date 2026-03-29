## 1. Runtime por proyecto

- [x] 1.1 Reforzar el registro de listeners por `projectId` para que una WebSocket abierta antes del arranque siga recibiendo eventos cuando el runtime aparezca.
- [x] 1.2 Ajustar el supervisor para mantener exactamente una sesión activa por proyecto, con snapshot consistente y rehidratación desde el backend.
- [x] 1.3 Asegurar la transición de estados `preparing` → `starting` → `running` → `waiting_input` → `monitoring` → `packaging` → `completed` / `error`.
- [x] 1.4 Endurecer el límite global de cinco procesos y el bloqueo de arranques duplicados por proyecto.

## 2. Flujo asíncrono y validaciones

- [x] 2.1 Convertir `/generate` en una operación rápida que responda con estado aceptado y deje la ejecución en background.
- [x] 2.2 Convertir `/complete` en una transición asíncrona válida solo en estados permitidos.
- [x] 2.3 Reforzar validaciones de nombre e historias vacías con errores 4xx claros.
- [x] 2.4 Mantener el endpoint de estado para polling y devolver snapshot consistente del proyecto y del runtime.

## 3. Configuración del workspace generado

- [x] 3.1 Regenerar la configuración local de OpenCode para cada proyecto sin mezclarla con OpenSpec.
- [x] 3.2 Regenerar la configuración local de OpenSpec con contexto persistente referenciado por archivos.
- [x] 3.3 Verificar que el workspace generado conserva trazabilidad del bloque de historias de usuario original.

## 4. UI de seguimiento y consola

- [x] 4.1 Hacer que la Tab 2 siga al proyecto seleccionado y rehidrate su snapshot al reconectar.
- [x] 4.2 Mostrar los estados reales del runtime y la información de sesión, puerto y mensaje actual.
- [x] 4.3 Mantener el autoscroll de terminal y habilitar el input solo cuando el runtime esté esperando entrada.
- [x] 4.4 Corregir el flujo de confirmación de completado y la transición a la tab de resultado.

## 5. Pruebas y verificación local

- [x] 5.1 Añadir o ajustar pruebas backend para arranque previo al socket, límites de concurrencia, validaciones y estados de `/generate` y `/complete`.
- [x] 5.2 Añadir o ajustar pruebas frontend para selección persistente de proyecto, rehidratación y comportamiento de terminal.
- [x] 5.3 Ejecutar build y tests del backend y frontend.
- [x] 5.4 Levantar backend y frontend en local y validar el flujo completo de Tab 1 a Tab 2 con un proyecto real.

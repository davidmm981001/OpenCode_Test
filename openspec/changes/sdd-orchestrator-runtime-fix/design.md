## Context

La implementación actual mezcla la vida del runtime con la selección de proyecto en la UI. El backend ya conserva snapshots y listeners por proyecto, pero la conexión visual no siempre queda alineada con el runtime real cuando la ejecución arranca después de que la Tab 2 ya está abierta.

Además, el flujo de generación y completado sigue pareciendo síncrono en la experiencia del usuario aunque internamente lance trabajo en background. Eso vuelve frágil la percepción del estado y complica la reconexión tras recargar el navegador.

## Goals / Non-Goals

**Goals:**
- Garantizar un runtime aislado por proyecto con estado, sesión y stream persistentes mientras el proceso siga vivo.
- Hacer que la Tab 2 siga al proyecto seleccionado y reciba snapshots aunque el socket exista antes del arranque.
- Convertir generación y empaquetado en operaciones rápidas con estado consultable por polling.
- Mantener separado el contexto de OpenCode y OpenSpec dentro del workspace generado.
- Dejar validaciones explícitas para estados inválidos, límites de concurrencia y reinicios.

**Non-Goals:**
- Cambiar el stack objetivo del proyecto generado.
- Introducir autenticación, multiusuario o permisos.
- Cambiar el SDD nivel 1 del monorepo.
- Añadir integración directa desde frontend a OpenCode; el backend sigue siendo el único puente.

## Decisions

1. **Mantener un registro de runtime por `projectId` y no por socket**
   - Rationale: el problema principal es la pérdida de vinculación cuando la UI se conecta antes del arranque. El runtime debe existir y emitir a listeners ya registrados por proyecto, independientemente de cuándo se conecte el cliente.
   - Alternatives considered: crear el socket solo después de arrancar el runtime. Rechazado porque rompe reconexión y no cubre cierres de navegador.

2. **Usar el snapshot como fuente de verdad para rehidratación**
   - Rationale: el frontend necesita pintar el estado exacto tras reconexión sin depender de haber presenciado todos los eventos intermedios.
   - Alternatives considered: reconstruir el estado solo desde eventos. Rechazado porque es más frágil en procesos largos y reconexiones.

3. **Separar estado rápido y eventos en tiempo real**
   - Rationale: las operaciones largas deben responder con 202/estado y el UI debe hacer polling cuando necesite sincronizarse, mientras WebSocket queda para streaming continuo.
   - Alternatives considered: mantener endpoints bloqueantes hasta finalización. Rechazado por ser incompatible con flujos SDD largos.

4. **Persistir el contexto de historias como archivo dentro del workspace generado**
   - Rationale: los prompts largos deben permanecer trazables y reaprovechables por OpenCode/OpenSpec sin depender de memoria de una sola petición.
   - Alternatives considered: inyectar todo el contexto solo como texto inicial. Rechazado porque pierde trazabilidad y complica reuso.

5. **Mantener OpenCode y OpenSpec en rutas y artefactos separados**
   - Rationale: la configuración del runtime y la especificación del proyecto generado no deben mezclarse para evitar acoplamientos accidentales.
   - Alternatives considered: fusionar ambos en un único archivo de contexto. Rechazado por la propia restricción del prompt y por mantenibilidad.

6. **Autoscroll y reconexión basados en snapshot + stream incremental**
   - Rationale: la consola debe sentirse como terminal, pero sin perder la posición funcional al reconectar.
   - Alternatives considered: recargar todo el log en cada evento. Rechazado por costo y ruido.

## Risks / Trade-offs

- [Riesgo] Dependencia del formato de eventos de OpenCode para rehidratar transcript → [Mitigación] mantener el buffer de snapshot y tratar la lectura de sesión como apoyo, no como única fuente.
- [Riesgo] Los endpoints asíncronos pueden mostrar estados intermedios breves → [Mitigación] la UI debe usar polling y snapshot para converger rápido.
- [Riesgo] El límite global de 5 procesos puede bloquear usuarios concurrentes → [Mitigación] devolver errores claros y conservar el estado actual del proyecto.
- [Riesgo] La separación de contexto podría dejar demasiado texto repetido → [Mitigación] preferir archivos de contexto y referencias en lugar de duplicar contenido inline.

## Migration Plan

1. Actualizar el contrato OpenSpec del cambio con capacidades y requisitos nuevos.
2. Ajustar backend para que la conexión WebSocket se pueda registrar antes del arranque y siga recibiendo eventos del runtime cuando éste aparezca.
3. Convertir la UI en consumidora del snapshot del proyecto seleccionado, con polling de respaldo y reconexión automática.
4. Revisar la generación del workspace para que OpenCode/OpenSpec queden separados y el contexto de HUs sea persistente.
5. Validar con pruebas unitarias/integración y luego levantar backend y frontend en local para verificar el flujo completo.

## Open Questions

- El formato exacto del transcript recuperado desde OpenCode puede variar según la API de sesión disponible; si faltan campos, la estrategia debe degradar a snapshot + stream en vivo sin romper la UI.
- Si la documentación vigente de OpenCode exige ajustes puntuales al arranque headless, se deberán reflejar en la capa de backend sin exponerlos al frontend.

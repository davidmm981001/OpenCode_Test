## ADDED Requirements

### Requirement: la Tab 2 sigue el proyecto seleccionado
La UI MUST mantener la Tab 2 sincronizada con el proyecto actualmente seleccionado, incluso si la conexión se abre antes de que el runtime arranque.

#### Scenario: la generación arranca desde la Tab 1
- **WHEN** el usuario inicia la generación desde la Tab 1 del proyecto seleccionado
- **THEN** la Tab 2 permanece vinculada a ese mismo proyecto
- **AND** muestra la ejecución real del runtime de ese proyecto sin saltar a otro contexto

### Requirement: indicadores de estado reales
La UI MUST mostrar el estado real del proceso con los valores `preparing`, `starting`, `running`, `waiting_input`, `monitoring`, `packaging`, `completed` y `error`.

#### Scenario: el runtime cambia de fase
- **WHEN** el backend emite un cambio de fase
- **THEN** la UI actualiza el indicador visible sin esperar a que termine la operación completa

### Requirement: terminal con autoscroll
La UI MUST comportarse como una terminal, haciendo autoscroll hacia la última línea cuando llegan nuevos eventos.

#### Scenario: llegan nuevas líneas al log
- **WHEN** el runtime emite nuevas líneas de salida
- **THEN** la vista del log se desplaza automáticamente al final

### Requirement: reconexión sin perder el proyecto
La UI MUST rehidratar el snapshot del proyecto seleccionado al reconectar el WebSocket o al recargar la página.

#### Scenario: el navegador se cierra y vuelve a abrirse
- **WHEN** el usuario vuelve a abrir la aplicación mientras el proyecto sigue corriendo
- **THEN** la UI recupera el snapshot del proyecto seleccionado
- **AND** continúa mostrando el stream en vivo del mismo proyecto

### Requirement: input habilitado solo al esperar respuesta
La UI MUST habilitar el campo de entrada únicamente cuando el runtime indique que está esperando input.

#### Scenario: el proceso aún está ejecutando
- **WHEN** el runtime no ha indicado espera de entrada
- **THEN** el input permanece deshabilitado
- **AND** la UI evita enviar mensajes fuera de tiempo

## ADDED Requirements

### Requirement: runtime aislado por proyecto
El sistema MUST mantener un runtime independiente por `projectId`, con una única sesión persistente, un puerto propio y un stream de eventos propio mientras el proceso siga activo.

#### Scenario: el runtime arranca para un proyecto concreto
- **WHEN** el usuario inicia la generación de un proyecto
- **THEN** el backend crea o reutiliza solo el runtime asociado a ese `projectId`
- **AND** ese runtime expone su estado, sesión y puerto sin mezclarse con otros proyectos

### Requirement: suscripción previa al arranque
El sistema MUST conservar las suscripciones WebSocket registradas antes de que el runtime exista y asociarlas al proyecto cuando el runtime arranque.

#### Scenario: el navegador se conecta antes de iniciar la generación
- **WHEN** la Tab 2 abre el WebSocket de un proyecto que todavía no tiene runtime activo
- **THEN** la conexión recibe el snapshot inicial del proyecto
- **AND** cuando el runtime arranca, los eventos posteriores llegan a la misma suscripción del proyecto

### Requirement: un solo proceso activo por proyecto
El sistema MUST impedir que un proyecto tenga más de un proceso activo simultáneamente.

#### Scenario: el usuario intenta relanzar un proyecto en ejecución
- **WHEN** el proyecto ya tiene un runtime activo o una generación pendiente
- **THEN** el backend rechaza el intento con un error de conflicto
- **AND** no crea un segundo proceso para ese mismo proyecto

### Requirement: límite global de procesos simultáneos
El sistema MUST limitar a cinco los procesos activos globales en paralelo.

#### Scenario: se alcanza el máximo global
- **WHEN** ya existen cinco procesos activos entre todos los proyectos
- **THEN** el siguiente intento de arranque falla con un error claro de límite alcanzado
- **AND** el proyecto mantiene su estado anterior sin crear un runtime parcial

### Requirement: reinicio del servidor marca error
El sistema MUST marcar como `error` cualquier proyecto que estuviera en ejecución cuando el servidor se reinicia.

#### Scenario: el backend vuelve a iniciar con proyectos activos
- **WHEN** el backend detecta proyectos persistidos con estado `running`
- **THEN** esos proyectos pasan a `error`
- **AND** el mensaje explica que el proceso fue interrumpido por un reinicio del servidor

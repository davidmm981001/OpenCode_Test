## 1. Artefactos SDD del cambio

- [x] 1.1 Completar proposal, specs, design y tasks del delta change HU-02
- [x] 1.2 Ejecutar validación estricta previa del cambio

## 2. Backend de proyectos y snapshots

- [x] 2.1 Modelar persistencia PostgreSQL para proyectos, snapshots y archivos fuente
- [x] 2.2 Implementar endpoints CRUD de proyectos
- [x] 2.3 Implementar endpoint de carga de fuentes (archivo y zip) con creación de snapshot
- [x] 2.4 Implementar endpoint de listado de archivos por proyecto/snapshot

## 3. Validaciones y persistencia estable

- [x] 3.1 Validar extensiones permitidas, tamaño máximo y encoding determinístico
- [x] 3.2 Asegurar que fuentes persisten en DB sin dependencia del workspace efímero

## 4. Frontend de gestión y Files tab

- [x] 4.1 Construir UI de CRUD básico de proyectos
- [x] 4.2 Implementar upload de fuentes y visualización de resultados
- [x] 4.3 Incorporar Tab Files con listado por snapshot

## 5. Validación funcional y cierre

- [x] 5.1 Ejecutar pruebas funcionales (crear proyecto, subir fuentes, verificar snapshot y listado)
- [x] 5.2 Ejecutar validación estricta final del cambio
- [x] 5.3 Archivar el cambio HU-02 al cumplir criterios de aceptación y DoD

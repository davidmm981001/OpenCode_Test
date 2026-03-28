# Design: contexto local para archivos del chat

## Estrategia
Implementar una capa local en memoria que reciba archivos sueltos o un ZIP, normalice su contenido, aplique filtros de exclusión y prepare un bloque de contexto textual para anteponerlo al mensaje del usuario solo cuando el toggle esta activo.

Al mismo tiempo, dejar intacto el flujo de archivos que se suben al RAG para indexacion en backend.

## Integracion
- Crear un `useFileContext` para toda la logica.
- Crear `FileUploadPanel` para la UI de carga y estado.
- Reutilizar el flujo existente de carga al RAG en la composicion del chat.
- Conectar el contexto al punto exacto de envio del chat.
- Mostrar conteo aproximado de tokens del contexto cargado y de la ventana de contexto del modelo.

## Decisiones
- El ZIP se procesa solo en navegador con JSZip.
- El contenido se mantiene en memoria.
- El mensaje original del usuario no se reemplaza; se antepone un prefijo `<code>...</code>` solo al enviar.
- El filtrado de rutas se define en un archivo dedicado por ecosistema.
- Se agregan pruebas unitarias para los helpers puros y pruebas de componente para el flujo principal.

## Riesgos
- Romper el formato del mensaje si no se escapa correctamente el contenido.
- Exceder la ventana de contexto con archivos muy grandes.
- Mezclar ZIP con archivos sueltos.

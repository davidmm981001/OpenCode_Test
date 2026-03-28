# Proposal: carga local de archivos para enriquecer el chat

## Objetivo
Agregar un panel frontend para cargar archivos locales y, de forma opcional, inyectar su contenido al mensaje del chat. En paralelo, preservar el flujo existente de carga de archivos al RAG para que ambos usos convivan sin mezclarse.

## Alcance
- Panel de carga en la pantalla del chat.
- Conservacion del flujo existente de carga al RAG.
- Soporte para archivos sueltos y un ZIP excluyente.
- Filtro de rutas tipo .gitignore.
- Toggle para decidir si el contexto se agrega al mensaje actual.
- Estimacion de tokens aproximados del contexto cargado.
- Visualizacion del tamano aproximado de la ventana de contexto del modelo activo.
- Pruebas de comportamiento y validacion local.

## Fuera de alcance
- Cambios al backend de indexacion del RAG.
- Persistencia de archivos en disco.
- Indexacion de archivos en backend.

## Capacidades afectadas
- Chat frontend de ragapp.
- Manejo de mensajes de entrada.
- Configuracion de entorno para el modelo seleccionado.
- Pruebas del frontend.

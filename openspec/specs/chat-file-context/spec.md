# Especificacion Principal: contexto local de archivos en el chat

## Requirement: carga local de archivos
El sistema debe permitir que el usuario cargue archivos locales desde la interfaz del chat sin enviarlos al backend como archivos adjuntos.

## Requirement: preservacion del flujo de RAG
El sistema debe conservar el flujo existente de carga de archivos al RAG para indexacion en backend, separado del contexto local.

## Requirement: modo ZIP excluyente
El sistema debe permitir cargar un unico archivo ZIP y tratarlo como excluyente con respecto a archivos sueltos.

## Requirement: filtrado de rutas irrelevantes
El sistema debe excluir archivos y rutas irrelevantes usando patrones equivalentes a un `.gitignore` para ecosistemas Java, PostgreSQL, React, Node.js, ASP.NET, .NET y C#.

## Requirement: inyeccion opcional de contexto
Al enviar un mensaje, si el toggle de aplicacion esta activo, el sistema debe anteponer al mensaje un bloque `<code>...</code>` con el contenido agregado de los archivos cargados.

## Requirement: preservacion del mensaje original
El sistema debe conservar el texto original del usuario y solo agregar el contexto como prefijo temporal al enviar.

## Requirement: metrica de tokens del contexto
El sistema debe mostrar una estimacion aproximada de tokens del contenido cargado.

## Requirement: metrica de ventana de contexto
El sistema debe mostrar la ventana de contexto aproximada del modelo activo en RAG.

## Requirement: seguridad de contenido
El sistema debe escapar el contenido antes de envolverlo en tags `<code>` para evitar romper el mensaje.

## Requirement: pruebas del flujo
El sistema debe incluir pruebas para el flujo de carga, filtrado, ZIP, alternancia del toggle e integracion del mensaje.

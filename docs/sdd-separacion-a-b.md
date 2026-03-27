# Separacion SDD A/B para V1

## SDD A: Plataforma (operativo en V1)

SDD A cubre la plataforma de ejecucion y orquestacion sobre la que corre el producto.

Incluye:
- Backend de plataforma (API base, salud, integraciones de infraestructura).
- Frontend de plataforma (experiencia base operativa para validaciones V1).
- Infraestructura runtime (PostgreSQL, Redis, compose local, configuracion `.env`).
- Gobernanza de cambios OpenSpec y validaciones de calidad por sub-HU.

En V1, SDD A debe quedar ejecutable end-to-end en entorno local.

## SDD B: Proyectos generados (preconfigurado en V1)

SDD B cubre el resultado de generacion para proyectos objetivo de modernizacion.

Incluye:
- Estructuras, plantillas y convenciones de proyectos generados.
- Configuracion base de proyectos de salida.
- Artefactos de soporte para evolucion futura del flujo de generacion.

En V1, SDD B queda preconfigurado y trazable, pero no conversacional/operativo completo.

## Limites y gobernanza

- Todo cambio debe declarar si afecta SDD A, SDD B o ambos.
- Sub-HUs de plataforma no deben introducir logica de negocio de proyectos generados.
- Sub-HUs de proyectos generados no deben romper la operacion base de plataforma.
- La validacion de cierre de una sub-HU exige evidencias de criterios de aceptacion y DoD del alcance declarado.

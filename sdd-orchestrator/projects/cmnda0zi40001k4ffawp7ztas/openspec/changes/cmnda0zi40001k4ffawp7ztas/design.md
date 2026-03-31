## Context

La aplicación será una frontend React + Vite en TypeScript, sin backend, porque la historia de usuario solo requiere cálculo y conversión local.

## Goals / Non-Goals

**Goals:**
- Resolver operaciones básicas desde una pantalla única.
- Convertir entre unidades de masa comunes.
- Mantener una experiencia simple y responsive.

**Non-Goals:**
- No se implementan conversiones de temperatura, longitud o moneda.
- No se agrega persistencia ni API remota.

## Decisions

- La lógica de cálculo y conversión vive en `src/calculator.ts` para facilitar pruebas.
- La UI se concentra en `src/App.tsx` con dos tarjetas: cálculo y conversión.
- Se usa una validación simple de expresión para evitar caracteres no permitidos.

## Risks / Trade-offs

- `Function(...)` simplifica el cálculo, pero depende de una validación estricta de la expresión.
- El alcance se limita a masa para no mezclar dominios que la historia no pide.

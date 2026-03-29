## Por qué

Se necesita una calculadora simple con suma, resta, multiplicación y división, con una interfaz React básica, una API Spring Boot y pruebas mínimas que validen las operaciones.

## Qué cambia

- Se agrega un backend Spring Boot con un endpoint REST para calcular operaciones.
- Se agrega una interfaz React básica para capturar operandos, elegir la operación y mostrar el resultado.
- Se agregan pruebas mínimas de backend y frontend para validar el flujo.

## Capacidades

### Nuevas capacidades
- `calculator-api`: ejecuta operaciones aritméticas simples desde una API REST.
- `calculator-ui`: permite ingresar datos y ver el resultado en una UI React.
- `calculator-tests`: valida suma, resta, multiplicación, división y el caso de división por cero.

### Capacidades modificadas
- Ninguna.

## Impacto

- Estructura de backend Spring Boot.
- Estructura de frontend React + Vite.
- Tests automáticos y orquestación local con Docker Compose.

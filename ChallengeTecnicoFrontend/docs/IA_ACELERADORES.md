# IA_ACELERADORES.md

## Contexto

Durante el desarrollo del challenge se utilizó IA como herramienta de aceleración para reducir tiempo de implementación en tareas operativas y repetitivas, manteniendo el control sobre todas las decisiones técnicas relevantes.

El desarrollo fue guiado por un plan de trabajo estructurado por etapas, desde la base de la aplicación hasta documentación, testing, UX, performance y Docker. La IA se utilizó para asistir en la ejecución de ese plan, no para reemplazar criterio técnico ni para definir el diseño del sistema.

---

## Qué se pidió a la IA y por qué

La IA se utilizó principalmente para acelerar tareas concretas dentro de cada etapa del plan.

### Etapa 1 - Base de aplicación

Uso:
- limpieza del scaffold inicial de Angular
- generación de un `App` mínimo con `RouterOutlet`
- asistencia en la configuración inicial de rutas

Por qué:
- reducir tiempo en tareas de arranque que no aportaban valor diferencial al challenge
- dejar rápidamente una base limpia para trabajar sobre la feature principal

---

### Etapa 2 - Estructura base de la feature automotores

Uso:
- asistencia para proponer una estructura inicial por carpetas
- generación base de archivos placeholder y piezas mínimas de la feature
- apoyo en naming técnico alineado al dominio

Por qué:
- acelerar la preparación de una estructura ordenada desde el inicio
- evitar desorden temprano en el proyecto
- materializar rápido la decisión de usar una organización orientada a features con `automotores` como centro

---

### Etapa 3 - Dominio y validaciones

Uso:
- generación inicial de validadores para:
  - dominio (`AAA999`, `AA999AA`)
  - CUIT
  - fecha `YYYYMM`
- asistencia para bosquejar modelos y helpers puros

Por qué:
- acelerar la implementación inicial de reglas conocidas
- concentrar tiempo en validar correctamente reglas y edge cases

---

### Etapa 4 - Infraestructura e integración

Uso:
- generación base de:
  - services HTTP
  - DTOs
  - mappers entre DTO y dominio
- asistencia en propuestas iniciales para manejo de errores

Por qué:
- reducir tiempo de wiring técnico
- acelerar una capa de integración limpia sin comprometer la arquitectura

---

### Etapa 5 - Estado y orquestación

Uso:
- asistencia en estructura base de facades o stores livianos
- propuestas iniciales para modelado de estado y acciones

Por qué:
- acelerar la organización del flujo sin introducir una solución sobredimensionada
- mantener foco en una orquestación simple y entendible

---

### Etapa 6 - Pantalla de listado

Uso:
- scaffolding de componentes standalone
- apoyo en estructura de tabla, filtros, estados visuales y wiring inicial
- sugerencias de organización de acciones por fila

Por qué:
- reducir tiempo en boilerplate Angular y estructura visual inicial

---

### Etapa 7 - Formulario crear/editar

Uso:
- generación base de formulario reactivo tipado
- apoyo en la estructura inicial de validaciones y mensajes
- asistencia en wiring entre formulario, facade y capa de integración

Por qué:
- acelerar la implementación del formulario sin perder control sobre reglas de negocio

---

### Etapa 8 - Flujo de titular por CUIT

Uso:
- asistencia para organizar el flujo de búsqueda de titular, alta de sujeto y reintento
- propuestas de estructura para estados del flujo

Por qué:
- acelerar un flujo con varios estados posibles
- mantener consistencia con la decisión de tratar titular/sujeto dentro de la feature `automotores`

---

### Etapa 9 - UX y accesibilidad

Uso:
- sugerencias de mensajes accionables
- apoyo en atributos semánticos y de accesibilidad
- asistencia en la definición de identificadores estables para testing e2e

Por qué:
- mejorar consistencia de la interfaz
- acelerar detalles de usabilidad y accesibilidad sin dejar de revisar manualmente cada caso

---

### Etapa 10 - Manejo de errores y 422

Uso:
- asistencia en propuestas para mapear errores HTTP
- generación base de estructuras reutilizables para exponer errores a la UI

Por qué:
- acelerar un manejo consistente de errores
- evitar acoplar componentes directamente a `HttpErrorResponse`

---

### Etapa 11 - Testing

Uso:
- generación inicial de tests para:
  - validadores
  - formulario
  - estados de listado
  - casos básicos de error `422`

Por qué:
- reducir tiempo de escritura repetitiva en tests
- partir de una base que luego fue ajustada manualmente

---

## Cómo se validó lo generado

Todo lo generado con IA fue validado manualmente antes de considerarse parte de la solución final.

### Validación contra el plan de trabajo

Cada propuesta generada se contrastó con el plan definido por etapas para verificar que:

- respetara el objetivo de cada etapa
- no introdujera complejidad innecesaria
- no contradijera decisiones ya tomadas

---

### Validación contra la arquitectura

Se revisó especialmente que el código respetara:

- organización por features
- `automotores` como feature principal
- separación entre:
  - `domain/`
  - `application/`
  - `infrastructure/`
  - presentación
- ausencia de lógica de negocio en componentes

---

### Validación contra reglas del negocio

Se verificó que lo generado respetara las reglas del challenge, especialmente:

- validación de dominio
- validación de CUIT con dígito verificador correcto
- validación de fecha `YYYYMM`
- flujo de reasignación de titular si cambia el CUIT
- flujo de creación de sujeto cuando el CUIT no existe
- manejo de error `422`

---

### Validación funcional

Se probaron manualmente los flujos críticos:

- listado de automotores
- búsqueda y filtrado
- creación
- edición
- eliminación
- cambio de CUIT y reasignación
- alta de sujeto y reintento de asociación
- estados `loading`, `empty`, `error`, `success`

---

### Validación mediante tests

Lo generado también fue respaldado con tests en los puntos críticos:

- tests unitarios de validadores
- tests de formulario
- tests de estados de listado
- tests de manejo de errores

---

## Riesgos identificados al usar IA

### 1. Sobreingeniería

También puede sugerir:

- librerías de estado innecesarias
- demasiadas abstracciones para un alcance acotado
- estructuras que complican más de lo que ayudan

---

### 4. Código que funciona pero no respeta el diseño

Puede generar piezas que compilan y funcionan, pero:

- no respetan la arquitectura elegida
- contradicen el plan
- dificultan mantenimiento y defensa técnica

---

## Mitigaciones aplicadas

Para controlar esos riesgos se aplicaron las siguientes medidas:

- revisión manual de todo el código generado
- contraste permanente con el plan por etapas
- centralización de reglas en `domain/`
- orquestación del flujo en `application/`
- desacople de integración en `infrastructure/`
- refactorización del código generado cuando no respetaba la solución elegida
- descarte explícito de propuestas innecesarias o inconsistentes

---

## Qué se descartó y por qué

Durante el uso de IA se descartaron propuestas concretas por no alinearse al objetivo del challenge ni al plan definido.

---

### 1. Estructura técnica genérica en lugar de feature-first

Se descartaron propuestas donde el proyecto se organizaba de forma demasiado técnica o genérica, sin priorizar `automotores` como centro del dominio.

Motivo:
- no reflejaba el lenguaje del negocio
- diluía la feature principal
- complicaba la mantenibilidad del caso de uso principal

---

### 2. Separar `sujeto` como feature independiente

Motivo:
- rompía la decisión principal del plan
- aumentaba complejidad sin aportar valor al challenge
- dispersaba un flujo que debía resolverse dentro de `automotores`

---

### 3. Usar NgRx o un store global sobredimensionado

Motivo:
- sobreingeniería para el alcance del challenge
- mayor costo cognitivo y de implementación
- se priorizó una solución liviana con signals y facade/store acotado

---

### 4. Colocar validaciones directamente en formularios o componentes

Motivo:
- duplicación de lógica
- menor reutilización
- peor testeabilidad

Se centralizaron en `domain/validators`.

---

## Conclusión

La IA fue utilizada como acelerador de implementación en tareas operativas, repetitivas o de bajo valor estratégico, pero siempre bajo control técnico.

Las decisiones importantes sobre:

- arquitectura
- estructura por features
- separación de capas
- validaciones de negocio
- manejo de errores
- organización del flujo funcional

fueron tomadas de manera consciente y luego implementadas con ayuda de IA cuando resultó conveniente.

En consecuencia, la IA actuó como soporte de productividad, no como reemplazo del criterio de diseño ni de validación técnica.
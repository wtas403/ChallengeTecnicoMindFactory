# Plan de trabajo - Challenge Frontend Angular

## Objetivo

Construir un frontend Angular sólido, mantenible y defendible técnicamente para el challenge, tomando a `automotores` como feature principal del sistema y modelando el flujo de `sujeto/titular/dueño por CUIT` como parte de esa misma feature, sin convertirlo en una capacidad independiente.

El resultado debe cubrir:
- CRUD de automotores
- búsqueda y asociación de titular por CUIT
- alta de sujeto cuando el CUIT no exista
- validaciones de negocio en cliente
- integración REST limpia
- UX clara
- accesibilidad base
- performance razonable
- testing mínimo exigido
- documentación y Docker

---

## Principios rectores

1. `automotores` es la feature principal del sistema.
2. Todo el dominio específico del challenge vive dentro de esa feature.
3. `sujeto`, `titular` y `dueño` se tratan como parte del flujo funcional de automotores.
4. Se prioriza una estructura simple, coherente, escalable y sin duplicaciones.
5. Se separan claramente presentación, orquestación, dominio e integración.
6. Las reglas del dominio no se dispersan en componentes.
7. El naming debe ser estricto, predecible y alineado al lenguaje del negocio.
8. No se agregará complejidad que no aporte valor claro al challenge.
9. Cada decisión debe ser defendible en una revisión técnica.

---

## Alcance funcional a implementar

### 1. Listado de automotores

Debe incluir:
- columnas:
  - dominio
  - dueño/titular
  - CUIT
  - fabricación
  - acciones
- búsqueda por dominio y CUIT
- ordenamiento por columnas principales
- paginación
- estados:
  - loading
  - empty
  - error
  - success

### 2. Formulario de crear/editar automotor

Debe incluir:
- dominio
- chasis
- motor
- color
- fecha fabricación `YYYYMM`
- CUIT del dueño/titular

Debe resolver:
- alta
- edición
- baja
- validaciones client-side
- detección de cambios sin guardar
- guard de navegación

### 3. Flujo de titular por CUIT

Debe incluir:
- búsqueda de titular por CUIT
- si existe: asociarlo al automotor
- si no existe: permitir crear sujeto desde el frontend
- reintentar la asociación una vez creado
- si en edición cambia el CUIT: representar la reasignación del dueño responsable

### 4. Integración backend

Debe cubrir:
- `GET /api/automotores`
- `GET /api/automotores/:dominio`
- `POST /api/automotores`
- `PUT /api/automotores/:dominio`
- `DELETE /api/automotores/:dominio`
- `GET /api/sujetos/by-cuit?cuit=`
- `POST /api/sujetos`

### 5. Testing mínimo

Debe incluir:
- unit tests de validadores:
  - dominio
  - CUIT
  - `YYYYMM`
- tests de formulario con validaciones
- test de error API `422`
- test de listado en loading o empty
- si el tiempo alcanza: 1 e2e crítico

### 6. Documentación obligatoria

Debe incluir:
- `docs/DECISION_LOG.md`
- `docs/ESCALABILIDAD_FRONT.md`
- `docs/IA_ACELERADORES.md`
- `README.md`
- `.env.example`
- `docker-compose.yml`

---

## Decisiones arquitectónicas

### Feature principal

Se usará una organización orientada a features con `automotores` como centro del dominio.

Estructura objetivo:

```text
src/app/
  core/
  shared/
  features/
    automotores/
      routes/
      pages/
      components/
      domain/
      application/
      infrastructure/
```

### Criterio por capa

#### `core/`

Responsabilidades transversales y globales:
- interceptores HTTP
- manejo global de errores
- configuración app
- utilidades de infraestructura compartidas
- tokens o providers globales si hacen falta

No debe contener lógica del dominio de automotores.

#### `shared/`

Elementos de UI o utilidades reutilizables sin acoplamiento fuerte al dominio:
- componentes UI básicos
- pipes o helpers genéricos
- utilidades accesibles
- componentes de feedback reutilizables

No debe contener reglas específicas de automotores.

#### `features/automotores/`

Todo lo propio del caso de negocio:
- pantallas
- componentes del flujo
- modelos de dominio
- validadores del negocio
- servicios de integración del dominio
- store/facade/casos de uso del flujo

---

## Diseño interno de la feature automotores

### `routes/`

Archivos esperados:
- `automotores.routes.ts`

Responsabilidad:
- lazy loading de la feature
- definición de rutas:
  - listado
  - crear
  - editar
- vinculación con guards del flujo

### `pages/`

Archivos esperados:
- `automotores-list-page.ts`
- `automotor-form-page.ts`

Responsabilidad:
- composición de pantalla
- coordinación visual
- delegación al estado/orquestación
- sin lógica de dominio pesada

### `components/`

Componentes específicos de la feature, por ejemplo:
- `automotores-table.ts`
- `automotor-form.ts`
- `titular-cuit-field.ts`
- `crear-titular-inline.ts`
- `automotores-filters.ts`
- `automotor-delete-confirmation.ts`

Responsabilidad:
- UI enfocada
- inputs/outputs claros
- sin llamadas HTTP directas
- sin reglas duplicadas

### `domain/`

Subestructura sugerida:

```text
domain/
  models/
  validators/
  value-objects/
  errors/
```

Modelos esperados:
- `automotor.ts`
- `titular.ts`
- `automotores-filters.ts`
- `automotores-sort.ts`
- `automotores-page.ts`

Validadores esperados:
- `dominio.validator.ts`
- `cuit.validator.ts`
- `fecha-fabricacion.validator.ts`

Responsabilidad:
- lenguaje del dominio
- contratos internos
- reglas del negocio puras
- helpers puros para validación y transformación

### `application/`

Subestructura sugerida:

```text
application/
  stores/
  facades/
  use-cases/
```

Responsabilidad:
- orquestar el flujo de pantallas
- coordinar llamadas entre UI, validaciones e infraestructura
- mantener estado local con signals
- resolver loading/success/error
- encapsular acciones como:
  - cargar listado
  - buscar por filtro
  - guardar automotor
  - eliminar automotor
  - resolver titular por CUIT
  - crear titular y reintentar asociación

### `infrastructure/`

Subestructura sugerida:

```text
infrastructure/
  api/
  dtos/
  mappers/
  repositories/
```

Archivos esperados:
- `automotores-api.service.ts`
- `sujetos-api.service.ts`
- `automotor.dto.ts`
- `titular.dto.ts`
- `automotor.mapper.ts`
- `titular.mapper.ts`

Responsabilidad:
- integración HTTP
- DTOs de request/response
- mapping entre API y dominio
- encapsular detalles externos

---

## Naming y convenciones

### Naming principal

Usar:
- `automotor`
- `automotores`
- `titular`
- `sujeto` solo cuando el contrato API lo requiera
- `cuit`
- `dominio`
- `fechaFabricacion`

Evitar:
- `owner`
- `person`
- `customer`
- `subject` como naming central
- estructuras paralelas para la misma responsabilidad

### Convenciones de archivos

- archivos en kebab-case
- clases, tipos e interfaces alineadas al dominio
- nombres largos si hacen la intención más clara
- una responsabilidad por artefacto, sin fragmentar de más

### Convenciones Angular

- componentes standalone
- `ChangeDetectionStrategy.OnPush`
- signals para estado local
- formularios reactivos tipados
- `input()` y `output()` si se necesitan bindings
- control flow nativo `@if`, `@for`, `@switch`
- no `ngClass`
- no `ngStyle`
- no lógica de negocio en templates

---

## Estrategia de implementación por etapas

## Etapa 1 - Base de aplicación

### Objetivo

Reemplazar el scaffold inicial de Angular por un shell real y preparar el ingreso a la feature `automotores`.

### Tareas

1. Limpiar template demo generado por Angular.
2. Dejar `App` mínimo con `RouterOutlet`.
3. Crear `app.routes.ts` con lazy loading hacia `automotores`.
4. Mantener estructura simple desde el inicio.
5. Verificar que compile y que el test base deje de depender del scaffold original.

### Resultado esperado

- aplicación navegable
- root limpio
- entrada preparada para crecimiento por features

---

## Etapa 2 - Estructura base de la feature automotores

### Objetivo

Crear la estructura principal sin sobreingeniería y con límites claros.

### Tareas

1. Crear carpeta `features/automotores/`.
2. Crear `routes/`, `pages/`, `components/`, `domain/`, `application/`, `infrastructure/`.
3. Crear la ruta principal de listado.
4. Crear páginas placeholder mínimas si hace falta para construir incrementalmente.

### Resultado esperado

- estructura coherente desde el principio
- todo el dominio del challenge centralizado en una sola feature

---

## Etapa 3 - Dominio y validaciones

### Objetivo

Centralizar reglas del negocio como base del resto del sistema.

### Tareas

1. Definir modelo de `Automotor`.
2. Definir modelo de `Titular`.
3. Definir tipos de filtros, ordenamiento y paginación.
4. Implementar validador de dominio:
   - `AAA999`
   - `AA999AA`
5. Implementar validador de CUIT:
   - formato
   - dígito verificador módulo 11
6. Implementar validador de `YYYYMM`:
   - 6 dígitos
   - mes válido
   - no futuro
7. Diseñar helpers puros reutilizables para formulario y tests.
8. Crear tests unitarios de estas reglas.

### Resultado esperado

- reglas del negocio unificadas
- tests confiables
- base reutilizable para formulario y capa de integración

---

## Etapa 4 - Infraestructura e integración

### Objetivo

Preparar una integración limpia, fuertemente tipada y simple de evolucionar.

### Tareas

1. Elegir mock server como opción principal para este challenge.
2. Modelar DTOs de automotores y sujetos.
3. Crear servicios HTTP por responsabilidad:
   - `automotores-api.service.ts`
   - `sujetos-api.service.ts`
4. Crear mappers DTO -> dominio y dominio -> DTO.
5. Definir estrategia consistente de manejo de errores:
   - errores de red
   - errores inesperados
   - `422 Unprocessable Entity`
6. Agregar interceptor o handler liviano para normalizar errores HTTP.
7. Exponer mensajes útiles al flujo, no textos genéricos.

### Resultado esperado

- capa HTTP ordenada
- componentes desacoplados de `HttpClient`
- errores tratados de forma consistente

---

## Etapa 5 - Estado y orquestación

### Objetivo

Resolver el flujo con estado razonable, sin incorporar una librería extra salvo necesidad real.

### Estrategia elegida

Usar signals y una capa de orquestación liviana dentro de `application/`.

### Tareas

1. Crear un store/facade liviano para el listado.
2. Crear un store/facade liviano para el formulario o uno solo si la complejidad lo permite.
3. Modelar estados:
   - idle
   - loading
   - success
   - error
4. Resolver acciones:
   - cargar automotores
   - filtrar
   - ordenar
   - paginar
   - guardar
   - eliminar
   - buscar titular por CUIT
   - crear sujeto
   - reintentar asociación
5. Mantener las transformaciones de estado puras y predecibles.

### Resultado esperado

- lógica fuera de los componentes
- orquestación clara
- estado entendible y testeable

---

## Etapa 6 - Pantalla de listado

### Objetivo

Implementar el primer caso visible completo del challenge.

### Tareas

1. Crear `automotores-list-page`.
2. Crear tabla/lista de automotores.
3. Mostrar columnas obligatorias.
4. Implementar búsqueda por dominio/CUIT.
5. Implementar ordenamiento por columnas principales.
6. Implementar paginación.
7. Implementar acciones:
   - crear
   - editar
   - eliminar
8. Implementar estados de:
   - loading
   - empty
   - error
9. Asegurar accesibilidad:
   - estructura semántica
   - tabla o grid accesible según corresponda
   - foco visible
   - labels y textos claros
10. Optimizar render:
   - `trackBy`
   - `OnPush`
   - no recalcular innecesariamente en template

### Decisión de paginación

Inicialmente client-side, salvo que el mock o backend real ya venga preparado para server-side.
Justificación:
- menor complejidad inicial
- suficiente para challenge
- fácil de defender si se documenta el trade-off
- arquitectura preparada para migrar a server-side

### Resultado esperado

- pantalla lista para demostrar capacidad funcional y calidad de UI

---

## Etapa 7 - Formulario crear/editar

### Objetivo

Resolver el núcleo del challenge: creación y edición con validaciones y flujo por CUIT.

### Tareas

1. Crear `automotor-form-page`.
2. Crear `automotor-form`.
3. Definir formulario reactivo tipado.
4. Agregar validaciones sin duplicarlas:
   - dominio
   - CUIT
   - `YYYYMM`
5. Resolver modo crear.
6. Resolver modo editar.
7. Resolver eliminación desde flujo seguro.
8. Mostrar errores accionables por campo y globales.
9. Marcar claramente estado de guardado, error y éxito.
10. Prevenir pérdida de datos con guard de navegación.
11. Reflejar visualmente la reasignación del titular si cambia el CUIT.

### Resultado esperado

- formulario robusto
- reglas claras
- experiencia predecible y mantenible

---

## Etapa 8 - Flujo de titular por CUIT

### Objetivo

Integrar correctamente la búsqueda y alta de sujeto sin romper el foco en la feature automotores.

### Tareas

1. Al ingresar un CUIT válido, permitir búsqueda del titular.
2. Si existe:
   - mostrarlo
   - asociarlo al automotor
3. Si no existe:
   - mostrar un estado claro
   - ofrecer creación inline o dialog liviano
4. Crear sujeto con los datos requeridos por el flujo definido.
5. Reintentar automáticamente o con acción explícita la asociación.
6. Si el automotor ya tenía otro titular y cambia el CUIT:
   - representar la reasignación de dueño responsable
7. Mantener el flujo dentro del formulario de automotores, sin crear una feature aparte.

### Resultado esperado

- caso de negocio resuelto de punta a punta
- sin ambigüedad de ownership en la UI
- sin dispersión arquitectónica

---

## Etapa 9 - UX y accesibilidad

### Objetivo

Garantizar que la solución sea usable, clara y técnicamente defendible.

Además, dejar la interfaz preparada para pruebas e2e con Playwright mediante identificadores estables.

### Tareas

1. Mantener estética simple y sobria.
2. Diseñar mensajes accionables y específicos para cada estado.
3. Garantizar labels visibles y asociaciones correctas en formularios.
4. Agregar atributos de accesibilidad por campo cuando corresponda:
   - `aria-invalid`
   - `aria-describedby`
   - `role="alert"` o `aria-live` para feedback global
5. Reforzar manejo de foco:
   - foco inicial predecible por pantalla
   - foco al primer error o panel de error ante submit inválido
   - foco al bloque inline cuando se habilita creación de titular
6. Respetar navegación por teclado en listado, formulario, paginación y acciones.
7. Asegurar focus visible en todos los controles interactivos.
8. Revisar contraste mínimo razonable.
9. Resolver responsive al menos para desktop y tablet:
   - toolbar
   - tabla/acciones
   - paginación
   - formulario y bloque inline
10. Validar que el flujo de alta/edición no dependa solo de color o layout.
11. Revisar confirmaciones de acciones destructivas para mantener una UX consistente y accesible.

### Convención de `id` para Playwright y accesibilidad

Implementar `id` estables, semánticos y predecibles en elementos críticos para evitar selectores frágiles en e2e.

Alcance mínimo:
- buscador del listado
- tabla/listado
- controles de paginación
- acciones por fila
- campos del formulario
- mensajes de error por campo
- paneles de estado (`loading`, `empty`, `error`, `success`)
- bloque inline de creación de titular
- acciones principales (`guardar`, `cancelar`, `crear titular`)

Regla para elementos por fila:
- usar patrón estable basado en dominio (por ejemplo: `automotor-AA123BB-edit`).

### Resultado esperado

- UI clara para usuario no técnico
- base compatible con AXE/WCAG AA en el alcance del challenge
- interfaz preparada para automatización e2e con Playwright

---

## Etapa 10 - Manejo de errores y 422

### Objetivo

Resolver errores del backend sin contaminar componentes con detalles de HTTP.

### Tareas

1. Definir un formato interno de error de aplicación.
2. Mapear `422` a errores comprensibles para la UI.
3. Mostrar mensajes accionables.
4. Diferenciar:
   - error por validación de negocio
   - error de red
   - error inesperado
5. Cubrir el caso en tests.

### Resultado esperado

- errores consistentes
- mensajes útiles
- integración limpia con backend

---

## Etapa 11 - Testing

### Objetivo

Cubrir el mínimo exigido y dejar evidencia clara de calidad.

### Tareas

1. Unit tests de:
   - validador de dominio
   - validador de CUIT
   - validador de fecha `YYYYMM`
2. Component/service tests de:
   - formulario con validaciones
   - error `422`
   - listado en loading
   - listado en empty
3. Si el tiempo alcanza:
   - e2e de alta + reasignación de titular

### Criterio

- priorizar tests de reglas y flujos críticos
- no buscar cobertura artificial
- enfocarse en confianza del negocio

### Resultado esperado

- evidencia concreta del funcionamiento crítico
- base para defender calidad técnica

---

## Etapa 12 - Performance

### Objetivo

Aplicar mejoras simples, reales y documentables.

### Decisiones a implementar y luego documentar

1. Lazy loading por feature.
2. Signals + `OnPush` para minimizar renders innecesarios.
3. `trackBy` en listas de automotores.
4. Separación de componentes para reducir recomposición.
5. Evitar lógica compleja en template.
6. Estado local liviano sin store sobredimensionado.

### Evidencia documental

Registrar al menos 3 decisiones en `docs/DECISION_LOG.md` con:
- problema
- decisión
- trade-off
- impacto esperado

---

## Etapa 13 - Documentación

### Objetivo

Cumplir con los entregables y dejar el challenge defendible.

### Tareas

1. Completar `docs/DECISION_LOG.md`.
2. Crear `docs/ESCALABILIDAD_FRONT.md` cubriendo:
   - estrategia para 20 formularios similares
   - librería interna UI
   - convenciones de formularios/validadores/errores
   - observabilidad frontend
   - evolución a i18n, feature flags, design tokens, CI quality gates
3. Completar `docs/IA_ACELERADORES.md` con uso real de IA.
4. Crear `README.md` con:
   - cómo levantar
   - cómo correr tests
   - supuestos técnicos
   - decisiones importantes
5. Documentar librerías agregadas y su justificación.

### Resultado esperado

- entrega prolija
- decisiones explícitas
- buena defensa técnica

---

## Etapa 14 - Docker y ejecución

### Objetivo

Permitir levantar la solución con un comando simple.

### Tareas

1. Definir estrategia de ejecución:
   - `web` + `mock server` como opción recomendada para este challenge
2. Crear `docker-compose.yml`.
3. Crear `.env.example`.
4. Asegurar arranque simple y documentado.
5. Verificar accesibilidad de la app una vez levantada.

### Resultado esperado

- ejecución predecible
- buena DX
- alineación con requisitos del challenge

---

## Estrategia de integración recomendada

### Opción elegida

Mock server tipado y documentado.

### Justificación

- el challenge evalúa frontend principalmente
- menor costo de implementación y mantenimiento
- mejor foco en UX, arquitectura, testing y calidad
- suficiente para demostrar integración realista
- permite controlar fácilmente escenarios de `422`, loading y error

### Condición

La capa de infraestructura debe quedar preparada para migrar a backend real sin reescribir componentes ni dominio.

---

## Orden de ejecución recomendado

1. Limpiar shell Angular y crear app root mínima.
2. Configurar lazy loading de `automotores`.
3. Crear estructura base de la feature.
4. Implementar modelos y validadores del dominio.
5. Crear tests unitarios de validadores.
6. Montar infraestructura HTTP/mock y mapeo de errores.
7. Implementar estado/orquestación.
8. Implementar listado.
9. Implementar formulario crear/editar.
10. Implementar flujo de titular por CUIT.
11. Agregar guard de cambios sin guardar.
12. Completar tests de componentes/servicios.
13. Documentar decisiones.
14. Preparar Docker y README.
15. Revisar accesibilidad, responsive y detalles finales.

---

## Riesgos y mitigaciones

### Riesgo 1

Dispersar lógica de negocio entre formulario, servicios y componentes.

Mitigación:
- centralizar validadores y reglas en `domain/`
- orquestar flujo desde `application/`

### Riesgo 2

Convertir sujeto/titular en una feature paralela.

Mitigación:
- mantener todos los artefactos de ese flujo dentro de `features/automotores/`

### Riesgo 3

Sobreingeniería en estado o arquitectura.

Mitigación:
- usar signals y store/facade liviano
- evitar NgRx u otras librerías salvo necesidad real

### Riesgo 4

Componentes demasiado grandes o con responsabilidades mezcladas.

Mitigación:
- separar páginas de componentes de UI
- mantener cada componente enfocado

### Riesgo 5

Quedar corto en entregables no funcionales.

Mitigación:
- reservar una etapa explícita para docs, tests y Docker
- no dejar estas tareas para el final sin planificación

---

## Criterio de calidad de aceptación interna

La implementación se considerará lista cuando:
- exista CRUD completo de automotores
- las validaciones de dominio, CUIT y fecha funcionen
- el flujo de alta de sujeto por CUIT inexistente esté resuelto
- los errores `422` se muestren con mensajes útiles
- la UI tenga estados de loading/empty/error/success
- haya lazy loading y mejoras de performance documentadas
- existan tests mínimos exigidos
- el proyecto pueda levantarse con Docker
- la documentación obligatoria esté presente y sea consistente

---

## Entregables finales esperados

- Front Angular funcional
- feature `automotores` como centro del dominio
- integración REST o mock server
- tests mínimos
- documentación obligatoria
- Docker y README
- estructura coherente y defendible técnicamente

---
# Challenge Tecnico - Frontend Engineer (Angular)

**Plazo:** 3 dias (72 h) desde que recibis este enunciado.

**Entrega:** envia un mail a **challenge@mindfactory.ar** con el **link al repo publico**.

**Dudas:** podes escribirnos a lucas.kail**@mindfactory.ar**

**Stack objetivo:** Angular + TypeScript + RxJS + integracion con API REST (NestJS o mock server)

**Input:** especificacion funcional (automotores + dueno por CUIT) y contratos de API.

**Output:** Front funcional, accesible, performante y documentado + Docker.

---

## Objetivo (que buscamos)

Queremos evaluar tu capacidad para construir un frontend solido de negocio: **UX clara**, **validaciones robustas**, **arquitectura mantenible**, **performance**, e **integracion limpia con backend**.

El dominio funcional sigue siendo el mismo (alta/CRUD automotor + dueno por CUIT), pero el foco principal esta en **como disenas y construis el Frontend**.

> Bonus de actitud: contanos decisiones, trade-offs y que medirias en produccion.
> 

---

## Alcance obligatorio

### Frontend (Angular) - foco principal

### 1) Funcionalidad

- Pantalla de **Listado**:
    - columnas: dominio, dueno, CUIT, fabricacion, acciones.
    - busqueda por dominio/CUIT.
    - ordenamiento por columnas principales.
    - paginacion (client o server side, justificar eleccion).
- Pantalla de **Formulario crear/editar**:
    - campos: dominio, chasis, motor, color, fecha fabricacion (YYYYMM), CUIT dueno.
    - alta, edicion y baja de automotor.
    - deteccion de cambios para evitar perdida de datos (guard de navegacion).

### 2) UX y accesibilidad

- Flujo usable para usuario no tecnico.
- Estados de carga/skeleton, vacio, error y exito.
- Mensajes accionables (no genericos).
- Accesibilidad base: labels, focus visible, navegacion con teclado, contraste razonable, `aria-*` donde aplique.
- Responsive minimo desktop/tablet.

### 3) Validaciones client-side (equivalentes al negocio)

- **Dominio:** `AAA999` o `AA999AA`.
- **CUIT:** validacion de formato + digito verificador (modulo 11).
- **Fecha fabricacion (YYYYMM):** 6 digitos, mes 1..12, no futuro.
- En crear/editar: si cambia CUIT, el flujo debe representar la **reasignacion de dueno responsable**.
- Si el CUIT no existe, permitir **crear sujeto** desde el front (modal/dialogo inline) y reintentar.

### 4) Integracion backend y buenas practicas

- Consumir API REST con capa de servicios y tipado fuerte (DTOs/interfaces).
- Manejo consistente de errores HTTP (incluyendo `422 Unprocessable Entity`).
- Uso correcto de interceptores/handlers (ej.: mapear errores, loader global opcional).
- Evitar logica de negocio desparramada en componentes (separar presentacion de orquestacion).
- Manejo de estado razonable (sin sobre-ingenieria): signals, RxJS, store liviano o alternativa justificada.

### 5) Performance y calidad tecnica

- `OnPush`/signals (o estrategia equivalente) en vistas relevantes.
- `trackBy` en listas y evitar renders innecesarios.
- Lazy loading por features.
- Evitar suscripciones colgadas (patrones de cleanup).
- Al menos 3 decisiones de performance explicadas en `docs/DECISION_LOG.md`.

### 6) Librerias (uso criterioso)

- Podes usar Angular Material, CDK, PrimeNG, NgRx, TanStack Query, etc., **siempre justificando** costo/beneficio.
- Penaliza incluir librerias que no aportan valor claro.
- Documentar que librerias agregaste y por que.

### 7) Testing Frontend

- **Unit tests** de validadores (CUIT, dominio, YYYYMM).
- **Component/service tests** para al menos:
    - formulario con validaciones,
    - flujo de error API (422),
    - listado (render y estado vacio o loading).
- Extra valorado: 1 e2e critico (Cypress/Playwright) del flujo alta + reasignacion.

---

### Backend (minimo, para integracion)

No evaluamos profundidad backend en esta prueba, pero si una integracion realista.

- Opcion A: usar backend propio liviano (NestJS recomendado).
- Opcion B: mock server (MSW, json-server, Prism, etc.) con contratos claros.
- Debe exponer al menos:
    - `GET /api/automotores`
    - `GET /api/automotores/:dominio`
    - `POST /api/automotores`
    - `PUT /api/automotores/:dominio`
    - `DELETE /api/automotores/:dominio`
    - `GET /api/sujetos/by-cuit?cuit=`
    - `POST /api/sujetos`
- Las reglas de error deben contemplar `422` para validaciones de negocio.

---

### Docker

- `docker-compose.yml` con servicios minimos para ejecutar la solucion.
- Si usas backend real: `db` + `api` + `web`.
- Si usas mocks: `web` + servicio de mocks documentado.
- `.env.example` y README con one-liner de arranque.
- Debe levantar con un comando y quedar accesible.

---

## Flujo de trabajo con Git

- Trabajar en ramas.
- Commits con criterio (ideal Conventional Commits).
- Minimo **2 PRs** (ej.: `frontend-core` y `performance-ux`).
- Cada PR debe incluir:
    - que / por que / como,
    - pruebas manuales,
    - trade-offs tecnicos.

---

## Mini-desafio de pensamiento: Como escalarias este Front?

Crea `docs/ESCALABILIDAD_FRONT.md` con:

- Estrategia para escalar a 20 formularios similares.
- Diseno de componentes reutilizables y libreria interna UI.
- Convenciones de formularios/validadores y manejo de errores.
- Estrategia de observabilidad frontend (Web Vitals, errores JS, trazas).
- Plan de evolucion (i18n, feature flags, design tokens, CI quality gates).

---

## Podes usar IA/aceleradores (con criterio)

Permitido usar ChatGPT u otros, siempre que documentes en `docs/IA_ACELERADORES.md`:

- Que pediste y por que.
- Como validaste lo generado.
- Riesgos y mitigaciones.
- Que descartaste y por que.

---

## Reglas y limites

- Front minimalista en estetica, fuerte en funcionalidad y calidad.
- No cambiar reglas de negocio clave (dominio, CUIT, fecha, reasignacion).
- Priorizamos decisiones tecnicas explicitas por encima de “hacer mucho”.

---

## Criterios de evaluacion (100 pts)

- **Arquitectura Frontend y mantenibilidad** - 20 pts
- **UX + Accesibilidad** - 18 pts
- **Validaciones client-side y fidelidad de reglas** - 18 pts
- **Integracion API + manejo de errores** - 14 pts
- **Performance (render, carga, estrategia)** - 12 pts
- **Testing Frontend** - 10 pts
- **Docker + DX (README, arranque simple)** - 8 pts

**Bonuses (hasta +5):** e2e solido, Storybook o metricas Web Vitals visibles.

---

## Entrega (recordatorio)

- Envia mail a **challenge@mindfactory.ar** con el link al repo publico.
- Inclui en README:
    - como levantar el proyecto,
    - como correr tests,
    - supuestos tecnicos,
    - decisiones relevantes.
- Tiempo maximo: **3 dias (72 h)**.

---

## Checklist de aceptacion rapida

- [ ]  La app permite listar, crear, editar y eliminar automotores.
- [ ]  Las validaciones de dominio, CUIT y YYYYMM funcionan en cliente.
- [ ]  El flujo de creacion de sujeto por CUIT inexistente esta resuelto.
- [ ]  La integracion con API maneja `422` con mensajes utiles.
- [ ]  Hay estados de loading/error/empty y UX consistente.
- [ ]  Existe evidencia de optimizaciones de performance.
- [ ]  Hay tests de validadores + pruebas de componentes/servicios criticos.
- [ ]  Docker/README permiten levantar y probar rapido.
- [ ]  Documentacion de decisiones y escalabilidad frontend incluida.
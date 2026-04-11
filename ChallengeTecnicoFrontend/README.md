# Challenge Tecnico Frontend

Aplicacion Angular para la gestion de automotores y titulares, integrada con la API del mismo repositorio.

## Stack

- Angular 21
- TypeScript
- Signals + RxJS
- Tailwind CSS v4
- Vitest

## Levantar el proyecto

### Frontend solo

```bash
npm install
npm start
```

La app queda disponible en `http://localhost:4200`.

Nota: `npm start` no agrega proxy al backend.

### Frontend en Docker

```bash
npm install
npm run start:docker
```

Esta variante usa `proxy.docker.json` y reenvia `/api` hacia `http://api:3000`.

### Full stack del repo

Desde la raiz `ChallengeTecnicoMindFactory/`:

```bash
docker compose up --build
```

## Scripts utiles

```bash
npm start
npm run start:docker
npm run build
npm test
```

## Alcance implementado

- listado de automotores con busqueda por dominio o CUIT
- ordenamiento por columnas principales
- paginacion client-side
- formulario de alta y edicion
- baja de automotor
- validaciones de dominio, CUIT y fecha `YYYYMM`
- deteccion de cambios sin guardar
- flujo inline de titular inexistente
- manejo consistente de errores HTTP incluyendo `422`
- pantallas responsive para listado y formulario

## Supuestos tecnicos

- La API base del frontend es `'/api'`.
- La paginacion del listado se resuelve en cliente porque el backend actual expone `GET /api/automotores` sin contrato paginado.
- En frontend se usa `Titular` como concepto de dominio; `Sujeto` queda reservado para DTOs e integracion.

## Supuestos de dominio

- `dominio`, `chasis` y `motor` son identificadores univocos de automotor en el padron.
- `CUIT` es identificador univoco de titular.
- Un titular puede tener varios automotores.
- Cambiar el `CUIT` en alta/edicion representa una reasignacion de titular.
- La baja de automotor se define como **baja fisica** para el alcance de esta entrega.

## Decisiones relevantes

- Arquitectura por feature (`features/automotores`) con separacion `domain` / `application` / `infrastructure` para aislar logica de negocio de integracion y UI.
- Manejo de errores HTTP con mapeo consistente (incluyendo `422`) para desacoplar componentes de `HttpErrorResponse`.
- Estrategia de performance con `OnPush` y `trackBy` en vistas de listado para reducir renders innecesarios.
- Validacion de negocio alineada con backend para `dominio`, `cuit` (modulo 11) y `fechaFabricacion` (`YYYYMM` no futura).
- Paginacion client-side como decision explicita por contrato actual de API (sin endpoint paginado).

## Testing

Incluye tests de:

- validadores de negocio
- formulario principal
- flujo de error API
- listado con estados y paginacion
- flujos end-to-end en `../e2e`

Ejecutar:

```bash
npm test
```

E2E:

```bash
cd ../e2e
npm test
```

## Estructura principal

```text
src/app/
  core/
  features/automotores/
    application/
    components/
    domain/
    infrastructure/
    pages/
    routes/
```

## Documentacion complementaria

- `docs/DECISION_LOG.md`
- `docs/ESCALABILIDAD_FRONT.md`
- `docs/IA_ACELERADORES.md`

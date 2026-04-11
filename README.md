# Challenge Tecnico MindFactory

Solucion full-stack para gestion de automotores y titulares:

- Frontend: Angular 21 (`ChallengeTecnicoFrontend`)
- Backend: Express 5 + Prisma + MySQL (`ChallengeTecnicoBackend`)
- E2E: Playwright (`e2e`)

## Como levantar el proyecto

Requisito: Docker + Docker Compose.

One-liner desde la raiz del repo:

```bash
docker compose up --build
```

Servicios levantados:

- Frontend: `http://localhost:4200`
- Backend/API: `http://localhost:3000`
- Healthcheck: `http://localhost:3000/health`

## Como correr tests

### Backend

```bash
cd ChallengeTecnicoBackend
npm test
```

Adicionales:

- `npm run test:unit`
- `npm run test:integration` (destructivo sobre la DB de test configurada)

### Frontend

```bash
cd ChallengeTecnicoFrontend
npm test
```

### End-to-End

```bash
cd e2e
npm test
```

Comandos utiles:

- `npm run test:list`
- `npm run test:headed`
- `npm run test:ui`

## Supuestos tecnicos

- El frontend consume la API via `'/api'`.
- En Docker, `ChallengeTecnicoFrontend` usa `npm run start:docker` con `proxy.docker.json` hacia `http://api:3000`.
- El backend usa flujo Prisma por `db push` (sin migraciones versionadas en el repo).
- El orden de arranque del contenedor API contempla: `prisma:push` -> `prisma:seed` -> `build` -> `start`.
- La paginacion del listado de automotores es client-side, dado que el backend actual no expone contrato paginado.
- En frontend, `Titular` se usa como concepto de dominio y `Sujeto` queda en DTO/integracion.

## Supuestos de dominio

- `dominio`, `chasis` y `motor` identifican de forma univoca a un automotor en el padron.
- `CUIT` identifica de forma univoca al titular.
- Un titular puede estar asociado a multiples automotores.
- Si cambia el `CUIT` del formulario, se interpreta como reasignacion de titular responsable.
- La baja de automotor se considera **baja fisica** (sale del padron operativo). Historial/auditoria de bajas queda fuera del alcance del challenge.

## Decisiones relevantes

- Se centralizo la validacion de existencia de titular en `POST /api/automotores`, devolviendo `422` cuando corresponde, para mantener consistencia transaccional del flujo.
- Se utilizo estructura por feature (`features/automotores`) para separar dominio, aplicacion e infraestructura y facilitar escalabilidad.
- Se aplicaron estrategias de performance en UI (OnPush + `trackBy`) para reducir renders innecesarios en listas.
- Se implemento manejo consistente de errores HTTP con mapeo centralizado, incluyendo casos `422 Unprocessable Entity`.
- Se uso Tailwind CSS como capa visual liviana para evitar dependencias UI pesadas sin valor claro para el alcance.

## Endpoints principales

- `GET /api/automotores`
- `GET /api/automotores/:dominio`
- `POST /api/automotores`
- `PUT /api/automotores/:dominio`
- `DELETE /api/automotores/:dominio`
- `GET /api/sujetos/by-cuit?cuit=`
- `POST /api/sujetos`

## Variables de entorno

Existe `.env.example` en la raiz. Copiar a `.env` solo si se necesita personalizar credenciales/host de MySQL.

## Documentacion complementaria

- Frontend: `ChallengeTecnicoFrontend/README.md`
- Decision log: `ChallengeTecnicoFrontend/docs/DECISION_LOG.md`
- Escalabilidad frontend: `ChallengeTecnicoFrontend/docs/ESCALABILIDAD_FRONT.md`
- IA/aceleradores: `ChallengeTecnicoFrontend/docs/IA_ACELERADORES.md`

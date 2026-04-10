# Challenge Tecnico MindFactory

## Levantar todo con Docker

```bash
docker compose up --build
```

Servicios:

- Frontend: `http://localhost:4200`
- Backend: `http://localhost:3000`
- Health API: `http://localhost:3000/health`

## Tests

- Backend: `cd ChallengeTecnicoBackend && npm test`
- Frontend: `cd ChallengeTecnicoFrontend && npm test`
- E2E: `cd e2e && npm test`

## Variables de entorno

Copiar `.env.example` a `.env` si queres personalizar credenciales de MySQL.

## Estructura

- `ChallengeTecnicoFrontend`: app Angular
- `ChallengeTecnicoBackend`: API Express + Prisma + MySQL
- `e2e`: suite Playwright end-to-end

## Pruebas E2E (Playwright)

Proyecto dedicado en `e2e/`.

```bash
cd e2e
npm test
```

Comandos utiles:

- `npm run test:list`: lista los casos E2E
- `npm run test:headed`: ejecuta en modo headed
- `npm run test:ui`: abre Playwright UI

La suite usa `http://localhost:4200` por defecto y puede levantar el stack completo con `docker compose up --build` desde la raiz.

## Documentacion

- Frontend: `ChallengeTecnicoFrontend/README.md`
- Decision log: `ChallengeTecnicoFrontend/docs/DECISION_LOG.md`
- Escalabilidad: `ChallengeTecnicoFrontend/docs/ESCALABILIDAD_FRONT.md`
- IA/aceleradores: `ChallengeTecnicoFrontend/docs/IA_ACELERADORES.md`

## Endpoints principales

- `GET /api/automotores`
- `GET /api/automotores/:dominio`
- `POST /api/automotores`
- `PUT /api/automotores/:dominio`
- `DELETE /api/automotores/:dominio`
- `GET /api/sujetos/by-cuit?cuit=`
- `POST /api/sujetos`

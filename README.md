# Challenge Tecnico MindFactory

## Levantar todo con Docker

```bash
docker compose up --build
```

Servicios:

- Frontend: `http://localhost:4200`
- Backend: `http://localhost:3000`
- Health API: `http://localhost:3000/health`

## Variables de entorno

Copiar `.env.example` a `.env` si queres personalizar credenciales de MySQL.

## Estructura

- `ChallengeTecnicoFrontend`: app Angular
- `ChallengeTecnicoBackend`: API Express + Prisma + MySQL

## Endpoints principales

- `GET /api/automotores`
- `GET /api/automotores/:dominio`
- `POST /api/automotores`
- `PUT /api/automotores/:dominio`
- `DELETE /api/automotores/:dominio`
- `GET /api/sujetos/by-cuit?cuit=`
- `POST /api/sujetos`

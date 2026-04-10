# AGENTS.md

- This repo is two separate npm projects, not a workspace:
  - `ChallengeTecnicoBackend`: Express 5 + Prisma + MySQL
  - `ChallengeTecnicoFrontend`: Angular 21 app

- Full-stack local startup is `docker compose up --build` from the repo root.
- Docker startup order matters: the API container runs `npm run prisma:push && npm run prisma:seed && npm run build && npm run start`.

## Backend (`ChallengeTecnicoBackend`)

- Install/run commands:
  - `npm run dev`
  - `npm run build`
  - `npm test`
  - `npm run test:unit`
  - `npm run test:integration`
  - `npm run prisma:generate`
  - `npm run prisma:push`
  - `npm run prisma:seed`

- There is no lint or standalone typecheck script. Use `npm run build` as the TypeScript verification step.
- Focused backend tests can be run directly with Vitest, for example:
  - `npx vitest run test/unit/services/automotores.service.spec.ts`
  - `npx vitest run test/integration/health.spec.ts`

- Backend test gotcha: integration tests are destructive against the configured MySQL database.
- `test/setup.ts` defaults `DATABASE_URL` to `mysql://challenge:challenge@127.0.0.1:3306/challenge_mindfactory`.
- `test/helpers/test-db.ts` calls `deleteMany()` on both tables before reseeding.
- Vitest is intentionally serialized in `vitest.config.ts` (`fileParallelism: false`, `maxWorkers: 1`) because tests share DB state.

- Prisma flow in this repo is `prisma db push`, not checked-in migrations.
- If you change `prisma/schema.prisma`, regenerate/sync explicitly:
  - `npm run prisma:generate`
  - `npm run prisma:push`
  - `npm run prisma:seed` if seed data must match

- Edit backend source under `src/`. `dist/` is build output from `npm run build`.
- Request flow is `routes -> controllers -> services -> repositories -> Prisma`.

## Frontend (`ChallengeTecnicoFrontend`)

- Install/run commands:
  - `npm start`
  - `npm run start:docker`
  - `npm run build`
  - `npm test`

- There is no repo lint script. Use `npm run build` for compile-time verification.
- The frontend API base URL is `'/api'` in `src/app/app.config.ts`.
- Docker dev uses `npm run start:docker`, which adds `proxy.docker.json` and forwards `/api` to `http://api:3000`.
- Plain `npm start` does not add that Docker proxy.

- Frontend shell stays in `src/app/` (`app.ts`, `app.config.ts`, `app.routes.ts`).
- Business code is centered in `src/app/features/automotores/` and split into `domain/`, `application/`, and `infrastructure/`.
- In frontend domain code, use `Titular`; reserve `Sujeto` for backend-facing DTO/infrastructure code.

- Validation rules for `dominio`, `cuit`, and `fechaFabricacion` exist in both frontend and backend. Keep both sides aligned when changing those rules.

- Frontend tests check specific accessibility hooks and IDs in form components. Preserve/update the related specs when changing markup.

- Follow the additional Angular-specific instructions already in `ChallengeTecnicoFrontend/AGENTS.md` for frontend edits.
- If AI assistance is used for frontend work, update `ChallengeTecnicoFrontend/docs/IA_ACELERADORES.md`.

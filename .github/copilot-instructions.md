# Repository: ecomm-with-microservices — Copilot Instructions

This short guide helps AI coding agents get productive quickly in this monorepo.

- Quick summary
  - Monorepo: Turborepo + pnpm. Root scripts: `pnpm dev` -> `turbo run dev`.
  - Frontends: `apps/markeetoo-ui`, `apps/markeetoo-dashboard` (Next.js, App Router, Tailwind).
  - Microservices (in `apps/`):
    - `product-service` — Express (port 8000)
    - `order-service` — Fastify (port 8001)
    - `payment-service` — Hono (port 8002)
  - Shared packages: `@repo/product-db` (Prisma client & types), `@repo/typescript-config`, `@repo/eslint-config`.

- Files to open first
  - Service bootstrap: `apps/*-service/src/index.ts` (health/test endpoints, server config).
  - Routes & controllers: `apps/*-service/src/routes/*.route.ts` and `apps/*-service/src/controllers/*.controller.ts`.
  - Auth middleware examples: `apps/product-service/src/middleware/authMiddleware.ts` (Express), `apps/order-service/src/middleware/authMiddleware.ts` (Fastify), `apps/payment-service/src/middleware/authMiddleware.ts` (Hono).
  - DB: `packages/product-db/` (Prisma schema: `packages/product-db/prisma/schema.prisma`, generated client: `packages/product-db/generated/prisma`).
  - Frontend entry: `apps/markeetoo-ui/src/app/*` and `apps/markeetoo-dashboard/app/*`.

- Dev & common commands
  - Install: `pnpm i`
  - Run all: `pnpm dev` (runs `turbo run dev` across the workspace)
  - Run single package: `pnpm --filter <pkg> dev` (e.g., `pnpm --filter product-service dev`)
  - Prisma tasks (when changing schema):
    - `pnpm --filter @repo/product-db db:migrate`
    - `pnpm --filter @repo/product-db db:generate`
    - `pnpm --filter @repo/product-db db:deploy`
  - Type checks: `pnpm --filter <pkg> check-types` or `pnpm check-types` (root)

- Env & runtime notes
  - **DATABASE_URL** is required by `@repo/product-db` and referenced in `turbo.json` build env.
  - Dev commands use `tsx --env-file=.env` or `pnpm dlx tsx --env-file=.env` — ensure `.env` contains Clerk keys and `DATABASE_URL`.
  - Product service config: CORS allows `http://localhost:3002` and `http://localhost:3003` (UI/dash), and listens on port `8000`.

- Architecture & patterns (explicit examples)
  - Minimal server pattern: register middleware (Clerk auth), mount routes, expose `/health` and `/test` endpoints.
  - Auth: Clerk adapters vary by framework — follow the existing `shouldBeUser` middleware pattern that validates auth and attaches `userId` (see `apps/*-service/src/middleware/authMiddleware.ts`).
  - DB usage: controllers import `Prisma` and `prisma` from `@repo/product-db` (example: `apps/product-service/src/controllers/product.controller.ts` uses `Prisma.ProductCreateInput` and `prisma.product.create({ data })`).
  - Naming conventions: keep `*.route.ts` and `*.controller.ts` suffixes for route/controller pairs.
  - Error handling: services use a final error handler that returns JSON errors (see `apps/product-service/src/index.ts`).

- Notable gotchas & verification steps
  - Many controller functions are scaffolds (e.g., `updateProduct`, `getProducts` are empty) — check implementations before relying on endpoints.
  - No test runner is configured; verify API changes manually with curl/Postman or add a test harness.
  - When touching Prisma/DB changes: run migrations + `db:generate` and ensure `DATABASE_URL` is set in env used by the dev process.

- Where to add package-specific guidance
  - Frontend: `apps/markeetoo-ui/.github/copilot-instructions.md` contains UI-specific guidance and examples — consult it for UI work.

- Quick examples
  - Run product service: `pnpm --filter product-service dev` (listens at `http://localhost:8000`).
  - Auth middleware: `apps/product-service/src/middleware/authMiddleware.ts` uses `getAuth(req)` and sets `req.userId` or returns 401.
  - DB create example: in `apps/product-service/src/controllers/product.controller.ts`:
    - `const data: Prisma.ProductCreateInput = req.body; const product = await prisma.product.create({ data });`

If you'd like, I can: (1) shorten or reformat this into a 20-line quick cheat-sheet, (2) add more examples for the order/payment services, or (3) add a short checklist for PR reviewers. Which would you prefer?

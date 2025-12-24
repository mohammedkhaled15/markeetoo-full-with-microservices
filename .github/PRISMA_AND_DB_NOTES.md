# Prisma & DB Quick Notes — ecomm-with-microservices

Purpose: a short, practical reference that documents the DB/Prisma issues we fixed, how to reproduce them, and how to debug them going forward. Keep this file handy when working on DB-related issues.

## Summary of changes made
- Fixed broken exports and missing generated client error:
  - `packages/product-db/src/index.ts` now exports the usable API: `prisma` and `getPrismaClient()`.
- Avoided import-time crashes by lazy-initializing Prisma:
  - `packages/product-db/src/client.ts` now creates the `PrismaClient` only when first used.
  - `prisma` is exported as a Proxy so existing imports (`import { prisma } from '@repo/product-db'`) continue to work.
- Resolved Prisma engine/constructor issues:
  - Set `generator client { engineType = "binary" }` in `packages/product-db/prisma/schema.prisma` to prefer the binary engine for local dev.
  - Removed invalid runtime `datasources` option from PrismaClient constructor (the constructor validator rejects unknown options).
  - Added a safe default for `PRISMA_CLIENT_ENGINE_TYPE=binary` at runtime when not present and improved error messages to show engine state.
- Added guidance to the repo-level `.github/copilot-instructions.md` about `DATABASE_URL` and the lazy-init behavior.

## Quick reproduction & fixes
- Common failure: "Cannot find module '../generated/prisma/client'"
  - Cause: Prisma client was not generated or exports were wrong.
  - Fix: run `pnpm --filter @repo/product-db db:generate` and ensure `packages/product-db/src/index.ts` exports the client.

- Common failure: "PrismaClient needs to be constructed with a non-empty, valid PrismaClientOptions"
  - Cause: some Prisma builds require explicit engine selection or validate constructor options.
  - Fixes we applied:
    - `engineType = "binary"` in `packages/product-db/prisma/schema.prisma` and run `pnpm --filter @repo/product-db db:generate`.
    - Construct the client with no invalid options (don't pass `datasources` to the constructor). Use `DATABASE_URL` env var.
    - If you still hit engine errors, set `PRISMA_CLIENT_ENGINE_TYPE=binary` in your environment.

## How to test DB from this repo
- Ensure `.env` in the service you run has a valid `DATABASE_URL` (example in `apps/product-service/.env`):

  DATABASE_URL="postgresql://admin:123456@localhost:5432/products?schema=public"

- Generate Prisma client (after schema changes):
  - pnpm --filter @repo/product-db db:generate

- Quick import test (run inside a service folder where .env is available):
  - pnpm dlx tsx --env-file=.env -e "import('@repo/product-db').then(m=>console.log('OK', !!m.prisma)).catch(e=>console.error(e.stack||e))"

- Quick connect test (node):
  - From the repo root (ensure DATABASE_URL is set):
    - node -e "(async()=>{ const { getPrismaClient } = require('./packages/product-db/src/client'); const c = getPrismaClient(); await c.$connect(); console.log('connected'); await c.$disconnect(); })().catch(e=>console.error(e))"

## How to debug runtime errors
- If the service crashes at import time:
  - Check `.env` loading (services use `tsx --env-file=.env` in dev scripts).
  - Confirm `DATABASE_URL` is present and valid.
  - Run `pnpm --filter @repo/product-db db:generate`.
- If you get a constructor validation error about unknown properties:
  - Do not pass `datasources` to the Prisma constructor (it's rejected by the validator).
  - Use environment variables + `prisma generate` + engineType in schema.
- If engine errors persist:
  - Try exporting `PRISMA_CLIENT_ENGINE_TYPE=binary` in your env.
  - Check `packages/product-db/prisma/schema.prisma` `generator` block for `engineType`.

## Files changed (for reference)
- packages/product-db/prisma/schema.prisma (added `engineType = "binary"`)
- packages/product-db/src/client.ts (lazy initialization, `prisma` Proxy, `getPrismaClient()`)
- packages/product-db/src/index.ts (export `prisma` and re-export Prisma types)
- .github/copilot-instructions.md (note about `DATABASE_URL` and lazy init)

## Example: create a category (Product Service)
- Service: `product-service` (Express) — runs on `http://localhost:8000`
- Route: POST `/categories`
- Example body (JSON):
  {
    "name": "Apparel",
    "slug": "apparel"
  }

If you get a 500 and a Prisma error, copy the full server stack trace and the request body — include both and we'll diagnose quickly.

---

Note about this file: I will update this file as I make additional DB/Prisma fixes so it remains a single point of truth for these issues. If you want me to stop auto-updating it, tell me and I'll stop without making further changes.
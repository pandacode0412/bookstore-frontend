# AGENTS.md — Frontend (instructions for code assistants)

## Identity
`bookstore-frontend`: Next.js App Router + TypeScript + Tailwind; distinct repo from NestJS backend. API-first, **no direct DB/Prisma from frontend**, no duplicate business rules. Starter pages are not finished checkout UI.

## Read first
1. `AI_CONTEXT.md`, `docs/01-UI-UX.md`.
2. `docs/02-FRONTEND-ARCHITECTURE.md` and `docs/03-API-INTEGRATION.md`.
3. Backend canonical contract `../bookstore-backend/contracts/openapi.yaml` and `../bookstore-backend/docs/02-SRS.md` (when sibling repo is present).
4. `docs/04-FRONTEND-BACKLOG.md`, feature source.

## Rules
- No SQL/Prisma/DB driver in FE. Backend owns price, stock, orders, authorization.
- Server components for SEO/catalog; client components for interactions.
- Avoid hardcoded mock data once API endpoint exists. Surface loading/empty/error states.
- Do not store auth cookies or bearer tokens in localStorage. Browser cookie auth needs CSRF design.
- Update shared API contract, backend Swagger metadata, and relevant Markdown docs for every API/UI change; never silently invent endpoint/payload.
- Meet responsive/mobile and accessible form input requirements.
- When implementing task: include testing evidence, API compatibility, current status (implemented vs planned).

## Current starter
Home and book detail read published books. `/admin` is placeholder. Auth/cart/checkout are not implemented.

# AI Agent Instructions — Bookstore Frontend

This repository is a Next.js App Router + TypeScript storefront and Admin application. It is separate from the NestJS backend. The frontend is API-first: **never access Prisma, SQL, or the database directly**, and never duplicate backend business rules.

## Read before changing Admin UI

1. Read `AI_CONTEXT.md` and [`docs/UI_DESIGN_SYSTEM.md`](docs/UI_DESIGN_SYSTEM.md). The latter is the primary visual source of truth for Admin.
2. When changing Category Management, also read [`docs/ADMIN_CATEGORIES_SPEC.md`](docs/ADMIN_CATEGORIES_SPEC.md).
3. When changing Book Management, also read [`docs/ADMIN_BOOKS_UI.md`](docs/ADMIN_BOOKS_UI.md).
4. Inspect the route, relevant component, `src/app/admin.css`, existing UI components, routing, API client, auth guard, and icon dependency before editing.
5. Read `docs/01-UI-UX.md`, `docs/02-FRONTEND-ARCHITECTURE.md`, and `docs/03-API-INTEGRATION.md` for the applicable feature.
6. When a sibling backend repository is present, verify the canonical contract in `../bookstore-backend/contracts/openapi.yaml` and the related SRS/API documentation before changing an API consumer.

## Required Admin UI rules

- Admin is a **modern, compact, clear, consistent SaaS interface**. Preserve Bookstore's forest-green visual identity and the approved tokens; do not substitute a different palette without explicit approval.
- Use exactly one icon system across Admin. `lucide-react` is installed, so use Lucide icons. Do not use emoji, Unicode glyphs as fake icons, or mixed icon libraries.
- Buttons must have usable hover, focus-visible, disabled, and loading states. Every icon-only button requires an accessible name (`aria-label`) and a suitable tooltip/title when the label is not visible.
- Admin data must come from the backend. Never ship hardcoded categories, books, customers, dashboard values, or a decorative action without a working behavior.
- Do not repeat an input form in every row of a management table. Lists use tables; create/edit uses one dedicated modal, drawer, or appropriately scoped form surface.
- Status toggles and destructive actions must call the API, present API errors, and require the backend's ADMIN authorization. The UI never substitutes for authorization.
- Preserve existing routes, authentication, API compatibility, CRUD flows, and client-side CSRF handling. A UI-only task must not change backend/API/database logic.
- Support Vietnamese text, keyboard navigation, visible focus, screen readers, desktop and mobile without horizontal page overflow.

## General frontend rules

- Backend owns price, stock, order state, and authorization. Server components serve SEO/catalog paths; client components own interactive state.
- Do not store credentials, auth cookies, CSRF values, or bearer tokens in localStorage.
- When an API already exists, do not replace it with a mock. Provide loading, empty, error, success, forbidden, and retry states appropriate to the flow.
- Update the shared API contract, Swagger metadata, and affected Markdown only when API behavior changes. Never invent endpoint names, fields, or payloads.

## Completion checklist for UI work

1. State each changed file and the reason for it.
2. Verify interactions, API compatibility, validation, loading, empty, error, success, disabled, and authorization states relevant to the task.
3. Verify layouts at 375px, 768px, 1024px, and 1440px. If browser QA is unavailable, state that limitation and run type/build checks instead.
4. Update `docs/UI_DESIGN_SYSTEM.md` whenever a reusable Admin pattern or token changes. Update `docs/ADMIN_CATEGORIES_SPEC.md` whenever Category Management behavior/presentation rules change.
5. State explicitly which requested capability is not implemented because the backend/API does not support it; never fabricate it in the interface.

## Priority order

User request → security and working behavior → backend contract → UI design system → local code style.

When the UI documentation conflicts with a real backend limitation, keep the UI honest, explain the limitation in the relevant documentation, and propose the backend change separately.

## Current implementation

Storefront catalog, authentication, cart, COD checkout, customer orders, and SEO routes are implemented. The protected `/admin` area currently has dashboard, book, category, banner, order, and customer modules backed by real APIs. File upload, standalone promotions/coupons, inventory-adjustment UI, and time-series reporting remain unavailable until their backend contracts are implemented.

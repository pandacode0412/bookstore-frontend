# AI Context — Frontend quick index

**Project:** Bookstore E-commerce Vietnamese B2C physical books.
**Backend:** sibling `bookstore-backend` NestJS modular monolith, API base `/api`.
**Stack:** Next.js App Router + TS + Tailwind CSS; admin/storefront in same frontend repo.
**Endpoints actually working:** GET `/health`, catalog/category routes, session auth, persistent cart, GET/POST `/addresses`, POST `/orders`, GET `/orders/me`, GET `/orders/:id`, POST `/orders/:id/cancel`, and ADMIN-only GET `/admin/dashboard`. Other admin operations remain specs. Checkout is COD-only and server-authoritative for prices and stock.
**Money:** VND integer; effective display price salePriceVnd ?? priceVnd, browser estimates only.
**SSR base:** `API_INTERNAL_URL=http://api:4000/api` in Docker.
**Browser base:** `NEXT_PUBLIC_API_URL=http://localhost:4000/api`.
**Decision authority:** backend `contracts/openapi.yaml` + `docs/02-SRS.md`; no invented contracts.

## AI next steps
Admin catalog/order/inventory operations, then reporting. Always implement loading, empty, error states + small screens.

## Dev caveat
Starter is an educational scaffold, not secured/completed retail system.

**SEO:** Storefront metadata, product/breadcrumb JSON-LD, `robots.txt`, and dynamic `sitemap.xml` are implemented. Set `NEXT_PUBLIC_SITE_URL` to the production HTTPS origin before deployment; never index auth/admin pages.

**Admin access:** `/admin` is hidden from public navigation and client-gated using `GET /auth/me`. This is UX only; any future `/api/admin/*` endpoint must use a server-side ADMIN role guard.

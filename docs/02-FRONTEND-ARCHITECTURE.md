# Frontend Architecture — Next.js App Router

## Principles
- Next.js + TypeScript + Tailwind baseline. No direct DB/Prisma access.
- `next.config.ts` disables the development indicator so local review matches the end-user interface; this has no production-runtime impact.
- Server components for catalog fetching/SEO; client components for user interactions/cart/form state.
- Typed API client from OpenAPI planned (`../bookstore-backend/contracts/openapi.yaml`).
- Auth cookie handling must preserve HttpOnly; do not store credentials/tokens in localStorage.

## Suggested structure
```text
src/
  app/
    page.tsx
    books/{page.tsx,[slug]/page.tsx}
    cart/page.tsx
    checkout/page.tsx
    orders/{page.tsx,[id]/page.tsx}
    admin/{page.tsx,books/page.tsx,orders/page.tsx}
  components/{layout,books,cart,forms,ui}/
  features/{auth,catalog,cart,checkout,orders,admin}/
  lib/{api,format,validators}/
  types/
```

## Fetching
- Server-side in Compose: `API_INTERNAL_URL=http://api:4000/api`.
- Browser requests: `NEXT_PUBLIC_API_URL=http://localhost:4000/api`.
- Cookies: design same-site dev/prod URL scheme before implementing real authentication (separate origins require correct cookie and CSRF config).
- Return typed errors, avoid swallowing backend errors. Starter home offers basic graceful failure.

## SEO architecture
- Metadata belongs in server routes using Next.js Metadata API; client forms must not control SEO tags.
- Product detail uses `generateMetadata` from the canonical backend book record and emits Product/Breadcrumb JSON-LD server-side.
- `app/robots.ts` and `app/sitemap.ts` are the canonical crawler entry points. Keep their public paths aligned with real routes and never add private/auth/admin paths to the sitemap.
- Set `NEXT_PUBLIC_SITE_URL` to the deployed HTTPS storefront origin before release. The localhost fallback is only for development.

## State design
- Catalog search in URL search params for sharable SEO pages.
- Cart is persisted in backend per user; client state for UI optimism only.
- Checkout idempotency key is retained while address/note are unchanged after a failed attempt; changing either starts a new order attempt with a new UUID.
- Admin stays in this deployment as a protected `/admin` route, not a separate public application. UI role gates improve navigation but never replace backend `/api/admin/*` role authorization.

## Component contracts
BookCard accepts `Book`, displays effective price `salePriceVnd ?? priceVnd`, displays disabled when `stock===0`. CheckoutSummary displays **estimated** total until server creates order.

## Testing
Unit components/forms with React Testing Library; E2E with Playwright; contract checks with OpenAPI schema. To be implemented in later sprints.

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

`HomeHeroCarousel` is a client component because it owns the three-slide autoplay, keyboard-accessible controls, pause behavior and touch gesture state. It uses local image assets and `next/image`; it has no API dependency or effect on the server-rendered catalog data below it.

`SiteHeader` is a client layout component because it tracks the mobile navigation drawer, derives active primary-route links from the App Router pathname, loads public categories from `GET /categories`, and links catalog collections to the typed `bestselling`/`onSale` query contract. It listens for the local `bookstore:categories-changed` event after an ADMIN category mutation so menu data is re-fetched without a full browser refresh. It composes the existing `CatalogSearch` and `AuthNavigation`; `HeaderCommerceActions` reads the existing `/cart` and `/wishlist` endpoints only to show non-zero account counts, and silently omits badges for guests or unavailable data. `notifyAuthSessionChanged()` publishes the client-only `bookstore:auth-session-changed` event after successful login, register, or logout, so the persistent root-layout header re-reads `/auth/me` and renders the user name/avatar without a full browser reload. This keeps navigation presentation separate from commerce mutations.

`SiteChrome` keeps storefront header/footer out of `/admin`; the nested admin layout applies `AdminGate` then `AdminShell`. Each admin module calls the cookie/CSRF-aware `browserApi` only and does not derive prices, role permissions, status validity, or inventory rules in the client. The home server component fetches `GET /banners` and supplies `HomeHeroCarousel` with real banner records; no slide definitions are embedded in UI code.

## Testing
Unit components/forms with React Testing Library; E2E with Playwright; contract checks with OpenAPI schema. To be implemented in later sprints.

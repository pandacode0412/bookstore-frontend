# Frontend ↔ Backend Integration Contract

Canonical contract: `../../bookstore-backend/contracts/openapi.yaml` when repositories are siblings.

## Environment
`NEXT_PUBLIC_API_URL`: browser-visible base URL (no secrets).
`API_INTERNAL_URL`: SSR/server-component base URL; Compose uses `http://api:4000/api`.

## Implemented catalog

`GET /categories` returns only categories with at least one published book. `GET /books` supports `page`, `limit`, `q`, `category` (slug), and `sort` (`newest`, `price_asc`, `price_desc`). Price sorting is by the backend's `priceVnd`; the UI's displayed sale price remains `salePriceVnd ?? priceVnd`.

## Example catalog
```ts
const base = process.env.API_INTERNAL_URL ?? 'http://localhost:4000/api';
const response = await fetch(`${base}/books?page=1&limit=12`, { cache: 'no-store' });
if (!response.ok) throw new Error(`Catalog unavailable (${response.status})`);
const data = await response.json();
```

## Auth implementation
- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, and `POST /auth/logout` are implemented. Both successful registration and login set the backend's `HttpOnly` `bookstore_session` cookie; the frontend never reads or stores the token.
- Browser requests use `{ credentials: 'include' }`; backend CORS is configured to the Compose frontend origin (`http://localhost:${WEB_PORT:-3000}`).
- The browser API wrapper ends a stalled JSON request after 10 seconds. Multipart image uploads receive a 30-second limit because the API must forward the image to Cloudinary. A network failure is presented as a retryable connection error; it is not treated as an unauthenticated (`401`) response.
- `POST /auth/register` requires a valid email and a 6–128 character password. A successful registration signs the customer in and redirects them to the storefront home page.
- CSRF validation is required before adding authenticated commerce mutations; CORS alone is not CSRF protection.

## Cart implementation
- `GET /cart`, `POST /cart/items`, `PATCH /cart/items/{bookId}`, and `DELETE /cart/items/{bookId}` are implemented. Cart pages use server responses for the current effective price and estimated subtotal.
- Login sets a readable `bookstore_csrf` cookie at path `/` alongside the HttpOnly session cookie at `/api`. The browser wrapper can therefore send its value as `X-CSRF-Token` from every frontend route for non-GET requests; never put either value in localStorage.
- A `401` from add-to-cart routes to login. A `409` means stock or availability changed; reload the cart and show the server response.
- Handle 401: redirect login; 403: forbidden UI; 409: conflict toast + refresh; 5xx: retry affordance.

## Wishlist implementation
- `GET /wishlist`, `POST /wishlist/items`, and `DELETE /wishlist/items/:bookId` are cookie-authenticated. The header heart links to the private `/wishlist` page; the book detail action loads the saved state and toggles it.
- A `401` from the toggle redirects to login. Saves and removes include the CSRF header through `browserApi`; the client never uses localStorage as a substitute for the server list.

## Delivery address, checkout, and customer orders
- `GET /addresses` and `POST /addresses` are cookie-authenticated. The checkout page lets a customer save a delivery address then select it; `/account` also lists saved addresses. Saved addresses never come from mock data.
- `POST /orders` accepts `{ addressId, paymentMethod: 'COD', note? }` and an `Idempotency-Key` UUID header. The checkout client holds that UUID for an unchanged failed attempt so a network retry returns the original order rather than creating a duplicate. Changing selected address or note creates a new key.
- The frontend only displays API totals. It does not send unit prices, shipping totals, stock values, or an inline address snapshot to checkout.
- `GET /orders/me`, `GET /orders/:id`, and `POST /orders/:id/cancel` back `/orders` and `/orders/[id]`. Cancellation is offered only while API status is `PENDING`; the server remains authoritative.
- Checkout and order pages are private and carry `noindex` metadata. Loading, login-required, empty, and API-error views are explicit.

## ADMIN dashboard

- `GET /admin/dashboard` is a cookie-authenticated ADMIN endpoint. It returns book/order/customer metrics, delivered-only revenue, a zero-filled order-status distribution, at most five newest orders, and delivered-order top sellers.
- The dashboard UI does not calculate revenue or infer status totals. It displays the response and handles `401`, `403`, loading, network error, and retry states.

## ADMIN content operations

- `GET /admin/books?page&limit&q&status&categoryId`, `GET /admin/books/summary`, `GET /admin/books/{id}`, `POST /admin/books`, and `PATCH /admin/books/{id}` back the Book Management list and dedicated create/edit routes. The summary is a database count contract (total/published/draft/archived/out-of-stock), not client arithmetic over a page. Payloads contain VND integer values, category UUID, status, URL-based cover/gallery, and author names; server validation remains authoritative. Hard deletion is intentionally unsupported; archive with `{ status: 'ARCHIVED' }` instead.
- The storefront renders cover images from the public response field `coverUrl`; it does not embed demo book covers. A successful ADMIN create/update emits a client-only catalog invalidation event. Newly created books default to `PUBLISHED` in the Admin form so they appear in public `GET /books`; a book intentionally saved as `DRAFT` or `ARCHIVED` remains absent because the backend public route filters to `PUBLISHED`.
- `POST /admin/media/images` accepts multipart `file` plus `purpose` (`book-cover`, `book-gallery`, or `banner`) for an authenticated ADMIN with the normal CSRF header. It returns `{ url, width, height, bytes, format }` from Cloudinary. The reusable upload control checks JPEG/PNG/WebP and 8 MB in the browser, then lets backend remain authoritative for role, CSRF, MIME/signature, and final size validation. It presents a truthful configuration/API error instead of falling back to a fake URL.
- `GET/POST/PATCH /admin/banners` backs the Banner module; public home carousel data is `GET /banners`. Cloudinary image URLs are permitted by the existing URL contract. `next.config.ts` allows the trusted `res.cloudinary.com` hostname so optimized carousel images render correctly.
- `GET /admin/orders?page&limit&status&q` plus `PATCH /admin/orders/{id}/status` backs the Order module. `q` is submitted search for order code/customer name/customer email; the public frontend does not invent unsupported date filtering. `GET /admin/dashboard` supplies the order view's total/pending/processing/delivered KPI values. The UI only offers backend-supported next statuses and asks for explicit confirmation before cancellation.
- `GET /admin/customers` backs the Customer module and exposes no client-side account mutation.
- Books, orders, and customers send the backend-supported `page` and `limit=20` query parameters. Orders/customers only apply the typed `q` filter after a search form submission; changing a status filter resets to page 1. The shared pager renders API `meta` directly and never synthesizes a total.
- When an ADMIN selects `CANCELED`, the frontend requires an additional confirmation dialog before it sends `PATCH /admin/orders/{id}/status`. The backend remains the only authority for a valid transition and one-time stock restoration.

## Ownership boundaries
Never calculate authoritative total in frontend; local numbers are display estimates. Never accept client `priceVnd` when creating order. Only Backend updates inventory/order states.

## Contract sync procedure
1. API change proposed in backend OpenAPI.
2. Frontend updates generated types/API wrapper or local interfaces.
3. Validate response/field compatibility.
4. Merge/change coordination by breaking-change label.

## MVP statuses
Catalog, active banners, Auth, Cart, saved Address, checkout, customer Order endpoints, documented ADMIN dashboard/content endpoints, and ADMIN Cloudinary image upload are implemented. Inventory adjustment and standalone coupon engine remain outside the current contract.

# Frontend Task Board

- [x] F-000 Bootstrap Next.js + storefront page / book detail / admin placeholder.
- [x] F-001 Catalog grid/filter/search/pagination/sort query state; loading/empty/error.
- [x] F-002 Auth login/register/logout and current user.
- [x] F-003 Customer cart (add/update/delete, persisted state, estimated summary, empty/error).
- [x] F-004 Checkout form with saved-address creation/selection and COD placement; safe retry key per unchanged attempt.
- [x] F-005 Customer order history/detail and PENDING-only cancellation UI.
- [x] F-005a Customer wishlist: persistent save/remove, detail toggle and private list page.
- [x] F-006 Admin layout, role gates, book/category forms. Isolated role-gated shell plus category/book/banner/customer modules are implemented against real APIs.
- [~] F-007 Admin orders statuses, inventory adjustment, dashboard. Dashboard and guarded order transitions are implemented; a dedicated inventory-adjustment screen remains backlog.
- [ ] F-008 Accessibility, responsive and E2E regression (responsive/UI baseline and technical SEO metadata, robots, sitemap, Product/Breadcrumb JSON-LD implemented; E2E/manual accessibility regression remains).
- [x] F-009 Catalog discovery endpoints: public `GET /books?sort=bestselling` ranks `DELIVERED` quantities only; `GET /books?onSale=true` filters public books with sale prices. The header and catalog filters use the typed API contract, with an honest empty state when no delivered sales exist.

Each task requires linked backend endpoint, error cases, screenshot/manual check, documentation update, and tests.

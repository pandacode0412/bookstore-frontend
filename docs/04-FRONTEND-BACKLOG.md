# Frontend Task Board

- [x] F-000 Bootstrap Next.js + storefront page / book detail / admin placeholder.
- [x] F-001 Catalog grid/filter/search/pagination/sort query state; loading/empty/error.
- [x] F-002 Auth login/register/logout and current user.
- [x] F-003 Customer cart (add/update/delete, persisted state, estimated summary, empty/error).
- [x] F-004 Checkout form with saved-address creation/selection and COD placement; safe retry key per unchanged attempt.
- [x] F-005 Customer order history/detail and PENDING-only cancellation UI.
- [x] F-005a Customer wishlist: persistent save/remove, detail toggle and private list page.
- [x] F-006 Admin layout, role gates, book/category forms. Isolated role-gated shell plus category/book/banner/customer modules are implemented against real APIs.
- [~] F-007 Admin orders statuses, inventory adjustment, dashboard. Dashboard, guarded order transitions (including cancellation confirmation), reusable API-backed list pagination, and responsive Admin UI are implemented; a dedicated inventory-adjustment screen remains backlog because its API is still planned only.
- [ ] F-008 Accessibility, responsive and E2E regression (responsive/UI baseline and technical SEO metadata, robots, sitemap, Product/Breadcrumb JSON-LD implemented; E2E/manual accessibility regression remains).
- [x] F-009 Catalog discovery endpoints: public `GET /books?sort=bestselling` ranks `DELIVERED` quantities only; `GET /books?onSale=true` filters public books with sale prices. The header and catalog filters use the typed API contract, with an honest empty state when no delivered sales exist.
- [x] F-010 Dynamic storefront catalog integrity: home/catalog/detail render public API records without static book data; ADMIN book mutations invalidate open storefront views, and product cards/cart use the actual `coverUrl` or an explicit no-cover state.
- [x] F-011 ADMIN Cloudinary image upload: protected backend multipart upload, reusable book cover/gallery and banner controls, Cloudinary URL persistence through existing content APIs, plus loading/error validation states.
- [x] F-012 ADMIN orders UX: compact responsive order operations screen using real dashboard KPIs, submitted server filters, paginated table/card records, accessible detail drawer, and backend-validated status transitions without unsupported date filters.
- [x] F-013 ADMIN book management UX: dedicated list/create/edit routes, real book summary/category filters, responsive table/cards, Cloudinary media editing, catalog invalidation, and archive-instead-of-delete workflow.

Each task requires linked backend endpoint, error cases, screenshot/manual check, documentation update, and tests.

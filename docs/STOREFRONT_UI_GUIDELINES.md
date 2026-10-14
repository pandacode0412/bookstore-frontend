# Customer Storefront — UI & UX Guidelines

**Version:** 1.0 | **Updated:** 2026-10-14 | **Scope:** customer-facing site (not `/admin/**`).

**Required reading:** `docs/SHARED_DESIGN_SYSTEM.md`, then this file.

## 1. Goals

A polished, trustworthy Vietnamese bookstore: fast book discovery, clear book imagery, readable price/discount, easy wishlist/cart, straightforward login and checkout. Match the existing Bookstore forest-green brand, and avoid copying the Admin dashboard layout.

## 2. Public Header & Navigation

- Desktop: Bookstore logo, Category menu, prominent real search, Wishlist, Cart, Account actions; concise secondary navigation for book discovery.
- Avoid duplicate Wishlist/Orders between primary and secondary navigation. Categories are loaded from backend, not hardcoded.
- Wishlist/cart count badges only reflect real state; preserve auth/session/cart behavior.
- Mobile: compact navigation with accessible menu/drawer; search remains easy to access; no horizontal overflow.
- Navigational links must point to real routes; active/hover/focus state visible.

## 3. Hero Banner / Carousel

- **Full-width single-slide carousel** under the header; display one banner at a time (not 3 columns).
- Read active banners from backend, honor display order and destination link. The current 3 existing banners are data, not a permanent limit.
- Visible previous/next buttons near left and right edges; accessible labels, keyboard interaction, mobile swipe if feasible.
- Optional autoplay ~5s with smooth transition ~500ms; pause on hover/focus and respect reduced motion.
- Provide pagination indicators; handle 0 or 1 banner without broken controls.
- Keep image crop intentional; allow mobile-specific asset/focal point if supported; no intrusive overlay on text already embedded in image.
- Prioritize first slide loading; prevent layout shift.

## 4. Browse & Product Cards

- Product category navigation comes from active backend categories. Filters/search/sort operate on API-supported values.
- Product card: book cover, title, author when available, current price, original price/discount only when valid, stock state and primary action.
- Responsive grid, coherent cover aspect ratios, readable titles; consistent image placeholders.
- Book lists for New, Best Selling, Promotions must use real backend definitions, not fabricated rankings or dummy data.
- Empty/loading/error states, pagination or load more according to actual API implementation.

## 5. Authentication, Cart & Checkout

- Auth card approximately max-width 440px for compact forms; avoid oversized headings.
- Login/Register share foundations: proper input labels, `Eye` / `EyeOff` visibility toggles for password fields; each toggle maintains independent state. Accessible buttons with `type="button"` inside forms.
- Validate on client for UX but never bypass backend validation. Preserve API, auth and redirect behavior.
- Cart and checkout: prices and totals revalidated server-side, loading and actionable error states, and no fake payment confirmation.
- Clear order status and return paths.

## 6. Layout & Responsive

- Product sections generally use a consistent centered content container; **Hero banner may be full-bleed** independent of container.
- Storefront headings may be more expressive than Admin, but maintain hierarchy, type scale and readable line lengths.
- Desktop 1440px: header, full-width hero, featured book sections. Mobile 375px: navigation drawer, manageable image ratios, single/two-column grid when readable.
- Tap targets suitable for touch; visible focus, no hover-only actions.

## 7. Dynamic Admin → Storefront contract

```text
Admin CRUD (authenticated + authorized)
    → Backend API → Database / Asset storage
    → Public read API for active/published records
    → Storefront cache refresh / revalidation
    → Updated categories/books/banners/prices appear to customers
```

Admin changes should persist after reload, storefront should fetch real data, and caching/revalidation should be intentional. If immediate real-time updates are not required, normal fetch/revalidation is enough; do not add WebSockets unnecessarily.

## 8. Storefront done criteria

- [ ] Same brand/foundation tokens and icon family as Admin.
- [ ] Distinct shopping-focused layout, not an Admin sidebar/table on public pages.
- [ ] Menus, product lists and banners use real backend data.
- [ ] Banner full width, one slide visible, arrows + controlled autoplay when >1 slide.
- [ ] Login/Register password icons, cart links, navigation and filters work.
- [ ] Accessible labels, focus states, loading/errors, responsive behavior.
- [ ] Tested 375/768/1024/1440px.

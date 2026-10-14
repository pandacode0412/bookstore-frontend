# Admin UI Design System

## Scope and authority

This document is the visual source of truth for the protected `/admin` area. It supplements `01-UI-UX.md`; it does not alter backend contracts, authorization, or storefront styling.

## Brand tokens

Keep the approved Bookstore forest-green identity. The Admin implementation defines these tokens in `src/app/admin.css`, scoped under `.admin-app`:

| Token | Value | Use |
|---|---:|---|
| `--admin-brand` | `#185443` | Primary actions, icons, focus context |
| `--admin-brand-strong` | `#123F33` | Sidebar and strong brand surfaces |
| `--admin-brand-soft` | `#EAF4EF` | Selected/hover soft surface |
| `--admin-page` | `#F8FAF9` | Page background |
| `--admin-surface` | `#FFFFFF` | Cards, forms, dialogs |
| `--admin-text` | `#182F27` | Main text |
| `--admin-muted` | `#65756E` | Supporting text |
| `--admin-border` | `#E5EAE7` | Quiet borders |
| `--admin-danger` | `#DC2626` | Destructive confirmation |

Do not change these values or introduce a competing Admin palette without a documented design decision and explicit approval. Storefront tokens remain separate.

## Typography and spacing

- Use existing `Manrope` for headings and `Be Vietnam Pro` for body/UI text; do not add a third Admin font.
- Page title: 28–32px, semibold/bold. Section title: 18–20px, semibold. Body: 14–16px. Small label: 12–14px. KPI: 28–32px.
- Use the 8px spacing rhythm: 8, 12, 16, 20, 24, 32px.
- Page padding is 28–32px desktop, 18–24px tablet, 12–20px mobile. Cards use 12px radius, 16–20px padding, quiet borders, and no heavy shadows.

## Layout

- Desktop: 252px fixed Admin sidebar, compact 68px sticky topbar, and max-width 1440px content region.
- Sidebar may collapse on desktop; at `<=840px` it becomes a keyboard-accessible drawer.
- Dashboard KPI cards: four columns at wide desktop, two columns at tablet, one column at mobile.
- Management tables may scroll horizontally only within `.admin-table-wrap`; the page must not gain horizontal overflow.
- Responsive verification targets: 375px, 768px, 1024px, 1440px.

## Components and interaction patterns

### Navigation and icons

- Use `lucide-react` only, typically 18–20px.
- Active sidebar items use a white surface and forest-green text. Hover/focus is subtle and visible.
- Icon-only controls must include `aria-label`; provide `title` when a collapsed navigation label is hidden.

### Buttons and fields

- Primary actions use the forest-green `.button`; secondary actions use `.secondary-button`; destructive confirmation uses `.admin-danger-button`.
- Every action must have a real behavior. Disabled/loading actions explain their state in text where needed.
- Inputs use visible focus rings and semantic labels. Do not rely on placeholders as labels.

### Data management

- Use real API data with explicit loading, empty, error, retry, and success feedback.
- Product media uses the real `coverUrl` returned by the public Book API. If it is absent, use an explicit “Chưa có ảnh bìa” state; never substitute emoji or demo artwork as a product cover.
- Reusable `AdminImageUpload` is used for book cover/gallery and banner media. It is a labelled file control with loading/error/success feedback, accepts JPEG/PNG/WebP up to 8 MB, and writes only the real Cloudinary URL returned by the protected backend endpoint into the surrounding form. It must never invent an image URL or claim that the form record was saved after upload alone.
- Use `AdminPagination` only with response metadata from paginated backend endpoints. Never paginate by slicing a fetched array in the browser.
- Keep create/edit forms in a dedicated form surface, modal, or drawer—not duplicated per table row.
- Destructive operations use a confirmation dialog and do not imply success before the API confirms it.

### Order operations

- The order-management header stays compact: one title/subtitle pair and a real refresh action. Do not add operational labels, fake notification controls, or decorative overflow menus.
- Use dashboard-provided order metrics for order KPI cards. If the endpoint is unavailable, disclose that state instead of rendering zeroes or inferred totals.
- A responsive orders table may transform into labelled record cards below 600px; it must preserve the same real data and pagination semantics.
- The per-row detail action uses a Lucide `Eye` icon with an accessible name. Put actual processing controls inside the detail drawer/sheet, where order items, payment, address, totals, history, and valid next states can be reviewed together.
- Do not introduce filter controls when their backend query contract does not exist. In particular, date ranges require a server-supported date filter before they are rendered.

### Book operations

- Book listing, create, and edit are separate routes. Keep the list dense and operational; keep the complete multi-field form on `/admin/books/new` or `/admin/books/[id]/edit`.
- Book statistics must be fetched from the dedicated real summary contract, never inferred from the active paginated page.
- Use an explicit no-cover state when `coverUrl` is absent. Cover/gallery previews and upload controls write only real URLs returned by the media API.
- Hard-delete is not a supported catalog action. Use a clearly confirmed `ARCHIVED` update to remove a book from public discovery without destroying order history.
- On small screens, transform the book table to labelled cards and make editor fields/actions fit one column without page-level horizontal overflow.

### Dashboard integrity

- KPI, revenue, order status, recent orders, and bestseller values must be rendered from `GET /admin/dashboard`.
- Do not add charts, trends, notifications, or low-stock item lists unless the API returns the underlying data. Use an honest empty/explanatory state instead.

## Accessibility baseline

- Keyboard reachable controls, visible `:focus-visible`, valid labels, Vietnamese text, and an accessible name for icon-only controls are required.
- Dialogs use `role="dialog"` or `role="alertdialog"`, `aria-modal`, labelled headings, and explicit close/cancel paths.
- Important controls target roughly 40–44px minimum height/width.

## Implementation references

- Admin shell/layout: `src/components/admin/admin-shell.tsx`
- Shared Admin CSS: `src/app/admin.css`
- Shared pagination: `src/components/admin/admin-pagination.tsx`
- Orders UI contract: `docs/ADMIN_ORDERS_UI.md`
- Books UI contract: `docs/ADMIN_BOOKS_UI.md`
- API contract notes: `docs/03-API-INTEGRATION.md`

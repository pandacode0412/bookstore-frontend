# Admin Book Management UI

## Scope and routes

Book management is an isolated, ADMIN-protected workflow with no hardcoded product/category data.

| Route | Purpose |
|---|---|
| `/admin/books` | Compact searchable, filterable book list and live summary. |
| `/admin/books/new` | Dedicated create form. |
| `/admin/books/[id]/edit` | Dedicated edit/archive form for one real administrative record. |

The listing never embeds the long create/edit form. The form routes preserve the existing session/CSRF-aware API client and backend validation remains authoritative.

## Data contract

| UI capability | Real endpoint |
|---|---|
| Paginated list | `GET /admin/books?page&limit&q&status&categoryId` |
| Summary cards | `GET /admin/books/summary` |
| Form read | `GET /admin/books/{id}` |
| Create/update/archive | `POST /admin/books`, `PATCH /admin/books/{id}` |
| Categories | `GET /admin/categories` |
| Image upload | `POST /admin/media/images` |

The list sends a submitted `q` and immediate category/status filters to the backend. The four cards are total, published, out-of-stock, and draft counts returned by the summary endpoint; they are never calculated from the current pagination page.

There is deliberately no delete button: the backend has no hard-delete contract and books can be referenced by orders. The real destructive-like operation is an explicit confirmed `ARCHIVED` status update, which hides the book from the public catalog while preserving history.

## Listing pattern

- Header: **Quản lý sách**, subtitle **Quản lý sản phẩm, giá bán và tồn kho**, and Lucide `Plus` link to the create route.
- Toolbar: title/SKU search, category, publication status, refresh, and conditional clear filters. Every filter is backed by the API.
- Columns: cover, title/SKU, category, effective selling price, stock, status, and actions.
- Actions use Lucide only: `Eye` opens the real public product only for published books, `FilePenLine` opens edit, and `Archive` makes a confirmed API update. There is no decorative overflow action.
- Missing covers render an explicit no-cover state, never demo artwork.

## Editor pattern

The form groups Basic information, Pricing and inventory, and Images in separate white cards. Desktop short fields use a two-column grid; description/media use full width. It supports:

- generated editable slug from title;
- client feedback for required values, slug shape, non-negative integer prices/stock, and sale price not exceeding base price;
- Cloudinary-backed cover/gallery upload, URL input, preview, replacement and pre-save gallery removal;
- Draft/Published/Archived state, with a real **Lưu & xuất bản** action;
- duplicate-submit protection, API success/error feedback, and an unsaved-change confirmation before leaving.

Only `PUBLISHED` books appear in the customer catalog. A successful create/update/archive publishes `notifyCatalogChanged()` so open storefront views refresh their real API data.

## Responsive and accessibility

- 1440px: four summary cards, compact table, two-column fields/media layout.
- 1024px: two summary cards per row and media sections stack.
- 768px: toolbar wraps within content; sidebar follows shared Admin behavior.
- 375px: toolbar/actions are full width, list rows become labelled cards, fields are one column, and sticky action bar becomes a regular vertical action group.
- Icon-only controls have visible focus, `aria-label`, and `title`. Images have meaningful alternatives; form fields have labels and inline help/error states.

Browser visual QA remains required at the four target widths when a local browser controller is available. TypeScript and production build checks are mandatory when it is not.

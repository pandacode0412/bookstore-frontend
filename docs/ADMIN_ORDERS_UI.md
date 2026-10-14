# Admin Orders UI

## Scope

`/admin/orders` is the protected operational view for real bookstore orders. It is a frontend presentation change only: authorization, pricing, stock restoration, and valid order transitions remain enforced by the backend.

## Data sources

| UI area | Endpoint | Notes |
|---|---|---|
| Order table | `GET /admin/orders?page&limit&status&q` | Pagination metadata comes directly from the response. `q` searches order code, customer name, or customer email. |
| KPI cards | `GET /admin/dashboard` | Total, pending, processing (`CONFIRMED` + `PACKING` + `SHIPPING`), and delivered order counts use returned dashboard metrics/status counts. |
| Detail and status update | `PATCH /admin/orders/{id}/status` | The selected order record supplies customer, address, items, payment, totals, and history. The backend validates every transition. |

The current API has no date-range parameter. Therefore the page intentionally has no date filter; it must not simulate client-side filtering over one paginated page.

## Interaction model

- Header uses the page title **Quản lý đơn hàng**, its operational subtitle, and a real reload action.
- The compact toolbar contains submitted search, status selection, and a clear-filter action only when filters are active.
- Each table row has one real icon action: Lucide `Eye`, labelled “Xem chi tiết đơn hàng”. No decorative overflow menu is shown.
- The detail surface is a right drawer on desktop and a bottom sheet on mobile. It contains the order snapshot, ordered products, payment/shipping/totals, status history, and only the next states permitted by the existing state machine.
- Moving to `CANCELED` requires an explicit destructive confirmation. Other requested transitions still show server success/error feedback and are never optimistic.

## States

- Initial table/KPI loading, refresh loading, and retryable API error are explicit.
- If no order exists without filters, the page shows `PackageOpen` with “Chưa có đơn hàng”.
- If a query/status produces no result, it shows “Không tìm thấy đơn hàng” and provides a real clear-filter action.
- Dashboard KPI failure is disclosed separately; the UI does not replace unavailable numbers with mock values.

## Responsive and accessibility

- `>1080px`: four compact KPI cards, table, right-side drawer.
- `768–1080px`: two KPI columns while the table remains readable.
- `<=600px` (including 375px): KPI cards become a two-column compact grid; table rows expose labelled fields as cards; the detail drawer becomes a bottom sheet.
- Search, select, refresh, drawer close, pagination, status controls, and the Eye action remain keyboard reachable with visible focus. Icon-only controls have `aria-label` and `title`.
- The implementation uses the shared Admin forest-green tokens and Lucide icons only.

## Verification

- TypeScript no-emit check and production Next build pass.
- Browser visual verification remains required at 375px, 768px, 1024px, and 1440px when a local browser session is available.

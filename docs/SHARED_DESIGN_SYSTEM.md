# Shared Design System — Bookstore Admin & Customer Storefront

**Version:** 1.0 | **Updated:** 2026-10-14 | **Applies to:** all frontend routes.

> This is a **design contract and implementation guide**, not a statement that all components have been built. Audit the repository before creating or modifying UI.

## 1. Shared visual identity vs. distinct experiences

| Concern | Shared rules | Admin specializations | Storefront specializations |
|---|---|---|---|
| Brand | Forest green, neutral cream/white, coherent typography | High-density neutral surfaces | More visual storytelling and book imagery |
| Icons | One vector icon family and stroke style | CRUD, status, tables | Cart, wishlist, search, navigation |
| Controls | Button, Input, Dialog, Switch, Badge, feedback patterns | Table filters, edit forms | Quantity selector, product actions |
| Layout | Consistent baseline spacing and responsive behavior | Sidebar + topbar + tables | Public header + full-width hero + product grids |
| Content | Real data, accessible UI and consistent language | Operational workflows | Shopping journeys |

The two experiences **share design foundations, NOT page layout templates**.

## 2. Suggested token model (adapt existing tokens rather than duplicate)

```css
:root {
  --brand-primary: #185443;
  --brand-primary-hover: #123F33;
  --brand-cream: #F8F7F2;
  --surface: #FFFFFF;
  --text-primary: #182F27;
  --text-secondary: #64748B;
  --border-subtle: #E5EAE7;
  --status-success: #15803D;
  --status-warning: #B45309;
  --status-danger: #B91C1C;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --focus-ring: #247B61;
}
```

These are recommended defaults based on current Bookstore visual direction. Keep compatible tokens if already present; do not create a parallel conflicting palette or force exact hex values without reviewing contrast.

Typography: use current Vietnamese-compatible font or consider Inter. Base body 14–16px Admin, 16px Storefront; titles are route-specific. Use an 8px-based spacing rhythm with 4px increments where appropriate.

## 3. Reusable UI foundations

- `Button` (primary, secondary/outline, ghost, destructive): consistent loading, disabled, keyboard focus and accessible labels.
- `IconButton`: SVG icon with tooltip where needed and required `aria-label`.
- `Input`/`Textarea`/`Select`: real labels, error text, autocomplete where applicable.
- `Modal`/`Drawer`/`ConfirmDialog`: focus trap and restoration, close/escape behavior, validation/error preservation.
- `Switch` for active/inactive state, `Checkbox` for selecting items or agreeing to terms; avoid confusing meanings.
- `Badge` for statuses with both text and semantic styling (never communicate solely by color).
- `Skeleton`, `EmptyState`, `ErrorState`, `Toast` when appropriate.
- `ProductCard` belongs to Storefront; `DataTable` belongs to Admin. Share only underlying primitives.
- Complex Admin content creation/editing uses a dedicated route and grouped form cards, not an inline table form. A desktop two-column field grid becomes one column on mobile; image preview/upload and save actions remain real API operations.

## 4. Icon convention (if Lucide is used)

| Shared/Storefront | Icon | Admin | Icon |
|---|---|---|---|
| Search | `Search` | Dashboard | `LayoutDashboard` |
| Account | `UserRound` | Book CRUD | `BookOpen` |
| Shopping cart | `ShoppingCart` | Category CRUD | `Tags` |
| Wishlist | `Heart` | Create | `Plus` |
| Category menu | `Grid2X2` | Edit | `Pencil` |
| Next / Previous | `ChevronRight` / `ChevronLeft` | Delete | `Trash2` |
| Show / hide password | `Eye` / `EyeOff` | Save / Refresh | `Save` / `RefreshCw` |

Typical icon size 18–20px; target hit areas suitable for mouse and touch. In a password field, use a `type="button"` eye toggle; visibility state per field.

## 5. Accessibility, performance and language

- All links/buttons interactive for real; tab order and visible focus styles; icon-only controls have accessible names.
- WCAG AA contrast target; do not rely on color alone; support `prefers-reduced-motion`.
- Responsive behavior for 375 / 768 / 1024 / 1440px; never create page-level horizontal overflow.
- Product/banner images should have appropriate alternatives and dimension/ratio to reduce layout shifts; prioritize above-the-fold hero assets.
- Vietnamese labels and error messages; no broken or mixed localized copy.
- No false sales counts, fake backend metrics, hardcoded production categories/products or fabricated reviews.

## 6. Rules for changing patterns

If a UI pattern changes: update this doc if shared; otherwise update `docs/UI_DESIGN_SYSTEM.md` (Admin) or `docs/STOREFRONT_UI_GUIDELINES.md` (customer). Never globally force Admin density/typography onto a visual Storefront component.

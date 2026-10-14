# Admin Category Management Specification

## Scope

The `/admin/categories` screen manages the same Category records used by the storefront navigation. It is an ADMIN-only frontend consumer; backend authorization and validation remain authoritative.

## API contract

| Operation | Endpoint | Rule |
|---|---|---|
| Read all categories | `GET /admin/categories` | Includes active and inactive records for ADMIN |
| Create category | `POST /admin/categories` | Requires session, CSRF token, and ADMIN role |
| Update category | `PATCH /admin/categories/{id}` | Requires session, CSRF token, and ADMIN role |
| Storefront navigation | `GET /categories` | Returns active records only, ordered by `sortOrder`, then name |

Write fields are `name`, `slug`, `description`, `sortOrder`, and `isActive`. The frontend must preserve backend validation/error responses and must not invent a delete action: the backend intentionally has no hard-delete endpoint for categories with references.

## Required UI behavior

- Render records from `GET /admin/categories`; never substitute static category names.
- Create/edit should use a single dedicated form surface, modal, or drawer. Do not introduce a full duplicate input form in every list row when changing this page.
- Toggle active/inactive only through `PATCH`; show pending, success, and error feedback. On success dispatch `bookstore:categories-changed` so the storefront header refreshes its public category menu.
- Slug accepts lowercase URL-safe values as enforced by the API/client pattern. `sortOrder` is a non-negative integer.
- Keep a refresh action, empty state, and API-error retry path. Changes must remain usable by keyboard and screen readers.

## Visual rules

- Follow `UI_DESIGN_SYSTEM.md` exactly: forest-green tokens, Lucide icons, compact cards, 8px spacing rhythm, focus-visible states, and no decorative/nonfunctional controls.
- At 375px the editor/list stacks to one column; at wider widths the list can use a responsive table or compact list. No viewport-level horizontal scroll.

## Backend limitations to preserve

- No category hard delete is available by design.
- The admin listing is not paginated by the current backend contract; do not create fake pagination. If the category volume requires it, propose a paginated backend contract first.
- Category changes do not carry product count or analytics data; do not display invented counts.

## Related documents

- `UI_DESIGN_SYSTEM.md`
- `03-API-INTEGRATION.md`
- `../../bookstore-backend/docs/02-SRS.md` (FR-CAT-04)
- `../../bookstore-backend/contracts/openapi.yaml`

# UI/UX Specification — Bookstore

## Guiding principles
- Tiếng Việt, rõ giá bán/giá giảm/tình trạng hàng; ưu tiên mobile-first, responsive.
- UX tránh checkout mơ hồ; trạng thái đơn dễ nhìn; không nói `đặt thành công` trước khi server xác nhận.
- Accessible labels, focus rings, keyboard interactions, alt text cho ảnh.

## Pages, audience & main elements
| Route | Actor | Components / Actions | State |
|---|---|---|---|
| `/` | All | Header/search/banner/books/categories | loading/empty/error |
| `/books` | All | keyword/category/sort/page/book cards | zero results |
| `/books/[slug]` | All | cover, info, prices, qty, add to cart | out of stock/404 |
| `/login` | Guest | email/password, reset placeholder | 401, validation |
| `/register` | Guest | register form | duplicate email |
| `/account` | Customer | current profile, cart/orders links, logout | login required |
| `/wishlist` | Customer | saved books, remove saved book | empty/login required |
| `/cart` | Customer | lines, qty, remove, subtotal | empty/stale price |
| `/checkout` | Customer | saved address, COD, summary, place | stock conflict/retry |
| `/orders` | Customer | list/status/history | empty/login required |
| `/orders/[id]` | Owner | items, status, cancel pending | forbidden/invalid state |
| `/admin` | Admin | live KPI summary, order status distribution, 5 newest orders | loading/error/forbidden |
| `/admin/books` | Admin | list filters/create/edit/publish | validation |
| `/admin/categories` | Admin | category/author management | conflict |
| `/admin/orders` | Admin | queue, detail, actions | invalid transition |

## Storefront layout
- Header: banner thương hiệu ngắn gọn có CTA catalog; logo dẫn về trang chủ; nút danh mục; tìm kiếm thật đưa `q` sang `/books`; vùng action luôn có giỏ hàng và icon tài khoản, kể cả khi đang kiểm tra phiên. Khi đã đăng nhập, hover hoặc focus icon tài khoản mở menu có tên/email, trang tài khoản, đơn hàng và đăng xuất; chạm trên mobile vẫn dẫn tới `/account`. Không hiển thị thông báo, % giảm giá, hoặc chính sách không có chức năng tương ứng. Trên màn nhỏ các nhóm tự xuống dòng, không che nội dung.
- Icon trong header là SVG nét đơn sắc cùng hệ (sách, danh mục, tìm kiếm, giỏ hàng, tài khoản), có nhãn văn bản và `aria-label` ở hành động chỉ còn icon trên mobile; không dùng emoji vì dễ khác kiểu giữa trình duyệt/thiết bị.
- Logo thương hiệu dùng asset `public/brand/bookstore-logo.png` (xe đẩy và sách), hiển thị độc lập ở header/footer, không kèm wordmark. Dùng `next/image`, có kích thước cố định để tránh layout shift, và `alt` rỗng vì liên kết chứa `aria-label` là tên truy cập được.
- Header có biểu tượng trái tim cỡ bằng các action còn lại, với vòng nền xanh đậm và nét trắng tương phản rõ. Nó dẫn tới `/wishlist`; khách đăng nhập có thể lưu/bỏ lưu trực tiếp tại trang chi tiết sách.
- Footer: bốn vùng rõ ràng cho giới thiệu/COD, liên kết mua sắm, liên kết tài khoản-đơn hàng và cam kết vận hành chỉ dựa trên tính năng đã có; không dùng liên kết chính sách hay hotline giả.
- BookCard: cover placeholder with aspect ratio, title max 2 lines, category, pricing VND, sold-out indicator, detail link.
- Detail: title/author/category/isbn/description; price; stock; qty; add to cart CTA.
- Cart: implemented persisted server state; quantity update/remove with loading/error states; summary is indicative only and checkout server must revalidate.
- Guest mở `/cart` thấy một sign-in gate dạng hai cột có minh hoạ giỏ hàng, lợi ích thật của tài khoản và CTA đăng nhập/xem sách; lỗi tải API thông thường có nút thử lại, không bị nhầm với yêu cầu đăng nhập.
- Form đăng ký/đăng nhập chỉ hiển thị lỗi của lần gửi hiện tại; phản hồi cũ không được ghi đè kết quả mới. Khi thành công, khách đã có phiên đăng nhập và được chuyển thẳng về trang chủ.
- `/account` là trang riêng tư, noindex: hiển thị đúng họ tên/email từ `/auth/me`, các địa chỉ giao hàng đã lưu từ `GET /addresses`, lối tắt tới giỏ hàng/đơn hàng và đăng xuất. Có loading/error/empty state cho địa chỉ; chưa có API chỉnh sửa hồ sơ hoặc địa chỉ nên không hiển thị biểu mẫu cập nhật giả.
- Đăng xuất chỉ thay đổi giao diện sau khi API xác nhận thành công. Nếu session hoặc CSRF lỗi, menu/header và trang tài khoản giữ phiên hiện tại và hiển thị lỗi có thể thao tác lại.
- Checkout: authenticated; shipping address; COD; confirmation; disable/retry safely with idempotency key.

## Commercial SEO implementation
- The root layout has a Vietnamese title template, description, Open Graph/Twitter metadata, and canonical URL support via `NEXT_PUBLIC_SITE_URL` (default localhost for development).
- Home and catalog provide canonical metadata. Login, register, and admin routes are disallowed in `robots.txt` and excluded from the sitemap.
- Each book detail page supplies product and breadcrumb JSON-LD, a canonical URL, descriptive metadata, effective VND offer, and schema.org stock availability.
- `sitemap.xml` contains the storefront and currently published books. It safely falls back to the static storefront routes if the API is unavailable during generation.
- Commerce copy must not claim payment methods beyond implemented COD. Product pages and checkout may describe COD ordering, but must not claim online payment or carrier tracking.

## Design tokens
- Nền giấy `#F7F6F0`, chữ xanh mực `#16342D`, primary xanh rêu `#216B57`, primary đậm `#174B3E`, điểm nhấn vàng đồng `#C99545`, border `#D9E1D9`, danger `#B13C45`.
- Typography dùng đúng hai Google Fonts: `Manrope` (heading, 600/700) và `Be Vietnam Pro` (body/UI, 400/500/600/700). Cả hai nạp subset `latin` và `vietnamese` qua `next/font`, với `font-display: swap` và fallback Arial/Helvetica/sans-serif.
- Font tokens: heading/body families; H1 `clamp(40px, 56px)` weight 700, H2 `clamp(30px, 36px)` weight 700, H3 `clamp(22px, 26px)` weight 600, body 16px/1.6, small 14px, button `clamp(14px, 16px)` weight 600. Heading dùng tracking âm nhẹ để gọn và đồng nhất trên desktop/mobile.
- Header, CTA, state, card và footer dùng cùng hệ xanh rêu/kem/vàng đồng; không pha banner đỏ với CTA xanh khi không có một chiến dịch thương hiệu đỏ riêng.
- Spacing scale 4/8/12/16/24/32; radius 8/12/16; typography system sans-serif.
- Breakpoints 360, 768, 1024, 1440; minimum click target about 44px for important controls.

## User journey states
Loading skeleton; Empty; Error (with retry); Success; Forbidden; OOS; Price changed on checkout; Session expired.

Auth forms submit at most one request at a time. A successful authentication clears any stale error, creates a session, and redirects to the storefront; success and error states never appear together.

## Admin requirements
- No direct price or stock mutation from client without server validation.
- Confirm dangerous actions, disabled invalid transition buttons, show success/error toast after response.
- Display VND integer formatted using `Intl.NumberFormat('vi-VN')`.
- The `/admin` route is not part of public navigation. The frontend only renders its link for `ADMIN`; the route has an initial client role gate, while the backend `/api/admin/*` endpoints independently enforce `ADMIN` before any data/action is exposed. The implemented dashboard reads its live metrics from `GET /admin/dashboard`, has loading/error/retry states, and is responsive from a four-card desktop grid to a single-column mobile view.
- The admin gate never silently redirects a signed-in customer: it shows a clear access-denied state with the current account email. Guests see a login CTA. If the API cannot be reached, the gate times out after 10 seconds and shows a retry action instead of loading forever. This makes role/session errors diagnosable without exposing admin content.

## MVP note
Implemented storefront: homepage, detail page, public catalog with keyword search, category filter, base-price sorting, pagination, plus loading/empty/error states; registration/login/logout and session-aware navigation; persistent wishlist and cart; COD checkout with saved delivery addresses; customer order list/detail and PENDING cancellation. ADMIN has a live read-only operational dashboard; catalog/order/inventory management actions remain backlog.
## Checkout and order experience

- `/checkout` is a private, mobile-responsive COD flow: customer selects or saves a delivery address, can add a short delivery note, sees server-returned cart estimates, and confirms with a clear “Đặt hàng COD” action.
- `/orders` and `/orders/[id]` are private, noindex account views. They communicate the API order state in Vietnamese, snapshot delivery address/items/totals, and expose cancellation only for `PENDING` orders.
- Checkout and auth submissions disable while pending. A success/error state is never displayed together, and an unchanged checkout retry preserves its idempotency key.

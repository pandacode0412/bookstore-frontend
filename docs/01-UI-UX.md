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
| `/admin` | Admin | isolated SaaS dashboard, KPIs, statuses, newest orders/top sellers | loading/error/forbidden |
| `/admin/books` | Admin | live book counts, title/SKU/category/status filters, list, archive confirmation | loading/empty/error |
| `/admin/books/new` | Admin | grouped create form, media upload, draft/publish actions | validation/upload failure |
| `/admin/books/[id]/edit` | Admin | grouped edit/archive form, media preview and unsaved-change warning | not found/validation |
| `/admin/categories` | Admin | category description/active/display order | conflict |
| `/admin/banners` | Admin | create/edit/activate/reorder URL-based banners | validation |
| `/admin/orders` | Admin | compact live KPIs, submitted search/status filter, order drawer, safe transition/history | loading/error/empty/invalid transition |
| `/admin/customers` | Admin | customer-safe search directory | loading/empty/error |

## Storefront layout
- Header: hai hàng trên desktop. Hàng chính giữ logo, nút danh mục, tìm kiếm (phần tử co giãn chính), yêu thích, giỏ hàng và tài khoản; hàng điều hướng nhanh được căn giữa, có chỉ báo route đang mở và focus/hover dễ nhận biết. Khi tài khoản có dữ liệu, badge số lượng chỉ hiện với giỏ hàng/yêu thích lớn hơn 0; khách chưa đăng nhập không thấy số `0`. Ngay khi phiên đăng nhập được tạo, action tài khoản đổi từ icon user mặc định sang avatar chữ cái và hiển thị tên người dùng; sau đăng xuất nó trở lại trạng thái khách. Với role `ADMIN`, header desktop có thêm action viền vàng “Quản trị” dẫn thẳng tới `/admin`; ở viewport hẹp action này còn icon có accessible name để không làm tràn header, còn mobile đặt link “Mở trang quản trị” trong drawer. Dropdown tài khoản hiện có vẫn mở bằng hover/focus với tên/email, trang tài khoản, đơn hàng và đăng xuất.
- Secondary navigation chỉ phục vụ khám phá catalog: `Trang chủ`, `Tất cả sách`, dropdown `Thể loại`, `Sách mới`, `Bán chạy`, `Khuyến mãi`. Dropdown `Thể loại` lấy dữ liệu thật từ `GET /categories`, dùng native `details/summary` để thao tác được bằng bàn phím, có trạng thái tải/rỗng và liên kết xem toàn bộ sách. `Yêu thích`/`Đơn hàng` chỉ còn ở action/account area, không bị lặp trong secondary navigation.
- Storefront category dropdown chỉ render `id`, `name`, `slug` từ public API; category inactive không xuất hiện. Lỗi tải có nút thử lại, desktop hiển thị lưới phù hợp số lượng category và mobile dùng các link chạm tối thiểu 44px trong drawer. Sau khi ADMIN lưu category, header refresh dữ liệu ngay trong phiên hiện tại.
- `Bán chạy` dùng API `GET /books?sort=bestselling`, chỉ xếp hạng quantity từ đơn `DELIVERED`; danh sách có thể rỗng khi chưa có đơn giao thành công. `Khuyến mãi` dùng `GET /books?onSale=true`, chỉ hiện sách public có giá giảm. Bộ lọc catalog có thêm sort Bán chạy và checkbox “Chỉ sách khuyến mãi”.
- Header mobile: hàng gọn chỉ gồm menu hamburger, logo và giỏ hàng; tìm kiếm chiếm toàn bộ hàng kế tiếp. Menu drawer thay thế navigation/danh mục, có link tài khoản, yêu thích và đơn hàng; tài khoản `ADMIN` có thêm link “Mở trang quản trị”. Link tài khoản dùng cùng avatar chữ cái/tên sau khi đăng nhập. Mọi điểm chạm chính tối thiểu 44px, không tạo cuộn ngang. Header không sticky để hero full-bleed luôn nằm đúng ngay dưới navigation và không che nội dung khi đọc.
- Trang chủ dùng hero carousel full-bleed ngay dưới navigation, hiển thị đúng một trong ba asset nội bộ `public/banner/` tại mỗi thời điểm. Nó không giới hạn bởi container nội dung, có chiều cao desktop `450–600px`, tự điều chỉnh cho tablet/mobile, dùng `next/image`, `object-fit: cover` và `object-position` theo từng asset để tránh cắt nội dung quan trọng. Slide đầu được ưu tiên tải, hai slide sau lazy-load; carousel tự chuyển 5 giây, lặp vô hạn, dừng khi hover/focus, hỗ trợ vuốt trên mobile, arrows hai cạnh, 3 dots đáy giữa và `prefers-reduced-motion`. Không thêm text overlay lên artwork đã có nội dung khuyến mãi.
- Icon trong header là SVG nét đơn sắc cùng hệ (sách, danh mục, tìm kiếm, giỏ hàng, tài khoản), có nhãn văn bản và `aria-label` ở hành động chỉ còn icon trên mobile; không dùng emoji vì dễ khác kiểu giữa trình duyệt/thiết bị.
- Logo thương hiệu dùng asset `public/brand/bookstore-logo.png` (xe đẩy và sách), hiển thị độc lập ở header/footer, không kèm wordmark. Dùng `next/image`, có kích thước cố định để tránh layout shift, và `alt` rỗng vì liên kết chứa `aria-label` là tên truy cập được.
- Header có biểu tượng trái tim cỡ bằng các action còn lại, với vòng nền xanh đậm và nét trắng tương phản rõ. Nó dẫn tới `/wishlist`; khách đăng nhập có thể lưu/bỏ lưu trực tiếp tại trang chi tiết sách.
- Footer: bốn vùng rõ ràng cho giới thiệu/COD, liên kết mua sắm, liên kết tài khoản-đơn hàng và cam kết vận hành chỉ dựa trên tính năng đã có; không dùng liên kết chính sách hay hotline giả.
- BookCard: ảnh bìa lấy trực tiếp từ `Book.coverUrl` do ADMIN quản lý, title max 2 lines, category, pricing VND, sold-out indicator, detail link. Khi record thật chưa có `coverUrl`, card/giỏ hàng nêu rõ “Chưa có ảnh bìa”; không dùng emoji hoặc artwork giả làm dữ liệu sản phẩm.
- Detail: title/author/category/isbn/description; price; stock; qty; add to cart CTA.
- Cart: implemented persisted server state; quantity update/remove with loading/error states; summary is indicative only and checkout server must revalidate.
- Guest mở `/cart` thấy một sign-in gate dạng hai cột có minh hoạ giỏ hàng, lợi ích thật của tài khoản và CTA đăng nhập/xem sách; lỗi tải API thông thường có nút thử lại, không bị nhầm với yêu cầu đăng nhập.
- Login/Register dùng một card trắng tối đa 440px trên nền kem nhạt, logo dẫn về trang chủ, typography/spacing đồng nhất và responsive không có thanh cuộn nội bộ. Login gồm Email, Mật khẩu có toggle SVG Eye/EyeOff 20px bên trong input (mỗi field độc lập, có nhãn truy cập được), hành động “Quên mật khẩu?” hiển thị trạng thái trung thực khi API reset chưa có, CTA và liên kết đăng ký. Register thêm Họ tên, Xác nhận mật khẩu và validation khớp mật khẩu ở client; API/session hiện có vẫn là nguồn xác thực cuối cùng.
- Form đăng ký/đăng nhập chỉ hiển thị lỗi của lần gửi hiện tại; phản hồi cũ không được ghi đè kết quả mới. Khi thành công, khách đã có phiên đăng nhập và được chuyển thẳng về trang chủ.
- Trang chủ, catalog và trang chi tiết buộc render động (`force-dynamic`, `revalidate = 0`) và các request catalog dùng `cache: 'no-store'`. Sau một lần ADMIN lưu sách, frontend phát tín hiệu catalog để storefront đang mở refresh dữ liệu; thay đổi cũng được thông báo giữa các tab qua `BroadcastChannel`. Chỉ record `PUBLISHED` được public API trả về. Biểu mẫu thêm sách mặc định chọn “Đang bán”; nếu ADMIN đổi sang Nháp/Lưu trữ, UI nêu rõ sách sẽ không hiển thị ở storefront.
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
- Admin dashboard có thêm quản lý category: ADMIN tạo mới, sửa tên/slug, bật-tắt hiển thị và đặt thứ tự bằng API protected. Form có validation browser cơ bản, loading/error state; backend vẫn là nguồn validation cuối cùng và header được báo refresh khi thao tác thành công.
- `/admin` dùng workspace tách khỏi storefront (không header/footer mua sắm), sidebar trái, topbar tài khoản ADMIN và mobile drawer. Các module dùng cùng loading/empty/error/table/form patterns, responsive không buộc table tràn viewport ngoài vùng cuộn ngang nội bộ.
- Quản trị Sách và Banner có cùng control “Tải ảnh từ máy”: chỉ nhận JPEG/PNG/WebP tối đa 8 MB, hiện trạng thái tải/lỗi/thành công và điền URL Cloudinary thực vào field URL hiện có. Tải ảnh không tự tạo/lưu sách hoặc banner; ADMIN vẫn phải lưu form, nên không có thay đổi dữ liệu ngầm. Khi Cloudinary chưa được cấu hình ở backend, UI hiển thị lỗi API thay vì URL/ảnh giả.
- `/admin/books` là danh sách gọn: title **Quản lý sách**, KPI thật từ `/admin/books/summary`, tìm title/SKU, lọc category/trạng thái, refresh và clear filter. Table dùng cover thật hoặc trạng thái “chưa có ảnh”, giá bán hiệu lực, tồn kho, badge trạng thái, Eye cho sách đã xuất bản, edit và archive có xác nhận. Form không nằm trong danh sách: `/admin/books/new` và `/admin/books/[id]/edit` nhóm thông tin cơ bản, giá/tồn, ảnh và action lưu/xuất bản. Không có nút xóa cứng vì API bảo toàn quan hệ/lịch sử đơn; `ARCHIVED` là thao tác thực được dùng để gỡ sách khỏi storefront.
- Admin UI dùng design system riêng, compact và không ảnh hưởng storefront: nền `#F8FAF9`, primary forest-green `#185443`, surface trắng, border nhẹ `#E5EAE7`, radius 12px. Sidebar desktop rộng 252px có thể thu gọn; ở tablet/mobile nó trở thành drawer. Topbar sticky cao 68px chỉ hiển thị breadcrumb, tên trang và menu tài khoản thật (trang tài khoản/đăng xuất), không có thông báo placeholder.
- Dashboard Admin dùng heading `Tổng quan` và mô tả `Theo dõi hoạt động kinh doanh của cửa hàng`; desktop hiển thị 4 KPI từ `GET /admin/dashboard`, một khối doanh thu thực và trạng thái đơn, sau đó đơn gần đây/sách bán chạy. Không dựng biểu đồ, trend hay notification giả khi API chưa trả dữ liệu theo thời gian. KPI xếp 4 cột trên desktop, 2 cột ở tablet và 1 cột ở mobile; bảng chỉ cuộn ngang trong vùng bảng.
- Tất cả icon điều hướng và metric của Admin dùng cùng bộ `lucide-react`, có `aria-label` hoặc nhãn văn bản, focus state rõ ràng và vùng chạm tối thiểu 40–44px. Typography tiếp tục dùng Manrope/Be Vietnam Pro của Design System chung; tiêu đề Admin ở mức 28–32px và section title 19px để tránh khoảng trắng/heading quá lớn.
- Quản lý Sách, Đơn hàng và Khách hàng dùng phân trang thật từ metadata `page`, `totalPages`, `total` của API; khi đổi trang, frontend chỉ gửi `page`/`limit` cùng filter hiện tại, không tự cắt dữ liệu phía client. Tìm kiếm của Đơn hàng/Khách hàng được gửi khi xác nhận form để tránh request theo từng phím gõ.
- `/admin/orders` dùng header gọn “Quản lý đơn hàng”, 4 KPI thật từ `GET /admin/dashboard` (tổng, chờ xử lý, đang xử lý, đã giao), toolbar tìm theo mã/tên/email và lọc trạng thái gửi lên API. API hiện chưa có lọc ngày nên UI không dựng date range giả. Bảng có mã, khách, ngày tạo, tổng tiền, trạng thái và action Eye mở drawer; trên mobile hàng trở thành card có nhãn mà không làm mất dữ liệu/phân trang.
- Drawer Đơn hàng hiển thị snapshot địa chỉ giao, phương thức/trạng thái thanh toán, items, tổng tiền và lịch sử chuyển trạng thái do API trả về. Chỉ thao tác hủy đơn có thêm dialog xác nhận destructive; các trạng thái khả dụng vẫn bị giới hạn bởi state machine hiện có ở backend. Không thêm menu `MoreHorizontal` chỉ để trang trí khi không có action thật.
- Banner management chỉ nhận URL HTTPS hoặc asset storefront và cho xem trước; không hiển thị upload file giả vì storage/quét tệp chưa được cung cấp. Homepage carousel lấy `GET /banners`, do đó bật/tắt/thay đổi thứ tự được phản ánh sau lần tải trang kế tiếp.
- The admin gate never silently redirects a signed-in customer: it shows a clear access-denied state with the current account email. Guests see a login CTA. If the API cannot be reached, the gate times out after 10 seconds and shows a retry action instead of loading forever. This makes role/session errors diagnosable without exposing admin content.

## MVP note
Implemented storefront: homepage, detail page, public catalog with keyword search, category filter, base-price sorting, pagination, plus loading/empty/error states; registration/login/logout and session-aware navigation; persistent wishlist and cart; COD checkout with saved delivery addresses; customer order list/detail and PENDING cancellation. ADMIN has a protected compact dashboard plus category, book, banner, order and customer management modules; every mutation remains validated and authorized by the backend.
## Checkout and order experience

- `/checkout` is a private, mobile-responsive COD flow: customer selects or saves a delivery address, can add a short delivery note, sees server-returned cart estimates, and confirms with a clear “Đặt hàng COD” action.
- `/orders` and `/orders/[id]` are private, noindex account views. They communicate the API order state in Vietnamese, snapshot delivery address/items/totals, and expose cancellation only for `PENDING` orders.
- Checkout and auth submissions disable while pending. A success/error state is never displayed together, and an unchanged checkout retry preserves its idempotency key.

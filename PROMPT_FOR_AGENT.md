# Prompt cho AI Coding Agent — Bookstore Admin UI Refresh

Bạn đang làm việc trong repository Frontend của dự án Bookstore E-commerce.

**Trước khi code**, hãy đọc đầy đủ `AGENTS.md`, `docs/UI_DESIGN_SYSTEM.md`, `docs/ADMIN_CATEGORIES_SPEC.md`. Kiểm tra stack, thư viện icon, component, routing, API client, auth và trang `/admin/categories` hiện tại. Nếu repo chưa có các file này, sử dụng các file đính kèm trong bộ tài liệu làm chuẩn.

## Nhiệm vụ

Refactor giao diện **Admin → Quản lý thể loại** theo chuẩn Modern SaaS Admin, giữ màu xanh Bookstore nhưng tối ưu bố cục, icon và nút. Không đổi nghiệp vụ/backend khi chỉ đang làm UI.

1. Giảm heading “Thể loại sách” về 24–28px, giảm padding và khoảng trắng dư thừa.
2. Chuyển khu tạo mới đang nằm ngang thành **nút `[Plus] Thêm thể loại` ở đầu trang**, mở modal/drawer form tạo.
3. Chuyển danh sách thể loại thành **bảng read-only**, chỉ có một hàng tiêu đề các cột: Tên, Slug, Mô tả, Thứ tự, Trạng thái, Thao tác.
4. Loại bỏ các ô input và nút “Lưu” lặp theo từng dòng. Dùng `[Pencil] Sửa` để mở modal/drawer chỉnh sửa.
5. Thay checkbox “Hiển thị” mặc định bằng Switch đồng bộ design system, cập nhật trạng thái qua API thực và xử lý lỗi.
6. Dùng icon SVG đồng nhất (ưu tiên Lucide nếu dự án đã có hoặc được phép cài): Plus, Pencil, Trash2, Search, RefreshCw, Tags, Save. Không dùng ký tự Unicode/emoji giả icon.
7. Icon-only actions phải có `aria-label`, tooltip, hover, focus; destructive actions cần xác nhận.
8. Bố cục compact, nút cao 38–42px, icon 18–20px, card nhẹ, responsive cho 375px/768px/1024px/1440px.
9. Giữ nguyên API, dữ liệu thực, auth/role guard, validation, điều hướng; không hardcode dữ liệu và không để nút giả.
10. Có loading, empty, error, success feedback; không mất dữ liệu sau reload.

## Tài liệu bắt buộc cập nhật

- Nếu bổ sung hoặc thay đổi quy chuẩn UI, cập nhật `docs/UI_DESIGN_SYSTEM.md`.
- Nếu thay đổi luồng màn hình quản lý thể loại, cập nhật `docs/ADMIN_CATEGORIES_SPEC.md`.
- Giữ `AGENTS.md` để AI Agent lần sau tự biết phải đọc docs trước khi sửa Admin UI.
- Khi kết thúc, liệt kê file đã sửa, test đã chạy, tính năng đã xác minh và các điểm còn thiếu.

**Không rebuild dự án; chỉ refactor có kiểm soát dựa trên code đang tồn tại.**

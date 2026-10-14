'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SiteHeader } from './site-header';

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return <>{children}</>;
  return <>
    <SiteHeader />
    <main className="container">{children}</main>
    <footer className="site-footer"><div className="container footer-grid">
      <section className="footer-intro"><Link className="brand brand-symbol" href="/" aria-label="Bookstore - Trang chủ"><Image className="brand-logo footer-logo" src="/brand/bookstore-logo.png" alt="" width={1254} height={1254} sizes="38px" /></Link><p>Những tựa sách chọn lọc cho hành trình học hỏi mỗi ngày.</p><span className="footer-note">Thanh toán khi nhận hàng (COD)</span></section>
      <nav aria-label="Mua sắm"><h2>Mua sắm</h2><Link href="/books">Tất cả sách</Link><Link href="/cart">Giỏ hàng</Link><Link href="/checkout">Thanh toán</Link></nav>
      <nav aria-label="Tài khoản và đơn hàng"><h2>Tài khoản</h2><Link href="/account">Tài khoản của tôi</Link><Link href="/wishlist">Sách yêu thích</Link><Link href="/orders">Theo dõi đơn hàng</Link><Link href="/login">Đăng nhập</Link></nav>
      <section className="footer-help"><h2>Mua hàng an tâm</h2><p>Giá và tồn kho được xác nhận lại trước khi tạo đơn.</p><p>Đơn đang chờ xác nhận có thể được hủy từ trang đơn hàng.</p></section>
    </div><div className="container footer-bottom">© {new Date().getFullYear()} Bookstore · Sách hay cho mỗi ngày.</div></footer>
  </>;
}

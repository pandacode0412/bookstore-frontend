import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { AuthNavigation } from '@/components/layout/auth-navigation';
import { CatalogSearch } from '@/components/layout/catalog-search';
import { HeaderIcon } from '@/components/layout/header-icon';
import { bodyFont, headingFont } from './fonts';
import './globals.css';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Bookstore | Sách hay mỗi ngày', template: '%s | Bookstore' },
  description: 'Khám phá sách công nghệ, phát triển bản thân và nhiều tựa sách chọn lọc với giá minh bạch.',
  keywords: ['mua sách online', 'nhà sách trực tuyến', 'sách công nghệ', 'sách phát triển bản thân'],
  openGraph: { type: 'website', locale: 'vi_VN', siteName: 'Bookstore', title: 'Bookstore | Sách hay mỗi ngày', description: 'Khám phá những tựa sách chọn lọc cho hành trình học hỏi của bạn.' },
  twitter: { card: 'summary', title: 'Bookstore | Sách hay mỗi ngày', description: 'Khám phá những tựa sách chọn lọc cho hành trình học hỏi của bạn.' },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body className={`${bodyFont.variable} ${headingFont.variable}`}>
    <header className="site-header">
      <div className="header-promo"><div className="container"><span>NHÀ SÁCH TRỰC TUYẾN · SÁCH HAY MỖI NGÀY</span><Link href="/books">KHÁM PHÁ SÁCH <b aria-hidden="true">→</b></Link></div></div>
      <div className="container header-main">
        <Link className="brand brand-symbol" href="/" aria-label="Bookstore - Trang chủ"><Image className="brand-logo" src="/brand/bookstore-logo.png" alt="" width={1254} height={1254} priority sizes="52px" /></Link>
        <Link className="category-trigger" href="/books" aria-label="Xem danh mục sách"><HeaderIcon name="grid" /><small>Danh mục</small></Link>
        <CatalogSearch />
        <nav className="header-actions" aria-label="Điều hướng mua sắm"><Link className="header-action header-favorite" href="/wishlist"><HeaderIcon name="heart" /><small>Yêu thích</small></Link><Link className="header-action" href="/cart"><HeaderIcon name="cart" /><small>Giỏ hàng</small></Link><AuthNavigation /></nav>
      </div>
    </header>
    <main className="container">{children}</main>
    <footer className="site-footer"><div className="container footer-grid">
      <section className="footer-intro"><Link className="brand brand-symbol" href="/" aria-label="Bookstore - Trang chủ"><Image className="brand-logo footer-logo" src="/brand/bookstore-logo.png" alt="" width={1254} height={1254} sizes="38px" /></Link><p>Những tựa sách chọn lọc cho hành trình học hỏi mỗi ngày.</p><span className="footer-note">Thanh toán khi nhận hàng (COD)</span></section>
      <nav aria-label="Mua sắm"><h2>Mua sắm</h2><Link href="/books">Tất cả sách</Link><Link href="/cart">Giỏ hàng</Link><Link href="/checkout">Thanh toán</Link></nav>
      <nav aria-label="Tài khoản và đơn hàng"><h2>Tài khoản</h2><Link href="/account">Tài khoản của tôi</Link><Link href="/wishlist">Sách yêu thích</Link><Link href="/orders">Theo dõi đơn hàng</Link><Link href="/login">Đăng nhập</Link></nav>
      <section className="footer-help"><h2>Mua hàng an tâm</h2><p>Giá và tồn kho được xác nhận lại trước khi tạo đơn.</p><p>Đơn đang chờ xác nhận có thể được hủy từ trang đơn hàng.</p></section>
    </div><div className="container footer-bottom">© {new Date().getFullYear()} Bookstore · Sách hay cho mỗi ngày.</div></footer>
  </body></html>;
}

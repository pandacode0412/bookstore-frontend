import Link from 'next/link';
import type { Metadata } from 'next';
import { listBanners, listBooks, listCategories } from '@/lib/api';
import type { Banner, Book, Category } from '@/lib/types';
import { BookCard } from '@/components/books/book-card';
import { HomeHeroCarousel } from '@/components/home/banner-carousel';
export const metadata: Metadata = { alternates: { canonical: '/' } };
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export default async function HomePage() {
  let books: Book[] = []; let categories: Category[] = []; let banners: Banner[] = []; let error = '';
  const [bookResult, categoryResult, bannerResult] = await Promise.allSettled([listBooks({ limit: 6 }), listCategories(), listBanners()]);
  if (bookResult.status === 'fulfilled') books = bookResult.value.items;
  else error = 'Không kết nối được Backend. Kiểm tra docker compose logs api.';
  if (categoryResult.status === 'fulfilled') categories = categoryResult.value;
  if (bannerResult.status === 'fulfilled') banners = bannerResult.value;
  return <>
    <h1 className="sr-only">Bookstore — Nhà sách trực tuyến</h1>
    {banners.length > 0 && <HomeHeroCarousel slides={banners} />}
    {categories.length > 0 && <section className="category-strip" aria-label="Danh mục sách"><span className="eyebrow">KHÁM PHÁ THEO CHỦ ĐỀ</span><div>{categories.map(category => <Link key={category.id} href={`/books?category=${encodeURIComponent(category.slug)}`}>{category.name} →</Link>)}</div></section>}
    <section className="section-heading"><div><div className="eyebrow">CẬP NHẬT TỪ CỬA HÀNG</div><h2>Sách mới cập nhật</h2></div><Link href="/books" className="text-link">Xem tất cả sách</Link></section>
    {error && <div className="error">{error}</div>}
    {!error && books.length === 0 && <section className="home-catalog-empty"><h2>Chưa có sách đang bán</h2><p>Những tựa sách được Admin đặt trạng thái “Đang bán” sẽ xuất hiện tại đây.</p></section>}
    {books.length > 0 && <div className="book-grid">{books.map(book => <BookCard key={book.id} book={book}/>)}</div>}
    <section className="commerce-notes" aria-label="Cam kết mua sắm"><div><strong>Giá minh bạch</strong><span>Hiển thị giá bán từ dữ liệu sản phẩm hiện tại.</span></div><div><strong>Kho cập nhật</strong><span>Tình trạng còn hàng lấy trực tiếp từ hệ thống.</span></div><div><strong>Thanh toán COD</strong><span>Đơn hàng được đặt theo hình thức thanh toán khi nhận hàng.</span></div></section>
  </>;
}

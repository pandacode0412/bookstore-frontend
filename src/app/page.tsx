import Link from 'next/link';
import type { Metadata } from 'next';
import { listBanners, listBooks, listCategories } from '@/lib/api';
import type { Banner, Book, Category } from '@/lib/types';
import { BookCard } from '@/components/books/book-card';
import { HomeHeroCarousel } from '@/components/home/banner-carousel';
export const metadata: Metadata = { alternates: { canonical: '/' } };
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
    <section className="section-heading"><div><div className="eyebrow">TUYỂN CHỌN HÔM NAY</div><h2>Sách nổi bật</h2></div><Link href="/books" className="text-link">Xem tất cả sách</Link></section>
    {error && <div className="error">{error}</div>}
    {!error && books.length === 0 && <p>Chưa có sách. Kiểm tra seed dữ liệu trong Backend.</p>}
    <div className="book-grid">{books.map(book => <BookCard key={book.id} book={book}/>)}</div>
    <section className="commerce-notes" aria-label="Cam kết mua sắm"><div><strong>Giá minh bạch</strong><span>Hiển thị giá bán ngay trên từng tựa sách.</span></div><div><strong>Kho cập nhật</strong><span>Tình trạng còn hàng lấy trực tiếp từ hệ thống.</span></div><div><strong>Thanh toán an toàn</strong><span>Đặt hàng COD sẽ được triển khai ở giai đoạn tiếp theo.</span></div></section>
  </>;
}

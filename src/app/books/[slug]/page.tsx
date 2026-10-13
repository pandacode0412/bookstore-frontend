import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBook, vnd } from '@/lib/api';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { WishlistToggle } from '@/components/wishlist/wishlist-toggle';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBook(slug).catch(() => null);
  if (!book) return { title: 'Không tìm thấy sách', robots: { index: false, follow: false } };
  const description = book.description || `Mua ${book.title} tại Bookstore. Xem giá và tình trạng kho mới nhất.`;
  return { title: book.title, description, alternates: { canonical: `/books/${book.slug}` }, openGraph: { type: 'website', title: book.title, description, url: `/books/${book.slug}` } };
}

export default async function BookDetailPage({params}: { params: Promise<{slug:string}> }) {
  const {slug} = await params;
  const book = await getBook(slug).catch(() => null);
  if (!book) notFound();
  const price = book.salePriceVnd ?? book.priceVnd;
  const description = book.description || `Mua ${book.title} tại Bookstore. Xem giá và tình trạng kho mới nhất.`;
  const productJsonLd = { '@context': 'https://schema.org', '@type': 'Product', name: book.title, sku: book.sku, description, category: book.category.name, offers: { '@type': 'Offer', priceCurrency: 'VND', price, availability: book.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', url: `${siteUrl}/books/${book.slug}` } };
  const breadcrumbJsonLd = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Trang chủ', item: siteUrl }, { '@type': 'ListItem', position: 2, name: 'Sách', item: `${siteUrl}/books` }, { '@type': 'ListItem', position: 3, name: book.title, item: `${siteUrl}/books/${book.slug}` }] };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} /><section className="detail"><div className="detail-cover" aria-hidden="true">📘</div><div>
    <Link href="/books" className="eyebrow">← Quay lại danh mục</Link>
    <h1>{book.title}</h1><p>{book.category.name} · {book.sku}</p>
    {book.bookAuthors.length > 0 && <p>Tác giả: {book.bookAuthors.map(({ author }) => author.name).join(', ')}</p>}
    <p className="detail-price">{vnd(price)}</p>
    {book.salePriceVnd != null && <p className="old-price">Giá bìa {vnd(book.priceVnd)}</p>}
    <p className="stock-status">{book.stock > 0 ? `Còn ${book.stock} cuốn trong kho` : 'Tạm hết hàng'}</p>
    <p>{book.description || 'Thông tin mô tả đang được cập nhật.'}</p>
    <AddToCartButton bookId={book.id} inStock={book.stock > 0} />
    <WishlistToggle bookId={book.id} />
    <div className="purchase-callout"><strong>{book.stock > 0 ? 'Thanh toán an toàn' : 'Thông báo khi có hàng'}</strong><span>{book.stock > 0 ? 'Giá và tồn kho luôn được kiểm tra lại trước khi đặt hàng.' : 'Tựa sách này hiện chưa thể đặt.'}</span></div>
  </div></section></>;
}

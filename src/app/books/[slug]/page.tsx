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
  const authors = book.bookAuthors.map(({ author }) => author.name).join(', ');
  const discount = book.salePriceVnd != null ? Math.round((1 - book.salePriceVnd / book.priceVnd) * 100) : 0;
  const description = book.description || `Mua ${book.title} tại Bookstore. Xem giá và tình trạng kho mới nhất.`;
  const productJsonLd = { '@context': 'https://schema.org', '@type': 'Product', name: book.title, sku: book.sku, description, category: book.category.name, offers: { '@type': 'Offer', priceCurrency: 'VND', price, availability: book.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', url: `${siteUrl}/books/${book.slug}` } };
  const breadcrumbJsonLd = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Trang chủ', item: siteUrl }, { '@type': 'ListItem', position: 2, name: 'Sách', item: `${siteUrl}/books` }, { '@type': 'ListItem', position: 3, name: book.title, item: `${siteUrl}/books/${book.slug}` }] };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} /><section className="product-page">
    <nav className="product-breadcrumb" aria-label="Đường dẫn"><Link href="/">Trang chủ</Link><span aria-hidden="true">/</span><Link href="/books">Sách</Link><span aria-hidden="true">/</span><span>{book.title}</span></nav>
    <article className="product-detail-card"><header className="product-detail-heading"><div className="eyebrow">{book.category.name}</div><h1>{book.title}</h1><dl className="product-meta"><div><dt>Mã sách</dt><dd>{book.sku}</dd></div>{authors && <div><dt>Tác giả</dt><dd>{authors}</dd></div>}{book.isbn && <div><dt>ISBN</dt><dd>{book.isbn}</dd></div>}</dl></header>
      <div className="product-detail-layout"><section className="product-gallery" aria-label={`Ảnh bìa sách ${book.title}`}><div className="product-cover-frame">{book.coverUrl ? <img src={book.coverUrl} alt={`Bìa sách ${book.title}`} /> : <div className="product-cover-placeholder" aria-hidden="true"><strong>{book.title.slice(0, 1)}</strong><span>{book.category.name}</span></div>}</div><span className="product-cover-caption">Ảnh bìa sản phẩm</span></section>
        <aside className="product-purchase"><section className="product-price-panel"><span>Giá sản phẩm</span><strong>{vnd(price)}</strong>{book.salePriceVnd != null && <div><del>{vnd(book.priceVnd)}</del>{discount > 0 && <em>Giảm {discount}%</em>}</div>}</section><section className="product-info-panel"><div><span>Tình trạng</span><strong className={book.stock > 0 ? 'is-in-stock' : 'is-out-of-stock'}>{book.stock > 0 ? `Còn ${book.stock} cuốn` : 'Tạm hết hàng'}</strong></div><div><span>Danh mục</span><Link href={`/books?category=${encodeURIComponent(book.category.slug)}`}>{book.category.name}</Link></div>{authors && <div><span>Tác giả</span><strong>{authors}</strong></div>}<AddToCartButton bookId={book.id} inStock={book.stock > 0} /><WishlistToggle bookId={book.id} /></section><section className="product-assurance"><strong>Mua hàng an tâm</strong><span>Giá và tồn kho được kiểm tra lại trước khi tạo đơn. Thanh toán khi nhận hàng (COD).</span></section></aside>
      </div><section className="product-description"><h2>Giới thiệu sách</h2><p>{description}</p></section>
    </article>
  </section></>;
}

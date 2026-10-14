import Link from 'next/link';
import type { Metadata } from 'next';
import { BookCard } from '@/components/books/book-card';
import { listBooks, listCategories } from '@/lib/api';
import type { BookListQuery, Category } from '@/lib/types';

type SearchParams = Record<string, string | string[] | undefined>;
type BookSort = NonNullable<BookListQuery['sort']>;
const sorts = new Set<BookSort>(['newest', 'price_asc', 'price_desc', 'bestselling']);

export const metadata: Metadata = {
  title: 'Danh mục sách',
  description: 'Tìm và khám phá những tựa sách chọn lọc tại Bookstore.',
  alternates: { canonical: '/books' },
};
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseQuery(params: SearchParams): Required<BookListQuery> {
  const rawPage = Number(first(params.page));
  const rawQ = (first(params.q) ?? '').trim();
  const rawCategory = (first(params.category) ?? '').trim();
  const rawSort = first(params.sort);
  const onSale = first(params.onSale) === 'true';
  return {
    page: Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1,
    limit: 12,
    q: rawQ.slice(0, 100),
    category: /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(rawCategory) ? rawCategory : '',
    onSale,
    sort: sorts.has(rawSort as BookSort) ? rawSort as BookSort : 'newest',
  };
}

function pageHref(query: Required<BookListQuery>, page: number) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  if (query.q) params.set('q', query.q);
  if (query.category) params.set('category', query.category);
  if (query.onSale) params.set('onSale', 'true');
  if (query.sort !== 'newest') params.set('sort', query.sort);
  return `/books?${params.toString()}`;
}

function CatalogFilters({ categories, query }: { categories: Category[]; query: Required<BookListQuery> }) {
  return <form className="catalog-filters" action="/books">
    <label className="search-field" htmlFor="catalog-q"><span>Tìm sách</span>
      <input id="catalog-q" name="q" type="search" defaultValue={query.q} maxLength={100} placeholder="Nhập tên sách" />
    </label>
    <label htmlFor="catalog-category"><span>Danh mục</span>
      <select id="catalog-category" name="category" defaultValue={query.category}>
        <option value="">Tất cả danh mục</option>
        {categories.map(category => <option key={category.id} value={category.slug}>{category.name}</option>)}
      </select>
    </label>
    <label htmlFor="catalog-sort"><span>Sắp xếp</span>
      <select id="catalog-sort" name="sort" defaultValue={query.sort}>
        <option value="newest">Mới nhất</option>
        <option value="bestselling">Bán chạy</option>
        <option value="price_asc">Giá thấp đến cao</option>
        <option value="price_desc">Giá cao đến thấp</option>
      </select>
    </label>
    <label className="catalog-sale-filter" htmlFor="catalog-on-sale"><input id="catalog-on-sale" name="onSale" type="checkbox" value="true" defaultChecked={query.onSale} /><span>Chỉ sách khuyến mãi</span></label>
    <button className="button" type="submit">Lọc sách</button>
  </form>;
}

export default async function BooksPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const query = parseQuery(await searchParams);
  let categories: Category[] = [];
  let catalogError = '';
  let categoryError = '';
  const [booksResult, categoriesResult] = await Promise.allSettled([listBooks(query), listCategories()]);
  if (booksResult.status === 'rejected') catalogError = 'Không thể tải danh mục sách. Vui lòng thử lại sau.';
  if (categoriesResult.status === 'fulfilled') categories = categoriesResult.value;
  else categoryError = 'Danh sách danh mục hiện chưa tải được; bạn vẫn có thể tìm theo tên và sắp xếp.';
  const books = booksResult.status === 'fulfilled' ? booksResult.value : null;

  return <section className="catalog-page">
    <div className="catalog-intro"><div><div className="eyebrow">DANH MỤC SÁCH</div><h1>Tìm cuốn sách phù hợp</h1></div>
      {books && <p>{books.meta.total} tựa sách</p>}</div>
    <CatalogFilters categories={categories} query={query} />
    {categoryError && <p className="notice">{categoryError}</p>}
    {catalogError && <div className="error" role="alert"><p>{catalogError}</p><Link className="button" href={pageHref(query, query.page)}>Thử lại</Link></div>}
    {books && books.items.length === 0 && <div className="catalog-empty"><h2>Không tìm thấy sách phù hợp</h2><p>Hãy thử từ khóa khác hoặc bỏ bộ lọc danh mục.</p><Link href="/books" className="text-link">Xem toàn bộ sách</Link></div>}
    {books && books.items.length > 0 && <div className="book-grid">{books.items.map(book => <BookCard key={book.id} book={book} />)}</div>}
    {books && books.meta.totalPages > 1 && <nav className="pagination" aria-label="Phân trang sách">
      {books.meta.page > 1 ? <Link href={pageHref(query, books.meta.page - 1)}>← Trước</Link> : <span aria-disabled="true">← Trước</span>}
      <span>Trang {books.meta.page} / {books.meta.totalPages}</span>
      {books.meta.page < books.meta.totalPages ? <Link href={pageHref(query, books.meta.page + 1)}>Sau →</Link> : <span aria-disabled="true">Sau →</span>}
    </nav>}
  </section>;
}

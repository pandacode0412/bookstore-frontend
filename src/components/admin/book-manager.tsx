'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Archive, BookOpen, CheckCircle2, CircleOff, Eye, FilePenLine, LoaderCircle, PackageX, Plus, RefreshCw, Search } from 'lucide-react';
import { AdminPagination } from '@/components/admin/admin-pagination';
import { BrowserApiError, browserApi } from '@/lib/browser-api';
import { notifyCatalogChanged } from '@/lib/catalog-change';
import { vnd } from '@/lib/api';
import type { AdminBook, AdminBookPage, AdminBookSummary, AdminCategory } from '@/lib/types';

const labels: Record<AdminBook['status'], string> = { DRAFT: 'Nháp', PUBLISHED: 'Đang bán', ARCHIVED: 'Lưu trữ' };
const message = (cause: unknown, fallback: string) => cause instanceof BrowserApiError ? cause.message : fallback;

export function BookManager() {
  const [books, setBooks] = useState<AdminBookPage | null>(null);
  const [summary, setSummary] = useState<AdminBookSummary | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [page, setPage] = useState(1);
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState('');
  const [summaryError, setSummaryError] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [archiving, setArchiving] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try { const items = await browserApi<AdminCategory[]>('/admin/categories'); setCategories(items); setCategoriesError(''); }
    catch (cause) { setCategories([]); setCategoriesError(message(cause, 'Không thể tải thể loại để lọc sách.')); }
  }, []);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (query) params.set('q', query); if (status) params.set('status', status); if (categoryId) params.set('categoryId', categoryId);
    const [booksResult, summaryResult] = await Promise.allSettled([browserApi<AdminBookPage>(`/admin/books?${params.toString()}`), browserApi<AdminBookSummary>('/admin/books/summary')]);
    if (booksResult.status === 'fulfilled') setBooks(booksResult.value); else setError(message(booksResult.reason, 'Không thể tải danh sách sách.'));
    if (summaryResult.status === 'fulfilled') { setSummary(summaryResult.value); setSummaryError(''); } else { setSummary(null); setSummaryError('Không thể tải thống kê sách.'); }
    setLoading(false);
  }, [categoryId, page, query, status]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { void loadCategories(); }, [loadCategories]);

  const isFiltered = Boolean(query || status || categoryId);
  const stats = useMemo(() => summary ? [
    { label: 'Tổng số sách', value: summary.total, icon: BookOpen }, { label: 'Sách đang bán', value: summary.published, icon: CheckCircle2 },
    { label: 'Sách hết hàng', value: summary.outOfStock, icon: PackageX }, { label: 'Sách nháp', value: summary.draft, icon: FilePenLine },
  ] : [], [summary]);

  function submitSearch(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setPage(1); setQuery(queryInput.trim()); }
  function setFilter(setter: (value: string) => void, value: string) { setter(value); setPage(1); }
  function clearFilters() { setQueryInput(''); setQuery(''); setStatus(''); setCategoryId(''); setPage(1); }
  async function archive(book: AdminBook) {
    if (!window.confirm(`Lưu trữ “${book.title}”? Sách sẽ không còn hiển thị trên cửa hàng, nhưng lịch sử đơn hàng vẫn được giữ.`)) return;
    setArchiving(book.id); setError(''); setNotice('');
    try { await browserApi<AdminBook>(`/admin/books/${book.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'ARCHIVED' }) }); notifyCatalogChanged(); setNotice(`Đã lưu trữ “${book.title}”.`); await load(); }
    catch (cause) { setError(message(cause, 'Không thể lưu trữ sách.')); } finally { setArchiving(null); }
  }

  return <section className="admin-module-page admin-books-page">
    <header className="admin-module-heading admin-books-heading"><div><h1>Quản lý sách</h1><p>Quản lý sản phẩm, giá bán và tồn kho</p></div><Link className="button admin-primary-action" href="/admin/books/new"><Plus aria-hidden="true" size={18} />Thêm sách</Link></header>
    {summaryError ? <p className="admin-data-note" role="status">{summaryError}</p> : <section className="admin-book-kpis" aria-label="Thống kê sách" aria-busy={!summary}>{summary ? stats.map(({ label, value, icon: Icon }) => <article key={label}><div><span>{label}</span><Icon aria-hidden="true" size={18} /></div><strong>{value}</strong></article>) : Array.from({ length: 4 }, (_, index) => <article className="is-loading" key={index}><div><span>Đang tải</span><LoaderCircle aria-hidden="true" className="admin-icon-spin" size={18} /></div><strong>—</strong></article>)}</section>}
    <form className="admin-toolbar admin-book-toolbar" onSubmit={submitSearch}>
      <label className="admin-book-search"><Search aria-hidden="true" size={18} /><span className="sr-only">Tìm sách</span><input value={queryInput} onChange={(event) => setQueryInput(event.target.value)} placeholder="Tìm tên sách hoặc SKU" aria-label="Tìm theo tên sách hoặc SKU" /></label>
      <select value={categoryId} onChange={(event) => setFilter(setCategoryId, event.target.value)} aria-label="Lọc theo thể loại" disabled={Boolean(categoriesError)}><option value="">Tất cả thể loại</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}{category.isActive ? '' : ' (đã ẩn)'}</option>)}</select>
      <select value={status} onChange={(event) => setFilter(setStatus, event.target.value)} aria-label="Lọc theo trạng thái"><option value="">Tất cả trạng thái</option>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      <button className="button admin-search-button" type="submit" disabled={loading || Boolean(archiving)}><Search aria-hidden="true" size={16} />Tìm kiếm</button>
      <button className="secondary-button admin-book-refresh" type="button" onClick={() => void load()} disabled={loading || Boolean(archiving)} aria-label="Làm mới danh sách sách" title="Làm mới"><RefreshCw aria-hidden="true" size={17} className={loading ? 'admin-icon-spin' : undefined} /><span>Làm mới</span></button>
      {isFiltered && <button className="secondary-button admin-clear-filters" type="button" onClick={clearFilters} disabled={loading || Boolean(archiving)}>Xóa bộ lọc</button>}
    </form>
    {categoriesError && <div className="admin-inline-error" role="alert"><span>{categoriesError}</span><button className="text-link" type="button" onClick={() => void loadCategories()}>Thử lại</button></div>}
    {notice && <p className="admin-success" role="status">{notice}</p>}{error && <div className="admin-books-error" role="alert"><p>{error}</p><button className="secondary-button" type="button" onClick={() => void load()} disabled={loading}>Thử lại</button></div>}
    <section className="admin-panel admin-table-panel admin-books-panel"><div className="admin-panel-heading"><div><h2>Danh sách sách</h2><p>{books ? `${books.meta.total} bản ghi` : 'Đang tải dữ liệu…'}</p></div></div>
      {books === null && !error ? <div className="admin-books-empty" aria-busy="true"><LoaderCircle aria-hidden="true" size={28} className="admin-icon-spin" /><h3>Đang tải sách…</h3></div> : books && books.items.length === 0 ? <div className="admin-books-empty"><CircleOff aria-hidden="true" size={32} /><h3>{isFiltered ? 'Không tìm thấy sách phù hợp' : 'Chưa có sách'}</h3><p>{isFiltered ? 'Hãy thử điều chỉnh từ khóa hoặc bộ lọc.' : 'Thêm sách đầu tiên để bắt đầu quản lý catalog.'}</p>{isFiltered ? <button className="secondary-button" type="button" onClick={clearFilters}>Xóa bộ lọc</button> : <Link className="button" href="/admin/books/new"><Plus aria-hidden="true" size={17} />Thêm sách</Link>}</div> : books && <div className="admin-table-wrap"><table className="admin-table admin-books-table"><thead><tr><th>Ảnh bìa</th><th>Sách</th><th>Thể loại</th><th>Giá bán</th><th>Tồn kho</th><th>Trạng thái</th><th><span className="sr-only">Thao tác</span></th></tr></thead><tbody>{books.items.map((book) => <tr key={book.id}><td data-label="Ảnh bìa"><div className="admin-book-cover">{book.coverUrl ? <img src={book.coverUrl} alt={`Bìa sách ${book.title}`} /> : <span title="Chưa có ảnh bìa"><BookOpen aria-hidden="true" size={20} /></span>}</div></td><td data-label="Sách"><strong>{book.title}</strong><small>{book.sku}{book.isbn ? ` · ISBN ${book.isbn}` : ''}</small></td><td data-label="Thể loại">{book.category.name}</td><td data-label="Giá bán"><strong>{vnd(book.salePriceVnd ?? book.priceVnd)}</strong>{book.salePriceVnd !== null && <small className="admin-book-base-price">{vnd(book.priceVnd)}</small>}</td><td data-label="Tồn kho"><span className={book.stock === 0 ? 'admin-stock-empty' : undefined}>{book.stock}</span></td><td data-label="Trạng thái"><span className={`admin-tag is-${book.status.toLowerCase()}`}>{labels[book.status]}</span></td><td className="admin-book-actions" data-label="Thao tác">{book.status === 'PUBLISHED' && <Link className="admin-icon-button" href={`/books/${book.slug}`} aria-label={`Xem ${book.title} trên cửa hàng`} title="Xem trên cửa hàng"><Eye aria-hidden="true" size={18} /></Link>}<Link className="admin-icon-button" href={`/admin/books/${book.id}/edit`} aria-label={`Sửa ${book.title}`} title="Chỉnh sửa"><FilePenLine aria-hidden="true" size={18} /></Link>{book.status !== 'ARCHIVED' && <button type="button" className="admin-icon-button is-danger" onClick={() => void archive(book)} disabled={archiving === book.id} aria-label={`Lưu trữ ${book.title}`} title="Lưu trữ">{archiving === book.id ? <LoaderCircle aria-hidden="true" size={18} className="admin-icon-spin" /> : <Archive aria-hidden="true" size={18} />}</button>}</td></tr>)}</tbody></table></div>}
      {books && <AdminPagination meta={books.meta} onPageChange={setPage} label="danh sách sách" />}
    </section>
  </section>;
}

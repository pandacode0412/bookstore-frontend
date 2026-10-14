import type { Banner, BookDetail, BookListQuery, BookPage, Category } from './types';
const base = process.env.API_INTERNAL_URL || 'http://localhost:4000/api';
export async function listBooks(query: BookListQuery = {}): Promise<BookPage> {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.q) params.set('q', query.q);
  if (query.category) params.set('category', query.category);
  if (query.onSale) params.set('onSale', 'true');
  if (query.sort && query.sort !== 'newest') params.set('sort', query.sort);
  const suffix = params.size ? `?${params.toString()}` : '';
  const res = await fetch(`${base}/books${suffix}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Books API failed: ${res.status}`);
  return res.json();
}
export async function listCategories(): Promise<Category[]> {
  const res = await fetch(`${base}/categories`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Categories API failed: ${res.status}`);
  return res.json();
}
export async function listBanners(): Promise<Banner[]> {
  const res = await fetch(`${base}/banners`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Banners API failed: ${res.status}`);
  return res.json();
}
export async function getBook(slug: string): Promise<BookDetail | null> {
  const res = await fetch(`${base}/books/${encodeURIComponent(slug)}`, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Book API failed: ${res.status}`);
  return res.json();
}
export const vnd = (amount: number) => `${new Intl.NumberFormat('vi-VN').format(amount)} ₫`;

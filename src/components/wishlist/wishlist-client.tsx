'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BrowserApiError, browserApi } from '@/lib/browser-api';
import type { Wishlist } from '@/lib/types';
import { BookCard } from '@/components/books/book-card';

export function WishlistClient() {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState('');

  function load() { browserApi<Wishlist>('/wishlist').then(value => { setWishlist(value); setError(''); }).catch(cause => setError(cause instanceof BrowserApiError && cause.status === 401 ? 'Hãy đăng nhập để lưu và xem các sách yêu thích.' : 'Không thể tải danh sách yêu thích.')); }
  useEffect(() => { load(); }, []);

  async function remove(bookId: string) {
    setRemovingId(bookId); setError('');
    try { await browserApi<void>(`/wishlist/items/${bookId}`, { method: 'DELETE' }); setWishlist(current => current ? { items: current.items.filter(book => book.id !== bookId) } : current); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể xóa sách.'); }
    finally { setRemovingId(''); }
  }

  if (error && !wishlist) return <section className="wishlist-page wishlist-state"><div className="eyebrow">YÊU THÍCH</div><h1>Danh sách yêu thích</h1><p>{error}</p><Link className="button" href="/login">Đăng nhập</Link></section>;
  if (!wishlist) return <section className="wishlist-page wishlist-state" aria-busy="true"><h1>Đang tải sách yêu thích…</h1></section>;
  if (wishlist.items.length === 0) return <section className="wishlist-page wishlist-state"><div className="eyebrow">YÊU THÍCH</div><h1>Chưa có sách yêu thích</h1><p>Lưu những tựa sách bạn muốn đọc để quay lại bất cứ lúc nào.</p><Link className="button" href="/books">Khám phá sách</Link></section>;
  return <section className="wishlist-page"><div className="section-heading"><div><div className="eyebrow">YÊU THÍCH</div><h1>Sách bạn đã lưu</h1><p>{wishlist.items.length} tựa sách trong danh sách của bạn.</p></div><Link className="text-link" href="/books">Khám phá thêm sách</Link></div>{error && <div className="error" role="alert">{error}</div>}<div className="wishlist-grid">{wishlist.items.map(book => <article className="wishlist-item" key={book.id}><BookCard book={book} /><button type="button" onClick={() => void remove(book.id)} disabled={removingId === book.id}>{removingId === book.id ? 'Đang xóa…' : 'Bỏ yêu thích'}</button></article>)}</div></section>;
}

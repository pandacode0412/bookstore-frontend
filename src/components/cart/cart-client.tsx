'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BrowserApiError, browserApi } from '@/lib/browser-api';
import { vnd } from '@/lib/api';
import type { Cart } from '@/lib/types';
import { HeaderIcon } from '@/components/layout/header-icon';

export function CartClient() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState('');
  const [authRequired, setAuthRequired] = useState(false);
  const [pendingBookId, setPendingBookId] = useState('');
  async function load() {
    try { setCart(await browserApi<Cart>('/cart')); setError(''); setAuthRequired(false); }
    catch (cause) { const needsLogin = cause instanceof BrowserApiError && cause.status === 401; setAuthRequired(needsLogin); setError(needsLogin ? 'Hãy đăng nhập để xem giỏ hàng.' : 'Không thể tải giỏ hàng.'); }
  }
  useEffect(() => { void load(); }, []);
  async function update(bookId: string, quantity: number) {
    setPendingBookId(bookId); setError('');
    try { setCart(await browserApi<Cart>(`/cart/items/${bookId}`, { method: 'PATCH', body: JSON.stringify({ quantity }) })); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể cập nhật giỏ hàng.'); }
    finally { setPendingBookId(''); }
  }
  async function remove(bookId: string) {
    setPendingBookId(bookId); setError('');
    try { await browserApi<void>(`/cart/items/${bookId}`, { method: 'DELETE' }); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể xóa sách.'); }
    finally { setPendingBookId(''); }
  }
  if (error && !cart && authRequired) return <section className="cart-auth"><div className="cart-auth-visual" aria-hidden="true"><HeaderIcon name="cart" /><span>BOOKSTORE</span></div><div className="cart-auth-copy"><div className="eyebrow">GIỎ HÀNG CỦA BẠN</div><h1>Lưu những cuốn sách bạn yêu thích</h1><p>Đăng nhập để thêm sách vào giỏ, đặt hàng COD và theo dõi từng đơn hàng của bạn.</p><div className="cart-auth-actions"><Link className="button" href="/login">Đăng nhập để tiếp tục</Link><Link className="text-link" href="/books">Xem sách trước</Link></div><div className="cart-auth-benefits"><span><b>✓</b> Giỏ hàng được lưu theo tài khoản</span><span><b>✓</b> Theo dõi và hủy đơn chờ xác nhận</span></div></div></section>;
  if (error && !cart) return <div className="cart-empty"><h1>Chưa thể tải giỏ hàng</h1><p>{error}</p><button className="secondary-button" type="button" onClick={() => void load()}>Thử lại</button></div>;
  if (!cart) return <div className="cart-empty" aria-busy="true"><h1>Đang tải giỏ hàng…</h1></div>;
  if (cart.items.length === 0) return <div className="cart-empty"><h1>Giỏ hàng đang trống</h1><p>Hãy chọn một tựa sách để bắt đầu hành trình đọc của bạn.</p><Link className="button" href="/books">Khám phá sách</Link></div>;
  return <div className="cart-layout"><section><div className="eyebrow">GIỎ HÀNG</div><h1>Sách bạn đã chọn</h1>{error && <div className="error" role="alert">{error}</div>}<div className="cart-lines">{cart.items.map(({ book, quantity, unitPriceVnd, lineTotalVnd }) => <article className="cart-line" key={book.id}><div className="cart-cover" aria-hidden="true">📚</div><div className="cart-book"><Link href={`/books/${book.slug}`}><h2>{book.title}</h2></Link><p>{book.category.name} · {vnd(unitPriceVnd)}</p><p className={book.stock > 0 ? 'stock-status' : 'out-of-stock'}>{book.stock > 0 ? `Còn ${book.stock} cuốn` : 'Tạm hết hàng'}</p></div><div className="cart-actions"><label htmlFor={`quantity-${book.id}`}>Số lượng<select id={`quantity-${book.id}`} value={quantity} disabled={pendingBookId === book.id} onChange={event => void update(book.id, Number(event.target.value))}>{Array.from({ length: Math.min(99, Math.max(1, book.stock)) }, (_, index) => index + 1).map(value => <option key={value} value={value}>{value}</option>)}</select></label><strong>{vnd(lineTotalVnd)}</strong><button type="button" onClick={() => void remove(book.id)} disabled={pendingBookId === book.id}>Xóa</button></div></article>)}</div></section><aside className="cart-summary"><h2>Tóm tắt đơn hàng</h2><div><span>Tạm tính</span><strong>{vnd(cart.estimatedSubtotalVnd)}</strong></div><div><span>Phí giao hàng</span><span>Miễn phí giao hàng</span></div><hr/><div className="cart-total"><span>Tổng thanh toán</span><strong>{vnd(cart.estimatedSubtotalVnd)}</strong></div><p>Giá và tồn kho sẽ được kiểm tra lại trước khi tạo đơn.</p><Link className="button" href="/checkout">Tiến hành thanh toán</Link></aside></div>;
}

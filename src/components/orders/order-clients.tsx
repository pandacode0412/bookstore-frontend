'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BrowserApiError, browserApi } from '@/lib/browser-api';
import { vnd } from '@/lib/api';
import type { Order } from '@/lib/types';

const label: Record<Order['status'], string> = { PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận', PACKING: 'Đang đóng gói', SHIPPING: 'Đang giao', DELIVERED: 'Đã giao', CANCELED: 'Đã hủy' };
const date = (value: string) => new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
function OrderCard({ order }: { order: Order }) { return <article className="order-card"><div><span className={`order-status status-${order.status.toLowerCase()}`}>{label[order.status]}</span><h2>Đơn {order.orderCode}</h2><p>{date(order.createdAt)} · {order.items.reduce((total, item) => total + item.quantity, 0)} sản phẩm</p></div><div className="order-amount"><strong>{vnd(order.totalVnd)}</strong><Link className="text-link" href={`/orders/${order.id}`}>Xem chi tiết</Link></div></article>; }
export function OrderListClient() {
  const [orders, setOrders] = useState<Order[] | null>(null); const [error, setError] = useState('');
  useEffect(() => { browserApi<Order[]>('/orders/me').then(setOrders).catch(cause => setError(cause instanceof BrowserApiError && cause.status === 401 ? 'Hãy đăng nhập để xem đơn hàng.' : 'Không thể tải đơn hàng.')); }, []);
  if (error) return <div className="cart-empty"><h1>Đơn hàng của tôi</h1><p>{error}</p><Link className="button" href="/login">Đăng nhập</Link></div>;
  if (!orders) return <div className="cart-empty" aria-busy="true"><h1>Đang tải đơn hàng…</h1></div>;
  if (orders.length === 0) return <div className="cart-empty"><h1>Bạn chưa có đơn hàng</h1><p>Những đơn COD bạn đặt sẽ xuất hiện ở đây.</p><Link className="button" href="/books">Mua sách ngay</Link></div>;
  return <section className="orders-page"><div className="eyebrow">TÀI KHOẢN</div><h1>Đơn hàng của tôi</h1><div className="orders-list">{orders.map(order => <OrderCard key={order.id} order={order} />)}</div></section>;
}
export function OrderDetailClient({ id }: { id: string }) {
  const [order, setOrder] = useState<Order | null>(null); const [error, setError] = useState(''); const [cancelling, setCancelling] = useState(false);
  useEffect(() => { browserApi<Order>(`/orders/${id}`).then(setOrder).catch(cause => setError(cause instanceof BrowserApiError && cause.status === 401 ? 'Hãy đăng nhập để xem đơn hàng.' : 'Không tìm thấy đơn hàng này.')); }, [id]);
  async function cancel() { if (!order || !confirm('Bạn muốn hủy đơn hàng này?')) return; setCancelling(true); setError(''); try { setOrder(await browserApi<Order>(`/orders/${order.id}/cancel`, { method: 'POST' })); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể hủy đơn hàng.'); } finally { setCancelling(false); } }
  if (error && !order) return <div className="cart-empty"><h1>Không thể mở đơn hàng</h1><p>{error}</p><Link className="button" href="/orders">Về đơn hàng</Link></div>;
  if (!order) return <div className="cart-empty" aria-busy="true"><h1>Đang tải đơn hàng…</h1></div>;
  const address = order.addressSnapshot;
  return <section className="order-detail"><Link className="text-link" href="/orders">← Đơn hàng của tôi</Link><div className="order-heading"><div><div className="eyebrow">{order.orderCode}</div><h1>Chi tiết đơn hàng</h1><p>{date(order.createdAt)}</p></div><span className={`order-status status-${order.status.toLowerCase()}`}>{label[order.status]}</span></div>{error && <div className="error" role="alert">{error}</div>}<div className="order-detail-grid"><section className="order-products"><h2>Sản phẩm</h2>{order.items.map(item => <div className="order-product" key={item.bookId}><div><strong>{item.titleSnapshot}</strong><span>{item.skuSnapshot} · {vnd(item.unitPriceVnd)} × {item.quantity}</span></div><strong>{vnd(item.lineTotalVnd)}</strong></div>)}<div className="order-total"><span>Tổng thanh toán</span><strong>{vnd(order.totalVnd)}</strong></div></section><aside className="order-side"><h2>Giao đến</h2><p><strong>{address.recipientName}</strong><br />{address.phone}<br />{address.line1}{address.ward ? `, ${address.ward}` : ''}{address.district ? `, ${address.district}` : ''}<br />{address.city}</p><h2>Thanh toán</h2><p>COD · Chưa thanh toán</p>{order.note && <><h2>Ghi chú</h2><p>{order.note}</p></>}{order.status === 'PENDING' && <button className="secondary-button danger-button" type="button" disabled={cancelling} onClick={() => void cancel()}>{cancelling ? 'Đang hủy…' : 'Hủy đơn hàng'}</button>}</aside></div></section>;
}

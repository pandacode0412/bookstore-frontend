'use client';

import { useCallback, useEffect, useState } from 'react';
import { BookOpen, CircleDollarSign, Clock3, PackageCheck, ShoppingBag, Users } from 'lucide-react';
import { BrowserApiError, browserApi } from '@/lib/browser-api';
import { vnd } from '@/lib/api';
import type { AdminDashboard, OrderStatus } from '@/lib/types';

const statusLabels: Record<OrderStatus, string> = {
  PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận', PACKING: 'Đang đóng gói',
  SHIPPING: 'Đang giao', DELIVERED: 'Đã giao', CANCELED: 'Đã hủy',
};
const orderStatuses = Object.keys(statusLabels) as OrderStatus[];
const date = (value: string) => new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

export function AdminDashboardClient({ children }: { children?: React.ReactNode }) {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [error, setError] = useState('');
  const load = useCallback(() => {
    setDashboard(null);
    setError('');
    browserApi<AdminDashboard>('/admin/dashboard').then(setDashboard).catch((cause: unknown) => {
      if (cause instanceof BrowserApiError && cause.status === 403) setError('Tài khoản này không có quyền xem báo cáo quản trị.');
      else if (cause instanceof BrowserApiError && cause.status === 401) setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      else setError('Không thể tải dữ liệu quản trị. Vui lòng thử lại.');
    });
  }, []);
  useEffect(() => { load(); }, [load]);

  if (error) return <section className="admin-state"><div className="eyebrow">QUẢN TRỊ</div><h1>Chưa tải được dashboard</h1><p>{error}</p><button type="button" className="button" onClick={load}>Thử lại</button></section>;
  if (!dashboard) return <section className="admin-state" aria-busy="true"><div className="eyebrow">QUẢN TRỊ</div><h1>Đang tải dashboard…</h1><p>Dữ liệu vận hành đang được tổng hợp.</p></section>;

  const { metrics, orderStatus, recentOrders } = dashboard;
  const cards = [
    { label: 'Tổng đơn hàng', value: String(metrics.totalOrders), note: `${metrics.pendingOrders} đơn cần xác nhận`, icon: ShoppingBag },
    { label: 'Doanh thu', value: vnd(metrics.deliveredRevenueVnd), note: 'Chỉ tính đơn đã giao', icon: CircleDollarSign },
    { label: 'Sách đang bán', value: String(metrics.publishedBooks), note: `${metrics.lowStockBooks} sách sắp hết hàng`, icon: BookOpen },
    { label: 'Khách hàng', value: String(metrics.totalCustomers), note: 'Tài khoản khách hàng đã đăng ký', icon: Users },
  ];
  return <main className="admin-dashboard">
    <header className="admin-dashboard-heading"><div><h1>Tổng quan</h1><p>Theo dõi hoạt động kinh doanh của cửa hàng</p></div><button type="button" className="secondary-button" onClick={load}>Làm mới</button></header>
    <section className="admin-metrics" aria-label="Chỉ số vận hành">{cards.map(({ label, value, note, icon: Icon }) => <article className="admin-metric" key={label}><div><span>{label}</span><Icon aria-hidden="true" size={18} /></div><strong>{value}</strong><small>{note}</small></article>)}</section>
    <section className="admin-analytics-grid"><article className="admin-panel admin-revenue-summary"><div className="admin-panel-heading"><div><h2>Doanh thu đã giao</h2><p>Chỉ tính các đơn có trạng thái đã giao.</p></div><CircleDollarSign aria-hidden="true" size={20} /></div><strong>{vnd(metrics.deliveredRevenueVnd)}</strong><p className="admin-data-note"><Clock3 aria-hidden="true" size={15} />Biểu đồ theo thời gian chưa hiển thị vì API chưa cung cấp khoảng ngày.</p></article><article className="admin-panel"><div className="admin-panel-heading"><div><h2>Trạng thái đơn hàng</h2><p>Phân bổ theo trạng thái hiện tại.</p></div><PackageCheck aria-hidden="true" size={20} /></div><dl className="admin-status-list">{orderStatuses.map(status => <div key={status}><dt><span className={`order-status status-${status.toLowerCase()}`}>{statusLabels[status]}</span></dt><dd>{orderStatus[status]}</dd></div>)}</dl></article></section>
    <section className="admin-dashboard-grid"><article className="admin-panel"><div className="admin-panel-heading"><div><h2>Đơn hàng gần đây</h2><p>5 đơn được tạo gần nhất.</p></div></div>{recentOrders.length === 0 ? <p className="admin-empty">Chưa có đơn hàng nào.</p> : <div className="admin-recent-orders">{recentOrders.map(order => <div className="admin-recent-order" key={order.id}><div><strong>{order.orderCode}</strong><span>{order.customerName} · {order.itemCount} sản phẩm</span><small>{date(order.createdAt)}</small></div><div><span className={`order-status status-${order.status.toLowerCase()}`}>{statusLabels[order.status]}</span><strong>{vnd(order.totalVnd)}</strong></div></div>)}</div>}</article><article className="admin-panel"><div className="admin-panel-heading"><div><h2>Sách bán chạy</h2><p>Chỉ tính đơn đã giao.</p></div></div>{dashboard.topSellingBooks.length === 0 ? <p className="admin-empty">Chưa có dữ liệu bán hàng đã giao.</p> : <div className="admin-top-selling">{dashboard.topSellingBooks.map((book, index) => <div key={book.id}><span><strong>{index + 1}. {book.title}</strong><small>{book.sku}</small></span><strong>{book.soldQuantity} đã bán</strong></div>)}</div>}</article></section>{children}
  </main>;
}

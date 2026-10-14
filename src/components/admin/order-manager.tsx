'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock3, Eye, LoaderCircle, PackageCheck, PackageOpen, RefreshCw, Search, ShoppingBag, TriangleAlert, X } from 'lucide-react';
import { AdminPagination } from '@/components/admin/admin-pagination';
import { BrowserApiError, browserApi } from '@/lib/browser-api';
import { vnd } from '@/lib/api';
import type { AdminDashboard, AdminOrder, AdminOrderPage, OrderStatus } from '@/lib/types';

const labels: Record<OrderStatus, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PACKING: 'Đang đóng gói',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELED: 'Đã hủy',
};

const nextStatuses: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELED'],
  CONFIRMED: ['PACKING', 'CANCELED'],
  PACKING: ['SHIPPING', 'CANCELED'],
  SHIPPING: ['DELIVERED'],
  DELIVERED: [],
  CANCELED: [],
};

const paymentLabels: Record<AdminOrder['paymentStatus'], string> = {
  UNPAID: 'Chưa thanh toán', PENDING: 'Đang chờ thanh toán', PAID: 'Đã thanh toán', FAILED: 'Thanh toán thất bại', REFUNDED: 'Đã hoàn tiền',
};

const date = (value: string) => new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
const message = (cause: unknown, fallback: string) => cause instanceof BrowserApiError ? cause.message : fallback;

function shippingAddress(order: AdminOrder) {
  const address = order.addressSnapshot;
  return [address.line1, address.ward, address.district, address.city].filter(Boolean).join(', ');
}

export function OrderManager() {
  const [data, setData] = useState<AdminOrderPage | null>(null);
  const [summary, setSummary] = useState<AdminDashboard | null>(null);
  const [summaryError, setSummaryError] = useState('');
  const [status, setStatus] = useState('');
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [target, setTarget] = useState<OrderStatus | null>(null);
  const [reason, setReason] = useState('');
  const [pending, setPending] = useState(false);
  const [confirmCancellation, setConfirmCancellation] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const [ordersResult, dashboardResult] = await Promise.allSettled([
      browserApi<AdminOrderPage>(`/admin/orders?page=${page}&limit=20${status ? `&status=${status}` : ''}&q=${encodeURIComponent(query)}`),
      browserApi<AdminDashboard>('/admin/dashboard'),
    ]);
    if (ordersResult.status === 'fulfilled') setData(ordersResult.value);
    else setError(message(ordersResult.reason, 'Không thể tải danh sách đơn hàng.'));
    if (dashboardResult.status === 'fulfilled') {
      setSummary(dashboardResult.value);
      setSummaryError('');
    } else {
      setSummary(null);
      setSummaryError('Không thể tải tổng quan đơn hàng.');
    }
    setLoading(false);
  }, [page, query, status]);

  useEffect(() => { void load(); }, [load]);

  const isFiltered = Boolean(status || query);
  const kpis = useMemo(() => {
    if (!summary) return [];
    const processing = summary.orderStatus.CONFIRMED + summary.orderStatus.PACKING + summary.orderStatus.SHIPPING;
    return [
      { label: 'Tổng đơn hàng', value: summary.metrics.totalOrders, icon: ShoppingBag },
      { label: 'Chờ xác nhận', value: summary.metrics.pendingOrders, icon: Clock3 },
      { label: 'Đang xử lý', value: processing, icon: PackageCheck },
      { label: 'Hoàn thành', value: summary.orderStatus.DELIVERED, icon: CheckCircle2 },
    ];
  }, [summary]);

  function openOrder(order: AdminOrder) {
    setSelected(order);
    setTarget(null);
    setReason('');
    setConfirmCancellation(false);
  }

  function closeOrder() {
    if (pending) return;
    setSelected(null);
    setTarget(null);
    setReason('');
    setConfirmCancellation(false);
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setQuery(queryInput.trim());
  }

  function updateStatus(value: string) {
    setStatus(value);
    setPage(1);
  }

  function clearFilters() {
    setStatus('');
    setQuery('');
    setQueryInput('');
    setPage(1);
  }

  async function transition() {
    if (!selected || !target) return;
    setPending(true);
    setError('');
    setNotice('');
    try {
      await browserApi<AdminOrder>(`/admin/orders/${selected.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: target, reason: reason || undefined }),
      });
      setNotice(`Đã chuyển đơn ${selected.orderCode} sang “${labels[target]}”.`);
      setSelected(null);
      setTarget(null);
      setReason('');
      setConfirmCancellation(false);
      await load();
    } catch (cause) {
      setError(message(cause, 'Không thể cập nhật đơn hàng.'));
      setConfirmCancellation(false);
    } finally {
      setPending(false);
    }
  }

  function requestTransition() {
    if (target === 'CANCELED') {
      setConfirmCancellation(true);
      return;
    }
    void transition();
  }

  return <section className="admin-module-page admin-orders-page">
    <header className="admin-module-heading admin-orders-heading">
      <div><h1>Quản lý đơn hàng</h1><p>Theo dõi và xử lý đơn hàng của cửa hàng</p></div>
      <button type="button" className="secondary-button admin-orders-refresh" onClick={() => void load()} disabled={loading || pending}>
        <RefreshCw aria-hidden="true" size={16} className={loading ? 'admin-icon-spin' : undefined} />
        {loading ? 'Đang làm mới…' : 'Làm mới'}
      </button>
    </header>

    {summaryError ? <p className="admin-data-note admin-orders-summary-error" role="status">{summaryError}</p> : <section className="admin-order-kpis" aria-label="Tổng quan đơn hàng" aria-busy={!summary}>{summary ? kpis.map(({ label, value, icon: Icon }) => <article className="admin-order-kpi" key={label}><div><span>{label}</span><Icon aria-hidden="true" size={18} /></div><strong>{value}</strong></article>) : Array.from({ length: 4 }, (_, index) => <article className="admin-order-kpi is-loading" key={index}><div><span>Đang tải</span><LoaderCircle aria-hidden="true" size={18} className="admin-icon-spin" /></div><strong>—</strong></article>)}</section>}

    <form className="admin-toolbar admin-order-toolbar" onSubmit={submitSearch}>
      <label className="admin-order-search"><Search aria-hidden="true" size={18} /><span className="sr-only">Tìm đơn hàng</span><input value={queryInput} onChange={(event) => setQueryInput(event.target.value)} placeholder="Mã đơn, tên hoặc email khách" aria-label="Tìm đơn hàng theo mã, tên hoặc email" /></label>
      <select value={status} onChange={(event) => updateStatus(event.target.value)} aria-label="Lọc trạng thái đơn hàng"><option value="">Tất cả trạng thái</option>{Object.entries(labels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
      <button className="button admin-search-button" type="submit" disabled={loading}><Search aria-hidden="true" size={16} />Tìm kiếm</button>
      {isFiltered && <button className="secondary-button admin-clear-filters" type="button" onClick={clearFilters} disabled={loading}>Xóa bộ lọc</button>}
    </form>

    {notice && <p className="admin-success" role="status">{notice}</p>}
    {error && <div className="admin-orders-error" role="alert"><p>{error}</p><button type="button" className="secondary-button" onClick={() => void load()} disabled={loading}>Thử lại</button></div>}

    <section className="admin-panel admin-table-panel admin-orders-panel">
      <div className="admin-panel-heading"><div><h2>Danh sách đơn hàng</h2><p>{data ? `${data.meta.total} đơn hàng` : 'Đang tải dữ liệu…'}</p></div></div>
      {data === null && !error ? <div className="admin-orders-empty" aria-busy="true"><LoaderCircle aria-hidden="true" size={28} className="admin-icon-spin" /><h3>Đang tải đơn hàng…</h3><p>Dữ liệu vận hành đang được đồng bộ.</p></div> : data && data.items.length === 0 ? <div className="admin-orders-empty"><PackageOpen aria-hidden="true" size={32} /><h3>{isFiltered ? 'Không tìm thấy đơn hàng' : 'Chưa có đơn hàng'}</h3><p>{isFiltered ? 'Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.' : 'Đơn hàng của khách sẽ được hiển thị tại đây khi phát sinh.'}</p>{isFiltered && <button type="button" className="secondary-button" onClick={clearFilters}>Xóa bộ lọc</button>}</div> : data && <div className="admin-table-wrap"><table className="admin-table admin-orders-table"><thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Ngày tạo</th><th>Tổng tiền</th><th>Trạng thái</th><th><span className="sr-only">Thao tác</span></th></tr></thead><tbody>{data.items.map((order) => <tr key={order.id}><td data-label="Mã đơn"><strong>{order.orderCode}</strong><small>{order.items.length} sản phẩm</small></td><td data-label="Khách hàng"><strong>{order.customer.fullName || 'Chưa cập nhật tên'}</strong><small>{order.customer.email}</small></td><td data-label="Ngày tạo">{date(order.createdAt)}</td><td data-label="Tổng tiền"><strong>{vnd(order.totalVnd)}</strong></td><td data-label="Trạng thái"><span className={`order-status status-${order.status.toLowerCase()}`}>{labels[order.status]}</span></td><td className="admin-order-actions" data-label="Thao tác"><button type="button" className="admin-icon-button" onClick={() => openOrder(order)} aria-label={`Xem chi tiết đơn ${order.orderCode}`} title="Xem chi tiết"><Eye aria-hidden="true" size={18} /></button></td></tr>)}</tbody></table></div>}
      {data && <AdminPagination meta={data.meta} onPageChange={setPage} label="danh sách đơn hàng" />}
    </section>

    {selected && <div className="admin-dialog-backdrop admin-order-drawer-backdrop" role="presentation">
      <section className="admin-dialog admin-order-drawer" role="dialog" aria-modal="true" aria-labelledby="order-dialog-title">
        <button type="button" className="admin-dialog-close" aria-label="Đóng chi tiết đơn hàng" onClick={closeOrder} disabled={pending}><X aria-hidden="true" size={18} /></button>
        <header className="admin-order-drawer-heading"><div><span className="eyebrow">{selected.orderCode}</span><h2 id="order-dialog-title">Chi tiết đơn hàng</h2><p>{date(selected.createdAt)}</p></div><span className={`order-status status-${selected.status.toLowerCase()}`}>{labels[selected.status]}</span></header>
        <section className="admin-order-drawer-section"><h3>Khách hàng và giao hàng</h3><dl className="admin-order-summary"><div><dt>Khách hàng</dt><dd>{selected.customer.fullName || 'Chưa cập nhật tên'}<br /><small>{selected.customer.email}</small></dd></div><div><dt>Người nhận</dt><dd>{selected.addressSnapshot.recipientName} · {selected.addressSnapshot.phone}</dd></div><div><dt>Địa chỉ</dt><dd>{shippingAddress(selected)}</dd></div></dl></section>
        <section className="admin-order-drawer-section"><h3>Sản phẩm</h3><div className="admin-order-items">{selected.items.map((item) => <div key={item.bookId}><span><b>{item.titleSnapshot}</b><small>{item.skuSnapshot} · {vnd(item.unitPriceVnd)} × {item.quantity}</small></span><strong>{vnd(item.lineTotalVnd)}</strong></div>)}</div></section>
        <section className="admin-order-drawer-section"><h3>Thanh toán và tổng tiền</h3><dl className="admin-order-summary"><div><dt>Phương thức</dt><dd>{selected.paymentMethod}</dd></div><div><dt>Thanh toán</dt><dd>{paymentLabels[selected.paymentStatus]}</dd></div><div><dt>Tạm tính</dt><dd>{vnd(selected.subtotalVnd)}</dd></div><div><dt>Phí vận chuyển</dt><dd>{vnd(selected.shippingFeeVnd)}</dd></div><div className="admin-order-total"><dt>Tổng thanh toán</dt><dd>{vnd(selected.totalVnd)}</dd></div></dl></section>
        {selected.note && <section className="admin-order-drawer-section"><h3>Ghi chú khách hàng</h3><p className="admin-order-note">{selected.note}</p></section>}
        <section className="admin-order-drawer-section"><h3>Lịch sử xử lý</h3>{selected.statusHistory.length > 0 ? <div className="admin-history">{selected.statusHistory.map((item) => <span key={item.id}><b>{labels[item.fromStatus]} → {labels[item.toStatus]}</b> · {item.actorName} · {date(item.createdAt)}{item.reason ? ` · ${item.reason}` : ''}</span>)}</div> : <p className="admin-order-note">Chưa có thao tác trạng thái nào được ghi nhận.</p>}</section>
        {nextStatuses[selected.status].length > 0 && <section className="admin-transition"><h3>Cập nhật trạng thái</h3><label><span>Chuyển đến</span><select value={target || ''} onChange={(event) => { setTarget(event.target.value as OrderStatus); setConfirmCancellation(false); }} disabled={pending}><option value="">Chọn trạng thái</option>{nextStatuses[selected.status].map((value) => <option value={value} key={value}>{labels[value]}</option>)}</select></label><label><span>Ghi chú (không bắt buộc)</span><input value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} disabled={pending} /></label><button className="button" type="button" disabled={!target || pending} onClick={requestTransition}>{pending ? 'Đang cập nhật…' : target === 'CANCELED' ? 'Tiếp tục hủy đơn' : 'Xác nhận chuyển trạng thái'}</button></section>}
      </section>
    </div>}

    {confirmCancellation && selected && <div className="admin-dialog-backdrop admin-confirm-backdrop" role="presentation">
      <section className="admin-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="cancel-order-title" aria-describedby="cancel-order-description">
        <TriangleAlert aria-hidden="true" size={22} />
        <div><h2 id="cancel-order-title">Xác nhận hủy đơn</h2><p id="cancel-order-description">Đơn {selected.orderCode} sẽ được hủy. Tồn kho được backend hoàn lại đúng một lần và không thể khôi phục trạng thái đơn từ giao diện này.</p></div>
        <div className="admin-confirm-actions"><button type="button" className="secondary-button" onClick={() => setConfirmCancellation(false)} disabled={pending}>Quay lại</button><button type="button" className="admin-danger-button" onClick={() => void transition()} disabled={pending}>{pending ? 'Đang hủy…' : 'Hủy đơn'}</button></div>
      </section>
    </div>}
  </section>;
}

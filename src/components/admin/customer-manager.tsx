'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { AdminPagination } from '@/components/admin/admin-pagination';
import { BrowserApiError, browserApi } from '@/lib/browser-api';
import type { AdminCustomerPage } from '@/lib/types';

const date = (value: string) => new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(value));

export function CustomerManager() {
  const [data, setData] = useState<AdminCustomerPage | null>(null);
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setError('');
    browserApi<AdminCustomerPage>(`/admin/customers?page=${page}&limit=20&q=${encodeURIComponent(query)}`)
      .then(setData)
      .catch((cause) => {
        setData({ items: [], meta: { page, limit: 20, total: 0, totalPages: 0 } });
        setError(cause instanceof BrowserApiError ? cause.message : 'Không thể tải khách hàng.');
      });
  }, [page, query]);

  useEffect(() => { load(); }, [load]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setQuery(queryInput.trim());
  }

  return (
    <section className="admin-module-page">
      <header className="admin-module-heading">
        <div>
          <div className="eyebrow">KHÁCH HÀNG</div>
          <h1>Danh sách khách hàng</h1>
          <p>Chỉ hiển thị thông tin cần thiết cho vận hành; không có mật khẩu hoặc dữ liệu phiên.</p>
        </div>
      </header>

      <form className="admin-toolbar" onSubmit={submitSearch}>
        <input value={queryInput} onChange={(event) => setQueryInput(event.target.value)} placeholder="Tìm tên hoặc email" aria-label="Tìm khách hàng" />
        <button className="secondary-button admin-search-button" type="submit"><Search aria-hidden="true" size={16} />Tìm kiếm</button>
      </form>
      {error && <p className="admin-category-error" role="alert">{error}</p>}

      <section className="admin-panel admin-table-panel">
        <div className="admin-panel-heading"><div><h2>Khách hàng</h2><p>{data ? `${data.meta.total} tài khoản` : 'Đang tải…'}</p></div><button className="secondary-button" type="button" onClick={load}>Làm mới</button></div>
        {data === null ? <p className="admin-empty" aria-busy="true">Đang tải khách hàng…</p> : data.items.length === 0 ? <p className="admin-empty">Không tìm thấy khách hàng.</p> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Khách hàng</th><th>Ngày tạo</th><th>Đơn hàng</th></tr></thead><tbody>{data.items.map((customer) => <tr key={customer.id}><td><strong>{customer.fullName || 'Chưa cập nhật tên'}</strong><small>{customer.email}</small></td><td>{date(customer.createdAt)}</td><td>{customer.orderCount}</td></tr>)}</tbody></table></div>}
        {data && <AdminPagination meta={data.meta} onPageChange={setPage} label="danh sách khách hàng" />}
      </section>
    </section>
  );
}

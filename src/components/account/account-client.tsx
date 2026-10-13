'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { browserApi } from '@/lib/browser-api';
import type { Address, CurrentUser } from '@/lib/types';
import { HeaderIcon } from '@/components/layout/header-icon';

export function AccountClient() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null | undefined>(undefined);
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [addressError, setAddressError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const currentUser = await browserApi<CurrentUser>('/auth/me');
        if (!active) return;
        setUser(currentUser);
        try {
          const savedAddresses = await browserApi<Address[]>('/addresses');
          if (active) setAddresses(savedAddresses);
        } catch {
          if (active) { setAddresses([]); setAddressError('Chưa thể tải địa chỉ giao hàng.'); }
        }
      } catch {
        if (active) setUser(null);
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  async function logout() {
    setLoggingOut(true); setLogoutError('');
    try { await browserApi<void>('/auth/logout', { method: 'POST' }); }
    catch (cause) { setLogoutError(cause instanceof Error ? cause.message : 'Không thể đăng xuất. Vui lòng thử lại.'); setLoggingOut(false); return; }
    setUser(null);
    router.push('/');
    router.refresh();
  }

  if (user === undefined) return <div className="account-loading" aria-busy="true">Đang tải thông tin tài khoản…</div>;
  if (!user) return <section className="account-gate"><div className="eyebrow">TÀI KHOẢN</div><h1>Đăng nhập để xem tài khoản</h1><p>Quản lý thông tin cá nhân, đơn hàng và giỏ sách của bạn tại một nơi.</p><div><Link className="button" href="/login">Đăng nhập</Link><Link className="text-link" href="/register">Tạo tài khoản</Link></div></section>;

  const name = user.fullName || user.email.split('@')[0];
  return <section className="account-page"><div className="account-heading"><div><div className="eyebrow">TÀI KHOẢN CỦA TÔI</div><h1>Xin chào, {name}</h1><p>Thông tin và các tác vụ mua sắm của bạn tại Bookstore.</p></div><div className="account-avatar" aria-hidden="true"><HeaderIcon name="user" /></div></div>
    <div className="account-grid"><section className="account-card"><h2>Thông tin tài khoản</h2><dl><div><dt>Họ và tên</dt><dd>{user.fullName || 'Chưa cập nhật'}</dd></div><div><dt>Email</dt><dd>{user.email}</dd></div><div><dt>Trạng thái</dt><dd><span className="account-status">Đang hoạt động</span></dd></div></dl><p className="account-note">Thông tin tên và email được lấy trực tiếp từ phiên đăng nhập hiện tại.</p></section>
      <aside className="account-card account-menu"><h2>Mua sắm &amp; đơn hàng</h2><Link href="/orders"><span><strong>Đơn hàng của tôi</strong><small>Xem trạng thái và chi tiết đơn COD</small></span><b aria-hidden="true">→</b></Link><Link href="/cart"><span><strong>Giỏ hàng</strong><small>Tiếp tục với những sách đã chọn</small></span><b aria-hidden="true">→</b></Link>{user.role === 'ADMIN' && <Link href="/admin"><span><strong>Quản trị</strong><small>Khu vực dành cho quản trị viên</small></span><b aria-hidden="true">→</b></Link>}<button className="secondary-button account-logout" type="button" disabled={loggingOut} onClick={() => void logout()}>{loggingOut ? 'Đang đăng xuất…' : 'Đăng xuất'}</button>{logoutError && <p className="error account-logout-error" role="alert">{logoutError}</p>}</aside>
    </div>
    <section className="account-card account-addresses"><div className="account-section-heading"><div><h2>Địa chỉ giao hàng</h2><p>Dùng cho đơn hàng COD của bạn.</p></div><Link className="text-link" href="/cart">Đi tới giỏ hàng</Link></div>{addresses === null && <p className="account-address-state" aria-busy="true">Đang tải địa chỉ…</p>}{addressError && <p className="account-address-state error" role="alert">{addressError}</p>}{addresses !== null && !addressError && addresses.length === 0 && <div className="account-address-state"><strong>Bạn chưa lưu địa chỉ nào.</strong><span>Thêm địa chỉ ở bước thanh toán khi bạn đã có sách trong giỏ.</span></div>}{addresses !== null && !addressError && addresses.length > 0 && <div className="account-address-list">{addresses.map(address => <article key={address.id}><div><strong>{address.recipientName} {address.isDefault && <em>Mặc định</em>}</strong><span>{address.phone}</span><p>{address.line1}{address.ward ? `, ${address.ward}` : ''}{address.district ? `, ${address.district}` : ''}, {address.city}</p></div></article>)}</div>}</section>
  </section>;
}

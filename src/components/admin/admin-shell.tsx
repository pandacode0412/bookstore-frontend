'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { browserApi } from '@/lib/browser-api';
import { notifyAuthSessionChanged } from '@/lib/auth-session';
import type { CurrentUser } from '@/lib/types';

const navigation = [
  { href: '/admin', label: 'Tổng quan', icon: '◫' },
  { href: '/admin/orders', label: 'Đơn hàng', icon: '□' },
  { href: '/admin/books', label: 'Sách', icon: '▤' },
  { href: '/admin/categories', label: 'Thể loại', icon: '◇' },
  { href: '/admin/banners', label: 'Banner', icon: '▱' },
  { href: '/admin/customers', label: 'Khách hàng', icon: '◎' },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [logoutPending, setLogoutPending] = useState(false);
  useEffect(() => { browserApi<CurrentUser>('/auth/me').then(setUser).catch(() => setUser(null)); }, []);
  const name = user?.fullName || user?.email.split('@')[0] || 'Quản trị viên';
  const initials = name.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toLocaleUpperCase('vi-VN')).join('');
  async function logout() {
    setLogoutPending(true);
    try { await browserApi<void>('/auth/logout', { method: 'POST' }); notifyAuthSessionChanged(); router.push('/login'); router.refresh(); }
    finally { setLogoutPending(false); }
  }
  return <div className="admin-app">
    <aside className={`admin-sidebar${drawerOpen ? ' is-open' : ''}`} aria-label="Điều hướng quản trị">
      <div className="admin-sidebar-brand"><Link href="/admin" onClick={() => setDrawerOpen(false)}><span>BOOK</span>STORE <small>ADMIN</small></Link><button type="button" className="admin-sidebar-close" onClick={() => setDrawerOpen(false)} aria-label="Đóng menu quản trị">×</button></div>
      <nav>{navigation.map(item => <Link key={item.href} href={item.href} onClick={() => setDrawerOpen(false)} className={pathname === item.href ? 'is-active' : ''} aria-current={pathname === item.href ? 'page' : undefined}><span aria-hidden="true">{item.icon}</span>{item.label}</Link>)}</nav>
      <div className="admin-sidebar-footer"><Link href="/" onClick={() => setDrawerOpen(false)}>↗ Xem cửa hàng</Link></div>
    </aside>
    {drawerOpen && <button className="admin-drawer-backdrop" type="button" aria-label="Đóng menu" onClick={() => setDrawerOpen(false)} />}
    <div className="admin-workspace">
      <header className="admin-topbar"><button type="button" className="admin-menu-button" onClick={() => setDrawerOpen(true)} aria-label="Mở menu quản trị">☰</button><div><span className="admin-topbar-kicker">BOOKSTORE ADMIN</span><strong>{navigation.find(item => item.href === pathname)?.label || 'Quản trị'}</strong></div><div className="admin-topbar-actions"><span className="admin-notification-status" title="Chưa có hệ thống thông báo">Thông báo chưa bật</span><div className="admin-profile"><span aria-hidden="true">{initials || 'QT'}</span><div><strong>{name}</strong><small>Quản trị viên</small></div><button type="button" onClick={() => void logout()} disabled={logoutPending}>{logoutPending ? '…' : 'Đăng xuất'}</button></div></div></header>
      <div className="admin-content">{children}</div>
    </div>
  </div>;
}

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, LayoutDashboard, LogOut, Menu, PanelsTopLeft, ShoppingCart, Store, Tags, Users, X } from 'lucide-react';
import { browserApi } from '@/lib/browser-api';
import { notifyAuthSessionChanged } from '@/lib/auth-session';
import type { CurrentUser } from '@/lib/types';

const navigation = [
  { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Đơn hàng', icon: ShoppingCart },
  { href: '/admin/books', label: 'Sách', icon: BookOpen },
  { href: '/admin/categories', label: 'Thể loại', icon: Tags },
  { href: '/admin/banners', label: 'Banner', icon: PanelsTopLeft },
  { href: '/admin/customers', label: 'Khách hàng', icon: Users },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
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
  const current = navigation.find(item => item.href === pathname) ?? navigation[0];
  return <div className={`admin-app${collapsed ? ' is-sidebar-collapsed' : ''}`}>
    <aside className={`admin-sidebar${drawerOpen ? ' is-open' : ''}`} aria-label="Điều hướng quản trị">
      <div className="admin-sidebar-brand"><Link href="/admin" onClick={() => setDrawerOpen(false)} aria-label="Bookstore Admin"><span>BOOK</span><b>STORE</b><small>ADMIN</small></Link><button type="button" className="admin-sidebar-close" onClick={() => setDrawerOpen(false)} aria-label="Đóng menu quản trị"><X size={18} /></button></div>
      <nav>{navigation.map(item => { const Icon = item.icon; return <Link key={item.href} href={item.href} onClick={() => setDrawerOpen(false)} className={pathname === item.href ? 'is-active' : ''} aria-current={pathname === item.href ? 'page' : undefined} title={collapsed ? item.label : undefined}><Icon aria-hidden="true" size={19} /><span>{item.label}</span></Link>; })}</nav>
      <div className="admin-sidebar-footer"><Link href="/" prefetch={false} onClick={() => setDrawerOpen(false)} title={collapsed ? 'Xem cửa hàng' : undefined}><Store aria-hidden="true" size={18} /><span>Xem cửa hàng</span></Link><button type="button" className="admin-sidebar-collapse" onClick={() => setCollapsed(value => !value)} aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}>{collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}</button></div>
    </aside>
    {drawerOpen && <button className="admin-drawer-backdrop" type="button" aria-label="Đóng menu" onClick={() => setDrawerOpen(false)} />}
    <div className="admin-workspace">
      <header className="admin-topbar"><button type="button" className="admin-menu-button" onClick={() => setDrawerOpen(true)} aria-label="Mở menu quản trị"><Menu size={20} /></button><div className="admin-page-context"><span>Quản trị / {current.label}</span><strong>{current.label}</strong></div><div className="admin-topbar-actions"><div className="admin-profile"><button type="button" className="admin-profile-trigger" onClick={() => setProfileOpen(value => !value)} aria-expanded={profileOpen} aria-controls="admin-profile-menu"><span aria-hidden="true">{initials || 'QT'}</span><div><strong>{name}</strong><small>Quản trị viên</small></div></button>{profileOpen && <div id="admin-profile-menu" className="admin-profile-menu"><Link href="/account" onClick={() => setProfileOpen(false)}>Tài khoản của tôi</Link><button type="button" onClick={() => void logout()} disabled={logoutPending}><LogOut size={16} />{logoutPending ? 'Đang đăng xuất…' : 'Đăng xuất'}</button></div>}</div></div></header>
      <div className="admin-content">{children}</div>
    </div>
  </div>;
}

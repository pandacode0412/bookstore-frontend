'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AUTH_SESSION_CHANGED_EVENT, notifyAuthSessionChanged } from '@/lib/auth-session';
import { browserApi } from '@/lib/browser-api';
import type { CurrentUser } from '@/lib/types';
import { HeaderIcon } from './header-icon';

export function AuthNavigation() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null | undefined>(undefined);
  const [logoutError, setLogoutError] = useState('');
  const loadUser = useCallback(() => {
    browserApi<CurrentUser>('/auth/me').then(setUser).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    loadUser();
    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, loadUser);
    return () => window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, loadUser);
  }, [loadUser]);

  async function logout() {
    setLogoutError('');
    try { await browserApi<void>('/auth/logout', { method: 'POST' }); }
    catch (cause) { setLogoutError(cause instanceof Error ? cause.message : 'Không thể đăng xuất. Vui lòng thử lại.'); return; }
    setUser(null);
    notifyAuthSessionChanged();
    router.push('/'); router.refresh();
  }
  if (user === undefined) return <Link className="header-action" href="/account" aria-label="Tài khoản"><HeaderIcon name="user" /><small>Tài khoản</small></Link>;
  if (!user) return <Link className="header-action" href="/login"><HeaderIcon name="user" /><small>Tài khoản</small></Link>;
  const name = user.fullName || user.email.split('@')[0];
  const initials = name.trim().split(/\s+/).slice(0, 2).map(part => part.charAt(0).toLocaleUpperCase('vi-VN')).join('');
  return <>
    {user.role === 'ADMIN' && <Link className="header-action header-admin-action" href="/admin" aria-label="Mở trang quản trị" title="Mở trang quản trị"><HeaderIcon name="grid" /><small>Quản trị</small></Link>}
    <div className="header-account-menu"><Link className="header-action header-user-signed-in" href="/account" title={user.email} aria-label={`Tài khoản của ${name}`}><span className="header-profile-avatar" aria-hidden="true">{initials || 'TK'}</span><small>{name}</small></Link><div className="account-popover" aria-label="Menu tài khoản"><div className="account-popover-user"><strong>{name}</strong><span>{user.email}</span></div><Link href="/account">Tài khoản của tôi</Link><Link href="/wishlist">Sách yêu thích</Link><Link href="/orders">Đơn hàng của tôi</Link>{user.role === 'ADMIN' && <Link href="/admin">Quản trị</Link>}<button type="button" onClick={() => void logout()}>Đăng xuất</button>{logoutError && <p className="account-popover-error" role="alert">{logoutError}</p>}</div></div>
  </>;
}

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { browserApi } from '@/lib/browser-api';
import type { CurrentUser } from '@/lib/types';
import { HeaderIcon } from './header-icon';

export function AuthNavigation() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null | undefined>(undefined);
  const [logoutError, setLogoutError] = useState('');
  useEffect(() => { browserApi<CurrentUser>('/auth/me').then(setUser).catch(() => setUser(null)); }, []);
  async function logout() {
    setLogoutError('');
    try { await browserApi<void>('/auth/logout', { method: 'POST' }); }
    catch (cause) { setLogoutError(cause instanceof Error ? cause.message : 'Không thể đăng xuất. Vui lòng thử lại.'); return; }
    setUser(null); router.push('/'); router.refresh();
  }
  if (user === undefined) return <Link className="header-action" href="/account" aria-label="Tài khoản"><HeaderIcon name="user" /><small>Tài khoản</small></Link>;
  if (!user) return <Link className="header-action" href="/login"><HeaderIcon name="user" /><small>Tài khoản</small></Link>;
  const name = user.fullName || user.email.split('@')[0];
  return <><div className="header-account-menu"><Link className="header-action" href="/account" title={user.email}><HeaderIcon name="user" /><small>{name}</small></Link><div className="account-popover" aria-label="Menu tài khoản"><div className="account-popover-user"><strong>{name}</strong><span>{user.email}</span></div><Link href="/account">Tài khoản của tôi</Link><Link href="/wishlist">Sách yêu thích</Link><Link href="/orders">Đơn hàng của tôi</Link>{user.role === 'ADMIN' && <Link href="/admin">Quản trị</Link>}<button type="button" onClick={() => void logout()}>Đăng xuất</button>{logoutError && <p className="account-popover-error" role="alert">{logoutError}</p>}</div></div></>;
}

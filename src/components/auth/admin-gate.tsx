'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BrowserApiError, browserApi } from '@/lib/browser-api';
import type { CurrentUser } from '@/lib/types';

export function AdminGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<'loading' | 'allowed' | 'guest' | 'forbidden' | 'unavailable'>('loading');
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    browserApi<CurrentUser>('/auth/me').then(user => {
      if (!active) return;
      setUser(user);
      setState(user.role === 'ADMIN' ? 'allowed' : 'forbidden');
    }).catch(error => {
      if (!active) return;
      setState(error instanceof BrowserApiError && error.status === 401 ? 'guest' : 'unavailable');
    });
    return () => { active = false; };
  }, [attempt]);
  if (state === 'loading') return <div className="route-gate" aria-live="polite">Đang kiểm tra quyền truy cập…</div>;
  if (state === 'guest') return <section className="route-gate route-gate-card"><div><div className="eyebrow">QUẢN TRỊ</div><h1>Hãy đăng nhập để tiếp tục</h1><p>Khu vực này chỉ dành cho tài khoản quản trị.</p><Link className="button" href="/login">Đăng nhập</Link></div></section>;
  if (state === 'unavailable') return <section className="route-gate route-gate-card"><div><div className="eyebrow">QUẢN TRỊ</div><h1>Chưa thể kiểm tra quyền truy cập</h1><p>Không kết nối được đến máy chủ. Hãy kiểm tra API rồi thử lại.</p><button className="button" type="button" onClick={() => { setState('loading'); setAttempt(value => value + 1); }}>Thử lại</button></div></section>;
  if (state === 'forbidden') return <section className="route-gate route-gate-card"><div><div className="eyebrow">QUẢN TRỊ</div><h1>Tài khoản chưa có quyền quản trị</h1><p>Bạn đang đăng nhập bằng <strong>{user?.email}</strong>. Hãy đăng xuất rồi đăng nhập bằng tài khoản ADMIN.</p><Link className="button" href="/account">Về tài khoản</Link></div></section>;
  return <>{children}</>;
}

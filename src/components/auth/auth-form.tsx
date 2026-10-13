'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useRef, useState } from 'react';
import { BrowserApiError, browserApi } from '@/lib/browser-api';
import type { CurrentUser } from '@/lib/types';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const requestVersion = useRef(0);
  const isRegister = mode === 'register';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    const currentRequest = ++requestVersion.current;
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '');
    const password = String(form.get('password') ?? '');
    const fullName = String(form.get('fullName') ?? '');
    setError(''); setPending(true);
    try {
      await browserApi<CurrentUser>(isRegister ? '/auth/register' : '/auth/login', {
        method: 'POST', body: JSON.stringify(isRegister ? { email, password, fullName } : { email, password }),
      });
      if (currentRequest !== requestVersion.current) return;
      router.push('/');
      router.refresh();
    } catch (cause) {
      if (currentRequest !== requestVersion.current) return;
      setError(cause instanceof BrowserApiError ? cause.message : 'Không thể kết nối đến máy chủ. Vui lòng thử lại.');
    } finally {
      if (currentRequest === requestVersion.current) { submitting.current = false; setPending(false); }
    }
  }

  return <section className="auth-page"><form className="auth-card" onSubmit={submit}>
    <div className="eyebrow">{isRegister ? 'TẠO TÀI KHOẢN' : 'ĐĂNG NHẬP'}</div>
    <h1>{isRegister ? 'Đăng ký Bookstore' : 'Chào mừng trở lại'}</h1>
    <p>{isRegister ? 'Dùng email để tạo tài khoản mua sách.' : 'Đăng nhập để chuẩn bị cho giỏ hàng và đơn hàng của bạn.'}</p>
    {isRegister && <label htmlFor="fullName">Họ và tên <span>(không bắt buộc)</span><input id="fullName" name="fullName" autoComplete="name" maxLength={120} /></label>}
    <label htmlFor="email">Email<input id="email" name="email" type="email" autoComplete="email" required maxLength={254} /></label>
    <label htmlFor="password">Mật khẩu<input id="password" name="password" type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} required minLength={isRegister ? 6 : 1} maxLength={128} />
      {isRegister && <small>Tối thiểu 6 ký tự.</small>}</label>
    {error && <div className="error" role="alert">{error}</div>}
    <button className="button" type="submit" disabled={pending}>{pending ? 'Đang xử lý…' : isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}</button>
    <p className="auth-switch">{isRegister ? <>Đã có tài khoản? <Link href="/login">Đăng nhập</Link></> : <>Chưa có tài khoản? <Link href="/register">Đăng ký</Link></>}</p>
  </form></section>;
}

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useRef, useState } from 'react';
import { BrowserApiError, browserApi } from '@/lib/browser-api';
import { notifyAuthSessionChanged } from '@/lib/auth-session';
import type { CurrentUser } from '@/lib/types';

function PasswordVisibilityIcon({ visible }: { visible: boolean }) {
  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {visible ? <><path d="M3 3l18 18" /><path d="M10.6 10.7a2 2 0 0 0 2.7 2.7" /><path d="M9.9 4.2A10.7 10.7 0 0 1 12 4c6.1 0 9.5 8 9.5 8a18.8 18.8 0 0 1-3.1 4.3M6.1 6.1C3.8 7.7 2.5 12 2.5 12S5.9 20 12 20c1 0 1.9-.2 2.8-.5" /></> : <><path d="M2.5 12S5.9 4 12 4s9.5 8 9.5 8-3.4 8-9.5 8-9.5-8-9.5-8Z" /><circle cx="12" cy="12" r="3" /></>}
  </svg>;
}

function PasswordField({ id, label, autoComplete, hint, confirmation = false }: { id: string; label: string; autoComplete: string; hint?: string; confirmation?: boolean }) {
  const [visible, setVisible] = useState(false);
  return <label className="auth-field" htmlFor={id}><span>{label}</span><div className="auth-password-control"><input id={id} name={id} type={visible ? 'text' : 'password'} autoComplete={autoComplete} required minLength={6} maxLength={128} aria-describedby={hint ? `${id}-hint` : undefined} /><button className="auth-password-toggle" type="button" onClick={() => setVisible(value => !value)} aria-label={visible ? `Ẩn ${label.toLowerCase()}` : `Hiện ${label.toLowerCase()}`} aria-pressed={visible}><PasswordVisibilityIcon visible={visible} /></button></div>{hint && <small id={`${id}-hint`}>{hint}</small>}{confirmation && <span className="sr-only">Nhập lại mật khẩu để xác nhận.</span>}</label>;
}

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [resetNote, setResetNote] = useState('');
  const submitting = useRef(false);
  const requestVersion = useRef(0);
  const isRegister = mode === 'register';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '');
    const password = String(form.get('password') ?? '');
    const fullName = String(form.get('fullName') ?? '');
    const confirmPassword = String(form.get('confirmPassword') ?? '');
    if (isRegister && password !== confirmPassword) {
      setResetNote('');
      setError('Mật khẩu xác nhận chưa khớp. Vui lòng kiểm tra lại.');
      return;
    }
    submitting.current = true;
    const currentRequest = ++requestVersion.current;
    setError(''); setResetNote(''); setPending(true);
    try {
      await browserApi<CurrentUser>(isRegister ? '/auth/register' : '/auth/login', {
        method: 'POST', body: JSON.stringify(isRegister ? { email, password, fullName } : { email, password }),
      });
      if (currentRequest !== requestVersion.current) return;
      notifyAuthSessionChanged();
      router.push('/');
      router.refresh();
    } catch (cause) {
      if (currentRequest !== requestVersion.current) return;
      setError(cause instanceof BrowserApiError ? cause.message : 'Không thể kết nối đến máy chủ. Vui lòng thử lại.');
    } finally {
      if (currentRequest === requestVersion.current) { submitting.current = false; setPending(false); }
    }
  }

  return <section className="auth-page"><form className="auth-card" onSubmit={submit} aria-busy={pending}>
    <Link className="auth-logo" href="/" aria-label="Bookstore - Trang chủ"><Image src="/brand/bookstore-logo.png" alt="" width={1254} height={1254} priority sizes="56px" /></Link>
    <header className="auth-heading"><div className="eyebrow">{isRegister ? 'TÀI KHOẢN MỚI' : 'CHÀO MỪNG TRỞ LẠI'}</div><h1>{isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}</h1><p>{isRegister ? 'Tạo tài khoản để lưu sách, giỏ hàng và theo dõi đơn COD.' : 'Đăng nhập để tiếp tục hành trình mua sách của bạn.'}</p></header>
    <div className="auth-fields">
      {isRegister && <label className="auth-field" htmlFor="fullName"><span>Họ và tên <em>(không bắt buộc)</em></span><input id="fullName" name="fullName" autoComplete="name" maxLength={120} /></label>}
      <label className="auth-field" htmlFor="email"><span>Email</span><input id="email" name="email" type="email" autoComplete="email" required maxLength={254} inputMode="email" /></label>
      <PasswordField id="password" label="Mật khẩu" autoComplete={isRegister ? 'new-password' : 'current-password'} hint={isRegister ? 'Tối thiểu 6 ký tự.' : undefined} />
      {isRegister && <PasswordField id="confirmPassword" label="Xác nhận mật khẩu" autoComplete="new-password" confirmation />}
    </div>
    {!isRegister && <button type="button" className="auth-forgot" onClick={() => { setError(''); setResetNote('Chức năng đặt lại mật khẩu đang được chuẩn bị. Vui lòng sử dụng đúng email và mật khẩu đã đăng ký.'); }}>Quên mật khẩu?</button>}
    {resetNote && <div className="auth-notice" role="status">{resetNote}</div>}
    {error && <div className="error auth-error" role="alert">{error}</div>}
    <button className="button auth-submit" type="submit" disabled={pending}>{pending ? 'Đang xử lý…' : isRegister ? 'Đăng ký' : 'Đăng nhập'}</button>
    <p className="auth-switch">{isRegister ? <>Đã có tài khoản? <Link href="/login">Đăng nhập</Link></> : <>Chưa có tài khoản? <Link href="/register">Đăng ký ngay</Link></>}</p>
  </form></section>;
}

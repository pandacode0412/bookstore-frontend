'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { AUTH_SESSION_CHANGED_EVENT } from '@/lib/auth-session';
import { browserApi } from '@/lib/browser-api';
import type { Category, CurrentUser } from '@/lib/types';
import { AuthNavigation } from './auth-navigation';
import { CatalogSearch } from './catalog-search';
import { HeaderCommerceActions } from './header-commerce-actions';
import { HeaderIcon } from './header-icon';

const quickLinks = [
  { href: '/', label: 'Trang chủ' },
  { href: '/books', label: 'Tất cả sách' },
  { href: '/books?sort=newest', label: 'Sách mới' },
  { href: '/books?sort=bestselling', label: 'Bán chạy' },
  { href: '/books?onSale=true', label: 'Khuyến mãi' },
];

function isCurrentLink(href: string, pathname: string) {
  const [linkPath, linkQuery] = href.split('?');
  // Query-state sorting is intentionally not marked as a primary route. This lets
  // the static root layout render without a search-param hydration boundary.
  return !linkQuery && pathname === linkPath;
}

function CategoryLinks({ categories, error, onNavigate, onRetry, compact = false }: { categories: Category[] | null; error: boolean; onNavigate?: () => void; onRetry: () => void; compact?: boolean }) {
  if (categories === null) return <p className={compact ? 'mobile-category-status' : 'category-status'}>Đang tải thể loại…</p>;
  if (error) return <div className={compact ? 'mobile-category-status' : 'category-status'} role="status"><span>Chưa tải được thể loại.</span><button type="button" onClick={onRetry}>Thử lại</button></div>;
  if (categories.length === 0) return <p className={compact ? 'mobile-category-status' : 'category-status'}>Chưa có thể loại sách.</p>;
  return <>{categories.map(category => <Link key={category.id} href={`/books?category=${encodeURIComponent(category.slug)}`} onClick={onNavigate}>{category.name}</Link>)}</>;
}

export function SiteHeader() {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [categoryError, setCategoryError] = useState(false);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const closeDrawer = () => setIsDrawerOpen(false);

  const loadCategories = useCallback(() => {
    setCategories(null);
    setCategoryError(false);
    browserApi<Category[]>('/categories').then(setCategories).catch(() => {
      setCategories([]);
      setCategoryError(true);
    });
  }, []);

  const loadCurrentUser = useCallback(() => {
    browserApi<CurrentUser>('/auth/me').then(setUser).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    loadCategories();
    window.addEventListener('bookstore:categories-changed', loadCategories);
    return () => window.removeEventListener('bookstore:categories-changed', loadCategories);
  }, [loadCategories]);

  useEffect(() => {
    loadCurrentUser();
    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, loadCurrentUser);
    return () => window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, loadCurrentUser);
  }, [loadCurrentUser]);

  const accountName = user?.fullName || user?.email.split('@')[0];
  const accountInitials = accountName?.trim().split(/\s+/).slice(0, 2).map(part => part.charAt(0).toLocaleUpperCase('vi-VN')).join('');

  return <header className="site-header">
    <div className="header-primary">
      <div className="container header-main">
        <button className="mobile-menu-toggle" type="button" aria-label={isDrawerOpen ? 'Đóng menu điều hướng' : 'Mở menu điều hướng'} aria-controls="mobile-site-navigation" aria-expanded={isDrawerOpen} onClick={() => setIsDrawerOpen(open => !open)}>
          <HeaderIcon name={isDrawerOpen ? 'close' : 'menu'} />
        </button>
        <Link className="brand brand-symbol" href="/" aria-label="Bookstore - Trang chủ" onClick={closeDrawer}>
          <Image className="brand-logo" src="/brand/bookstore-logo.png" alt="" width={1254} height={1254} priority sizes="58px" />
        </Link>
        <details className="category-menu">
          <summary className="category-trigger"><HeaderIcon name="grid" /><small>Danh mục</small></summary>
          <div className="category-popover"><strong>Thể loại sách</strong><CategoryLinks categories={categories} error={categoryError} onRetry={loadCategories} /><Link className="category-view-all" href="/books">Xem tất cả sách</Link></div>
        </details>
        <CatalogSearch />
        <nav className="header-actions" aria-label="Điều hướng mua sắm">
          <HeaderCommerceActions />
          <div className="header-desktop-account"><AuthNavigation /></div>
        </nav>
      </div>
    </div>
    <nav className="header-quick-links" aria-label="Khám phá nhanh"><div className="container">
      {quickLinks.slice(0, 2).map(link => <Link key={link.href} href={link.href} aria-current={isCurrentLink(link.href, pathname) ? 'page' : undefined} className={isCurrentLink(link.href, pathname) ? 'is-active' : undefined}>{link.label}</Link>)}
      <details className="secondary-category-menu">
        <summary aria-label="Mở danh sách thể loại sách">Thể loại</summary>
        <div className="secondary-category-popover"><strong>Thể loại sách</strong><CategoryLinks categories={categories} error={categoryError} onRetry={loadCategories} /><Link className="category-view-all" href="/books">Xem tất cả sách</Link></div>
      </details>
      {quickLinks.slice(2).map(link => <Link key={link.href} href={link.href} aria-current={isCurrentLink(link.href, pathname) ? 'page' : undefined} className={isCurrentLink(link.href, pathname) ? 'is-active' : undefined}>{link.label}</Link>)}
    </div></nav>
    <nav id="mobile-site-navigation" className="mobile-navigation" aria-label="Điều hướng trên thiết bị di động" hidden={!isDrawerOpen}>
      <div className="mobile-navigation-section"><strong>Khám phá</strong>{quickLinks.map(link => <Link key={link.href} href={link.href} aria-current={isCurrentLink(link.href, pathname) ? 'page' : undefined} onClick={closeDrawer}>{link.label}</Link>)}</div>
      <div className="mobile-navigation-section"><strong>Thể loại sách</strong><CategoryLinks categories={categories} error={categoryError} onRetry={loadCategories} compact onNavigate={closeDrawer} /><Link href="/books" onClick={closeDrawer}>Xem tất cả sách</Link></div>
      <div className="mobile-navigation-account"><Link href="/account" onClick={closeDrawer}>{accountName ? <span className="mobile-profile-avatar" aria-hidden="true">{accountInitials || 'TK'}</span> : <HeaderIcon name="user" />}{accountName || 'Tài khoản của tôi'}</Link><Link href="/wishlist" onClick={closeDrawer}><HeaderIcon name="heart" />Sách yêu thích</Link><Link href="/orders" onClick={closeDrawer}><HeaderIcon name="cart" />Đơn hàng của tôi</Link>{user?.role === 'ADMIN' && <Link className="mobile-admin-link" href="/admin" onClick={closeDrawer}><HeaderIcon name="grid" />Mở trang quản trị</Link>}</div>
    </nav>
  </header>;
}

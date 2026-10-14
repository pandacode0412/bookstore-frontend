'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { browserApi } from '@/lib/browser-api';
import type { Cart, Wishlist } from '@/lib/types';
import { HeaderIcon } from './header-icon';

type HeaderCounts = { cart: number; wishlist: number };

/** Loads optional, account-scoped counts without changing cart or wishlist behavior. */
export function HeaderCommerceActions() {
  const [counts, setCounts] = useState<HeaderCounts | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([browserApi<Cart>('/cart'), browserApi<Wishlist>('/wishlist')])
      .then(([cart, wishlist]) => {
        if (!active) return;
        setCounts({
          cart: cart.items.reduce((total, item) => total + item.quantity, 0),
          wishlist: wishlist.items.length,
        });
      })
      // Guest visitors do not have counts, so no error should be surfaced in the header.
      .catch(() => { if (active) setCounts(null); });
    return () => { active = false; };
  }, []);

  return <>
    <Link className="header-action header-favorite" href="/wishlist" aria-label={counts?.wishlist ? `Yêu thích, ${counts.wishlist} sách` : 'Yêu thích'}>
      <span className="header-action-icon"><HeaderIcon name="heart" />{counts?.wishlist ? <b className="header-count-badge">{counts.wishlist > 99 ? '99+' : counts.wishlist}</b> : null}</span>
      <small>Yêu thích</small>
    </Link>
    <Link className="header-action header-cart" href="/cart" aria-label={counts?.cart ? `Giỏ hàng, ${counts.cart} sản phẩm` : 'Giỏ hàng'}>
      <span className="header-action-icon"><HeaderIcon name="cart" />{counts?.cart ? <b className="header-count-badge">{counts.cart > 99 ? '99+' : counts.cart}</b> : null}</span>
      <small>Giỏ hàng</small>
    </Link>
  </>;
}

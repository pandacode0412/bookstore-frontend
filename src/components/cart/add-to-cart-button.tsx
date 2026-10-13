'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BrowserApiError, browserApi } from '@/lib/browser-api';
import type { Cart } from '@/lib/types';

export function AddToCartButton({ bookId, inStock }: { bookId: string; inStock: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  async function add() {
    setPending(true); setMessage('');
    try {
      await browserApi<Cart>('/cart/items', { method: 'POST', body: JSON.stringify({ bookId, quantity: 1 }) });
      setMessage('Đã thêm sách vào giỏ hàng.');
    } catch (error) {
      if (error instanceof BrowserApiError && error.status === 401) { router.push('/login'); return; }
      setMessage(error instanceof Error ? error.message : 'Không thể thêm vào giỏ hàng.');
    } finally { setPending(false); }
  }
  return <div className="add-to-cart"><button className="button" type="button" onClick={add} disabled={!inStock || pending}>{pending ? 'Đang thêm…' : inStock ? 'Thêm vào giỏ hàng' : 'Tạm hết hàng'}</button>{message && <span role="status">{message}</span>}</div>;
}

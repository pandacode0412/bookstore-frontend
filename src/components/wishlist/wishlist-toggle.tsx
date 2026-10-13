'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BrowserApiError, browserApi } from '@/lib/browser-api';
import type { Wishlist } from '@/lib/types';
import { HeaderIcon } from '@/components/layout/header-icon';

export function WishlistToggle({ bookId }: { bookId: string }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    browserApi<Wishlist>('/wishlist').then(list => { if (active) setSaved(list.items.some(book => book.id === bookId)); }).catch(() => undefined).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [bookId]);

  async function toggle() {
    setPending(true); setMessage('');
    try {
      if (saved) {
        await browserApi<void>(`/wishlist/items/${bookId}`, { method: 'DELETE' });
        setSaved(false); setMessage('Đã xóa khỏi danh sách yêu thích.');
      } else {
        await browserApi<Wishlist>('/wishlist/items', { method: 'POST', body: JSON.stringify({ bookId }) });
        setSaved(true); setMessage('Đã lưu vào danh sách yêu thích.');
      }
    } catch (cause) {
      if (cause instanceof BrowserApiError && cause.status === 401) { router.push('/login'); return; }
      setMessage(cause instanceof Error ? cause.message : 'Không thể cập nhật danh sách yêu thích.');
    } finally { setPending(false); }
  }

  return <div className="wishlist-toggle"><button className={`secondary-button${saved ? ' is-saved' : ''}`} type="button" disabled={loading || pending} onClick={() => void toggle()}><HeaderIcon name="heart" /><span>{loading ? 'Đang kiểm tra…' : pending ? 'Đang cập nhật…' : saved ? 'Đã yêu thích' : 'Lưu yêu thích'}</span></button>{message && <span role="status">{message}</span>}</div>;
}

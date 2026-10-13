'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BrowserApiError, browserApi } from '@/lib/browser-api';
import { vnd } from '@/lib/api';
import type { Address, AddressInput, Cart, Order } from '@/lib/types';

export function CheckoutClient() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null); const [addresses, setAddresses] = useState<Address[]>([]); const [addressId, setAddressId] = useState('');
  const [note, setNote] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(true); const [savingAddress, setSavingAddress] = useState(false); const [placing, setPlacing] = useState(false);
  const key = useRef<string | undefined>(undefined);
  const resetKey = () => { key.current = undefined; };
  async function load() {
    try {
      const [nextCart, nextAddresses] = await Promise.all([browserApi<Cart>('/cart'), browserApi<Address[]>('/addresses')]);
      setCart(nextCart); setAddresses(nextAddresses); setAddressId(current => current || nextAddresses.find(address => address.isDefault)?.id || nextAddresses[0]?.id || ''); setError('');
    } catch (cause) { setError(cause instanceof BrowserApiError && cause.status === 401 ? 'Hãy đăng nhập để thanh toán.' : 'Không thể tải thông tin thanh toán.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
  async function saveAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSavingAddress(true); setError(''); const form = new FormData(event.currentTarget);
    const body: AddressInput = { recipientName: String(form.get('recipientName') ?? ''), phone: String(form.get('phone') ?? ''), line1: String(form.get('line1') ?? ''), ward: String(form.get('ward') ?? '') || null, district: String(form.get('district') ?? '') || null, city: String(form.get('city') ?? ''), isDefault: true };
    try { const address = await browserApi<Address>('/addresses', { method: 'POST', body: JSON.stringify(body) }); setAddresses(current => [address, ...current.map(item => ({ ...item, isDefault: false }))]); setAddressId(address.id); resetKey(); event.currentTarget.reset(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể lưu địa chỉ.'); } finally { setSavingAddress(false); }
  }
  async function placeOrder() {
    if (!addressId) { setError('Vui lòng thêm hoặc chọn địa chỉ giao hàng.'); return; }
    if (!key.current) key.current = crypto.randomUUID(); setPlacing(true); setError('');
    try { const order = await browserApi<Order>('/orders', { method: 'POST', headers: { 'Idempotency-Key': key.current }, body: JSON.stringify({ addressId, paymentMethod: 'COD', note }) }); router.push(`/orders/${order.id}`); router.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể tạo đơn hàng.'); } finally { setPlacing(false); }
  }
  if (loading) return <div className="cart-empty" aria-busy="true"><h1>Đang chuẩn bị thanh toán…</h1></div>;
  if (error && !cart) return <div className="cart-empty"><h1>Chưa thể thanh toán</h1><p>{error}</p><Link className="button" href="/login">Đăng nhập</Link></div>;
  if (!cart || cart.items.length === 0) return <div className="cart-empty"><h1>Giỏ hàng đang trống</h1><p>Hãy thêm sách trước khi đặt hàng.</p><Link className="button" href="/books">Khám phá sách</Link></div>;
  return <div className="checkout-layout"><section><div className="eyebrow">THANH TOÁN AN TOÀN</div><h1>Thông tin giao hàng</h1>{error && <div className="error" role="alert">{error}</div>}{addresses.length > 0 && <fieldset className="address-list"><legend>Chọn địa chỉ đã lưu</legend>{addresses.map(address => <label className="address-choice" key={address.id}><input type="radio" name="address" value={address.id} checked={addressId === address.id} onChange={() => { setAddressId(address.id); resetKey(); }} /><span><strong>{address.recipientName} {address.isDefault && <em>Mặc định</em>}</strong><small>{address.phone} · {address.line1}{address.ward ? `, ${address.ward}` : ''}{address.district ? `, ${address.district}` : ''}, {address.city}</small></span></label>)}</fieldset>}<details className="address-new" open={addresses.length === 0}><summary>{addresses.length ? 'Thêm địa chỉ giao hàng mới' : 'Thêm địa chỉ giao hàng'}</summary><form className="address-form" onSubmit={saveAddress}><label>Người nhận<input name="recipientName" required maxLength={120} /></label><label>Số điện thoại<input name="phone" required inputMode="tel" maxLength={25} /></label><label className="full-field">Địa chỉ<input name="line1" required minLength={3} maxLength={255} placeholder="Số nhà, tên đường" /></label><label>Phường/Xã <span>(không bắt buộc)</span><input name="ward" maxLength={120} /></label><label>Quận/Huyện <span>(không bắt buộc)</span><input name="district" maxLength={120} /></label><label className="full-field">Tỉnh/Thành phố<input name="city" required maxLength={120} /></label><button className="secondary-button" type="submit" disabled={savingAddress}>{savingAddress ? 'Đang lưu…' : 'Lưu và chọn địa chỉ này'}</button></form></details><label className="checkout-note">Ghi chú cho đơn hàng <span>(không bắt buộc)</span><textarea value={note} maxLength={500} onChange={event => { setNote(event.target.value); resetKey(); }} placeholder="Ví dụ: giao giờ hành chính" /></label><div className="cod-note"><strong>Thanh toán khi nhận hàng (COD)</strong><span>Bạn chỉ thanh toán khi nhận được đơn.</span></div></section><aside className="cart-summary"><h2>Đơn hàng của bạn</h2>{cart.items.map(item => <div className="checkout-line" key={item.book.id}><span>{item.book.title} × {item.quantity}</span><strong>{vnd(item.lineTotalVnd)}</strong></div>)}<hr/><div><span>Tạm tính</span><strong>{vnd(cart.estimatedSubtotalVnd)}</strong></div><div><span>Phí giao hàng</span><span>Miễn phí</span></div><div className="cart-total"><span>Tổng thanh toán</span><strong>{vnd(cart.estimatedSubtotalVnd)}</strong></div><p>Giá, sách và tồn kho được máy chủ kiểm tra lại trước khi tạo đơn.</p><button className="button" type="button" disabled={placing || !addressId} onClick={() => void placeOrder()}>{placing ? 'Đang tạo đơn…' : 'Đặt hàng COD'}</button><Link className="text-link" href="/cart">Quay lại giỏ hàng</Link></aside></div>;
}

import type { Metadata } from 'next';
import { CartClient } from '@/components/cart/cart-client';

export const metadata: Metadata = { title: 'Giỏ hàng', robots: { index: false, follow: false } };
export default function CartPage() { return <CartClient />; }

import type { Metadata } from 'next';
import { CheckoutClient } from '@/components/orders/checkout-client';
export const metadata: Metadata = { title: 'Thanh toán', robots: { index: false, follow: false } };
export default function CheckoutPage() { return <CheckoutClient />; }

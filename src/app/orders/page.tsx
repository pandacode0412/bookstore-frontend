import type { Metadata } from 'next';
import { OrderListClient } from '@/components/orders/order-clients';
export const metadata: Metadata = { title: 'Đơn hàng của tôi', robots: { index: false, follow: false } };
export default function OrdersPage() { return <OrderListClient />; }

import type { Metadata } from 'next';
import { OrderDetailClient } from '@/components/orders/order-clients';
export const metadata: Metadata = { title: 'Chi tiết đơn hàng', robots: { index: false, follow: false } };
export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <OrderDetailClient id={id} />; }

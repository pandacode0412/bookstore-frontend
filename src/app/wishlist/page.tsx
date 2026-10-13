import type { Metadata } from 'next';
import { WishlistClient } from '@/components/wishlist/wishlist-client';

export const metadata: Metadata = { title: 'Sách yêu thích', robots: { index: false, follow: false } };

export default function WishlistPage() { return <WishlistClient />; }

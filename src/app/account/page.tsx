import type { Metadata } from 'next';
import { AccountClient } from '@/components/account/account-client';

export const metadata: Metadata = { title: 'Tài khoản của tôi', robots: { index: false, follow: false } };

export default function AccountPage() { return <AccountClient />; }

import type { Metadata } from 'next';
import { AdminGate } from '@/components/auth/admin-gate';
import { AdminDashboardClient } from '@/components/admin/admin-dashboard';

export const metadata: Metadata = { title: 'Quản trị', robots: { index: false, follow: false } };
export default function AdminPage() {
  return <AdminGate><AdminDashboardClient /></AdminGate>;
}

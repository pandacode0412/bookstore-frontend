import type { Metadata } from 'next';
import { AdminGate } from '@/components/auth/admin-gate';
import { AdminShell } from '@/components/admin/admin-shell';
import '@/app/admin.css';

export const metadata: Metadata = { title: 'Quản trị', robots: { index: false, follow: false } };
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminGate><AdminShell>{children}</AdminShell></AdminGate>;
}

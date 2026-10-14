import { CategoryManager } from '@/components/admin/category-manager';

export default function AdminCategoriesPage() {
  return <section className="admin-module-page"><header className="admin-module-heading"><div><div className="eyebrow">DANH MỤC</div><h1>Quản lý thể loại</h1><p>Sắp xếp và kiểm soát các thể loại xuất hiện trong menu cửa hàng.</p></div></header><CategoryManager /></section>;
}

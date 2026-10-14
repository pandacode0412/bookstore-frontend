'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

type PaginationMeta = {
  page: number;
  totalPages: number;
  total: number;
};

type AdminPaginationProps = {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  label: string;
};

export function AdminPagination({ meta, onPageChange, label }: AdminPaginationProps) {
  if (meta.totalPages <= 1) return null;

  return (
    <nav className="admin-pagination" aria-label={`Phân trang ${label}`}>
      <span>Trang {meta.page} / {meta.totalPages} · {meta.total} kết quả</span>
      <div>
        <button
          type="button"
          className="secondary-button"
          onClick={() => onPageChange(meta.page - 1)}
          disabled={meta.page <= 1}
          aria-label="Trang trước"
        >
          <ChevronLeft aria-hidden="true" size={17} />
          Trước
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={() => onPageChange(meta.page + 1)}
          disabled={meta.page >= meta.totalPages}
          aria-label="Trang sau"
        >
          Sau
          <ChevronRight aria-hidden="true" size={17} />
        </button>
      </div>
    </nav>
  );
}

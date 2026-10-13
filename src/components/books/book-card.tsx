import Link from 'next/link';
import { vnd } from '@/lib/api';
import type { Book } from '@/lib/types';

export function BookCard({ book }: { book: Book }) {
  return <Link className="book-card" href={`/books/${book.slug}`}>
    <div className="book-cover" aria-hidden="true"><span>📚</span><small>{book.category.name}</small></div>
    <div className="book-content"><div className="eyebrow">{book.sku}</div>
      <h3>{book.title}</h3><div className="price">{vnd(book.salePriceVnd ?? book.priceVnd)}</div>
      {book.salePriceVnd != null && <div className="old-price">{vnd(book.priceVnd)}</div>}
      <div className="availability">{book.stock > 0 ? `Còn ${book.stock} cuốn` : 'Hết hàng'}</div>
    </div>
  </Link>;
}

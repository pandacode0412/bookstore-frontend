'use client';

export default function BooksError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <section className="catalog-page"><div className="error" role="alert"><h1>Không thể tải danh mục sách</h1><p>Vui lòng kiểm tra kết nối rồi thử lại.</p><button className="button" type="button" onClick={reset}>Thử lại</button></div></section>;
}

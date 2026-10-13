export default function BooksLoading() {
  return <section className="catalog-page" aria-busy="true" aria-label="Đang tải danh mục sách">
    <div className="catalog-intro"><div><div className="eyebrow">DANH MỤC SÁCH</div><h1>Đang tải sách…</h1></div></div>
    <div className="catalog-filters catalog-loading-line" />
    <div className="book-grid">{Array.from({ length: 6 }, (_, index) => <div className="book-card skeleton" key={index}><div className="book-cover" /><div className="book-content"><div /><div /><div /></div></div>)}</div>
  </section>;
}

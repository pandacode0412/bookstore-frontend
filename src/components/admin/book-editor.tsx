'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { ArrowLeft, ImageOff, LoaderCircle, Plus, Save, Trash2 } from 'lucide-react';
import { AdminImageUpload } from '@/components/admin/admin-image-upload';
import { BrowserApiError, browserApi } from '@/lib/browser-api';
import { notifyCatalogChanged } from '@/lib/catalog-change';
import type { AdminBook, AdminCategory } from '@/lib/types';

type Draft = { sku: string; slug: string; title: string; categoryId: string; priceVnd: string; salePriceVnd: string; stock: string; status: AdminBook['status']; isbn: string; coverUrl: string; description: string; authors: string; images: string[] };
const blank = (categoryId = ''): Draft => ({ sku: '', slug: '', title: '', categoryId, priceVnd: '', salePriceVnd: '', stock: '0', status: 'DRAFT', isbn: '', coverUrl: '', description: '', authors: '', images: [] });
const message = (cause: unknown, fallback: string) => cause instanceof BrowserApiError ? cause.message : fallback;
const slugify = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const isBookUrl = (value: string) => /^(https:\/\/|\/)/.test(value.trim());

function draftOf(book: AdminBook): Draft {
  return { sku: book.sku, slug: book.slug, title: book.title, categoryId: book.category.id, priceVnd: String(book.priceVnd), salePriceVnd: book.salePriceVnd === null ? '' : String(book.salePriceVnd), stock: String(book.stock), status: book.status, isbn: book.isbn || '', coverUrl: book.coverUrl || '', description: book.description || '', authors: book.bookAuthors.map((item) => item.author.name).join(', '), images: book.images.map((item) => item.imageUrl) };
}

export function BookEditor({ mode }: { mode: 'create' | 'edit' }) {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const bookId = params.id;
  const [draft, setDraft] = useState<Draft>(blank());
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [galleryUrl, setGalleryUrl] = useState('');
  const [slugEdited, setSlugEdited] = useState(mode === 'edit');
  const [dirty, setDirty] = useState(false);
  const [loadError, setLoadError] = useState('');

  const load = useCallback(async () => {
    if (mode === 'edit' && !bookId) return;
    setLoading(true); setLoadError('');
    try {
      const [categoryItems, book] = await Promise.all([browserApi<AdminCategory[]>('/admin/categories'), mode === 'edit' ? browserApi<AdminBook>(`/admin/books/${bookId}`) : Promise.resolve(null)]);
      setCategories(categoryItems); setDraft(book ? draftOf(book) : blank(categoryItems[0]?.id)); setSlugEdited(mode === 'edit'); setDirty(false);
    } catch (cause) { setLoadError(message(cause, mode === 'edit' ? 'Không thể tải thông tin sách.' : 'Không thể tải thể loại.')); } finally { setLoading(false); }
  }, [bookId, mode]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { const warn = (event: BeforeUnloadEvent) => { if (!dirty || saving) return; event.preventDefault(); event.returnValue = ''; }; window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn); }, [dirty, saving]);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) { setDirty(true); setDraft((current) => ({ ...current, [key]: value })); }
  function updateTitle(value: string) { setDirty(true); setDraft((current) => ({ ...current, title: value, slug: slugEdited ? current.slug : slugify(value) })); }
  function addGallery(value = galleryUrl) { const url = value.trim(); if (!isBookUrl(url)) { setError('URL ảnh phụ phải bắt đầu bằng https:// hoặc /.'); return; } if (draft.images.includes(url)) { setGalleryUrl(''); return; } if (draft.images.length >= 8) { setError('Tối đa 8 ảnh phụ cho mỗi sách.'); return; } setError(''); setGalleryUrl(''); update('images', [...draft.images, url]); }
  function exit() { if (dirty && !window.confirm('Các thay đổi chưa lưu sẽ bị mất. Bạn có muốn rời trang?')) return; router.push('/admin/books'); }

  async function save(statusOverride?: AdminBook['status']) {
    const status = statusOverride ?? draft.status; const priceVnd = Number(draft.priceVnd); const stock = Number(draft.stock); const salePriceVnd = draft.salePriceVnd ? Number(draft.salePriceVnd) : null;
    if (!draft.title.trim() || !draft.sku.trim() || !draft.slug.trim() || !draft.categoryId) { setError('Vui lòng điền tiêu đề, SKU, slug và thể loại.'); return; }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug)) { setError('Slug chỉ dùng chữ thường, số và dấu gạch ngang.'); return; }
    if (!Number.isInteger(priceVnd) || priceVnd < 0 || !Number.isInteger(stock) || stock < 0 || (salePriceVnd !== null && (!Number.isInteger(salePriceVnd) || salePriceVnd < 0 || salePriceVnd > priceVnd))) { setError('Kiểm tra lại giá và tồn kho. Giá khuyến mãi không được lớn hơn giá gốc.'); return; }
    setSaving(true); setError(''); setNotice('');
    const payload = { sku: draft.sku.trim(), slug: draft.slug, title: draft.title.trim(), categoryId: draft.categoryId, priceVnd, salePriceVnd, stock, status, isbn: draft.isbn.trim() || null, coverUrl: draft.coverUrl.trim() || null, description: draft.description.trim() || null, authors: draft.authors.split(',').map((name) => name.trim()).filter(Boolean), images: draft.images };
    try { const saved = await browserApi<AdminBook>(mode === 'edit' ? `/admin/books/${bookId}` : '/admin/books', { method: mode === 'edit' ? 'PATCH' : 'POST', body: JSON.stringify(payload) }); notifyCatalogChanged(); setDraft(draftOf(saved)); setDirty(false); setSlugEdited(true); setNotice(saved.status === 'PUBLISHED' ? `Đã lưu “${saved.title}”. Sách hiện xuất hiện trên cửa hàng.` : `Đã lưu “${saved.title}” ở trạng thái ${saved.status === 'DRAFT' ? 'nháp' : 'lưu trữ'}.`); if (mode === 'create') router.replace(`/admin/books/${saved.id}/edit`); } catch (cause) { setError(message(cause, 'Không thể lưu sách.')); } finally { setSaving(false); }
  }
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void save(); }
  if (loading) return <section className="admin-module-page"><div className="admin-books-empty admin-panel" aria-busy="true"><LoaderCircle aria-hidden="true" size={30} className="admin-icon-spin" /><h1>Đang tải biểu mẫu sách…</h1></div></section>;
  if (loadError) return <section className="admin-module-page"><div className="admin-books-empty admin-panel"><h1>Không thể mở biểu mẫu sách</h1><p>{loadError}</p><div><button className="secondary-button" type="button" onClick={() => void load()}>Thử lại</button><Link className="button" href="/admin/books">Về danh sách sách</Link></div></div></section>;
  const isEdit = mode === 'edit';
  return <section className="admin-module-page admin-book-editor-page"><header className="admin-module-heading admin-book-editor-heading"><div><Link className="admin-back-link" href="/admin/books" onClick={(event) => { if (dirty && !window.confirm('Các thay đổi chưa lưu sẽ bị mất. Bạn có muốn rời trang?')) event.preventDefault(); }}><ArrowLeft aria-hidden="true" size={17} />Danh sách sách</Link><h1>{isEdit ? 'Chỉnh sửa sách' : 'Thêm sách mới'}</h1><p>{isEdit ? 'Cập nhật thông tin, giá bán, tồn kho và trạng thái xuất bản.' : 'Tạo sản phẩm mới với dữ liệu sẽ được backend kiểm tra trước khi lưu.'}</p></div></header><form className="admin-book-form" onSubmit={submit}>
      <section className="admin-panel admin-book-form-section"><header><div><h2>Thông tin cơ bản</h2><p>Các trường có dấu * là bắt buộc.</p></div></header><div className="admin-form-grid"><label className="admin-form-wide"><span>Tiêu đề sách <b>*</b></span><input value={draft.title} onChange={(event) => updateTitle(event.target.value)} required maxLength={255} autoComplete="off" /></label><label><span>SKU <b>*</b></span><input value={draft.sku} onChange={(event) => update('sku', event.target.value)} required maxLength={64} autoComplete="off" /></label><label><span>Slug URL <b>*</b></span><input value={draft.slug} onChange={(event) => { setSlugEdited(true); update('slug', event.target.value); }} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" maxLength={120} /><small>Tạo từ tiêu đề cho đến khi bạn tự chỉnh sửa.</small></label><label><span>ISBN</span><input value={draft.isbn} onChange={(event) => update('isbn', event.target.value)} maxLength={32} autoComplete="off" /></label><label><span>Thể loại <b>*</b></span><select value={draft.categoryId} onChange={(event) => update('categoryId', event.target.value)} required><option value="" disabled>Chọn thể loại</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}{category.isActive ? '' : ' (đã ẩn)'}</option>)}</select></label><label className="admin-form-wide"><span>Tác giả</span><input value={draft.authors} onChange={(event) => update('authors', event.target.value)} placeholder="Ví dụ: Nguyễn Nhật Ánh, Tô Hoài" maxLength={604} /><small>Ngăn cách tối đa 5 tác giả bằng dấu phẩy.</small></label><label className="admin-form-wide"><span>Mô tả</span><textarea value={draft.description} onChange={(event) => update('description', event.target.value)} rows={6} maxLength={20000} placeholder="Mô tả ngắn gọn, rõ nội dung sách…" /></label></div></section>
      <section className="admin-panel admin-book-form-section"><header><div><h2>Giá và tồn kho</h2><p>Giá VND và tồn kho được backend xác thực trước khi cập nhật.</p></div></header><div className="admin-form-grid"><label><span>Giá gốc (VND) <b>*</b></span><input type="number" min="0" step="1" value={draft.priceVnd} onChange={(event) => update('priceVnd', event.target.value)} required inputMode="numeric" /></label><label><span>Giá khuyến mãi (VND)</span><input type="number" min="0" step="1" value={draft.salePriceVnd} onChange={(event) => update('salePriceVnd', event.target.value)} inputMode="numeric" /><small>Để trống nếu không giảm giá.</small></label><label><span>Tồn kho <b>*</b></span><input type="number" min="0" step="1" value={draft.stock} onChange={(event) => update('stock', event.target.value)} required inputMode="numeric" /></label><label><span>Trạng thái xuất bản</span><select value={draft.status} onChange={(event) => update('status', event.target.value as AdminBook['status'])}><option value="DRAFT">Bản nháp</option><option value="PUBLISHED">Đang bán</option><option value="ARCHIVED">Lưu trữ</option></select><small>Chỉ “Đang bán” xuất hiện trên cửa hàng.</small></label></div></section>
      <section className="admin-panel admin-book-form-section"><header><div><h2>Hình ảnh</h2><p>Chỉ tải JPEG, PNG hoặc WebP tối đa 8 MB qua Cloudinary.</p></div></header><div className="admin-book-media-grid"><div className="admin-book-cover-editor"><span>Ảnh bìa</span><div className="admin-book-cover-preview">{draft.coverUrl ? <img src={draft.coverUrl} alt={`Xem trước bìa ${draft.title || 'sách'}`} /> : <span><ImageOff aria-hidden="true" size={28} />Chưa có ảnh bìa</span>}</div><label><span>URL ảnh bìa</span><input value={draft.coverUrl} onChange={(event) => update('coverUrl', event.target.value)} placeholder="https://… hoặc /…" /></label><div className="admin-book-media-actions"><AdminImageUpload purpose="book-cover" disabled={saving} onUploaded={(url) => update('coverUrl', url)} />{draft.coverUrl && <button className="text-link is-danger" type="button" onClick={() => update('coverUrl', '')}><Trash2 aria-hidden="true" size={15} />Gỡ ảnh bìa</button>}</div></div><div className="admin-book-gallery"><span>Ảnh phụ</span><div className="admin-gallery-add"><input value={galleryUrl} onChange={(event) => setGalleryUrl(event.target.value)} placeholder="Dán URL ảnh phụ" aria-label="URL ảnh phụ" /><button className="secondary-button" type="button" onClick={() => addGallery()} disabled={saving}><Plus aria-hidden="true" size={16} />Thêm</button></div><AdminImageUpload purpose="book-gallery" disabled={saving || draft.images.length >= 8} onUploaded={(url) => addGallery(url)} /><small>Tối đa 8 ảnh. Mỗi ảnh có thể gỡ trước khi lưu.</small>{draft.images.length > 0 ? <ul className="admin-gallery-list">{draft.images.map((url) => <li key={url}><img src={url} alt="Ảnh phụ sách" /><span>{url}</span><button type="button" className="admin-icon-button is-danger" onClick={() => update('images', draft.images.filter((item) => item !== url))} aria-label="Gỡ ảnh phụ" title="Gỡ ảnh"><Trash2 aria-hidden="true" size={16} /></button></li>)}</ul> : <p className="admin-gallery-empty">Chưa có ảnh phụ.</p>}</div></div></section>
      {error && <p className="admin-category-error" role="alert">{error}</p>}{notice && <p className="admin-success" role="status">{notice}</p>}<footer className="admin-book-form-actions"><button className="button" type="submit" disabled={saving || categories.length === 0}>{saving ? <><LoaderCircle aria-hidden="true" size={17} className="admin-icon-spin" />Đang lưu…</> : <><Save aria-hidden="true" size={17} />{isEdit ? 'Lưu thay đổi' : 'Lưu sách'}</>}</button>{draft.status !== 'PUBLISHED' && <button className="secondary-button" type="button" disabled={saving || categories.length === 0} onClick={() => void save('PUBLISHED')}>Lưu & xuất bản</button>}<button className="secondary-button" type="button" onClick={exit} disabled={saving}>Hủy</button>{categories.length === 0 && <span className="admin-form-help">Cần có ít nhất một thể loại trước khi lưu sách.</span>}</footer></form></section>;
}

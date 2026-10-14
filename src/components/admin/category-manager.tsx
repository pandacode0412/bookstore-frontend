'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { BrowserApiError, browserApi } from '@/lib/browser-api';
import type { AdminCategory } from '@/lib/types';

type CategoryDraft = { name: string; slug: string; description: string; sortOrder: string; isActive: boolean };
const blankDraft: CategoryDraft = { name: '', slug: '', description: '', sortOrder: '0', isActive: true };

function apiMessage(cause: unknown, fallback: string) {
  return cause instanceof BrowserApiError ? cause.message : fallback;
}

function categoryChanged() {
  window.dispatchEvent(new Event('bookstore:categories-changed'));
}

function CategoryRow({ category, onSaved }: { category: AdminCategory; onSaved: () => void }) {
  const [draft, setDraft] = useState<CategoryDraft>({ name: category.name, slug: category.slug, description: category.description || '', sortOrder: String(category.sortOrder), isActive: category.isActive });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const sortOrder = Number(draft.sortOrder);
    if (!Number.isInteger(sortOrder) || sortOrder < 0) { setError('Thứ tự phải là số nguyên từ 0 trở lên.'); return; }
    setPending(true); setError('');
    try {
      await browserApi<AdminCategory>(`/admin/categories/${category.id}`, { method: 'PATCH', body: JSON.stringify({ name: draft.name, slug: draft.slug, description: draft.description || null, sortOrder, isActive: draft.isActive }) });
      categoryChanged(); onSaved();
    } catch (cause) { setError(apiMessage(cause, 'Không thể cập nhật thể loại.')); }
    finally { setPending(false); }
  }

  return <form className={`admin-category-row${draft.isActive ? '' : ' is-inactive'}`} onSubmit={save}>
    <label><span>Tên</span><input value={draft.name} onChange={event => setDraft(current => ({ ...current, name: event.target.value }))} maxLength={100} required disabled={pending} /></label>
    <label><span>Slug</span><input value={draft.slug} onChange={event => setDraft(current => ({ ...current, slug: event.target.value }))} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" maxLength={100} required disabled={pending} /></label>
    <label className="admin-category-description"><span>Mô tả</span><input value={draft.description} onChange={event => setDraft(current => ({ ...current, description: event.target.value }))} maxLength={500} disabled={pending} /></label>
    <label><span>Thứ tự</span><input value={draft.sortOrder} onChange={event => setDraft(current => ({ ...current, sortOrder: event.target.value }))} type="number" min="0" max="1000000" step="1" required disabled={pending} /></label>
    <label className="admin-category-active"><input type="checkbox" checked={draft.isActive} onChange={event => setDraft(current => ({ ...current, isActive: event.target.checked }))} disabled={pending} /><span>Hiển thị</span></label>
    <button type="submit" className="secondary-button" disabled={pending}>{pending ? 'Đang lưu…' : 'Lưu'}</button>
    {error && <p className="admin-category-error" role="alert">{error}</p>}
  </form>;
}

export function CategoryManager() {
  const [categories, setCategories] = useState<AdminCategory[] | null>(null);
  const [draft, setDraft] = useState<CategoryDraft>(blankDraft);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback(() => {
    setError('');
    browserApi<AdminCategory[]>('/admin/categories').then(setCategories).catch(cause => {
      setCategories([]); setError(apiMessage(cause, 'Không thể tải thể loại.'));
    });
  }, []);
  useEffect(() => { load(); }, [load]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const sortOrder = Number(draft.sortOrder);
    if (!Number.isInteger(sortOrder) || sortOrder < 0) { setError('Thứ tự phải là số nguyên từ 0 trở lên.'); return; }
    setCreating(true); setError('');
    try {
      await browserApi<AdminCategory>('/admin/categories', { method: 'POST', body: JSON.stringify({ name: draft.name, slug: draft.slug, description: draft.description || null, sortOrder, isActive: draft.isActive }) });
      setDraft(blankDraft); categoryChanged(); load();
    } catch (cause) { setError(apiMessage(cause, 'Không thể tạo thể loại.')); }
    finally { setCreating(false); }
  }

  return <section className="admin-panel admin-categories-panel" aria-labelledby="admin-categories-title">
    <div className="admin-panel-heading"><div><h2 id="admin-categories-title">Thể loại sách</h2><p>Tạo, sắp xếp hoặc ẩn thể loại khỏi menu storefront.</p></div><button type="button" className="secondary-button" onClick={load}>Làm mới</button></div>
    <form className="admin-category-create" onSubmit={create}>
      <label><span>Tên thể loại</span><input value={draft.name} onChange={event => setDraft(current => ({ ...current, name: event.target.value }))} maxLength={100} required disabled={creating} /></label>
      <label><span>Slug URL</span><input value={draft.slug} onChange={event => setDraft(current => ({ ...current, slug: event.target.value }))} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" maxLength={100} required disabled={creating} /></label>
      <label className="admin-category-description"><span>Mô tả</span><input value={draft.description} onChange={event => setDraft(current => ({ ...current, description: event.target.value }))} maxLength={500} disabled={creating} /></label>
      <label><span>Thứ tự</span><input value={draft.sortOrder} onChange={event => setDraft(current => ({ ...current, sortOrder: event.target.value }))} type="number" min="0" max="1000000" step="1" required disabled={creating} /></label>
      <label className="admin-category-active"><input type="checkbox" checked={draft.isActive} onChange={event => setDraft(current => ({ ...current, isActive: event.target.checked }))} disabled={creating} /><span>Hiển thị</span></label>
      <button className="button" type="submit" disabled={creating}>{creating ? 'Đang tạo…' : 'Thêm thể loại'}</button>
    </form>
    {error && <p className="admin-category-error" role="alert">{error}</p>}
    {categories === null ? <p className="admin-empty" aria-busy="true">Đang tải thể loại…</p> : error ? null : categories.length === 0 ? <p className="admin-empty">Chưa có thể loại nào.</p> : <div className="admin-category-list">{categories.map(category => <CategoryRow key={category.id} category={category} onSaved={load} />)}</div>}
  </section>;
}

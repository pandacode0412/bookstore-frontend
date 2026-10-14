'use client';

import { useId, useState } from 'react';
import { ImagePlus, LoaderCircle } from 'lucide-react';
import { BrowserApiError, browserApi } from '@/lib/browser-api';

type UploadPurpose = 'book-cover' | 'book-gallery' | 'banner';
type UploadResult = { url: string; width: number; height: number; bytes: number; format: string };

const maxBytes = 8 * 1024 * 1024;

export function AdminImageUpload({ purpose, onUploaded, disabled = false }: { purpose: UploadPurpose; onUploaded: (url: string) => void; disabled?: boolean }) {
  const inputId = useId();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function selectFile(file: File | undefined) {
    if (!file || pending || disabled) return;
    setError('');
    setNotice('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Chỉ hỗ trợ ảnh JPEG, PNG hoặc WebP.');
      return;
    }
    if (file.size > maxBytes) {
      setError('Ảnh phải nhỏ hơn hoặc bằng 8 MB.');
      return;
    }

    const formData = new FormData();
    formData.set('file', file);
    formData.set('purpose', purpose);
    setPending(true);
    try {
      const uploaded = await browserApi<UploadResult>('/admin/media/images', { method: 'POST', body: formData });
      onUploaded(uploaded.url);
      setNotice(`Đã tải ${uploaded.format.toUpperCase()} ${uploaded.width}×${uploaded.height}px lên Cloudinary.`);
    } catch (cause) {
      setError(cause instanceof BrowserApiError ? cause.message : 'Không thể tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setPending(false);
    }
  }

  return <div className="admin-media-upload">
    <input id={inputId} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled || pending} onChange={(event) => { void selectFile(event.target.files?.[0]); event.currentTarget.value = ''; }} />
    <label className="secondary-button admin-upload-button" htmlFor={inputId} aria-disabled={disabled || pending}>
      {pending ? <LoaderCircle aria-hidden="true" size={17} className="admin-icon-spin" /> : <ImagePlus aria-hidden="true" size={17} />}
      {pending ? 'Đang tải ảnh…' : 'Tải ảnh từ máy'}
    </label>
    <span>JPEG, PNG hoặc WebP · tối đa 8 MB</span>
    {error && <p className="admin-category-error" role="alert">{error}</p>}
    {notice && <p className="admin-success" role="status">{notice}</p>}
  </div>;
}

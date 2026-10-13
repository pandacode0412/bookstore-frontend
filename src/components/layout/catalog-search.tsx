'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeaderIcon } from './header-icon';

export function CatalogSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    router.push(`/books${params.size ? `?${params.toString()}` : ''}`);
  }
  return <form className="header-search" role="search" onSubmit={submit}><label className="sr-only" htmlFor="header-search-input">Tìm sách</label><input id="header-search-input" value={query} onChange={event => setQuery(event.target.value)} placeholder="Tìm tựa sách, tác giả bạn yêu thích" maxLength={100} /><button type="submit" aria-label="Tìm sách"><HeaderIcon name="search" /><span>Tìm kiếm</span></button></form>;
}

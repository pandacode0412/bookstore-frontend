import type { MetadataRoute } from 'next';
import { listBooks } from '@/lib/api';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = [{ url: siteUrl, changeFrequency: 'weekly' as const, priority: 1 }, { url: `${siteUrl}/books`, changeFrequency: 'daily' as const, priority: 0.9 }];
  try {
    const books = await listBooks({ limit: 50 });
    return [...base, ...books.items.map(book => ({ url: `${siteUrl}/books/${book.slug}`, changeFrequency: 'weekly' as const, priority: 0.8 }))];
  } catch { return base; }
}

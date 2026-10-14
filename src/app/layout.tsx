import type { Metadata } from 'next';
import { SiteChrome } from '@/components/layout/site-chrome';
import { bodyFont, headingFont } from './fonts';
import './globals.css';
import './home-hero.css';
import './auth-pages.css';
import './auth-password-icons.css';
import './site-header.css';
import './book-data.css';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Bookstore | Sách hay mỗi ngày', template: '%s | Bookstore' },
  description: 'Khám phá sách công nghệ, phát triển bản thân và nhiều tựa sách chọn lọc với giá minh bạch.',
  keywords: ['mua sách online', 'nhà sách trực tuyến', 'sách công nghệ', 'sách phát triển bản thân'],
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/brand/bookstore-logo.png',
  },
  openGraph: { type: 'website', locale: 'vi_VN', siteName: 'Bookstore', title: 'Bookstore | Sách hay mỗi ngày', description: 'Khám phá những tựa sách chọn lọc cho hành trình học hỏi của bạn.' },
  twitter: { card: 'summary', title: 'Bookstore | Sách hay mỗi ngày', description: 'Khám phá những tựa sách chọn lọc cho hành trình học hỏi của bạn.' },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body className={`${bodyFont.variable} ${headingFont.variable}`}>
    <SiteChrome>{children}</SiteChrome>
  </body></html>;
}

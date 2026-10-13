import { Be_Vietnam_Pro, Manrope } from 'next/font/google';

export const headingFont = Manrope({
  subsets: ['latin', 'vietnamese'],
  weight: ['600', '700'],
  display: 'swap',
  variable: '--font-heading',
  fallback: ['Arial', 'Helvetica', 'sans-serif'],
});

export const bodyFont = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-body',
  fallback: ['Arial', 'Helvetica', 'sans-serif'],
});

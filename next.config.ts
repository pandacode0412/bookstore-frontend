import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Hide the Next.js development overlay badge; it never appears in production.
  devIndicators: false,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' }],
  },
};
export default nextConfig;

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Memory-Optimization für Vercel-Builds — verhindert OOM bei großen
  // CSS-Bundles. Aktiviert experimentelle Webpack-Memory-Reduzierung.
  experimental: {
    webpackMemoryOptimizations: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
};

export default nextConfig;

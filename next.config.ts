import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Verhindert OOM auf Vercel-Build-Container:
  // - webpackBuildWorker: false → kein separater Worker-Prozess mit eigenem
  //   Memory-Limit. Build läuft im Main-Prozess, der mit NODE_OPTIONS auf 6GB
  //   hochgezogen werden kann (siehe package.json build-Skript).
  experimental: {
    webpackBuildWorker: false,
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

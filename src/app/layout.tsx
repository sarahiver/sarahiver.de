import type { Metadata } from 'next';
import './globals.css';
import './design-system-v2.css';
import { SITE_CONFIG } from '@/lib/content';

export const metadata: Metadata = {
  title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
  description: SITE_CONFIG.description,
  openGraph: {
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: `https://${SITE_CONFIG.domain}`,
    siteName: SITE_CONFIG.name,
    locale: 'de_DE',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500&family=Inter:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-paper text-ink">{children}</body>
    </html>
  );
}

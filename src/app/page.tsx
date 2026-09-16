import type { Metadata } from 'next';
import LandingV4 from '@/components/landing-v4/LandingV4';
import { SEO } from '@/lib/landing-v4';

/**
 * sarahiver.de — Landing v4.1.
 *
 * Kein force-static mehr: die Stil-Sektion liest Paletten und Schriften aus
 * den Preset-Tabellen. Die Seite wird stündlich neu generiert (ISR), bleibt
 * also für Besucher statisch schnell.
 */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: SEO.title,
  description: SEO.description,
  openGraph: {
    title: SEO.title,
    description: SEO.description,
    url: 'https://sarahiver.de',
    siteName: 'sarahiver.de',
    locale: 'de_DE',
    type: 'website',
  },
};

export default function Home() {
  return <LandingV4 />;
}

import type { Metadata } from 'next';
import LandingV4 from '@/components/landing-v4/LandingV4';
import { SEO } from '@/lib/landing-v4';

/**
 * sarahiver.de — Landing v4 (Mockup-Umsetzung, Sept. 2026).
 *
 * Self-Service-Produkt, Einmalzahlung 69 €. Die alte Landing v3
 * (components/landing/LandingChrome.tsx) bleibt im Repo, wird aber nicht mehr
 * gerendert.
 */
export const dynamic = 'force-static';

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

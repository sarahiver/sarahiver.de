import type { Metadata } from 'next';
import LandingV4 from '@/components/landing-v4/LandingV4';
import LaunchGate from '@/components/launch/LaunchGate';
import { SEO } from '@/lib/landing-v4';

/**
 * sarahiver.de — Landing v4.1 + Launch Gate.
 *
 * Das Gate liegt NUR auf der Landing, nicht auf Demoseiten oder Dashboard —
 * genau die beiden Ziele, auf die es verweist, sollen frei erreichbar bleiben.
 * Abschalten über PRE_LAUNCH_MODE in lib/launch.ts.
 *
 * Kein force-static: die Stil-Sektion liest Paletten und Schriften aus den
 * Preset-Tabellen. Die Seite wird stündlich neu generiert (ISR).
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
  return (
    <>
      <LandingV4 />
      <LaunchGate />
    </>
  );
}

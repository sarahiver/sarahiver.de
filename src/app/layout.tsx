import type { Metadata } from 'next';
// Selbst gehostete Schriften (ersetzt Google Fonts) — zuerst laden.
import './fonts.css';
import './globals.css';
// Ebene 1 — gemeinsame Maßsysteme aller acht Wedding Designs (keine Ästhetik).
import './foundation.css';
// Wedding Styles der Kundenseiten — eigenständige Ebene.
import './design-system-v2.css';
// RSVP (Phase 3) — stilneutrale Struktur für alle acht Designs. Nach den
// Stil-Variablen aus design-system-v2.css, vor den Design-Layern.
import './rsvp-base.css';
// Ebene 2 — Design 01: Editorial. Muss nach design-system-v2.css stehen.
import './editorial.css';
// Ebene 2 — Design 03: Organic. Eigener Style-Layer, greift nur über
// [data-style='organic']; muss nach editorial.css und design-system-v2.css stehen.
import './organic.css';
// Ebene 2 — Design 02: Brutalist. Eigener Style-Layer, greift nur über
// [data-style='brutalist']; muss nach design-system-v2.css und den übrigen
// Design-Layern stehen.
import './brutalist.css';
// Ebene 2 — Design 04: Mono. Eigener Style-Layer, greift nur über
// [data-style='mono']; steht nach allen anderen Design-Layern.
import './mono.css';
// Ebene 2 — Design 07: Bauhaus. Eigener Style-Layer, greift nur über
// [data-style='bauhaus'].
import './bauhaus.css';
// Ebene 2 — Design 06: Opulent. Eigener Style-Layer, greift nur über
// [data-style='opulent'].
import './opulent.css';
// Ebene 2 — Design 05: Liquefy. Eigener Style-Layer, greift nur über
// [data-style='liquefy'].
import './liquefy.css';
// Ebene 2 — Design 08: Kinetic. Eigener Style-Layer, greift nur über
// [data-style='kinetic'].
import './kinetic.css';
// Sarahiver Brand: Landing + Launch Gate.
import './landing-v4.css';
import './launch-gate.css';
// Interne Review-Umgebung /allelements (nur Chrome, greift nie in die Vorschau).
import './allelements.css';
// Entkoppelt: landing.css und landing-v3.css gehörten zur alten Landing
// (Klassen .landing / .lp3-*). Keine gerenderte Route nutzt sie noch; der
// Import lud u. a. 14 Google-Schriftfamilien nach. Dateien und die zugehörigen
// Komponenten unter components/landing und components/sections können gelöscht
// werden.
import { SITE_CONFIG } from '@/lib/content';
import Analytics from '@/components/analytics/Analytics';

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
      </head>
      <body className="bg-paper text-ink">
        {children}
        {/* Messung nur nach Einwilligung; ohne Mess-ID passiert nichts. */}
        <Analytics />
      </body>
    </html>
  );
}

import SiteHeader from '@/components/layout/SiteHeader';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import Dashboard from '@/components/sections/Dashboard';
import Bereiche from '@/components/sections/Bereiche';
import Konfigurator from '@/components/sections/Konfigurator';
import Pricing from '@/components/sections/Pricing';
import HowItWorks from '@/components/sections/HowItWorks';
import Voices from '@/components/sections/Voices';
import Faq from '@/components/sections/Faq';
import FinalCta from '@/components/sections/FinalCta';

/**
 * sarahiver.de — Marketing Landing v2 (Modern Studio)
 *
 * Section-Reihenfolge — conversion-optimiert:
 *   Hero          → emotional hook + CTA
 *   Dashboard     → "live ausprobieren" engagement-hook
 *   Bereiche      → was bekomme ich konkret? (Substanz)
 *   Konfigurator  → User wählt Bereiche, sieht eigenen Preis live
 *   Pricing       → klare Tabelle für die, die noch zweifeln
 *   HowItWorks    → 3 simple Schritte
 *   Voices        → Trust (Founder-Note + 2 Beta-Stimmen)
 *   Faq           → Einwände vor dem Checkout abbauen
 *   FinalCta      → letzter dramatic close
 *
 * Examples-Section wurde entfernt — das Dashboard erfüllt jetzt
 * die gleiche Funktion (8 Stile zeigen), aber interaktiv.
 */
export default function Home() {
  return (
    <div className="landing">
      <SiteHeader />
      <Hero />
      <Dashboard />
      <Bereiche />
      <Konfigurator />
      <Pricing />
      <HowItWorks />
      <Voices />
      <Faq />
      <FinalCta />
      <Footer />
    </div>
  );
}

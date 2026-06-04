import SiteHeader from '@/components/layout/SiteHeader';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import Examples from '@/components/sections/Examples';
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
 * Section-Reihenfolge — bewusst conversion-optimiert:
 *   Hero          → emotional hook + CTA
 *   Examples      → "wow"-Moment, 8 Stile zum Anschauen
 *   Bereiche      → was bekomme ich konkret? (Substanz)
 *   Konfigurator  → User interagiert, sieht eigenen Preis live
 *   Pricing       → klare Tabelle für die, die noch zweifeln
 *   HowItWorks    → 3 simple Schritte
 *   Voices        → Trust (Founder-Note + 2 Beta-Stimmen)
 *   Faq           → Einwände vor dem Checkout abbauen
 *   FinalCta      → letzter dramatic close
 */
export default function Home() {
  return (
    <div className="landing">
      <SiteHeader />
      <Hero />
      <Examples />
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

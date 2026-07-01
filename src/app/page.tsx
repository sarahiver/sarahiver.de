import {
  LandingHeader,
  LandingHero,
  StudioIntro,
  LandingFlow,
  LandingFounderProof,
  LandingGallery,
  LandingPricing,
  LandingFaq,
  LandingFooter,
} from '@/components/landing/LandingChrome';
import Configurator from '@/components/landing/Configurator';

/**
 * sarahiver.de — Marketing Landing v3 (Emotional Studio)
 *
 * Conversion-fokussiert, emotional, funktionsbeschreibend:
 *   Hero            → großes Paarfoto, Vertrauen, klarer CTA
 *   Studio          → interaktiver Baukasten mit Beispieldaten + Live-Preis
 *                     (ersetzt die alten Hero-/Dashboard-/Bereiche-/Examples-Sektionen)
 *   Flow            → echter Onboarding-Ablauf (Anmelden → live)
 *   Founder + Proof → Vertrauen (Gründer-Note, Kennzahlen, Stimmen)
 *   Gallery         → emotionale Paarfotos
 *   Pricing         → echtes Tier-Modell aus bereiche-katalog.ts
 *   Faq             → Einwände abbauen (semantische <details>)
 *   Footer          → finaler CTA
 */
export default function Home() {
  return (
    <div className="lp3">
      <LandingHeader />
      <main>
        <LandingHero />
        <StudioIntro />
        <Configurator />
        <LandingFlow />
        <LandingFounderProof />
        <LandingGallery />
        <LandingPricing />
        <LandingFaq />
      </main>
      <LandingFooter />
    </div>
  );
}

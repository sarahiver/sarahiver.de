import {
  LandingHeader,
  LandingHero,
  StyleExamples,
  LandingFlow,
  LandingFounderProof,
  LandingGallery,
  LandingPricing,
  LandingFaq,
  LandingFooter,
} from '@/components/landing/LandingChrome';

/**
 * sarahiver.de — Marketing Landing (Emotional + Beispiele + CTA)
 *
 * Statt eingebettetem Konfigurator: kuratierte Beispiel-Galerie mit echten
 * Demo-Seiten ("Live ansehen" -> /[slug]) + CTA "Selbst ausprobieren" (/testen,
 * Sandbox-Dashboard). Demos werden via /api/seed-demos angelegt.
 */
export const dynamic = 'force-static';

export default function Home() {
  return (
    <div className="lp3">
      <LandingHeader />
      <main>
        <LandingHero />
        <StyleExamples />
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

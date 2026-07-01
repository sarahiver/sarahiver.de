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
import { loadAllPresets } from '@/lib/presets';
import type { PresetBundle } from '@/components/landing/preview-tokens';

/**
 * sarahiver.de — Marketing Landing v3 (Emotional Studio)
 *
 * Der Konfigurator rendert die ECHTEN Bereich-Komponenten im echten
 * .wedding-site-wrapper mit echten Tokens (Design System v2) — die Vorschau
 * zeigt exakt das, was gekauft wird. Fokus-Modus: ein Bereich groß statt
 * langem Scrollen. Preise/Bereiche aus bereiche-katalog.ts.
 */
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Echte Presets aus der DB (Stile/Paletten/Fonts). Fallback greift im
  // Configurator, falls (z.B. lokal ohne Supabase) leer.
  let presets: PresetBundle | undefined;
  try {
    const all = await loadAllPresets();
    presets = { styles: all.styles, palettes: all.palettes, fonts: all.fonts };
  } catch {
    presets = undefined;
  }

  return (
    <div className="lp3">
      <LandingHeader />
      <main>
        <LandingHero />
        <StudioIntro />
        <Configurator presets={presets} />
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

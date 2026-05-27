import type { WeddingBereich, EffectiveTokens } from '@/types/supabase';
import HeroVariantA from '@/components/bereiche/Hero/HeroVariantA';
import HeroVariantB from '@/components/bereiche/Hero/HeroVariantB';
import HeroVariantC from '@/components/bereiche/Hero/HeroVariantC';
import BereichPlaceholder from '@/components/layout/BereichPlaceholder';

/**
 * BereichRenderer — wählt die richtige Komponente basierend auf
 * bereich_key + variant.
 *
 * Wenn eine Bereich-Komponente noch nicht existiert (z.B. RSVP während
 * der Entwicklung), wird ein BereichPlaceholder gerendert, damit das
 * Layout nicht bricht.
 *
 * Wird PRO Bereich aufgerufen (15 mal pro vollständiger Hochzeitsseite).
 */

interface BereichRendererProps {
  bereich: WeddingBereich;
  tokens: EffectiveTokens;
}

export function BereichRenderer({ bereich, tokens }: BereichRendererProps) {
  const { bereich_key, variant, content } = bereich;

  // === HERO ===
  if (bereich_key === 'hero') {
    const props = { tokens, content };
    if (variant === 'a') return <HeroVariantA {...props} />;
    if (variant === 'b') return <HeroVariantB {...props} />;
    if (variant === 'c') return <HeroVariantC {...props} />;
  }

  // === Alle anderen Bereiche: noch nicht gebaut → Placeholder ===
  return <BereichPlaceholder bereich={bereich} />;
}

import type { WeddingBereich, EffectiveTokens } from '@/types/supabase';
import HeroVariantA from '@/components/bereiche/Hero/HeroVariantA';
import HeroVariantB from '@/components/bereiche/Hero/HeroVariantB';
import HeroVariantC from '@/components/bereiche/Hero/HeroVariantC';
import CountdownVariantA from '@/components/bereiche/Countdown/CountdownVariantA';
import CountdownVariantB from '@/components/bereiche/Countdown/CountdownVariantB';
import CountdownVariantC from '@/components/bereiche/Countdown/CountdownVariantC';
import BereichPlaceholder from '@/components/layout/BereichPlaceholder';

/**
 * BereichRenderer — wählt die richtige Komponente basierend auf
 * bereich_key + variant.
 *
 * Wenn eine Bereich-Komponente noch nicht existiert (z.B. RSVP während
 * der Entwicklung), wird ein BereichPlaceholder gerendert, damit das
 * Layout nicht bricht.
 */

interface BereichRendererProps {
  bereich: WeddingBereich;
  tokens: EffectiveTokens;
}

export function BereichRenderer({ bereich, tokens }: BereichRendererProps) {
  const { bereich_key, variant, content } = bereich;
  const props = { tokens, content };

  // === HERO ===
  if (bereich_key === 'hero') {
    if (variant === 'a') return <HeroVariantA {...props} />;
    if (variant === 'b') return <HeroVariantB {...props} />;
    if (variant === 'c') return <HeroVariantC {...props} />;
  }

  // === COUNTDOWN ===
  if (bereich_key === 'countdown') {
    if (variant === 'a') return <CountdownVariantA {...props} />;
    if (variant === 'b') return <CountdownVariantB {...props} />;
    if (variant === 'c') return <CountdownVariantC {...props} />;
  }

  // === Alle anderen Bereiche: noch nicht gebaut → Placeholder ===
  return <BereichPlaceholder bereich={bereich} />;
}

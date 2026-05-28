import type { WeddingBereich, EffectiveTokens } from '@/types/supabase';
import HeroVariantA from '@/components/bereiche/Hero/HeroVariantA';
import HeroVariantB from '@/components/bereiche/Hero/HeroVariantB';
import HeroVariantC from '@/components/bereiche/Hero/HeroVariantC';
import CountdownVariantA from '@/components/bereiche/Countdown/CountdownVariantA';
import CountdownVariantB from '@/components/bereiche/Countdown/CountdownVariantB';
import CountdownVariantC from '@/components/bereiche/Countdown/CountdownVariantC';
import LovestoryVariantA from '@/components/bereiche/Lovestory/LovestoryVariantA';
import LovestoryVariantB from '@/components/bereiche/Lovestory/LovestoryVariantB';
import LovestoryVariantC from '@/components/bereiche/Lovestory/LovestoryVariantC';
import GalleryVariantA from '@/components/bereiche/Gallery/GalleryVariantA';
import GalleryVariantB from '@/components/bereiche/Gallery/GalleryVariantB';
import GalleryVariantC from '@/components/bereiche/Gallery/GalleryVariantC';
import RsvpVariantA from '@/components/bereiche/RSVP/RsvpVariantA';
import RsvpVariantB from '@/components/bereiche/RSVP/RsvpVariantB';
import RsvpVariantC from '@/components/bereiche/RSVP/RsvpVariantC';
import TimelineVariantA from '@/components/bereiche/Timeline/TimelineVariantA';
import TimelineVariantB from '@/components/bereiche/Timeline/TimelineVariantB';
import TimelineVariantC from '@/components/bereiche/Timeline/TimelineVariantC';
import FaqVariantA from '@/components/bereiche/FAQ/FaqVariantA';
import FaqVariantB from '@/components/bereiche/FAQ/FaqVariantB';
import FaqVariantC from '@/components/bereiche/FAQ/FaqVariantC';
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

  // === LOVESTORY ===
  if (bereich_key === 'lovestory') {
    if (variant === 'a') return <LovestoryVariantA {...props} />;
    if (variant === 'b') return <LovestoryVariantB {...props} />;
    if (variant === 'c') return <LovestoryVariantC {...props} />;
  }

  // === GALLERY ===
  if (bereich_key === 'gallery') {
    if (variant === 'a') return <GalleryVariantA {...props} />;
    if (variant === 'b') return <GalleryVariantB {...props} />;
    if (variant === 'c') return <GalleryVariantC {...props} />;
  }

  // === RSVP ===
  if (bereich_key === 'rsvp') {
    if (variant === 'a') return <RsvpVariantA {...props} />;
    if (variant === 'b') return <RsvpVariantB {...props} />;
    if (variant === 'c') return <RsvpVariantC {...props} />;
  }

  // === TIMELINE ===
  if (bereich_key === 'timeline') {
    if (variant === 'a') return <TimelineVariantA {...props} />;
    if (variant === 'b') return <TimelineVariantB {...props} />;
    if (variant === 'c') return <TimelineVariantC {...props} />;
  }

  // === FAQ ===
  if (bereich_key === 'faq') {
    if (variant === 'a') return <FaqVariantA {...props} />;
    if (variant === 'b') return <FaqVariantB {...props} />;
    if (variant === 'c') return <FaqVariantC {...props} />;
  }

  // === Alle anderen Bereiche: noch nicht gebaut → Placeholder ===
  return <BereichPlaceholder bereich={bereich} />;
}
